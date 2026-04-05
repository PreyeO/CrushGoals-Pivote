"use client";

import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { OrgGoal, MemberGoalStatusValue, OrgMember } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckInProgressInput } from "./CheckInProgressInput";
import { CheckInStatusSelector } from "./CheckInStatusSelector";
import { getToday } from "@/lib/store-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCheckInModalProps {
  goal: OrgGoal;
  children?: React.ReactNode;
}

export function GoalCheckInModal({ goal, children }: GoalCheckInModalProps) {
  const [now] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(goal.currentValue);
  const [memberStatus, setMemberStatus] =
    useState<MemberGoalStatusValue>("on_track");
  const [note, setNote] = useState("");
  const [taggedMemberIds, setTaggedMemberIds] = useState<string[]>([]);

  const members = useStore((state) => state.members);
  const user = useStore((state) => state.user);
  
  // Get current user's role for this organization
  const myMember = useMemo(() => 
    members.find(m => m.orgId === goal.orgId && m.userId === user?.id),
  [members, goal.orgId, user?.id]);
  
  const isAdmin = myMember?.role === "admin" || myMember?.role === "owner";

  // Get other members for tagging
  const orgMembers = useMemo(() => 
    members.filter(m => m.orgId === goal.orgId && m.userId !== user?.id),
  [members, goal.orgId, user?.id]);

  const updateProgress = useStore((state) => state.updateGoalProgress);
  const updateGoalStatus = useStore((state) => state.updateGoalStatus);
  const upsertMemberStatus = useStore((state) => state.upsertMemberStatus);
  const dailyCheckIn = useStore((state) => state.dailyCheckIn);

  const isDaily =
    goal.frequency === "daily" ||
    goal.frequency === "weekly" ||
    goal.frequency === "monthly";

  // Pacing Logic (only for non-daily goals)
  const start = new Date(goal.startDate).getTime();
  const end = new Date(goal.deadline).getTime();
  const totalDuration = end - start;
  const elapsed = now - start;
  const expectedProgress =
    totalDuration > 0
      ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)))
      : 0;

  // Calculate actual % for metric goals
  const displayProgress = goal.targetNumber
    ? Math.round((progress / goal.targetNumber) * 100)
    : progress;
  const isBehind = !isDaily && displayProgress < expectedProgress - 10;
  const isAhead = !isDaily && displayProgress > expectedProgress + 10;

  // AUTO-SYNC: flip to "Completed" when slider/input reaches 100% or target
  useEffect(() => {
    const isComplete = goal.targetNumber
      ? progress >= goal.targetNumber
      : progress >= 100;
    if (!isDaily && isComplete && memberStatus !== "completed") {
      setMemberStatus("completed");
    }
  }, [progress, goal.targetNumber, isDaily, memberStatus]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      // 1. Update shared goal progress (only for non-daily/one-time)
      if (!isDaily) {
        await updateProgress(goal.id, progress);
      }

      // 2. Smart Status Logic:
      if (memberStatus === "blocked") {
        // Mark goal as blocked (Admins can do this, or any member can flag a shared goal)
        await updateGoalStatus(goal.id, "blocked", note);
      } else if (memberStatus === "completed") {
        // Allow full goal completion: admin always, non-admin if progress is genuinely at 100%
        const progressPct = goal.targetNumber
          ? Math.round((progress / goal.targetNumber) * 100)
          : progress;
        if (isAdmin || progressPct >= 100) {
          await updateGoalStatus(goal.id, "completed");
        }
      } else if (goal.status === "blocked" || goal.status === "not_started") {
        // Only move back to in_progress if the goal isn't already at 100%
        // (auto-complete already handled it in the store)
        const progressPct = goal.targetNumber
          ? Math.round((progress / goal.targetNumber) * 100)
          : progress;
        if (progressPct < 100) {
          await updateGoalStatus(goal.id, "in_progress");
        }
      }

      // 3. Save personal member status
      let finalProgress = isDaily ? 0 : progress;
      
      // AUTO-SYNC: If milestone/check-off goal is marked completed, set progress to 100%
      if (!isDaily && memberStatus === "completed") {
        // If they are an admin, we assume they are finishing the whole goal
        if (isAdmin) {
            finalProgress = goal.targetNumber || 100;
            await updateProgress(goal.id, finalProgress);
            if (goal.status !== "completed") {
                await updateGoalStatus(goal.id, "completed");
            }
        } else {
            // Standard member finished their part, but overall progress doesn't jump to 100%
            // unless they manually slid it there (already handled in step 1)
        }
      } else if (!isDaily && goal.status === "completed" && memberStatus !== "completed") {
        // If it WAS completed but now it's not (only Admins can usually do this or if they are reopening)
        if (isAdmin) {
            finalProgress = 0;
            await updateProgress(goal.id, 0);
            await updateGoalStatus(goal.id, "in_progress");
        }
      }

      await upsertMemberStatus(
        goal.id,
        goal.orgId,
        memberStatus,
        note,
        finalProgress,
        taggedMemberIds,
      );

      // 4. Milestone/Metric Check-in: Record a daily check-in so the grid "glows"
      if (!isDaily) {
        const todayStr = getToday();
        await dailyCheckIn(goal.id, todayStr, note, taggedMemberIds);
      }

      toast.success("Check-in saved!");
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save check-in";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            Check-in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-105 glass-card border-border/40 backdrop-blur-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="text-lg">{goal.emoji}</span>
            <span>Update Progress</span>
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground line-clamp-1">
            {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 pt-3 space-y-4">
          {/* Progress input — only for non-daily goals */}
          {!isDaily && (
            <CheckInProgressInput
              goal={goal}
              progress={progress}
              setProgress={setProgress}
              displayProgress={displayProgress}
              expectedProgress={expectedProgress}
              isBehind={isBehind}
              isAhead={isAhead}
            />
          )}

          {/* My status — ALWAYS visible for all goal types */}
          <CheckInStatusSelector
            memberStatus={memberStatus}
            setMemberStatus={setMemberStatus}
            goalStatus={goal.status}
          />

          <div className="flex gap-4 pt-1">
            {/* Note Section - Compressed */}
            <div className="flex-[1.5] space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground">
                    Update Note
                </div>
                <Textarea
                    placeholder="Notes..."
                    className={cn(
                        "min-h-[70px] text-xs rounded-xl resize-none py-2 px-3 leading-tight",
                        memberStatus === "blocked"
                            ? "bg-destructive/5 border-destructive/20"
                            : "bg-accent/5 border-border/10",
                    )}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            {/* Tagging Section - Multi-select Dropdown */}
            <div className="flex-1 space-y-1.5 border-l border-border/10 pl-4">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "text-[10px] font-black uppercase tracking-[0.05em] flex items-center gap-1.5 transition-colors",
                        memberStatus === "blocked" ? "text-destructive animate-pulse" : "text-muted-foreground"
                    )}>
                        <Users className="w-2.5 h-2.5" />
                        <span>{memberStatus === "blocked" ? "Tag Blockers" : "Tag Team"}</span>
                    </div>
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-8 justify-between text-[10px] font-bold bg-accent/5 border-border/10 px-2"
                        >
                            <span className="truncate">
                                {taggedMemberIds.length > 0 
                                    ? `${taggedMemberIds.length} members tagged` 
                                    : "Select..."}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass-card border-border/40">
                        <DropdownMenuLabel className="text-[10px] font-bold">Select Members</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {orgMembers.map((m) => {
                                const isTagged = taggedMemberIds.includes(m.id);
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={m.id}
                                        checked={isTagged}
                                        onCheckedChange={() => {
                                            if (isTagged) {
                                                setTaggedMemberIds(prev => prev.filter(id => id !== m.id));
                                            } else {
                                                setTaggedMemberIds(prev => [...prev, m.id]);
                                            }
                                        }}
                                        className="text-[11px] font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-4 h-4">
                                                <AvatarImage src={m.avatarUrl || undefined} />
                                                <AvatarFallback className="text-[6px]">{m.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{m.name}</span>
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                            {orgMembers.length === 0 && (
                                <div className="p-2 text-[10px] text-muted-foreground italic text-center">No team members</div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Compact Tagged Badges list below the dropdown if needed, or omit for extreme space saving */}
                {taggedMemberIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-y-auto no-scrollbar">
                        {taggedMemberIds.map(id => {
                            const m = orgMembers.find(member => member.id === id);
                            if (!m) return null;
                            return (
                                <Badge key={id} variant="secondary" className="h-4 gap-1 pl-1 pr-1 text-[8px] font-bold border-primary/10 bg-primary/5">
                                    {m.name.split(' ')[0]}
                                    <button onClick={() => setTaggedMemberIds(prev => prev.filter(p => p !== id))}>
                                        <X className="w-2 h-2" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0">
          <Button
            onClick={handleUpdate}
            disabled={isSaving || (memberStatus === "blocked" && !note.trim())}
            className="w-full gradient-primary text-white border-0 shadow-lg glow-primary h-9 text-xs font-black rounded-lg disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Check-in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
