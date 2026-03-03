"use client";

import { useState } from "react";

import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { OrgGoal, OrgMember } from "@/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getVisibleGoals } from "@/lib/store-utils";
import { useShallow } from "zustand/react/shallow";

interface ActiveGoalsListProps {
  orgId: string;
  limit?: number;
  goals?: OrgGoal[];
  members?: OrgMember[];
}

export function ActiveGoalsList({
  orgId,
  limit,
  goals: propGoals,
  members: propMembers,
}: ActiveGoalsListProps) {
  const storeGoals = useStore(
    useShallow((state) => state.goals.filter((g) => g.orgId === orgId)),
  );
  const storeMembers = useStore(useShallow((state) => state.members));
  const user = useStore(useShallow((state) => state.user));

  const goals = propGoals || storeGoals;
  const members = propMembers || storeMembers;

  const myMember = members.find(
    (m) => m.orgId === orgId && m.userId === user?.id,
  );
  const visibleGoals = getVisibleGoals(goals, myMember);

  const [now] = useState(() => Date.now());
  const displayedGoals = limit ? visibleGoals.slice(0, limit) : visibleGoals;

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 glass-card border-dashed border-2 border-border/40 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No active goals yet
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-6 text-center max-w-50">
          Every big achievement starts with a single goal.
        </p>
        <CreateGoalModal orgId={orgId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedGoals.map((goal) => {
        const goalAssignees = members.filter((m) =>
          goal.assignedTo.includes(m.id),
        );
        const blockedCount = goal.status === "blocked" ? 1 : 0;

        const start = new Date(goal.startDate || goal.createdAt).getTime();
        const end = new Date(goal.deadline).getTime();
        const expectedProgress =
          end - start > 0
            ? Math.min(
                100,
                Math.max(0, Math.round(((now - start) / (end - start)) * 100)),
              )
            : 0;
        const isBehind = goal.progress < expectedProgress - 15;
        const isAhead = goal.progress > expectedProgress + 15;

        return (
          <div
            key={goal.id}
            className="glass-card border-border/40 hover:border-primary/30 transition-all p-5 group flex flex-col sm:flex-row gap-5"
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {goal.emoji}
                    </span>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {goal.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-1.5 h-4",
                        isBehind
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : isAhead
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-primary/10 text-primary border-primary/20",
                      )}
                    >
                      {isBehind ? "Behind" : isAhead ? "Ahead" : "On Track"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {goal.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {goal.targetNumber
                      ? `${goal.currentValue} / ${goal.targetNumber} ${goal.unit}`
                      : goal.targetValue}
                  </span>
                  {blockedCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 text-[9px] font-black px-1.5 animate-pulse bg-destructive shadow-[0_0_10px_-2px_var(--destructive)]"
                    >
                      STUCK
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">
                    Overall Momentum
                  </span>
                  <span className="text-primary tabular-nums tracking-tight">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-accent/30 rounded-full overflow-hidden border border-border/10">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 ease-out shadow-[0_0_10px_-2px_rgba(var(--primary),0.5)]",
                      goal.status === "blocked"
                        ? "bg-destructive"
                        : "bg-primary",
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 sm:pl-6 sm:border-l border-border/20">
              <div className="flex -space-x-2">
                {goalAssignees.map((member) => (
                  <Avatar
                    key={member.id}
                    className="w-7 h-7 border-2 border-background ring-2 ring-transparent group-hover:ring-primary/10 transition-all"
                  >
                    <AvatarImage src={member.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <GoalCheckInModal goal={goal} />
            </div>
          </div>
        );
      })}

      {limit && goals.length > limit && (
        <Link
          href={`/org/${orgId}/goals`}
          className="flex items-center justify-center gap-2 py-3 w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors glass-card border-border/40 group mt-2"
        >
          View All Active Goals
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
