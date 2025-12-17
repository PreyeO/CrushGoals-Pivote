import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pause, Play, Calendar, AlertCircle } from "lucide-react";

interface PauseGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPaused: boolean;
  goalName: string;
  pauseReason?: string | null;
  pausedAt?: string | null;
  onPause: (reason: string) => void;
  onResume: () => void;
}

const PAUSE_REASONS = [
  { emoji: "🏖️", label: "Vacation", value: "vacation" },
  { emoji: "🤒", label: "Health/Sick", value: "health" },
  { emoji: "🚨", label: "Emergency", value: "emergency" },
  { emoji: "💼", label: "Work conflict", value: "work" },
  { emoji: "✏️", label: "Other", value: "other" },
];

export function PauseGoalModal({
  open,
  onOpenChange,
  isPaused,
  goalName,
  pauseReason,
  pausedAt,
  onPause,
  onResume,
}: PauseGoalModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handlePause = () => {
    const reason = selectedReason === "other" ? customReason : selectedReason;
    if (reason) {
      onPause(reason);
      onOpenChange(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleResume = () => {
    onResume();
    onOpenChange(false);
  };

  const formatPausedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] w-[95vw] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPaused ? (
              <>
                <Play className="w-5 h-5 text-success" />
                Resume Goal
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 text-warning" />
                Pause Goal
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPaused 
              ? `"${goalName}" is currently paused. Resume to continue tracking.`
              : "Life happens! Pause your goal without losing progress."
            }
          </DialogDescription>
        </DialogHeader>

        {isPaused ? (
          <div className="space-y-4">
            {/* Paused Info */}
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Goal is paused</p>
                  {pausedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Paused on {formatPausedDate(pausedAt)}
                    </p>
                  )}
                  {pauseReason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {pauseReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              When you resume, your deadline will be extended by the number of days you were paused. 
              Your progress stays intact!
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Keep Paused
              </Button>
              <Button className="flex-1 gap-2" onClick={handleResume}>
                <Play className="w-4 h-4" />
                Resume Goal
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reason Selection */}
            <div className="space-y-2">
              <Label>Why are you pausing?</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAUSE_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedReason === reason.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-secondary/50"
                    }`}
                  >
                    <span className="text-xl">{reason.emoji}</span>
                    <p className="text-sm font-medium mt-1">{reason.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            {selectedReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Tell us more (optional)</Label>
                <Textarea
                  id="customReason"
                  placeholder="What's going on?"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="bg-secondary border-border"
                  rows={2}
                />
              </div>
            )}

            {/* Info */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>✨ Your progress is safe! When you resume:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Tasks won't be marked as missed during pause</li>
                <li>Your deadline will extend automatically</li>
                <li>Streak protection: no penalty for paused days</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={handlePause}
                disabled={!selectedReason || (selectedReason === "other" && !customReason)}
              >
                <Pause className="w-4 h-4" />
                Pause Goal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}