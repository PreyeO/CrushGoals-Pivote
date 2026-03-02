"use client";
import { Progress } from "@/components/ui/progress";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { Calendar } from "lucide-react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export function DashboardGoals() {
  const goals = useStore(useShallow((state) => state.goals));
  const members = useStore(useShallow((state) => state.members));

  const user = useStore(useShallow((state) => state.user));

  // Find all member IDs for the current user across all orgs
  const myMemberIds = members
    .filter((m) => m.userId === user?.id)
    .map((m) => m.id);

  // Filter for goals assigned to any of these member IDs
  const myGoals = goals
    .filter((g) => g.assignedTo.some((id) => myMemberIds.includes(id)))
    .slice(0, 3);

  if (myGoals.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          My Active Goals
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {myGoals.map((goal) => (
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
              <h3 className="font-bold text-[14px] mb-1 leading-tight">
                {goal.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {goal.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-primary">
                    {goal.currentValue}%
                  </span>
                </div>
                <Progress value={goal.currentValue} className="h-1.5" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{" "}
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                <GoalCheckInModal goal={goal} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
