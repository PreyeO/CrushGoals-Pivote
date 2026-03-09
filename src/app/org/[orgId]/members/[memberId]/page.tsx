"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    ArrowLeft, Target, Trophy, Flame, Clock, TrendingUp,
    CheckCircle, AlertCircle, Ban, Calendar, Shield, ShieldCheck, Crown
} from "lucide-react";
import type { OrgRole, OrgGoal, GoalStatus } from "@/types";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";

const roleStyles: Record<OrgRole, { label: string; class: string; icon: React.ElementType }> = {
    owner: { label: "Owner", class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.78_0.14_80)]", icon: Crown },
    admin: { label: "Admin", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: ShieldCheck },
    member: { label: "Member", class: "bg-muted/60 text-muted-foreground", icon: Shield },
};

const goalStatusConfig: Record<GoalStatus, { label: string; color: string; icon: React.ElementType }> = {
    not_started: { label: "Not Started", color: "text-muted-foreground bg-muted/40", icon: Clock },
    in_progress: { label: "In Progress", color: "text-[oklch(0.70_0.18_250)] bg-[oklch(0.55_0.20_250_/_0.15)]", icon: TrendingUp },
    blocked: { label: "Blocked", color: "text-destructive bg-destructive/10", icon: Ban },
    completed: { label: "Completed", color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle },
};

