import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Flag, Plus } from "lucide-react";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId?: string;
  goalName?: string;
  goalEmoji?: string;
  onSuccess?: (task: TaskData) => void;
}

export interface TaskData {
  title: string;
  goal_id?: string;
  due_date: string;
  priority: string;
  time_estimate?: string;
}

export function AddTaskModal({ 
  open, 
  onOpenChange, 
  goalId, 
  goalName, 
  goalEmoji,
  onSuccess 
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState("medium");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSuccess?.({
        title: title.trim(),
        goal_id: goalId,
        due_date: dueDate,
        priority,
        time_estimate: timeEstimate || undefined,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority("medium");
    setTimeEstimate("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Task
          </DialogTitle>
          {goalName && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span>{goalEmoji || '🎯'}</span>
              Adding to: {goalName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="taskTitle">What do you need to do?</Label>
            <Input
              id="taskTitle"
              placeholder="e.g., Go for a 30-minute run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border h-12"
              autoFocus
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-secondary border-border h-12"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-secondary border-border h-12">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Low Priority
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    Medium Priority
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    High Priority
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Estimate */}
          <div className="space-y-2">
            <Label htmlFor="timeEstimate" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time Estimate (optional)
            </Label>
            <Input
              id="timeEstimate"
              placeholder="e.g., 30 mins, 1 hour"
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(e.target.value)}
              className="bg-secondary border-border h-12"
            />
          </div>

          {/* Submit Button */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              "Adding..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}