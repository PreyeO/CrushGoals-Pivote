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
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { OrgGoal, MemberGoalStatusValue } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckInProgressInput } from "./CheckInProgressInput";
import { CheckInStatusSelector } from "./CheckInStatusSelector";

interface GoalCheckInModalProps {
    goal: OrgGoal;
    children?: React.ReactNode;
}

export function GoalCheckInModal({ goal, children }: GoalCheckInModalProps) {
    const [now] = useState(() => Date.now());
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [progress, setProgress] = useState(goal.currentValue);
    const [memberStatus, setMemberStatus] = useState<MemberGoalStatusValue>("on_track");
    const [note, setNote] = useState("");

    const updateProgress = useStore((state) => state.updateGoalProgress);
    const updateGoalStatus = useStore((state) => state.updateGoalStatus);
    const upsertMemberStatus = useStore((state) => state.upsertMemberStatus);

    const isDaily = goal.frequency === "daily" || goal.frequency === "weekly" || goal.frequency === "monthly";

    // Pacing Logic (only for non-daily goals)
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.deadline).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const expectedProgress = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 0;

    // Calculate actual % for metric goals
    const displayProgress = goal.targetNumber ? Math.round((progress / goal.targetNumber) * 100) : progress;
    const isBehind = !isDaily && displayProgress < expectedProgress - 10;
    const isAhead = !isDaily && displayProgress > expectedProgress + 10;

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            // 1. Update shared goal progress (only for non-daily)
            if (!isDaily) {
                await updateProgress(goal.id, progress);
            }

            // 2. Smart Status Logic:
            if (memberStatus === "blocked") {
                // Mark goal as blocked
                await updateGoalStatus(goal.id, "blocked", note);
            } else if (memberStatus === "completed") {
                // Mark goal as completed
                await updateGoalStatus(goal.id, "completed");
            } else if (goal.status === "blocked" || goal.status === "not_started") {
                // AUTO-UNBLOCK or START: If user selects anything other than blocked/completed, 
                // move goal back to in_progress
                await updateGoalStatus(goal.id, "in_progress");
            }

            // 3. Save personal member status
            await upsertMemberStatus(goal.id, goal.orgId, memberStatus, note, isDaily ? 0 : progress);

            toast.success("Check-in saved!");
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to save check-in");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/10">
                        Check-in
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] glass-card border-border/40 backdrop-blur-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <span className="text-xl">{goal.emoji}</span>
                        <span>Update Progress</span>
                    </DialogTitle>
                    <DialogDescription className="text-[11px] text-muted-foreground line-clamp-1">
                        {goal.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-5">
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

                    {/* My status */}
                    <CheckInStatusSelector
                        memberStatus={memberStatus}
                        setMemberStatus={setMemberStatus}
                        goalStatus={goal.status}
                    />

                    {/* Personal note — always visible */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center justify-between">
                            <span>{memberStatus === "blocked" ? "What's blocking you?" : "Update Note (optional)"}</span>
                            {memberStatus === "blocked" && (
                                <span className="text-[9px] text-destructive lowercase font-bold animate-pulse">Required</span>
                            )}
                        </div>
                        <Textarea
                            placeholder={memberStatus === "blocked" ? "Describe what's blocking you..." : "Share what you've done, what's next..."}
                            className={cn(
                                "min-h-[80px] text-xs rounded-xl resize-none",
                                memberStatus === "blocked"
                                    ? "bg-destructive/5 border-destructive/20 focus-visible:ring-destructive/30"
                                    : "bg-accent/20 border-border/40"
                            )}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        {isBehind && memberStatus === "on_track" && (
                            <p className="text-[9px] text-yellow-500/80 font-medium">
                                💡 Tip: You're currently behind schedule. Consider flagging it as "Behind" if you need extra time.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        onClick={handleUpdate}
                        disabled={isSaving || (memberStatus === "blocked" && !note.trim())}
                        className="w-full gradient-primary text-white border-0 shadow-lg glow-primary h-10 text-xs font-black rounded-lg disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Check-in"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
