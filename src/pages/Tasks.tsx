import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TaskItem } from "@/components/TaskItem";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Clock, Zap, Loader2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Tasks() {
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading, addTask, toggleTask } = useTasks(today);
  const { goals } = useGoals();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskGoalId, setNewTaskGoalId] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskTime, setNewTaskTime] = useState("");
  
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTask(id, !completed);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      title: newTaskTitle,
      goal_id: newTaskGoalId || undefined,
      priority: newTaskPriority,
      time_estimate: newTaskTime || undefined,
      due_date: today,
    });
    
    setNewTaskTitle("");
    setNewTaskGoalId("");
    setNewTaskPriority("medium");
    setNewTaskTime("");
    setAddTaskOpen(false);
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Group by goal
  const groupedTasks = pendingTasks.reduce((acc, task) => {
    const goalName = task.goal?.name || 'No Goal';
    if (!acc[goalName]) acc[goalName] = [];
    acc[goalName].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Today's Mission 🎯</h1>
              <p className="text-muted-foreground">
                Complete all tasks for a Perfect Day bonus! (+100 XP)
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="hero" className="gap-2" onClick={() => setAddTaskOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <ProgressRing progress={progress} size={80} strokeWidth={6}>
                  <div className="text-center">
                    <span className="text-lg sm:text-2xl font-bold">{completedCount}/{tasks.length}</span>
                  </div>
                </ProgressRing>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{todayFormatted}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {progress === 100 
                      ? "🎉 Perfect Day achieved!" 
                      : tasks.length === 0
                      ? "No tasks for today. Add some!"
                      : `${tasks.length - completedCount} tasks remaining`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Remaining</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold">{tasks.length - completedCount}</p>
                </div>
                <Button variant="premium" className="gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Focus Mode</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No tasks for today</h3>
              <p className="text-muted-foreground mb-6">Add your first task to start crushing your goals!</p>
              <Button variant="hero" onClick={() => setAddTaskOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Task
              </Button>
            </div>
          )}

          {/* Tasks by Goal */}
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedTasks).map(([goalName, goalTasks]) => (
              <div key={goalName} className="glass-card p-4 sm:p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl sm:text-2xl">{goalTasks[0]?.goal?.emoji || '📌'}</span>
                  <h3 className="font-semibold text-base sm:text-lg">{goalName}</h3>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                    {goalTasks.filter(t => t.completed).length}/{goalTasks.length} complete
                  </span>
                </div>
                <div className="space-y-2">
                  {goalTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      goalName={task.goal?.name || 'No Goal'}
                      goalEmoji={task.goal?.emoji || '📌'}
                      timeEstimate={task.time_estimate || undefined}
                      priority={task.priority as "high" | "medium" | "low"}
                      completed={task.completed || false}
                      onComplete={() => handleToggle(task.id, task.completed || false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-6 lg:mt-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-muted-foreground">
                ✓ {completedTasks.length} Completed Tasks
              </h3>
              <div className="glass-card p-4 sm:p-6 rounded-2xl opacity-60">
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      goalName={task.goal?.name || 'No Goal'}
                      goalEmoji={task.goal?.emoji || '📌'}
                      priority={task.priority as "high" | "medium" | "low"}
                      completed={true}
                      onComplete={() => handleToggle(task.id, true)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Title</label>
              <Input
                placeholder="What do you need to do?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Link to Goal (optional)</label>
              <Select value={newTaskGoalId} onValueChange={setNewTaskGoalId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Goal</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.emoji} {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as "high" | "medium" | "low")}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Estimate</label>
                <Input
                  placeholder="e.g., 30 min"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
