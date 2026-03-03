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
import { useState, useMemo } from "react";
import { CheckCircle2, TrendingUp, History, AlertCircle, Clock, Ban, Sparkles } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrgGoal } from "@/types";
import { cn } from "@/lib/utils";

interface GoalCheckInModalProps {
    goal: OrgGoal;
    children?: React.ReactNode;
}

export function GoalCheckInModal({ goal, children }: GoalCheckInModalProps) {
    const [now] = useState(() => Date.now());
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(goal.currentValue);
    const [status, setStatus] = useState<any>(goal.status || "in_progress");
    const [blockedReason, setBlockedReason] = useState("");

    const updateProgress = useStore((state) => state.updateGoalProgress);
    const updateStatus = useStore((state) => state.updateGoalStatus);

    // Pacing Logic
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.deadline).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const expectedProgress = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 0;

    // Calculate actual % if it's a metric goal
    const displayProgress = goal.targetNumber ? Math.round((progress / goal.targetNumber) * 100) : progress;
    const isBehind = displayProgress < expectedProgress - 10;
    const isAhead = displayProgress > expectedProgress + 10;

    const handleUpdate = async () => {
        try {
            await updateProgress(goal.id, progress, status === "blocked" ? `🚩 BLOCKED: ${blockedReason}` : undefined);
            await updateStatus(goal.id, status);
            setOpen(false);
        } catch (error) {
            console.error("Failed to update goal:", error);
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
            <DialogContent className="sm:max-w-[450px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Progress Check-in</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                        Update your momentum on <span className="text-foreground font-bold">{goal.emoji} {goal.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    <div className="space-y-5">
                        <div className="flex items-end justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                {goal.targetNumber ? `Current ${goal.unit || 'Progress'}` : 'Current Completion'}
                            </Label>
                            <div className="flex flex-col items-end">
                                <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                                    {goal.targetNumber ? progress : `${progress}%`}
                                </span>
                                {goal.targetNumber && (
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                        out of {goal.targetNumber} {goal.unit} ({displayProgress}%)
                                    </span>
                                )}
                            </div>
                        </div>

                        {goal.targetNumber ? (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    className="w-full bg-accent/20 border-2 border-primary/20 rounded-xl h-14 px-4 text-xl font-bold focus:border-primary focus:outline-none transition-all"
                                    placeholder={`Enter ${goal.unit || 'amount'}...`}
                                />
                                <div className="flex items-center justify-between px-1">
                                    <button
                                        onClick={() => setProgress(Math.max(0, progress - 1))}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        - Decrease
                                    </button>
                                    <button
                                        onClick={() => setProgress(Math.min(goal.targetNumber || 100, progress + 1))}
                                        className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        + Increase
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Slider
                                value={[progress]}
                                onValueChange={(v: number[]) => setProgress(v[0])}
                                max={100}
                                step={1}
                                className="py-4"
                            />
                        )}

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/20">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                isBehind ? "bg-destructive/10 text-destructive" : isAhead ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                            )}>
                                {isBehind ? <Clock className="w-4 h-4" /> : isAhead ? <Sparkles className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-wider mb-0.5">Timeline Pacing</p>
                                <p className="text-[11px] font-bold">
                                    {isBehind ? "Slightly behind schedule" : isAhead ? "Crushing the timeline!" : "Perfectly on track"}
                                    <span className="text-muted-foreground font-medium ml-1">
                                        (Expected: {expectedProgress}%)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Current Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-accent/20 border-border/40 h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-border/40">
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>

                        {status === "blocked" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-destructive">Reason for Blockage</Label>
                                <Textarea
                                    placeholder="Why is this goal stuck?"
                                    className="bg-destructive/5 border-destructive/20 min-h-[80px] text-xs rounded-xl"
                                    value={blockedReason}
                                    onChange={(e) => setBlockedReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleUpdate} className="w-full gradient-primary text-white border-0 shadow-lg glow-primary h-12 text-sm font-black rounded-xl">
                        Update Progress
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
