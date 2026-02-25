"use client";

import { use, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { getOrganization, getOrgGoals, getOrgMembers, getGoalAssignees } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, Clock, TrendingUp, AlertCircle, CheckCircle, ChevronDown, Calendar, MessageSquare, Milestone, Search } from "lucide-react";
import { notFound } from "next/navigation";
import type { GoalStatus, GoalPriority, OrgGoal } from "@/types";

const statusStyles: Record<GoalStatus, { label: string; dotColor: string; badgeClass: string; icon: React.ElementType }> = {
    not_started: { label: "Not Started", dotColor: "bg-muted-foreground", badgeClass: "bg-muted/60 text-muted-foreground", icon: Clock },
    in_progress: { label: "In Progress", dotColor: "bg-[oklch(0.70_0.18_250)]", badgeClass: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: TrendingUp },
    blocked: { label: "Blocked", dotColor: "bg-[oklch(0.62_0.24_25)]", badgeClass: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]", icon: AlertCircle },
    completed: { label: "Completed", dotColor: "bg-[oklch(0.65_0.20_155)]", badgeClass: "bg-[oklch(0.55_0.18_155_/_0.15)] text-[oklch(0.70_0.18_155)]", icon: CheckCircle },
};

const priorityStyles: Record<GoalPriority, { label: string; class: string }> = {
    high: { label: "High", class: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]" },
    medium: { label: "Medium", class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.75_0.15_80)]" },
    low: { label: "Low", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]" },
};

function GoalCard({ goal }: { goal: OrgGoal }) {
    const [expanded, setExpanded] = useState(false);
    const s = statusStyles[goal.status];
    const p = priorityStyles[goal.priority];
    const assignees = getGoalAssignees(goal);
    const completedMs = goal.milestones.filter((m) => m.completed).length;

    return (
        <div className="glass-card p-5 transition-all hover:border-primary/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0">{goal.emoji}</span>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[14px] truncate">{goal.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>{goal.category}</span>
                            {goal.framework !== "simple" && (
                                <Badge className="bg-primary/10 text-primary text-[9px] px-1.5 py-0 uppercase tracking-wider">
                                    {goal.framework}
                                </Badge>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge className={`${p.class} text-[9px]`}>{p.label}</Badge>
                    <Badge className={`${s.badgeClass} text-[9px] gap-1`}>
                        <s.icon className="w-2.5 h-2.5" />{s.label}
                    </Badge>
                </div>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{goal.description}</p>

            {/* Progress */}
            <div className="flex items-center gap-2.5 mb-3">
                <Progress value={goal.progress} className="flex-1 h-2" />
                <span className="text-sm font-extrabold text-primary w-10 text-right">{goal.progress}%</span>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                        {assignees.slice(0, 4).map((m) => (
                            <Avatar key={m.id} className="w-6 h-6 border-[1.5px] border-background">
                                <AvatarFallback className="bg-primary/15 text-primary text-[8px] font-bold">{m.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {assignees.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold border-[1.5px] border-background">+{assignees.length - 4}</div>
                        )}
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {goal.milestones.length > 0 && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Milestone className="w-3 h-3" />
                            {completedMs}/{goal.milestones.length}
                        </span>
                    )}
                    {goal.comments.length > 0 && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {goal.comments.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                    {expanded ? "Less" : "More"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Expanded */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-border/30 space-y-4 animate-fade-in-up">
                    {/* Key Results */}
                    {goal.keyResults && goal.keyResults.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2">Key Results</p>
                            <div className="space-y-2">
                                {goal.keyResults.map((kr) => (
                                    <div key={kr.id} className="p-3 rounded-xl bg-accent/30">
                                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                                            <span className="font-medium">{kr.title}</span>
                                            <span className="text-[11px] font-bold text-primary">{kr.currentValue}/{kr.targetValue} {kr.unit}</span>
                                        </div>
                                        <Progress value={(kr.currentValue / kr.targetValue) * 100} className="h-[5px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2">
                                Milestones
                            </p>
                            <div className="space-y-1.5">
                                {goal.milestones.map((ms) => (
                                    <div key={ms.id} className="flex items-center gap-2.5 text-[12px] py-1.5">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ms.completed ? "bg-[oklch(0.55_0.18_155_/_0.2)]" : "bg-muted/60"}`}>
                                            {ms.completed ? <CheckCircle className="w-3 h-3 text-[oklch(0.70_0.18_155)]" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
                                        </div>
                                        <span className={ms.completed ? "line-through text-muted-foreground" : ""}>{ms.title}</span>
                                        <span className="text-[9px] text-muted-foreground ml-auto flex-shrink-0">
                                            {ms.completedAt
                                                ? `✓ ${new Date(ms.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                                : `Due ${new Date(ms.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    {goal.comments.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2">
                                Comments
                            </p>
                            <div className="space-y-2">
                                {goal.comments.map((c) => (
                                    <div key={c.id} className="flex items-start gap-2 p-3 rounded-xl bg-accent/20">
                                        <Avatar className="w-5 h-5 mt-0.5">
                                            <AvatarFallback className="bg-primary/15 text-primary text-[8px] font-bold">{c.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-semibold">{c.userName}</span>
                                                <span className="text-[9px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            </div>
                                            <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function OrgGoalsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [filter, setFilter] = useState<string>("all");
    const org = getOrganization(orgId);
    if (!org) return notFound();

    const allGoals = getOrgGoals(orgId);
    const filtered = filter === "all" ? allGoals : allGoals.filter((g) => g.status === filter);

    const counts: Record<string, number> = {
        all: allGoals.length,
        in_progress: allGoals.filter((g) => g.status === "in_progress").length,
        completed: allGoals.filter((g) => g.status === "completed").length,
        blocked: allGoals.filter((g) => g.status === "blocked").length,
        not_started: allGoals.filter((g) => g.status === "not_started").length,
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Team Goals
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-1">
                                {allGoals.length} goals · {counts.completed} completed · {counts.blocked > 0 ? `${counts.blocked} blocked` : "no blockers"}
                            </p>
                        </div>
                        <Button className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold self-start">
                            <Plus className="w-4 h-4" /> New Goal
                        </Button>
                    </div>

                    {/* Filters */}
                    <Tabs value={filter} onValueChange={setFilter} className="mb-6">
                        <TabsList className="bg-accent/40 p-1 h-auto">
                            {[
                                { value: "all", label: "All" },
                                { value: "in_progress", label: "Active" },
                                { value: "blocked", label: "Blocked" },
                                { value: "completed", label: "Done" },
                                { value: "not_started", label: "Not Started" },
                            ].map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value} className="text-[12px] px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                                    {tab.label} <span className="ml-1 text-[10px] opacity-60">{counts[tab.value]}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {/* Goals */}
                    <div className="space-y-4 stagger">
                        {filtered.map((goal) => (
                            <div key={goal.id} className="animate-fade-in-up">
                                <GoalCard goal={goal} />
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="glass-card p-16 text-center">
                                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No goals match this filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
