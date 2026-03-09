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

            // 2. If they mark as blocked, update the goal-level status too
            if (memberStatus === "blocked") {
                await updateGoalStatus(goal.id, "blocked");
            } else if (memberStatus === "completed") {
                await updateGoalStatus(goal.id, "completed");
            } else if (goal.status === "not_started") {
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
            <DialogContent className="sm:max-w-[460px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Progress Check-in</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                        Log your personal update on <span className="text-foreground font-bold">{goal.emoji} {goal.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Progress input — only for non-daily goals */}
                    {!isDaily && (
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                    {goal.targetNumber ? `Current ${goal.unit || "Progress"}` : "Current Completion"}
                                </Label>
                                <div className="flex flex-col items-end">
                                    <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                                        {goal.targetNumber ? progress : `${progress}%`}
                                    </span>
                                    {goal.targetNumber && (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            of {goal.targetNumber} {goal.unit} ({displayProgress}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {goal.targetNumber ? (
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        value={progress}
                                        onChange={(e) => setProgress(Number(e.target.value))}
                                        className="w-full bg-accent/20 border-2 border-primary/20 rounded-xl h-14 px-4 text-xl font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder={`Enter ${goal.unit || "amount"}...`}
                                    />
                                    <div className="flex items-center justify-between px-1">
                                        <button onClick={() => setProgress(Math.max(0, progress - 1))} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">- Decrease</button>
                                        <button onClick={() => setProgress(Math.min(goal.targetNumber || 100, progress + 1))} className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors">+ Increase</button>
                                    </div>
                                </div>
                            ) : (
                                <Slider value={[progress]} onValueChange={(v: number[]) => setProgress(v[0])} max={100} step={1} className="py-4" />
                            )}

                            {/* Pacing indicator */}
                            <div className={cn("flex items-center gap-3 p-3 rounded-xl border", isBehind ? "bg-destructive/5 border-destructive/20" : isAhead ? "bg-emerald-500/5 border-emerald-500/20" : "bg-accent/30 border-border/20")}>
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isBehind ? "bg-destructive/10 text-destructive" : isAhead ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                                    {isBehind ? <AlertTriangle className="w-4 h-4" /> : isAhead ? <Sparkles className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider mb-0.5">Timeline Pacing</p>
                                    <p className="text-[11px] font-bold">
                                        {isBehind ? "Behind schedule" : isAhead ? "Crushing the timeline!" : "On track"}
                                        <span className="text-muted-foreground font-normal ml-1">(Expected: {expectedProgress}%)</span>
                                    </p>
                                </div>
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
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMemberStatus(opt.value)}
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-xl border text-left transition-all font-semibold text-xs cursor-pointer",
                                            isSelected
                                                ? "border-primary/40 bg-primary/10 text-foreground"
                                                : "border-border/30 bg-accent/20 text-muted-foreground hover:border-border/60"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4 shrink-0", isSelected ? opt.color : "")} />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Personal note — always visible */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                            {memberStatus === "blocked" ? "What's blocking you?" : "Update Note (optional)"}
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
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="w-full gradient-primary text-white border-0 shadow-lg glow-primary h-12 text-sm font-black rounded-xl disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Check-in"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
