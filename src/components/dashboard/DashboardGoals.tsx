"use client";

import { useState, useEffect } from "react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { Calendar, Flame, Check, CheckCircle } from "lucide-react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { OrgGoal, OrgMember } from "@/types";
import { toast } from "sonner";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function calculateStreak(checkedDates: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (checkedDates.has(dateStr)) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

function DailyGoalCard({ goal }: { goal: OrgGoal }) {
  const dailyCheckIn = useStore((state) => state.dailyCheckIn);
  const undoDailyCheckIn = useStore((state) => state.undoDailyCheckIn);
  const fetchCheckIns = useStore((state) => state.fetchCheckIns);
  const checkins = useStore(
    useShallow((state) =>
      state.dailyCheckins.filter((c) => c.goalId === goal.id),
    ),
  );

  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    fetchCheckIns(goal.id);
  }, [goal.id, fetchCheckIns]);

  const checkedDatesSet = new Set(
    checkins.filter((c) => c.completed).map((c) => c.checkDate),
  );
  const todayStr = getToday();
  const checkedToday = checkedDatesSet.has(todayStr);
  const streak = calculateStreak(checkedDatesSet);
  const last14Days = getLast14Days();

  const handleDailyCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      if (checkedToday) {
        await undoDailyCheckIn(goal.id, todayStr);
        toast.success("Check-in undone");
      } else {
        await dailyCheckIn(goal.id, todayStr);
        toast.success("Checked in! 🔥");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to check in");
    } finally {
      setIsCheckingIn(false);
    }
  };

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
          <Badge
            variant="outline"
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 h-4 bg-[oklch(0.72_0.18_55_/_0.12)] text-[oklch(0.72_0.18_55)] border-[oklch(0.72_0.18_55_/_0.2)]"
          >
            <Flame className="w-2.5 h-2.5 mr-0.5" />
            {goal.frequency}
          </Badge>
        </div>
        <h3 className="font-bold text-[14px] mb-1 leading-tight">
          {goal.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {goal.description}
        </p>
      </div>

      <div className="space-y-4">
        {/* Streak + Check-in button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
            <span className="text-lg font-black text-[oklch(0.72_0.18_55)] tabular-nums">
              {streak}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              day streak
            </span>
          </div>
          <button
            onClick={handleDailyCheckIn}
            disabled={isCheckingIn}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50",
              checkedToday
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                : "gradient-primary text-white shadow-lg glow-primary hover:opacity-90",
            )}
          >
            {checkedToday ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Done
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Check In
              </>
            )}
          </button>
        </div>

        {/* Mini calendar heat map — last 14 days */}
        <div className="flex items-center gap-1">
          {last14Days.map((day) => {
            const isChecked = checkedDatesSet.has(day);
            const isToday = day === todayStr;
            const dayLabel = new Date(day + "T12:00:00").toLocaleDateString(
              "en-US",
              { weekday: "narrow" },
            );
            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[7px] text-muted-foreground/50 font-bold">
                  {dayLabel}
                </span>
                <div
                  className={cn(
                    "w-full aspect-square rounded-sm transition-all",
                    isChecked
                      ? "bg-primary shadow-[0_0_6px_-1px_var(--primary)]"
                      : isToday
                        ? "bg-accent/40 border-2 border-dashed border-primary/30"
                        : "bg-accent/20 border border-border/10",
                  )}
                  title={`${day}${isChecked ? " ✓" : ""}`}
                />
              </div>
            );
          })}
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
        </div>
      </div>
    </div>
  );
}

export function DashboardGoals() {
  const [now] = useState(() => Date.now());
  const goals = useStore(useShallow((state: AppState) => state.goals));
  const members = useStore(useShallow((state: AppState) => state.members));
  const user = useStore(useShallow((state: AppState) => state.user));

  // Find all member IDs for the current user across all orgs
  const myMemberIds = members
    .filter((m: OrgMember) => m.userId === user?.id)
    .map((m: OrgMember) => m.id);

  // Filter for goals assigned to any of these member IDs
  const myGoals = goals
    .filter((g: OrgGoal) => g.assignedTo.some((id) => myMemberIds.includes(id)))
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
        {myGoals.map((goal) => {
          const isDaily =
            goal.frequency === "daily" ||
            goal.frequency === "weekly" ||
            goal.frequency === "monthly";

          if (isDaily) {
            return <DailyGoalCard key={goal.id} goal={goal} />;
          }

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
                <h3 className="font-bold text-[14px] mb-1 leading-tight">
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
                    const start = new Date(
                      goal.startDate || goal.createdAt,
                    ).getTime();
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
        })}
      </div>
    </div>
  );
}
