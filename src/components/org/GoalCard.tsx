"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Calendar,
  Ban,
  AlertTriangle,
  Trash2,
  Users,
  Flame,
} from "lucide-react";
import { getGoalAssignees } from "@/lib/store-utils";
import { toast } from "sonner";
import type { OrgGoal, OrgMember } from "@/types";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { Celebration } from "@/components/ui/celebration";
import { statusStyles, priorityStyles } from "@/lib/goal-constants";
import { GoalTeamProgressPanel } from "./GoalTeamProgressPanel";
import { GoalDailyProgress } from "./GoalDailyProgress";
import { GoalStandardProgress } from "./GoalStandardProgress";

export function GoalCard({ goal }: { goal: OrgGoal }) {
  const [now] = useState(() => Date.now());
  const isCompleted = goal.status === "completed";
  const deadline = new Date(goal.deadline);
  const isOverdue = !isCompleted && deadline < new Date();
  const isDaily = goal.frequency === "daily" || goal.frequency === "weekly" || goal.frequency === "monthly";

  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger celebration on completion
  useEffect(() => {
    if (goal.status === "completed" && !isDaily) {
      setShowCelebration(true);
    }
  }, [goal.status, isDaily]);

  // Pacing (only for non-daily goals)
  const start = new Date(goal.startDate || goal.createdAt).getTime();
  const end = deadline.getTime();
  const totalTime = end - start;
  const elapsedTime = now - start;
  const expectedProgress =
    totalTime > 0
      ? Math.min(100, Math.max(0, Math.round((elapsedTime / totalTime) * 100)))
      : 0;
  const isBehind = !isDaily && goal.progress < expectedProgress - 15;
  const isAhead = !isDaily && goal.progress > expectedProgress + 15;

  const s = statusStyles[goal.status];
  const p = priorityStyles[goal.priority];

  const members = useStore((state) => state.members);
  const user = useStore((state) => state.user);
  const deleteGoal = useStore((state) => state.deleteGoal);
  const updateGoalStatus = useStore((state) => state.updateGoalStatus);
  const upsertMemberStatus = useStore((state) => state.upsertMemberStatus);
  const fetchMemberStatuses = useStore((state) => state.fetchMemberStatuses);
  const memberGoalStatuses = useStore(
    useShallow((state) =>
      state.memberGoalStatuses.filter((s) => s.goalId === goal.id),
    ),
  );

  // Daily check-in state
  const fetchCheckIns = useStore((state) => state.fetchCheckIns);
  const checkins = useStore(
    useShallow((state) =>
      state.dailyCheckins.filter((c) => c.goalId === goal.id),
    ),
  );

  useEffect(() => {
    if (isDaily) {
      fetchCheckIns(goal.id);
    }
  }, [isDaily, goal.id, fetchCheckIns]);

  const assignees = getGoalAssignees(goal, members);
  const myMember = members.find(
    (m) => m.orgId === goal.orgId && m.userId === user?.id,
  );
  const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";

  const handleToggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) fetchMemberStatuses(goal.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id, goal.orgId);
      toast.success("Goal deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete goal");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };



  return (
    <div
      className={cn(
        "glass-card p-5 transition-all animate-fade-in-up group/card relative overflow-hidden",
        isCompleted
          ? "border-emerald-500/30 bg-emerald-500/[0.02]"
          : "hover:border-primary/20",
        isOverdue &&
        "border-destructive/50 bg-destructive/[0.03] shadow-[0_0_20px_-10px_rgba(239,68,68,0.5)]",
      )}
    >
      {isCompleted && (
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
      )}
      {isOverdue && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-destructive text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg shadow-lg z-10 flex items-center gap-1.5 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </div>
      )}

      <Celebration active={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0 group-hover/card:scale-110 transition-transform">
            {goal.emoji}
          </span>
          <div className="min-w-0">
            <h3
              className={cn(
                "font-bold text-[15px] truncate",
                isOverdue && "text-destructive",
              )}
            >
              {goal.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">
                {goal.category}
              </span>
              {isDaily ? (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 h-4 bg-[oklch(0.72_0.18_55_/_0.12)] text-[oklch(0.72_0.18_55)] border-[oklch(0.72_0.18_55_/_0.2)]"
                >
                  <Flame className="w-2.5 h-2.5 mr-0.5" />
                  {goal.frequency}
                </Badge>
              ) : (
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
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge className={`${p.class} text-[9px]`}>{p.label}</Badge>
          <Badge className={`${s.badgeClass} text-[9px] gap-1`}>
            <s.icon className="w-2.5 h-2.5" />
            {s.label}
          </Badge>
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {goal.description}
      </p>

      {/* Blocked notice */}
      {goal.status === "blocked" && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Ban className="w-3 h-3" /> Blocked
          </p>
          <p className="text-[11px] text-destructive/80 italic">
            {goal.reason || "Waiting on resolution"}
          </p>
        </div>
      )}

      {/* Progress Section — different for daily vs metric/milestone goals */}
      {isDaily ? (
        <GoalDailyProgress goal={goal} checkins={checkins} />
      ) : (
        <GoalStandardProgress goal={goal} isOverdue={isOverdue} />
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {assignees.map((m: OrgMember) => (
              <Avatar
                key={m.id}
                className="w-7 h-7 border-2 border-background shadow-sm"
              >
                <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-black">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span
            className={cn(
              "text-[11px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md",
              isOverdue
                ? "bg-destructive/10 text-destructive"
                : "text-muted-foreground bg-accent/30",
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            {new Date(goal.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="relative">
              {confirmDelete ? (
                <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                  <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="text-[10px] font-bold bg-destructive text-white px-2 py-1 rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "..." : "Confirm"}
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className="text-[10px] font-bold bg-accent/50 text-muted-foreground px-2 py-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer group/del"
                  title="Delete Goal"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={handleToggleExpand}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg hover:bg-accent/50"
          >
            <Users className="w-3.5 h-3.5" />
            {expanded ? "Hide" : "Members"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {!isDaily && <GoalCheckInModal goal={goal} />}
        </div>
      </div>

      {/* Organization Progress Panel */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-border/30 space-y-3 animate-in fade-in slide-in-from-top-3">
          <p className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.2em]">
            Team Progress
          </p>

          <GoalTeamProgressPanel 
            assignees={assignees}
            memberGoalStatuses={memberGoalStatuses}
            isDaily={isDaily}
            checkins={checkins}
          />
        </div>
      )}
    </div>
  );
}
