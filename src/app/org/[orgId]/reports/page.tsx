"use client";

import { use, useState, useEffect } from "react";
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
    Minus
} from "lucide-react";
import { notFound } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

export default function OrgReportsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const org = useStore((state) => state.organizations.find((o) => o.id === orgId));
    const goals = useStore(useShallow((state) => state.goals.filter(g => g.orgId === orgId)));

    if (!mounted) return null;
    if (!org) return notFound();

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const blockedGoals = goals.filter(g => g.status === 'blocked').length;
    const avgProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / goals.length)
        : 0;

    const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
        <Card className="glass-card-hover border-border/40 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1 mt-1">
                    {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                    {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-destructive" />}
                    {trend === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                    <span className={cn(
                        "text-[10px] font-medium",
                        trend === 'up' ? "text-emerald-500" : trend === 'down' ? "text-destructive" : "text-muted-foreground"
                    )}>{trendValue}</span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
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
                            <Button variant="outline" size="sm" className="h-9 text-[11px] font-bold gap-2 bg-accent/20 border-border/40">
                                <FileText className="w-3.5 h-3.5" /> CSV
                            </Button>
                            <Button className="gradient-primary text-white border-0 h-9 px-6 text-[11px] font-bold glow-primary-sm gap-2">
                                <Download className="w-3.5 h-3.5" /> Export PDF
                            </Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
                        <StatCard title="Avg. Completion" value={`${avgProgress}%`} icon={TrendingUp} trend="up" trendValue="+12% vs last month" />
                        <StatCard title="Active Goals" value={goals.length} icon={Target} trend="stable" trendValue="Same as last week" />
                        <StatCard title="Team Health" value="84/100" icon={Activity} trend="up" trendValue="Improving consistently" />
                        <StatCard title="Collaborators" value={org.memberCount} icon={Users} trend="up" trendValue="+2 new members" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {/* Progress Chart Simulation */}
                        <Card className="lg:col-span-2 glass-card border-border/40">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-primary" /> Progress Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex flex-col justify-end gap-2 px-4 pb-6">
                                <div className="flex items-end gap-3 h-full px-2 border-b border-l border-border/30 pb-1">
                                    {[35, 45, 40, 65, 80, 75, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary/20 rounded-t-lg group relative transition-all hover:bg-primary/40" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border/40 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                                                {h}% Progress
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest pt-2">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Wins / Blockers */}
                        <Card className="glass-card border-border/40">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Goal Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed</span>
                                        <span>{completedGoals}</span>
                                    </div>
                                    <Progress value={(completedGoals / goals.length) * 100} className="h-1.5 bg-accent/20" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> In Progress</span>
                                        <span>{goals.length - completedGoals - blockedGoals}</span>
                                    </div>
                                    <Progress value={((goals.length - completedGoals - blockedGoals) / goals.length) * 100} className="h-1.5 bg-accent/20" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-destructive" /> Blocked</span>
                                        <span>{blockedGoals}</span>
                                    </div>
                                    <Progress value={(blockedGoals / goals.length) * 100} className="h-1.5 bg-accent/20" />
                                </div>

                                <div className="pt-4 mt-4 border-t border-border/20">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Your team is completing goals <span className="text-emerald-500 font-bold">2.4x faster</span> than last quarter.
                                        Most blockers are resolved within 48 hours.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

import { cn } from "@/lib/utils";
