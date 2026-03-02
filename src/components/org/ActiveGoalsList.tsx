"use client";

import Link from "next/link";
import { Target, ArrowRight, AlertCircle, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { OrgGoal, OrgMember, GoalStatus } from "@/types";

const statusStyles: Record<GoalStatus, { label: string; class: string; icon: React.ElementType }> = {
    not_started: { label: "Not Started", class: "bg-muted/60 text-muted-foreground", icon: Clock },
    in_progress: { label: "In Progress", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: TrendingUp },
    blocked: { label: "Blocked", class: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]", icon: AlertCircle },
    completed: { label: "Completed", class: "bg-[oklch(0.55_0.18_155_/_0.15)] text-[oklch(0.70_0.18_155)]", icon: CheckCircle },
};

interface ActiveGoalsListProps {
    orgId: string;
    goals: OrgGoal[];
    members: OrgMember[];
    blockedCount: number;
}

export function ActiveGoalsList({ orgId, goals, members, blockedCount }: ActiveGoalsListProps) {
    return (
        <div className="glass-card p-5 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    Active Goals
                    {blockedCount > 0 && (
                        <Badge className="bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)] text-[10px] gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> {blockedCount} blocked
                        </Badge>
                    )}
                </h2>
                <div className="flex items-center gap-3">
                    <CreateGoalModal orgId={orgId} />
                    <Link href={`/org/${orgId}/goals`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
            <div className="space-y-3">
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 bg-accent/10 rounded-2xl border border-dashed border-border/40">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary opacity-50" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold">No active goals found</p>
                            <p className="text-[11px] text-muted-foreground max-w-[200px]">
                                Break the ice! Create the first goal for this organization.
                            </p>
                        </div>
                    </div>
                ) : (
                    goals.map((goal) => {
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
                                    <Progress value={goal.currentValue} className="flex-1 h-[6px]" />
                                    <span className="text-[11px] font-bold w-8 text-right text-primary">{goal.currentValue}%</span>
                                </div>
                                <div className="flex items-center justify-between mt-2.5">
                                    <div className="flex -space-x-1.5">
                                        {goal.assignedTo.slice(0, 3).map((mId) => {
                                            const member = members.find((m) => m.id === mId);
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
                    })
                )}
            </div>
        </div>
    );
}
