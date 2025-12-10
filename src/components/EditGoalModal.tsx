import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{goal?.emoji}</span>
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
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
              <Label htmlFor="editCurrent">Current Progress</Label>
              <Input
                id="editCurrent"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="bg-secondary border-border h-12"
                placeholder="e.g., 5kg lost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTarget">Target</Label>
              <Input
                id="editTarget"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="bg-secondary border-border h-12"
                placeholder="e.g., 20kg"
              />
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
          </div>

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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
