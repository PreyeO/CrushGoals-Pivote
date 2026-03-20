"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Download,
    FileText,
    PieChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    XCircle,
    RefreshCw,
    CheckCircle2,
    Calendar as CalendarIcon
} from "lucide-react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { notFound } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { OrgGoal, OrgMember } from "@/types";

export default function OrgReportsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState<"month" | "quarter" | "year" | "all">("month");
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);
    const org = useStore(useShallow((state) => state.organizations.find((o) => o.id === orgId)));
    
    // Filtered goals based on period
    const allGoals = useStore(useShallow((state) => state.goals.filter(g => g.orgId === orgId)));
    const goals = useMemo(() => {
        if (filterPeriod === 'all') return allGoals;
        
        const now = new Date();
        const start = new Date();
        if (filterPeriod === 'month') {
            start.setMonth(now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
        } else if (filterPeriod === 'quarter') {
            start.setMonth(now.getMonth() - 3);
        } else if (filterPeriod === 'year') {
            start.setFullYear(now.getFullYear(), 0, 1);
            start.setHours(0, 0, 0, 0);
        }
        
        return allGoals.filter(g => new Date(g.createdAt) >= start || new Date(g.updatedAt) >= start);
    }, [allGoals, filterPeriod]);

    const members = useStore(useShallow((state) => state.members.filter(m => m.orgId === orgId)));

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    if (!mounted || (isLoading && !org)) return <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse">Loading Reports...</div>;
    if (!org) return notFound();

    const completedGoals = goals.filter((g: OrgGoal) => g.status === 'completed');
    const blockedGoals = goals.filter((g: OrgGoal) => g.status === 'blocked');
    const activeGoals = goals.filter((g: OrgGoal) => g.status !== 'completed');
    
    // 1. Needs Attention Logic
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - 3);
    const staleGoals = activeGoals.filter((g: OrgGoal) => new Date(g.updatedAt) < staleThreshold && g.status !== 'blocked');
    const needsAttention = [...blockedGoals, ...staleGoals].sort((a: OrgGoal, b: OrgGoal) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // 2. Member Breakdown Logic
    const memberStats = members.map((member: OrgMember) => {
        const memberGoals = goals.filter((g: OrgGoal) => g.assignedTo?.includes(member.id));
        const done = memberGoals.filter((g: OrgGoal) => g.status === 'completed').length;
        const blocked = memberGoals.filter((g: OrgGoal) => g.status === 'blocked').length;
        const total = memberGoals.length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
        
        return {
            name: member.name || "Unknown Member",
            total,
            done,
            blocked,
            rate,
            status: rate > 70 ? '🟢' : rate > 30 ? '⚠️' : '🔴'
        };
    }).sort((a: any, b: any) => b.rate - a.rate);

    // 3. Top Blockers Logic
    const blockerReasons: Record<string, number> = {};
    blockedGoals.forEach((g: OrgGoal) => {
        const reason = g.reason || "No reason provided";
        blockerReasons[reason] = (blockerReasons[reason] || 0) + 1;
    });
    const topBlockers = Object.entries(blockerReasons)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // 4. Monthly Trend Logic
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const month = d.getMonth();
        const year = d.getFullYear();
        const count = completedGoals.filter(g => {
            const compDate = new Date(g.updatedAt);
            return compDate.getMonth() === month && compDate.getFullYear() === year;
        }).length;
        return { name: monthNames[month], count };
    });

    const avgProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / goals.length)
        : 0;

    const StatCard = ({ title, value, icon: Icon, subtext }: any) => (
        <Card className="glass-card-hover border-border/40 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-[10px] text-muted-foreground mt-1 font-medium">{subtext}</div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Reports & Insights
                    </h1>
                    <p className="text-[13px] text-muted-foreground mt-1">
                        Deep dive into your team's performance and objective health.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterPeriod} onValueChange={(v: any) => setFilterPeriod(v)}>
                        <SelectTrigger className="h-9 w-[130px] text-[11px] font-bold bg-accent/20 border-border/40">
                            <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">Last 3 Months</SelectItem>
                            <SelectItem value="year">Year to Date</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-9 text-[11px] font-bold gap-2 bg-accent/20 border-border/40">
                        <FileText className="w-3.5 h-3.5" /> CSV
                    </Button>
                    <Button className="gradient-primary text-white border-0 h-9 px-6 text-[11px] font-bold glow-primary-sm gap-2">
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
                <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={TrendingUp} subtext="Across all active goals" />
                <StatCard title="Total Crushed" value={completedGoals.length} icon={Target} subtext="Historical total" />
                <StatCard title="Active Blockers" value={blockedGoals.length} icon={XCircle} subtext={blockedGoals.length > 0 ? "Action required" : "Clear skies"} />
                <StatCard title="Monthly Velocity" value={monthlyData[5].count} icon={Activity} subtext="Completions this month" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
                {/* Monthly Progress Chart */}
                <Card className="lg:col-span-2 glass-card border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-primary" /> Completion Trend
                        </CardTitle>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Last 6 Months</span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col justify-end gap-2 px-6 pb-6 pt-10">
                        <div className="flex items-end gap-6 h-full px-4 border-b border-border/30 pb-2">
                            {monthlyData.map((d, i) => {
                                const max = Math.max(...monthlyData.map(md => md.count), 1);
                                const height = (d.count / max) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                                        <div 
                                            className="w-full bg-primary/20 rounded-t-xl group-hover:bg-primary/40 transition-all duration-500 relative min-h-[4px]" 
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border border-border/40 px-3 py-1.5 rounded-lg text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-20 scale-90 group-hover:scale-100">
                                                {d.count} Crushed
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{d.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Blockers Section */}
                <Card className="glass-card border-border/40">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" /> Top Blocker Reasons
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topBlockers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">No Active Blockers</p>
                            </div>
                        ) : (
                            topBlockers.map(([reason, count], i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                                        <span className="truncate pr-4">{reason}</span>
                                        <span className="text-primary">{count}x</span>
                                    </div>
                                    <Progress value={(count / blockedGoals.length) * 100} className="h-1.5 bg-destructive/10" />
                                </div>
                            ))
                        )}
                        <div className="pt-6 mt-6 border-t border-border/20">
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                "This shows systemic problems, not just individual ones. Monitor these reasons to improve team throughput."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Member Breakdown Table */}
                <Card className="lg:col-span-3 glass-card border-border/40 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/40">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" /> Member Performance Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20">
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4 text-center">Active</th>
                                    <th className="px-6 py-4 text-center">Done</th>
                                    <th className="px-6 py-4 text-center">Blocked</th>
                                    <th className="px-6 py-4 text-right">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {memberStats.map((member: any, i: number) => (
                                    <tr key={i} className="hover:bg-accent/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                                    {member.name[0]}
                                                </div>
                                                <span className="text-sm font-bold tracking-tight">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium">{member.total - member.done}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-emerald-500">{member.done}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-destructive">{member.blocked}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className={cn(
                                                    "text-sm font-black",
                                                    member.rate > 70 ? "text-emerald-500" : member.rate > 30 ? "text-amber-500" : "text-destructive"
                                                )}>
                                                    {member.rate}%
                                                </span>
                                                <span className="text-lg leading-none">{member.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

