import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Loader2 } from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface BulkTaskCompletionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  goalName: string;
  goalEmoji: string;
  onComplete: (taskIds: string[]) => Promise<void>;
}

export function BulkTaskCompletion({
  open,
  onOpenChange,
  tasks,
  goalName,
  goalEmoji,
  onComplete,
}: BulkTaskCompletionProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incompleteTasks = tasks.filter(t => !t.completed);

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === incompleteTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(incompleteTasks.map(t => t.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedTasks.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(selectedTasks);
      setSelectedTasks([]);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] w-[95vw] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            Bulk Complete Tasks
          </DialogTitle>
          <DialogDescription>
            Select multiple tasks from "{goalEmoji} {goalName}" to mark as complete at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {incompleteTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">All tasks are already completed! 🎉</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedTasks.length === incompleteTasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Select All ({incompleteTasks.length} tasks)</span>
                </label>
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.length} selected
                </span>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {incompleteTasks.map((task) => (
                  <label
                    key={task.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedTasks.includes(task.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-secondary/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                    {task.priority && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        task.priority === 'high' && "bg-destructive/20 text-destructive",
                        task.priority === 'medium' && "bg-warning/20 text-warning",
                        task.priority === 'low' && "bg-success/20 text-success"
                      )}>
                        {task.priority}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={selectedTasks.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Complete {selectedTasks.length} Task{selectedTasks.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}