"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, MessageSquare, User, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGoalAssignees } from "@/lib/store-utils";
import type { OrgGoal } from "@/types";

interface GoalDetailsProps {
    goal: OrgGoal;
    className?: string;
}

export function GoalDetails({ goal, className }: GoalDetailsProps) {
    const members = useStore((state) => state.members);
    const fetchMemberStatuses = useStore((state) => state.fetchMemberStatuses);
    const memberGoalStatuses = useStore(
        useShallow((state) => state.memberGoalStatuses.filter(s => s.goalId === goal.id))
    );
    const checkins = useStore(
        useShallow((state) =>
            state.dailyCheckins
                .filter((c) => c.goalId === goal.id)
        )
    );

    useEffect(() => {
        fetchMemberStatuses(goal.id);
    }, [goal.id, fetchMemberStatuses]);

    const assignees = getGoalAssignees(goal, members);
    
    // Combine notes from checkins and status updates for a comprehensive activity feed
    const allActivity = useMemo(() => {
        const activity = [
            ...checkins.filter(c => c.note).map(c => ({
                id: c.id,
                userId: c.userId,
                note: c.note,
                date: c.checkDate || c.createdAt,
                type: 'checkin'
            })),
            ...memberGoalStatuses.filter(s => s.note).map(s => ({
                id: s.id,
                userId: s.userId,
                note: s.note,
                date: s.updatedAt,
                type: 'status_update'
            }))
        ];

        // Sort by date newest first
        return activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    }, [checkins, memberGoalStatuses]);

    return (
        <div className={cn("mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300", className)}>
            {/* Members Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <User className="w-3 h-3" />
                    Team Members
                </div>
                <div className="grid gap-3">
                    {assignees.map((member) => {
                        const status = memberGoalStatuses.find(s => s.userId === member.userId);
                        return (
                            <div key={member.id} className="group/member flex flex-col p-3 rounded-xl bg-accent/50 border border-border/10 hover:bg-accent/80 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 border border-background shadow-sm">
                                            <AvatarImage src={member.avatarUrl || undefined} />
                                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                                {member.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-xs font-bold leading-none mb-0.5">{member.name}</div>
                                            <div className="text-[9px] text-muted-foreground leading-none lowercase">
                                                {member.role}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Streak Badge */}
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                        <Flame className="w-2.5 h-2.5 fill-current" />
                                        <span className="text-[9px] font-black">{member.currentStreak || 0}</span>
                                    </div>
                                </div>
                                
                                {status?.note && (
                                    <div className="mt-1 pl-11 relative">
                                        <div className="absolute left-[3.25rem] top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                                        <p className="text-[10px] text-foreground/80 leading-relaxed bg-primary/5 rounded-lg p-2 border border-primary/10 italic">
                                            "{status.note}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {assignees.length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic py-2">
                            No members assigned to this goal.
                        </div>
                    )}
                </div>
            </div>

            {/* Combined Activity/Comments Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <Activity className="w-3 h-3" />
                    Feed / Activity
                </div>
                <div className="space-y-4">
                    {allActivity.map((act) => {
                        const commenter = members.find(m => m.userId === act.userId);
                        return (
                            <div key={act.id} className="relative pl-6 border-l border-primary/20 pb-1">
                                <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-background" />
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-primary">{commenter?.name || "Member"}</span>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent/50 text-muted-foreground border border-border/10 uppercase font-black tracking-tighter">
                                            {act.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {new Date(act.date).toLocaleDateString(undefined, { 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="text-[11px] leading-relaxed text-foreground bg-accent/30 p-2.5 rounded-xl border border-border/10 shadow-sm">
                                    {act.note}
                                </div>
                            </div>
                        )
                    })}
                    {allActivity.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 border-dashed border-border/50 bg-accent/5">
                            <MessageSquare className="w-5 h-5 text-muted-foreground/30 mb-2" />
                            <div className="text-[10px] text-muted-foreground italic font-medium">
                                No activity or notes recorded yet.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

