"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    Download,
    FileText,
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
import { reportService } from "@/lib/services/reportService";
import { toast } from "sonner";
import { ReportStatCards } from "@/components/org/ReportStatCards";
import { ReportMonthlyChart } from "@/components/org/ReportMonthlyChart";
import { ReportTopBlockers } from "@/components/org/ReportTopBlockers";
import { ReportMemberTable } from "@/components/org/ReportMemberTable";

export default function OrgReportsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
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

    const handleDownloadCSV = () => {
        if (!goals.length) {
            toast.error("No data available to export for this period.");
            return;
        }

        try {
            setIsExporting(true);
            const csv = reportService.generateCSV(goals);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `crushgoals_report_${org?.name.toLowerCase().replace(/\s+/g, '_')}_${filterPeriod}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV report downloaded successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to generate CSV report.");
        } finally {
            setIsExporting(false);
        }
    };

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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isExporting}
                        onClick={handleDownloadCSV}
                        className="h-9 text-[11px] font-bold gap-2 bg-accent/20 border-border/40"
                    >
                        <FileText className="w-3.5 h-3.5" /> {isExporting ? "Exporting..." : "CSV"}
                    </Button>
                    <Button className="gradient-primary text-white border-0 h-9 px-6 text-[11px] font-bold glow-primary-sm gap-2">
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </Button>
                </div>
            </header>

            <ReportStatCards
                avgProgress={avgProgress}
                completedGoalsCount={completedGoals.length}
                blockedGoalsCount={blockedGoals.length}
                monthlyVelocity={monthlyData[5].count}
            />

            <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
                <ReportMonthlyChart monthlyData={monthlyData} />
                <ReportTopBlockers topBlockers={topBlockers} totalBlocked={blockedGoals.length} />
                <ReportMemberTable memberStats={memberStats} />
            </div>
        </div>
    );
}
