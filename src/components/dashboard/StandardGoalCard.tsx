"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgGoal, Organization } from "@/types";
import { OrgLabel } from "./OrgLabel";

export function StandardGoalCard({
  goal,
  organizations,
}: {
  goal: OrgGoal;
  organizations: Organization[];
}) {
  const [now] = useState(() => Date.now());

  return (
    <div
      key={goal.id}
      className="glass-card p-6 animate-fade-in-up group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-xl">
            {goal.emoji}
          </div>
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
              goal.priority === "high"
                ? "bg-red-500/10 text-red-500"
                : goal.priority === "medium"
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-blue-500/10 text-blue-500",
            )}
          >
            {goal.priority}
          </span>
        </div>
        <OrgLabel orgId={goal.orgId} orgs={organizations} />
        <h3 className="font-bold text-[14px] mt-1.5 mb-1 leading-tight">
          {goal.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {goal.description}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold uppercase tracking-tight">
            <span className="text-muted-foreground">Momentum</span>
            <span className="text-primary flex items-center gap-1.5">
              {goal.targetNumber ? (
                <span className="text-[10px] text-muted-foreground mr-1">
                  {goal.currentValue} / {goal.targetNumber} {goal.unit}
                </span>
              ) : null}
              {goal.progress}%
            </span>
          </div>
          <Progress value={goal.progress} className="h-1.5" />

          {/* Pacing Badge */}
          {(() => {
            const start = new Date(goal.startDate || goal.createdAt).getTime();
            const end = new Date(goal.deadline).getTime();
            const expected =
              end - start > 0
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(((now - start) / (end - start)) * 100),
                    ),
                  )
                : 0;
            const isBehind = goal.progress < expected - 15;
            const isAhead = goal.progress > expected + 15;

            return (
              <div className="mt-2 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border-0",
                    isBehind
                      ? "bg-destructive/10 text-destructive"
                      : isAhead
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  {isBehind ? "Behind" : isAhead ? "Ahead" : "On Track"}
                </Badge>
                <span className="text-[9px] text-muted-foreground font-medium">
                  Expected: {expected}%
                </span>
              </div>
            );
          })()}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{" "}
              {new Date(goal.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <GoalCheckInModal goal={goal} />
        </div>
      </div>
    </div>
  );
}
