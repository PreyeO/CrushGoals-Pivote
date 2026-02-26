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
import { CheckCircle2, TrendingUp, History, AlertCircle, Clock, Ban } from "lucide-react";
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
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(goal.currentValue);
    const [status, setStatus] = useState<any>(goal.status || "in_progress");
    const [blockedReason, setBlockedReason] = useState("");
    const updateProgress = useStore((state) => state.updateGoalProgress);
    const updateStatus = useStore((state) => state.updateGoalStatus);

    const handleUpdate = async () => {
        try {
            // If blocked, we pass the reason as the note to updateProgress
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
                    <DialogDescription className="text-muted-foreground">
                        How much progress have you made on <span className="text-foreground font-medium">{goal.emoji} {goal.title}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-foreground">Current Progress</Label>
                            <span className="text-2xl font-bold text-primary">{progress}%</span>
                        </div>
                        <Slider
                            value={[progress]}
                            onValueChange={(v: number[]) => setProgress(v[0])}
                            max={100}
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                            <span>Not Started</span>
                            <span>Crushing it!</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Status</Label>
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-accent/20 border-border/40 h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-border/40">
                                <SelectItem value="not_started">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>Not Started</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <span>In Progress</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="blocked">
                                    <div className="flex items-center gap-2">
                                        <Ban className="w-4 h-4 text-destructive" />
                                        <span>Blocked</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Completed</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {status === "blocked" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-destructive">Reason for Blockage</Label>
                                <Textarea
                                    placeholder="Why is this goal stuck? (e.g., waiting for design team, budget approval...)"
                                    className="bg-destructive/5 border-destructive/20 min-h-[80px] text-xs"
                                    value={blockedReason}
                                    onChange={(e) => setBlockedReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-accent/20 border border-border/20 space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-primary" /> Recent Context
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            &quot;Last update was 2 days ago. You moved this from 15% to 24%. Keep the momentum!&quot;
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleUpdate} className="w-full gradient-primary text-white border-0 glow-primary h-11">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Progress Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
