"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { OrgGoal, OrgMember } from "@/types";
import { cn } from "@/lib/utils";

interface ActiveStandardGoalItemProps {
  goal: OrgGoal;
  members: OrgMember[];
  now: number;
}

export function ActiveStandardGoalItem({
  goal,
  members,
  now,
}: ActiveStandardGoalItemProps) {
  const goalAssignees = useMemo(
    () => members.filter((m) => goal.assignedTo.includes(m.id)),
    [members, goal.assignedTo]
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
    <div className="glass-card border-border/40 hover:border-primary/30 transition-all p-5 group flex flex-col sm:flex-row gap-5">
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
            <span className="text-muted-foreground">Overall Momentum</span>
            <span className="text-primary tabular-nums tracking-tight">
              {goal.progress}%
            </span>
          </div>
          <div className="h-2 w-full bg-accent/30 rounded-full overflow-hidden border border-border/10">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-out shadow-[0_0_10px_-2px_rgba(var(--primary),0.5)]",
                goal.status === "blocked" ? "bg-destructive" : "bg-primary",
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
}
