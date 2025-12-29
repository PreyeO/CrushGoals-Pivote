import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TaskItem } from "@/components/TaskItem";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCalendar } from "@/components/TaskCalendar";
import { WeeklyGoalView } from "@/components/WeeklyGoalView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkTaskCompletion } from "@/components/BulkTaskCompletion";
import { Plus, Filter, Clock, Zap, Loader2, Timer, CalendarDays, AlertTriangle, ChevronDown, ChevronUp, CheckSquare, CalendarRange } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useMissedTasks } from "@/hooks/useMissedTasks";
import { useGoals, Goal } from "@/hooks/useGoals";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";
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

// Calculate time left until midnight
const getTimeLeftToday = (): { hours: number; minutes: number; formatted: string } => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`
  };
};

export default function Tasks() {
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks(today);
  const { missedTasks, totalMissed, markTaskComplete, refreshMissedTasks, isLoading: missedLoading } = useMissedTasks();
  const { goals } = useGoals();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskGoalId, setNewTaskGoalId] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeftToday());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  const [showMissed, setShowMissed] = useState(false);
  const [bulkCompleteGoal, setBulkCompleteGoal] = useState<Goal | null>(null);
  
  // Fetch all tasks for weekly view (no date filter)
  const { tasks: allTasks, toggleTask: toggleAllTask } = useTasks();
  
  // Update time left every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeftToday());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTask(id, !completed);
  };

  const handleMissedTaskComplete = async (taskId: string) => {
    const success = await markTaskComplete(taskId);
    if (success) {
      toast.success('Task marked as complete! (Late but done!)');
      refreshMissedTasks();
    }
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

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkComplete = async (taskIds: string[]) => {
    for (const taskId of taskIds) {
      await toggleTask(taskId, true);
    }
    toast.success(`${taskIds.length} tasks completed! 🎉`);
  };

  const taskToDelete = tasks.find(t => t.id === deleteTaskId);

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
              <Button 
                variant={showWeeklyView ? "default" : "outline"} 
                className="gap-2"
                onClick={() => { setShowWeeklyView(!showWeeklyView); setShowCalendar(false); }}
              >
                <CalendarRange className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly</span>
              </Button>
              <Button 
                variant={showCalendar ? "default" : "outline"} 
                className="gap-2"
                onClick={() => { setShowCalendar(!showCalendar); setShowWeeklyView(false); }}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
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

          {/* Progress Overview with Time Left */}
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
              <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                {/* Time Left */}
                <div className="text-center px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-1.5 text-warning mb-0.5">
                    <Timer className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-medium">Time left</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-warning">{timeLeft.formatted}</p>
                </div>
                {/* Completed */}
                <div className="text-center">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs">Done</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-success">{completedCount}</p>
                </div>
                <Button variant="premium" className="gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Focus Mode</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          {showCalendar && (
            <div className="mb-6 glass-card rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Task Calendar</h3>
              <TaskCalendar selectedDate={new Date()} />
            </div>
          )}

          {/* Weekly Goal View */}
          {showWeeklyView && (
            <div className="mb-6 glass-card rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Weekly Goal Progress</h3>
              <WeeklyGoalView 
                tasks={allTasks} 
                goals={goals}
                onToggleTask={(id, completed) => toggleAllTask(id, !completed)}
              />
            </div>
          )}

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
            {Object.entries(groupedTasks).map(([goalName, goalTasks]) => {
              const goalData = goals.find(g => g.name === goalName);
              const incompleteTasks = goalTasks.filter(t => !t.completed);
              
              return (
                <div key={goalName} className="glass-card p-4 sm:p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl sm:text-2xl">{goalTasks[0]?.goal?.emoji || '📌'}</span>
                    <h3 className="font-semibold text-base sm:text-lg">{goalName}</h3>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                      {goalTasks.filter(t => t.completed).length}/{goalTasks.length} complete
                    </span>
                    {/* Bulk Complete Button */}
                    {goalData && incompleteTasks.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setBulkCompleteGoal(goalData)}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bulk</span>
                      </Button>
                    )}
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
                        onEdit={() => setEditTask(task)}
                        onDelete={() => setDeleteTaskId(task.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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

          {/* Missed Tasks */}
          {totalMissed > 0 && (
            <div className="mt-6 lg:mt-8">
              <button 
                onClick={() => setShowMissed(!showMissed)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="text-left">
                    <h3 className="font-semibold text-destructive">
                      {totalMissed} Missed Task{totalMissed > 1 ? 's' : ''}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Past tasks not completed. Tap to complete late.
                    </p>
                  </div>
                </div>
                {showMissed ? (
                  <ChevronUp className="w-5 h-5 text-destructive" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-destructive" />
                )}
              </button>
              
              {showMissed && (
                <div className="mt-4 glass-card p-4 sm:p-6 rounded-2xl border border-destructive/20">
                  <div className="space-y-4">
                    {missedTasks.map(task => {
                      const dueDate = new Date(task.due_date);
                      const formattedDate = dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <button
                            onClick={() => handleMissedTaskComplete(task.id)}
                            className="w-6 h-6 rounded-full border-2 border-destructive/50 hover:bg-destructive/20 hover:border-destructive transition-all flex items-center justify-center flex-shrink-0"
                          >
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.goal?.emoji} {task.goal?.name || 'No Goal'} • Due {formattedDate}
                            </p>
                          </div>
                          <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                            Missed
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
              <label className="text-sm font-medium mb-2 block">What do you need to do?</label>
              <Input
                placeholder="e.g., Go for a 30-minute run"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-secondary border-border"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Link to Goal</label>
              <Select value={newTaskGoalId || "none"} onValueChange={(v) => setNewTaskGoalId(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">📌 No Goal (standalone task)</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.emoji} {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Linking to a goal helps track your progress
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High - Do this first</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Important</SelectItem>
                  <SelectItem value="low">🟢 Low - When you have time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="hero" className="w-full" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskModal
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
        task={editTask}
        goals={goals}
        onSave={handleEditTask}
      />

      <DeleteConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        isLoading={isDeleting}
      />

      {/* Bulk Task Completion Modal */}
      {bulkCompleteGoal && (
        <BulkTaskCompletion
          open={!!bulkCompleteGoal}
          onOpenChange={(open) => !open && setBulkCompleteGoal(null)}
          tasks={tasks.filter(t => t.goal?.id === bulkCompleteGoal.id)}
          goalName={bulkCompleteGoal.name}
          goalEmoji={bulkCompleteGoal.emoji || '🎯'}
          onComplete={handleBulkComplete}
        />
      )}
    </div>
  );
}
