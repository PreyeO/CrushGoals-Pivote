"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Flame, CheckCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OrgGoal, DailyCheckIn } from "@/types";
import { calculateStreak, getToday, getLast14Days } from "@/lib/store-utils";

interface GoalDailyProgressProps {
  goal: OrgGoal;
  checkins: DailyCheckIn[];
}

export function GoalDailyProgress({ goal, checkins }: GoalDailyProgressProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const user = useStore((state) => state.user);
  const dailyCheckIn = useStore((state) => state.dailyCheckIn);
  const undoDailyCheckIn = useStore((state) => state.undoDailyCheckIn);
  const updateGoalStatus = useStore((state) => state.updateGoalStatus);
  const upsertMemberStatus = useStore((state) => state.upsertMemberStatus);

  const checkedDatesSet = new Set(
    checkins
      .filter((c) => c.completed && c.userId === user?.id)
      .map((c) => c.checkDate),
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

        if (goal.status === "not_started") {
          await updateGoalStatus(goal.id, "in_progress");
        }

        await upsertMemberStatus(
          goal.id,
          goal.orgId,
          "on_track",
          "Daily check-in completed! 🔥",
          0,
        );

        toast.success("Checked in! 🔥");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to check in";
      toast.error(message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
            <span className="text-lg font-black text-[oklch(0.72_0.18_55)] tabular-nums">
              {streak}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              day streak
            </span>
          </div>
        </div>
        <button
          onClick={handleDailyCheckIn}
          disabled={isCheckingIn}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
            checkedToday
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "gradient-primary text-white shadow-lg glow-primary hover:opacity-90",
          )}
        >
          {checkedToday ? (
            <>
              <CheckCircle className="w-4 h-4" /> Done Today
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Check In Today
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {last14Days.map((day: string) => {
          const isChecked = checkedDatesSet.has(day);
          const isToday = day === todayStr;
          const dayLabel = new Date(day + "T12:00:00").toLocaleDateString(
            "en-US",
            { weekday: "narrow" },
          );
          return (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[8px] text-muted-foreground/50 font-bold">
                {dayLabel}
              </span>
              <div
                className={cn(
                  "w-full aspect-square rounded-md transition-all",
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
    </div>
  );
}