export default function MemberDetailPage({ params }: { params: Promise<{ orgId: string; memberId: string }> }) {
    const { orgId, memberId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [now] = useState(() => Date.now());

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);
    const members = useStore(useShallow((state) => state.members));
    const goals = useStore(useShallow((state) => state.goals));
    const fetchMemberStatuses = useStore((state) => state.fetchMemberStatuses);
    const memberGoalStatuses = useStore(useShallow((state) => state.memberGoalStatuses));

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    const member = members.find(m => m.id === memberId && m.orgId === orgId);
    const memberGoals = goals.filter(g => g.orgId === orgId && g.assignedTo.includes(memberId));

    // Fetch statuses for all member goals
    useEffect(() => {
        if (memberGoals.length > 0) {
            memberGoals.forEach(g => fetchMemberStatuses(g.id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberGoals.length]);

    if (!mounted || (isLoading && !member)) return (
        <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse">
            Loading member...
        </div>
    );

    if (!member) return (
        <div className="p-8 text-center">
            <p className="text-muted-foreground">Member not found.</p>
            <Link href={`/org/${orgId}/members`} className="text-primary hover:underline text-sm mt-2 inline-block">
                ← Back to Members
            </Link>
        </div>
    );

    const r = roleStyles[member.role];
    const activeGoals = memberGoals.filter(g => g.status !== "completed");
    const completedGoals = memberGoals.filter(g => g.status === "completed");
    const blockedGoals = memberGoals.filter(g => g.status === "blocked");

    // Goals behind schedule
    const behindGoals = activeGoals.filter(g => {
        const start = new Date(g.startDate || g.createdAt).getTime();
        const end = new Date(g.deadline).getTime();
        const totalTime = end - start;
        const elapsed = now - start;
        const expected = totalTime > 0 ? Math.round((elapsed / totalTime) * 100) : 0;
        return g.progress < expected - 15;
    });

    // Overdue goals
    const overdueGoals = activeGoals.filter(g => new Date(g.deadline).getTime() < now);

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-5xl mx-auto">
            {/* Back link */}
            <Link
                href={`/org/${orgId}/members`}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
            </Link>

            {/* Profile Header Card */}
            <div className="glass-card p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-5">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/15 text-primary font-bold text-xl">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold truncate">{member.name}</h1>
                            <Badge className={`${r.class} text-[9px] gap-1`}>
                                <r.icon className="w-2.5 h-2.5" /> {r.label}
                            </Badge>
                        </div>
                        <p className="text-[12px] text-muted-foreground">{member.email || "No email"}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                            Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 stagger">
                <div className="glass-card p-4 text-center animate-fade-in-up">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Target className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Goals Assigned</p>
                    <p className="text-2xl font-black text-foreground">{member.goalsAssigned}</p>
                </div>
                <div className="glass-card p-4 text-center animate-fade-in-up">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-500">{member.goalsCompleted}</p>
                </div>
                <div className="glass-card p-4 text-center animate-fade-in-up">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Completion Rate</p>
                    <p className="text-2xl font-black text-primary">{member.completionRate}%</p>
                </div>
                <div className="glass-card p-4 text-center animate-fade-in-up">
                    <div className="w-9 h-9 rounded-xl bg-[oklch(0.72_0.18_55_/_0.12)] flex items-center justify-center mx-auto mb-2">
                        <Flame className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">Streak</p>
                    <p className="text-2xl font-black text-[oklch(0.72_0.18_55)]">{member.currentStreak}<span className="text-sm font-bold text-muted-foreground ml-1">days</span></p>
                </div>
            </div>

            {/* Alert Badges */}
            {(blockedGoals.length > 0 || behindGoals.length > 0 || overdueGoals.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-300">
                    {blockedGoals.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
                            <Ban className="w-3.5 h-3.5 text-destructive" />
                            <span className="text-[11px] font-bold text-destructive">{blockedGoals.length} goal{blockedGoals.length > 1 ? "s" : ""} blocked</span>
                        </div>
                    )}
                    {behindGoals.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-[11px] font-bold text-yellow-500">{behindGoals.length} goal{behindGoals.length > 1 ? "s" : ""} behind schedule</span>
                        </div>
                    )}
                    {overdueGoals.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
                            <Clock className="w-3.5 h-3.5 text-destructive" />
                            <span className="text-[11px] font-bold text-destructive">{overdueGoals.length} overdue</span>
                        </div>
                    )}
                </div>
            )}

            {/* Goals List */}
            <div>
                <p className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.15em] mb-4">
                    Assigned Goals ({memberGoals.length})
                </p>

                {memberGoals.length === 0 ? (
                    <div className="glass-card p-12 text-center border-dashed">
                        <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm font-bold text-foreground mb-1">No goals assigned</p>
                        <p className="text-xs text-muted-foreground">This member hasn't been assigned any goals yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger">
                        {memberGoals.map((goal) => {
                            const sc = goalStatusConfig[goal.status];
                            const StatusIcon = sc.icon;
                            const isOverdue = goal.status !== "completed" && new Date(goal.deadline).getTime() < now;

                            // Pacing
                            const start = new Date(goal.startDate || goal.createdAt).getTime();
                            const end = new Date(goal.deadline).getTime();
                            const totalTime = end - start;
                            const elapsed = now - start;
                            const expected = totalTime > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalTime) * 100))) : 0;
                            const isBehind = goal.progress < expected - 15;
                            const isAhead = goal.progress > expected + 15;

                            // Member's individual status for this goal
                            const ms = memberGoalStatuses.find(
                                s => s.goalId === goal.id && (s.userId === member.userId || s.userId === member.id)
                            );

                            return (
                                <div
                                    key={goal.id}
                                    className={cn(
                                        "glass-card p-5 transition-all animate-fade-in-up group relative overflow-hidden",
                                        isOverdue && "border-destructive/30 bg-destructive/[0.02]",
                                        goal.status === "completed" && "border-emerald-500/20 bg-emerald-500/[0.02]",
                                    )}
                                >
                                    {isOverdue && (
                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-destructive text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                                            Overdue
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{goal.emoji}</span>
                                            <div>
                                                <h4 className="font-bold text-[14px]">{goal.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-muted-foreground">{goal.category}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[9px] font-bold uppercase tracking-wider px-1.5 h-4",
                                                            isBehind ? "bg-destructive/10 text-destructive border-destructive/20"
                                                                : isAhead ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                    : "bg-primary/10 text-primary border-primary/20"
                                                        )}
                                                    >
                                                        {isBehind ? "Behind" : isAhead ? "Ahead" : "On Track"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${sc.color} text-[9px] gap-1`}>
                                                <StatusIcon className="w-2.5 h-2.5" />
                                                {sc.label}
                                            </Badge>
                                            <GoalCheckInModal goal={goal} />
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Progress</span>
                                            <span className="text-[10px] font-bold text-primary">
                                                {goal.targetNumber
                                                    ? `${goal.currentValue} / ${goal.targetNumber} ${goal.unit}`
                                                    : `${goal.progress}%`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Progress value={goal.progress} className="h-2" />
                                            </div>
                                            <span className={cn(
                                                "text-sm font-black w-10 text-right tabular-nums",
                                                isOverdue ? "text-destructive" : "text-primary"
                                            )}>
                                                {goal.progress}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Member's status note */}
                                    {ms && (
                                        <div className="pt-3 mt-3 border-t border-border/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider">
                                                    Last Check-in
                                                </span>
                                                <span className="text-[9px] text-muted-foreground/50">
                                                    {new Date(ms.updatedAt).toLocaleDateString("en-US", {
                                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                            {ms.note && (
                                                <p className="text-[11px] text-muted-foreground bg-accent/20 rounded-lg p-2 border border-border/10">
                                                    &ldquo;{ms.note}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Deadline */}
                                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
