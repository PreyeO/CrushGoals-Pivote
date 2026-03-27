"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  Calendar,
  Ban,
  AlertTriangle,
  Trash2,
  Users,
  Flame,
  Pencil,
  CheckCircle,
  EyeOff,
} from "lucide-react";
import { getGoalAssignees } from "@/lib/store-utils";
import { toast } from "sonner";
import type { OrgGoal, OrgMember, GoalStatus } from "@/types";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { CreateGoalModal } from "@/components/create-goal-modal";
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
  const isDaily =
    goal.frequency === "daily" ||
    goal.frequency === "weekly" ||
    goal.frequency === "monthly";

  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger celebration on completion
  useEffect(() => {
    if (goal.status === "completed" && !isDaily) {
      const timer = setTimeout(() => setShowCelebration(true), 0);
      return () => clearTimeout(timer);
    }
  }, [goal.status, isDaily]);

  const user = useStore((state) => state.user);
  const members = useStore((state) => state.members);
  const fetchCheckIns = useStore((state) => state.fetchCheckIns);
  const deleteGoal = useStore((state) => state.deleteGoal);
  const checkins = useStore(
    useShallow((state) =>
      state.dailyCheckins.filter((c) => c.goalId === goal.id),
    ),
  );

  useEffect(() => {
    fetchCheckIns(goal.id);
  }, [goal.id, fetchCheckIns]);

  const assignees = getGoalAssignees(goal, members);
  const myMember = members.find(
    (m) => m.userId === user?.id && m.orgId === goal.orgId,
  );
  const isAssigned = goal.assignedTo.includes(myMember?.id || "");
  const canEdit =
    user?.id === goal.createdBy ||
    myMember?.role === "owner" ||
    myMember?.role === "admin";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id, goal.orgId);
      toast.success("Goal deleted successfully");
    } catch (err) {
      toast.error("Failed to delete goal");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isPrivate = goal.isPrivate;
  const showPrivacyOverlay = isPrivate && user?.id !== goal.createdBy && myMember?.role !== "owner" && myMember?.role !== "admin";

  return (
    <div
      className={cn(
        "glass-card group/card flex flex-col transition-all duration-300",
        expanded ? "ring-1 ring-primary/20 shadow-xl" : "hover:shadow-lg",
        isCompleted ? "opacity-90" : "opacity-100",
      )}
    >
      {showCelebration && <Celebration active={true} onComplete={() => setShowCelebration(false)} />}
      
      <div className="p-6 flex-1 relative">
        {showPrivacyOverlay && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center rounded-2xl p-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
              <EyeOff className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="font-bold text-sm mb-1">Private Goal</h4>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
                This is a personal goal set by {assignees[0]?.name || "a team member"}.
            </p>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center text-2xl relative shadow-inner">
              {goal.emoji || "🎯"}
              {isCompleted && (
                <div className="absolute -right-2 -top-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg leading-tight group-hover/card:text-primary transition-colors">
                  {goal.title}
                </h3>
                {isPrivate && (
                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] gap-1 border-primary/20 bg-primary/5 text-primary">
                        <EyeOff className="w-2 h-2" /> Private
                    </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {goal.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showPrivacyOverlay && canEdit && !isCompleted && (
              <CreateGoalModal orgId={goal.orgId} goal={goal}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CreateGoalModal>
            )}
            {!showPrivacyOverlay && canEdit && (
              <div className="relative">
                {confirmDelete ? (
                   <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-[10px] font-bold"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] font-bold"
                        onClick={() => setConfirmDelete(false)}
                    >
                        Cancel
                    </Button>
                   </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDelete(true)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Labels bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 uppercase tracking-widest font-black py-0 px-2",
              priorityStyles[goal.priority as keyof typeof priorityStyles],
            )}
          >
            {goal.priority}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 uppercase tracking-widest font-black py-0 px-2",
              statusStyles[goal.status as GoalStatus] || "bg-accent/30 text-muted-foreground border-transparent",
            )}
          >
            {goal.status.replace("_", " ")}
          </Badge>
          {goal.category && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 uppercase tracking-widest font-black py-0 px-2 border-border/40 bg-accent/10"
            >
              {goal.category}
            </Badge>
          )}
          {isOverdue && (
            <Badge
              variant="destructive"
              className="text-[10px] h-5 uppercase tracking-widest font-black py-0 px-2 animate-pulse"
            >
              Overdue
            </Badge>
          )}
        </div>

        {/* Progress Section */}
        {isDaily ? (
          <GoalDailyProgress 
            goal={goal} 
            checkins={checkins} 
            isReadOnly={!isAssigned}
          />
        ) : (
          <>
            <GoalStandardProgress goal={goal} isOverdue={isOverdue} />
            {goal.frequency !== "one_time" && (
              <div className="mb-4">
                  <GoalDailyProgress 
                  goal={goal} 
                  checkins={checkins} 
                  isReadOnly={true} 
                  />
              </div>
            )}
          </>
        )}

      </div>

      {/* Meta row */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-border/20 bg-accent/5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {assignees.map((member) => (
              <Avatar
                key={member.id}
                className="w-6 h-6 border-2 border-background ring-2 ring-transparent group-hover/card:ring-primary/10 transition-all"
              >
                <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {assignees.length === 0
              ? "Unassigned"
              : assignees.length === 1
                ? assignees[0].name
                : `${assignees.length} assigned`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
              isOverdue
                ? "text-red-500 bg-red-500/10"
                : "text-muted-foreground bg-accent/30",
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            {new Date(goal.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <GoalCheckInModal goal={goal} />
        </div>
      </div>
    </div>
  );
}
