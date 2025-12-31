import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Star, Lock } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import type { Goal } from "@/hooks/useGoals";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredOverlay } from "@/components/TrialExpiredOverlay";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  goals: Goal[];
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function EditTaskModal({ open, onOpenChange, task, goals, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTrialOverlay, setShowTrialOverlay] = useState(false);
  const { canPerformActions } = useTrialStatus();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setGoalId(task.goal_id);
      setPriority(task.priority);
      setTimeEstimate(task.time_estimate || "");
      setDueDate(task.due_date);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task || !title) return;
    
    if (!canPerformActions) {
      setShowTrialOverlay(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(task.id, {
        title,
        goal_id: goalId,
        priority,
        time_estimate: timeEstimate || null,
        due_date: dueDate,
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
          <DialogTitle className="text-xl">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Task Title</Label>
            <Input
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Linked Goal</Label>
            <Select value={goalId || "none"} onValueChange={(v) => setGoalId(v === "none" ? null : v)}>
              <SelectTrigger className="bg-secondary border-border h-12">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No goal</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.emoji} {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(v: "high" | "medium" | "low") => setPriority(v)}>
                <SelectTrigger className="bg-secondary border-border h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time Estimate
              </Label>
              <Input
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="e.g., 30 min"
                className="bg-secondary border-border h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Due Date
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              disabled={!title || isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Trial Expired Overlay */}
        <TrialExpiredOverlay 
          open={showTrialOverlay} 
          onOpenChange={setShowTrialOverlay}
          actionType="edit"
        />
      </DialogContent>
    </Dialog>
  );
}
