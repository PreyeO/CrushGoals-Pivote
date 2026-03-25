import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgGoal } from "@/types";

interface CheckInProgressInputProps {
    goal: OrgGoal;
    progress: number;
    setProgress: (value: number) => void;
    displayProgress: number;
    expectedProgress: number;
    isBehind: boolean;
    isAhead: boolean;
}

export function CheckInProgressInput({
    goal,
    progress,
    setProgress,
    displayProgress,
    expectedProgress,
    isBehind,
    isAhead,
}: CheckInProgressInputProps) {
    return (
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
    );
}
