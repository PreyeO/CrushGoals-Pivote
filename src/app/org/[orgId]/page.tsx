"use client";

import { use } from "react";
import { Sidebar } from "@/components/sidebar";
import { getOrganization, getOrgGoals, getOrgMembers, getOrgActivities, getTeamHealthScore, getOrgLeaderboard } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Target, Users, CheckCircle, TrendingUp, AlertCircle, Clock, MessageSquare, UserPlus, ArrowRight, Activity, Heart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { GoalStatus } from "@/types";

const statusStyles: Record<GoalStatus, { label: string; class: string; icon: React.ElementType }> = {
    not_started: { label: "Not Started", class: "bg-muted/60 text-muted-foreground", icon: Clock },
    in_progress: { label: "In Progress", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: TrendingUp },
    blocked: { label: "Blocked", class: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]", icon: AlertCircle },
    completed: { label: "Completed", class: "bg-[oklch(0.55_0.18_155_/_0.15)] text-[oklch(0.70_0.18_155)]", icon: CheckCircle },
};

const activityIcons: Record<string, React.ElementType> = {
    goal_created: Target, goal_completed: CheckCircle, milestone_hit: TrendingUp,
    member_joined: UserPlus, comment: MessageSquare, status_change: AlertCircle, goal_assigned: Target,
};

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const org = getOrganization(orgId);
    if (!org) return notFound();

    const goals = getOrgGoals(orgId);
    const membersList = getOrgMembers(orgId);
    const activities = getOrgActivities(orgId);
    const health = getTeamHealthScore(orgId);
    const leaderboard = getOrgLeaderboard(orgId).slice(0, 3);

    const activeGoals = goals.filter((g) => g.status !== "completed");
    const completedGoals = goals.filter((g) => g.status === "completed");
    const blockedGoals = goals.filter((g) => g.status === "blocked");

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-3xl">{org.emoji}</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{org.name}</h1>
                                    <Badge variant="outline" className="capitalize text-[10px] font-semibold border-primary/30 text-primary">{org.plan}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{org.description}</p>
                            </div>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
                        {[
                            { label: "Active Goals", value: activeGoals.length, emoji: "🎯", gradient: "gradient-primary" },
                            { label: "Completed", value: completedGoals.length, emoji: "✅", gradient: "gradient-success" },
                            { label: "Members", value: membersList.length, emoji: "👥", gradient: "gradient-warning" },
                            { label: "Health Score", value: `${health.overall}%`, emoji: health.trend === "up" ? "📈" : "📊", gradient: "gradient-premium" },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card p-5 animate-fade-in-up">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center text-base`}>
                                        {stat.emoji}
                                    </div>
                                    {stat.label === "Health Score" && (
                                        <span className={`text-[10px] font-semibold ${health.trend === "up" ? "text-[oklch(0.70_0.18_155)]" : "text-muted-foreground"}`}>
                                            {health.trend === "up" ? "↑ Improving" : health.trend === "stable" ? "→ Stable" : "↓ Declining"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-3xl font-extrabold tracking-tight animate-count-up">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-5 gap-5">
                        {/* ── Left: Goals ── */}
                        <div className="lg:col-span-3 space-y-5">
                            {/* Active Goals */}
                            <div className="glass-card p-5 animate-fade-in-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold flex items-center gap-2 text-sm">
                                        <Target className="w-4 h-4 text-primary" />
                                        Active Goals
                                        {blockedGoals.length > 0 && (
                                            <Badge className="bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)] text-[10px] gap-1">
                                                <AlertCircle className="w-2.5 h-2.5" /> {blockedGoals.length} blocked
                                            </Badge>
                                        )}
                                    </h2>
                                    <Link href={`/org/${orgId}/goals`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                        View all <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {activeGoals.slice(0, 5).map((goal) => {
                                        const config = statusStyles[goal.status];
                                        return (
                                            <div key={goal.id} className="p-3.5 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-base">{goal.emoji}</span>
                                                        <h3 className="font-medium text-[13px] truncate">{goal.title}</h3>
                                                    </div>
                                                    <Badge className={`${config.class} text-[9px] flex-shrink-0 gap-1 ml-2`}>
                                                        <config.icon className="w-2.5 h-2.5" />
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2.5 mt-2.5">
                                                    <Progress value={goal.progress} className="flex-1 h-[6px]" />
                                                    <span className="text-[11px] font-bold w-8 text-right text-primary">{goal.progress}%</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2.5">
                                                    <div className="flex -space-x-1.5">
                                                        {goal.assignedTo.slice(0, 3).map((mId) => {
                                                            const member = membersList.find((m) => m.id === mId);
                                                            return (
                                                                <Avatar key={mId} className="w-5 h-5 border border-background">
                                                                    <AvatarFallback className="bg-primary/15 text-primary text-[8px] font-bold">
                                                                        {member?.name?.charAt(0) || "?"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column ── */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Team Health */}
                            <div className="glass-card p-5 animate-slide-in-right">
                                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-primary" />
                                    Team Health
                                </h2>
                                <div className="space-y-3.5">
                                    {[
                                        { label: "Goal Progress", value: health.goalProgress, color: "text-primary" },
                                        { label: "Member Engagement", value: health.memberEngagement, color: "text-[oklch(0.70_0.18_155)]" },
                                        { label: "On-Time Completion", value: health.onTimeCompletion, color: "text-[oklch(0.75_0.15_80)]" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                                <span className="text-muted-foreground">{item.label}</span>
                                                <span className={`font-bold ${item.color}`}>{item.value}%</span>
                                            </div>
                                            <Progress value={item.value} className="h-[5px]" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Performers */}
                            <div className="glass-card p-5 animate-slide-in-right" style={{ animationDelay: "80ms" }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-sm flex items-center gap-2">
                                        🏆 Top Performers
                                    </h2>
                                    <Link href={`/org/${orgId}/leaderboard`} className="text-[10px] text-primary hover:underline">View all</Link>
                                </div>
                                <div className="space-y-2.5">
                                    {leaderboard.map((entry) => (
                                        <div key={entry.memberId} className="flex items-center gap-3 p-2.5 rounded-xl bg-accent/20 hover:bg-accent/40 transition-colors">
                                            <span className="text-sm w-5 text-center">
                                                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                                            </span>
                                            <Avatar className="w-7 h-7">
                                                <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-bold">
                                                    {entry.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-medium truncate">{entry.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{entry.goalsCompleted} goals • {entry.completionRate}%</p>
                                            </div>
                                            <span className="text-[11px] font-bold text-primary">{entry.totalPoints}pt</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="glass-card p-5 animate-slide-in-right" style={{ animationDelay: "160ms" }}>
                                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" />
                                    Recent Activity
                                </h2>
                                <div className="space-y-3">
                                    {activities.slice(0, 5).map((act) => {
                                        const Icon = activityIcons[act.type] || Target;
                                        return (
                                            <div key={act.id} className="flex items-start gap-2.5">
                                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Icon className="w-3 h-3 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] leading-relaxed">
                                                        <span className="font-semibold">{act.userName}</span>{" "}
                                                        <span className="text-muted-foreground">{act.message}</span>
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                                                        {new Date(act.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
