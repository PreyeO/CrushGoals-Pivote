"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, TrendingUp, AlertCircle, CheckCircle, ChevronDown, Calendar, MessageSquare, Edit3, X, Check, Ban, AlertTriangle } from "lucide-react";
import { getGoalAssignees, getOrgLeaderboard } from "@/lib/store-utils";
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
    const isCompleted = goal.currentValue === 100 || goal.status === "completed";
    const deadline = new Date(goal.deadline);
    const isOverdue = !isCompleted && deadline < new Date();

    const [expanded, setExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newProgress, setNewProgress] = useState(goal.currentValue);
    const [updateNote, setUpdateNote] = useState("");

    const updateGoalProgress = useStore((state) => state.updateGoalProgress);

    const handleUpdateProgress = async () => {
        try {
            await updateGoalProgress(goal.id, newProgress, updateNote.trim());
            setIsUpdating(false);
            setUpdateNote("");
        } catch (error) {
            console.error("Failed to update progress:", error);
        }
    };

    const s = statusStyles[goal.status];
    const p = priorityStyles[goal.priority];
    const members = useStore((state) => state.members);
    const assignees = getGoalAssignees(goal, members);

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
                    <span className="text-xl flex-shrink-0">{goal.emoji}</span>
                    <div className="min-w-0">
                        <h3 className={cn("font-bold text-[15px] truncate", isOverdue && "text-destructive")}>{goal.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>{goal.category}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-primary font-medium">{goal.targetValue}</span>
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

            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">{goal.description}</p>

            {/* Status Section (Now before Progress) */}
            {goal.status === "blocked" && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Ban className="w-3 h-3" /> Blocked
                    </p>
                    <p className="text-[11px] text-destructive/80 italic">
                        {goal.comments.find(c => c.content.startsWith("🚩 BLOCKED:"))?.content.replace("🚩 BLOCKED:", "") || "Waiting on resolution"}
                    </p>
                </div>
            )}

            {/* Progress Section */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.1em]">Current Progress</span>
                    {!isUpdating ? (
                        <button
                            onClick={() => setIsUpdating(true)}
                            className="text-[10px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1.5 border border-primary/20 cursor-pointer"
                        >
                            <Edit3 className="w-3 h-3" /> Update
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={handleUpdateProgress} className="text-[10px] font-bold text-[oklch(0.70_0.18_155)] hover:bg-[oklch(0.55_0.18_155_/_0.1)] px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer">
                                <Check className="w-3 h-3" /> Finish
                            </button>
                            <button onClick={() => { setIsUpdating(false); setNewProgress(goal.currentValue); setUpdateNote(""); }} className="text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer">
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Progress value={isUpdating ? newProgress : goal.currentValue} className={cn("h-3 rounded-full", isOverdue && !isUpdating ? "bg-destructive/20" : "")} />
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
                    <span className={cn("text-lg font-black w-12 text-right tracking-tighter", isOverdue ? "text-destructive" : "text-primary")}>
                        {isUpdating ? newProgress : goal.currentValue}%
                    </span>
                </div>

                {isUpdating && (
                    <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Add a quick note (e.g. what's the latest?)</Label>
                        <Textarea
                            placeholder="Hit 80 sign-ups, waiting on landing page fix..."
                            value={updateNote}
                            onChange={(e) => setUpdateNote(e.target.value)}
                            className="text-xs bg-background/50 min-h-[60px]"
                        />
                    </div>
                )}
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
                    <span className={cn(
                        "text-[11px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md",
                        isOverdue ? "bg-destructive/10 text-destructive" : "text-muted-foreground bg-accent/30"
                    )}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
                >
                    {expanded ? "Less" : "Feed"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Expanded Feed */}
            {expanded && (
                <div className="mt-5 pt-5 border-t border-border/30 space-y-5 animate-in fade-in slide-in-from-top-3">
                    {/* Simplified human-centric comments */}
                    <div>
                        <p className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">Goal Updates</p>
                        <div className="space-y-3">
                            {goal.comments.length > 0 ? (
                                goal.comments.map((c) => (
                                    <div key={c.id} className="flex gap-3 items-start group/comment">
                                        <Avatar className="w-6 h-6 border border-background flex-shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">{c.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-accent/20 rounded-2xl p-3 border border-border/10 group-hover/comment:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-bold">{c.userName}</span>
                                                <span className="text-[9px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            </div>
                                            <p className="text-[12px] text-muted-foreground leading-snug">{c.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-muted-foreground italic text-center py-4 bg-accent/10 rounded-xl border border-dashed border-border/40">
                                    No updates yet. Encourage the team to share their progress!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
