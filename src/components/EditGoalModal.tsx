import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar, Shield, TrendingUp, History } from "lucide-react";
import type { Goal } from "@/hooks/useGoals";

interface EditGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (goalId: string, updates: Partial<Goal>) => Promise<Goal | null>;
}

export function EditGoalModal({ open, onOpenChange, goal, onSave }: EditGoalModalProps) {
  const [name, setName] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const originalDeadline = goal?.deadline || "";
  const originalTarget = goal?.target_value || "";

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetValue(goal.target_value || "");
      setCurrentValue(goal.current_value || "0");
      setDeadline(goal.deadline || "");
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal || !name) return;
    
    setIsLoading(true);
    try {
      await onSave(goal.id, {
        name,
        target_value: targetValue || null,
        current_value: currentValue,
        deadline: deadline || null,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isDeadlineExtended = deadline && originalDeadline && new Date(deadline) > new Date(originalDeadline);
  const isTargetModified = targetValue !== originalTarget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{goal?.emoji}</span>
            Adjust Goal
          </DialogTitle>
        </DialogHeader>

        {/* Progress Preservation Notice */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
          <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-success">Your progress is safe</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjusting deadlines or targets won't affect your completed tasks, XP, or streak history.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="editName" className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Goal Name
            </Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editCurrent" className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Current Progress
              </Label>
              <Input
                id="editCurrent"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="bg-secondary border-border h-12"
                placeholder="e.g., 5kg lost"
              />
              <p className="text-[10px] text-muted-foreground">Your tracked progress so far</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTarget" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Target
              </Label>
              <Input
                id="editTarget"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="bg-secondary border-border h-12"
                placeholder="e.g., 20kg"
              />
              {isTargetModified && (
                <p className="text-[10px] text-warning">Target modified from: {originalTarget}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDeadline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Deadline
            </Label>
            <Input
              id="editDeadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary border-border h-12"
            />
            {isDeadlineExtended && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <span>📅 Extending deadline from {new Date(originalDeadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Summary of changes */}
          {(isDeadlineExtended || isTargetModified) && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">Summary of adjustments:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {isTargetModified && (
                  <li>• Target: {originalTarget} → {targetValue}</li>
                )}
                {isDeadlineExtended && (
                  <li>• Deadline: {new Date(originalDeadline).toLocaleDateString()} → {new Date(deadline).toLocaleDateString()}</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleSave}
              disabled={!name || isLoading}
            >
              {isLoading ? "Saving..." : "Save Adjustments"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
