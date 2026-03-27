"use client";

import { useState, useEffect } from "react";
import { Flame, Check, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrgGoal, OrgMember } from "@/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
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

interface ActiveDailyGoalItemProps {
  goal: OrgGoal;
  members: OrgMember[];
}

export function ActiveDailyGoalItem({
  goal,
  members,
}: ActiveDailyGoalItemProps) {
  const dailyCheckIn = useStore((state) => state.dailyCheckIn);
  const undoDailyCheckIn = useStore((state) => state.undoDailyCheckIn);
  const fetchCheckIns = useStore((state) => state.fetchCheckIns);
  const user = useStore((state) => state.user);
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

  const goalAssignees = members.filter((m) => goal.assignedTo.includes(m.id));
  const isAssigned = goalAssignees.some(m => m.userId === user?.id);

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check in";
      toast.error(errorMessage);
    } finally {
      setIsCheckingIn(false);
    }
  };

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
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 h-4 bg-[oklch(0.72_0.18_55_/0.12)] text-[oklch(0.72_0.18_55)] border-[oklch(0.72_0.18_55_/0.2)]"
              >
                <Flame className="w-2.5 h-2.5 mr-0.5" />
                {goal.frequency}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {goal.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
              <span className="text-lg font-black text-[oklch(0.72_0.18_55)] tabular-nums">
                {streak}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                streak
              </span>
            </div>
          </div>
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
              <div
                key={day}
                className="flex flex-col items-center gap-1 flex-1"
              >
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
        {isAssigned && (
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
        )}
      </div>
    </div>
  );
}
