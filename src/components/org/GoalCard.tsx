"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Clock, TrendingUp, AlertCircle, CheckCircle, ChevronDown,
    Calendar, Ban, AlertTriangle, Trash2, Users,
} from "lucide-react";
import { getGoalAssignees } from "@/lib/store-utils";
import { toast } from "sonner";
import type { GoalStatus, GoalPriority, OrgGoal, OrgMember, MemberGoalStatusValue } from "@/types";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";

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

const memberStatusConfig: Record<MemberGoalStatusValue, { label: string; badgeClass: string; icon: React.ElementType }> = {
    on_track: { label: "On Track", badgeClass: "bg-primary/10 text-primary", icon: TrendingUp },
    behind: { label: "Behind", badgeClass: "bg-yellow-500/10 text-yellow-400", icon: Clock },
    blocked: { label: "Blocked", badgeClass: "bg-destructive/10 text-destructive", icon: Ban },
    completed: { label: "Completed", badgeClass: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle },
};

const STALE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export function GoalCard({ goal }: { goal: OrgGoal }) {
    const [now] = useState(() => Date.now());
    const isCompleted = goal.status === "completed";
    const deadline = new Date(goal.deadline);
    const isOverdue = !isCompleted && deadline < new Date();

    const [expanded, setExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Pacing
    const start = new Date(goal.startDate || goal.createdAt).getTime();
    const end = deadline.getTime();
    const totalTime = end - start;
    const elapsedTime = now - start;
    const expectedProgress = totalTime > 0 ? Math.min(100, Math.max(0, Math.round((elapsedTime / totalTime) * 100))) : 0;
    const isBehind = goal.progress < expectedProgress - 15;
    const isAhead = goal.progress > expectedProgress + 15;

    const s = statusStyles[goal.status];
    const p = priorityStyles[goal.priority];

    const members = useStore((state) => state.members);
    const user = useStore((state) => state.user);
    const deleteGoal = useStore((state) => state.deleteGoal);
    const fetchMemberStatuses = useStore((state) => state.fetchMemberStatuses);
    const memberGoalStatuses = useStore(
        useShallow((state) => state.memberGoalStatuses.filter((s) => s.goalId === goal.id))
    );

    const assignees = getGoalAssignees(goal, members);
    const myMember = members.find(m => m.orgId === goal.orgId && m.userId === user?.id);
    const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";

    const handleToggleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next) fetchMemberStatuses(goal.id);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteGoal(goal.id, goal.orgId);
            toast.success("Goal deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete goal");
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className={cn(
            "glass-card p-5 transition-all animate-fade-in-up group/card relative overflow-hidden",
            isCompleted ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "hover:border-primary/20",
            isOverdue && "border-destructive/50 bg-destructive/[0.03] shadow-[0_0_20px_-10px_rgba(239,68,68,0.5)]"
        )}>
            {isCompleted && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
            )}
            {isOverdue && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-destructive text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg shadow-lg z-10 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Overdue
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0 group-hover/card:scale-110 transition-transform">{goal.emoji}</span>
                    <div className="min-w-0">
                        <h3 className={cn("font-bold text-[15px] truncate", isOverdue && "text-destructive")}>{goal.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">{goal.category}</span>
                            <Badge variant="outline" className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 h-4",
                                isBehind ? "bg-destructive/10 text-destructive border-destructive/20" :
                                    isAhead ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        "bg-primary/10 text-primary border-primary/20"
                            )}>
                                {isBehind ? "Behind" : isAhead ? "Ahead" : "On Track"}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge className={`${p.class} text-[9px]`}>{p.label}</Badge>
                    <Badge className={`${s.badgeClass} text-[9px] gap-1`}>
                        <s.icon className="w-2.5 h-2.5" />{s.label}
                    </Badge>
                </div>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">{goal.description}</p>

            {/* Blocked notice */}
            {goal.status === "blocked" && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Ban className="w-3 h-3" /> Blocked
                    </p>
                    <p className="text-[11px] text-destructive/80 italic">
                        {goal.comments.find(c => c.content.includes("🚩 BLOCKED:"))?.content?.replace("🚩 BLOCKED:", "") || "Waiting on resolution"}
                    </p>
                </div>
            )}

            {/* Progress */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.1em]">Overall Progress</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {goal.targetNumber ? `${goal.currentValue} / ${goal.targetNumber} ${goal.unit}` : goal.targetValue}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Progress value={goal.progress} className={cn("h-3 rounded-full", isOverdue ? "bg-destructive/20" : "")} />
                    </div>
                    <span className={cn("text-lg font-black w-12 text-right tracking-tighter", isOverdue ? "text-destructive" : "text-primary")}>
                        {goal.progress}%
                    </span>
                </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {assignees.map((m: OrgMember) => (
                            <Avatar key={m.id} className="w-7 h-7 border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-black">{m.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <span className={cn("text-[11px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md", isOverdue ? "bg-destructive/10 text-destructive" : "text-muted-foreground bg-accent/30")}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <div className="relative">
                            {confirmDelete ? (
                                <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                    <button disabled={isDeleting} onClick={handleDelete} className="text-[10px] font-bold bg-destructive text-white px-2 py-1 rounded hover:bg-destructive/90 transition-colors disabled:opacity-50">
                                        {isDeleting ? "..." : "Confirm"}
                                    </button>
                                    <button disabled={isDeleting} onClick={() => setConfirmDelete(false)} className="text-[10px] font-bold bg-accent/50 text-muted-foreground px-2 py-1 rounded hover:bg-accent transition-colors disabled:opacity-50">
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer group/del" title="Delete Goal">
                                    <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                                </button>
                            )}
                        </div>
                    )}
                    <button
                        onClick={handleToggleExpand}
                        className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg hover:bg-accent/50"
                    >
                        <Users className="w-3.5 h-3.5" />
                        {expanded ? "Hide" : "Team"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    <GoalCheckInModal goal={goal} />
                </div>
            </div>

            {/* Team Progress Panel */}
            {expanded && (
                <div className="mt-5 pt-5 border-t border-border/30 space-y-3 animate-in fade-in slide-in-from-top-3">
                    <p className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.2em]">Team Progress</p>

                    {assignees.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic text-center py-4 bg-accent/10 rounded-xl border border-dashed border-border/40">
                            No members assigned to this goal yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {assignees.map((member: OrgMember) => {
                                const ms = memberGoalStatuses.find(s => s.userId === member.userId);
                                const stale = ms
                                    ? Date.now() - new Date(ms.updatedAt).getTime() > STALE_MS
                                    : true;
                                const config = ms ? memberStatusConfig[ms.status as MemberGoalStatusValue] : null;
                                const Icon = config?.icon;

                                return (
                                    <div key={member.id} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20 border border-border/10 hover:border-primary/20 transition-colors">
                                        <Avatar className="w-7 h-7 shrink-0 border border-background">
                                            <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-black">
                                                {member.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[12px] font-bold">{member.name}</span>
                                                {config ? (
                                                    <span className={cn("inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full", config.badgeClass)}>
                                                        {Icon && <Icon className="w-2.5 h-2.5" />}
                                                        {config.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                                                        No update
                                                    </span>
                                                )}
                                                {stale && (
                                                    <span className="text-[9px] text-yellow-500 font-bold flex items-center gap-0.5">
                                                        <AlertTriangle className="w-2.5 h-2.5" />
                                                        {ms ? "Stale" : "Never updated"}
                                                    </span>
                                                )}
                                            </div>
                                            {ms?.note && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">"{ms.note}"</p>
                                            )}
                                            {ms && (
                                                <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                                                    {new Date(ms.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
