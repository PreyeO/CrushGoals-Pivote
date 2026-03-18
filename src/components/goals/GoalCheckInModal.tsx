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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle2, TrendingUp, Clock, Ban, Sparkles, AlertTriangle, Flame, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { OrgGoal, MemberGoalStatusValue } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GoalCheckInModalProps {
    goal: OrgGoal;
    children?: React.ReactNode;
}

const memberStatusOptions: { value: MemberGoalStatusValue; label: string; icon: React.ElementType; color: string }[] = [
    { value: "on_track", label: "On Track", icon: TrendingUp, color: "text-primary" },
    { value: "behind", label: "Behind", icon: Clock, color: "text-yellow-500" },
    { value: "blocked", label: "Blocked", icon: Ban, color: "text-destructive" },
    { value: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
];

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
                await updateGoalStatus(goal.id, "blocked");
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

    const selectedStatusConfig = memberStatusOptions.find(o => o.value === memberStatus);

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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                    Current {goal.unit || "Value"}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-primary tabular-nums">
                                        {goal.targetNumber ? progress : `${progress}%`}
                                    </span>
                                    {goal.targetNumber && (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                            / {goal.targetNumber} ({displayProgress}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {goal.targetNumber ? (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={progress}
                                        onChange={(e) => setProgress(Number(e.target.value))}
                                        className="flex-1 bg-accent/20 border border-primary/20 rounded-lg h-10 px-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder={`Enter ${goal.unit || "amount"}...`}
                                    />
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="icon" onClick={() => setProgress(Math.max(0, progress - 1))} className="h-10 w-10 rounded-lg">-</Button>
                                        <Button variant="outline" size="icon" onClick={() => setProgress(Math.min(goal.targetNumber || 100, progress + 1))} className="h-10 w-10 rounded-lg">+</Button>
                                    </div>
                                </div>
                            ) : (
                                <Slider value={[progress]} onValueChange={(v: number[]) => setProgress(v[0])} max={100} step={1} className="py-2" />
                            )}

                            {/* Compact Pacing Badge */}
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold",
                                isBehind ? "bg-destructive/5 border-destructive/20 text-destructive" : 
                                isAhead ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : 
                                "bg-accent/30 border-border/20 text-muted-foreground"
                            )}>
                                {isBehind ? <AlertTriangle className="w-3 h-3" /> : isAhead ? <Sparkles className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                <span>{isBehind ? "Behind" : isAhead ? "Ahead" : "On Track"} • Expected: {expectedProgress}%</span>
                            </div>
                        </div>
                    )}

                    {/* My status */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">My Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {memberStatusOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = memberStatus === opt.value;
                                
                                // Dynamic Label: If blocked, "On Track" becomes "Resolved / On Track"
                                let label = opt.label;
                                if (goal.status === "blocked" && opt.value === "on_track") {
                                    label = "Resolved / On Track";
                                }

                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMemberStatus(opt.value)}
                                        className={cn(
                                            "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all font-semibold text-[11px] cursor-pointer",
                                            isSelected
                                                ? "border-primary/40 bg-primary/10 text-foreground"
                                                : "border-border/30 bg-accent/20 text-muted-foreground hover:border-border/60"
                                        )}
                                    >
                                        <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? opt.color : "")} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Personal note — always visible */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center justify-between">
                            <span>{memberStatus === "blocked" ? "What's blocking you?" : "Update Note (optional)"}</span>
                            {memberStatus === "blocked" && (
                                <span className="text-[9px] text-destructive lowercase font-bold animate-pulse">Required</span>
                            )}
                        </Label>
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
