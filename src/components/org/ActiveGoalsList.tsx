"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { Target, ArrowRight, Flame, Check, CheckCircle, Trophy, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { OrgGoal, OrgMember } from "@/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getVisibleGoals } from "@/lib/store-utils";
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

function DailyGoalListItem({
  goal,
  members,
}: {
  goal: OrgGoal;
  members: OrgMember[];
}) {
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

  const goalAssignees = members.filter((m) => goal.assignedTo.includes(m.id));

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
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 h-4 bg-[oklch(0.72_0.18_55_/_0.12)] text-[oklch(0.72_0.18_55)] border-[oklch(0.72_0.18_55_/_0.2)]"
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
    </div>
  );
}

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
  const [showCrushed, setShowCrushed] = useState(false);
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

  const activeGoals = visibleGoals.filter(g => g.status !== 'completed');
  const crushedGoals = visibleGoals.filter(g => g.status === 'completed');

  const [now] = useState(() => Date.now());
  const displayedActive = limit ? activeGoals.slice(0, limit) : activeGoals;

  if (activeGoals.length === 0 && crushedGoals.length === 0) {
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
    <div className="space-y-6">
      <div className="space-y-4">
        {displayedActive.map((goal) => {
          const isDaily =
            goal.frequency === "daily" ||
            goal.frequency === "weekly" ||
            goal.frequency === "monthly";

          if (isDaily) {
            return (
              <DailyGoalListItem key={goal.id} goal={goal} members={members} />
            );
          }

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
      </div>

      {/* Crushed Goals Section */}
      {crushedGoals.length > 0 && (
        <div className="pt-4 border-t border-border/10">
          <button
            onClick={() => setShowCrushed(!showCrushed)}
            className="flex items-center justify-between w-full py-2 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-left">
                <span className="text-[12px] font-black text-foreground block uppercase tracking-wider">
                  Crushed Goals
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {crushedGoals.length} targets successfully hit
                </span>
              </div>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center transition-transform",
              showCrushed ? "rotate-180" : ""
            )}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>

          {showCrushed && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              {crushedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">{goal.title}</h4>
                      <p className="text-[10px] text-muted-foreground">Successfully reached on {new Date(goal.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-3">
                    <CheckCircle className="w-3 h-3" />
                    Crushed
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {limit && visibleGoals.length > limit && (
        <Link
          href={`/org/${orgId}/goals?filter=in_progress`}
          className="flex items-center justify-center gap-2 py-3 w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors glass-card border-border/40 group mt-2"
        >
          View All Active Goals
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
