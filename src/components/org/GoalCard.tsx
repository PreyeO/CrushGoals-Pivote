"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, TrendingUp, AlertCircle, CheckCircle, ChevronDown, Calendar, MessageSquare, Milestone, Edit3, X, Check } from "lucide-react";
import { getGoalAssignees } from "@/lib/mock-data";
import type { GoalStatus, GoalPriority, OrgGoal, OrgMember } from "@/types";

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

export function GoalCard({ goal }: { goal: OrgGoal }) {
    const [expanded, setExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newProgress, setNewProgress] = useState(goal.progress);

    const updateGoalProgress = useStore((state) => state.updateGoalProgress);
    const toggleMilestone = useStore((state) => state.toggleMilestone);

    const handleUpdateProgress = () => {
        updateGoalProgress(goal.id, newProgress);
        setIsUpdating(false);
    };

    const s = statusStyles[goal.status];
    const p = priorityStyles[goal.priority];
    const assignees = getGoalAssignees(goal);
    const completedMs = goal.milestones.filter((m) => m.completed).length;

    return (
        <div className="glass-card p-5 transition-all hover:border-primary/20 animate-fade-in-up">
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
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Progress</span>
                    {!isUpdating ? (
                        <button
                            onClick={() => setIsUpdating(true)}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            <Edit3 className="w-2.5 h-2.5" /> Update
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={handleUpdateProgress} className="text-[10px] font-bold text-[oklch(0.70_0.18_155)] hover:underline flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Save
                            </button>
                            <button onClick={() => { setIsUpdating(false); setNewProgress(goal.progress); }} className="text-[10px] font-bold text-destructive hover:underline flex items-center gap-0.5">
                                <X className="w-2.5 h-2.5" /> Cancel
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Progress value={isUpdating ? newProgress : goal.progress} className="h-2" />
                        {isUpdating && (
                            <input
                                type="range"
                                min="0" max="100"
                                value={newProgress}
                                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        )}
                    </div>
                    <span className="text-sm font-extrabold text-primary w-10 text-right">
                        {isUpdating ? newProgress : goal.progress}%
                    </span>
                </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                        {assignees.slice(0, 4).map((m: OrgMember) => (
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
                                    <div
                                        key={ms.id}
                                        className="flex items-center gap-2.5 text-[12px] py-1.5 cursor-pointer group/ms"
                                        onClick={() => toggleMilestone(goal.id, ms.id)}
                                    >
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${ms.completed ? "bg-[oklch(0.55_0.18_155_/_0.2)]" : "bg-muted/60 group-hover/ms:bg-primary/20"}`}>
                                            {ms.completed ? <CheckCircle className="w-3 h-3 text-[oklch(0.70_0.18_155)]" /> : <Clock className="w-3 h-3 text-muted-foreground group-hover/ms:text-primary" />}
                                        </div>
                                        <span className={cn(ms.completed && "line-through text-muted-foreground")}>{ms.title}</span>
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
