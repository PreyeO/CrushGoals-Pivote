import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TaskItem } from "@/components/TaskItem";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Clock, Zap } from "lucide-react";

interface Task {
  id: string;
  title: string;
  goalEmoji: string;
  goalName: string;
  timeEstimate: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const initialTasks: Task[] = [
  { id: "1", title: "Drink 3L water", goalEmoji: "💪", goalName: "Lose 20kg", timeEstimate: "All day", completed: false, priority: "medium" },
  { id: "2", title: "30min cardio workout", goalEmoji: "💪", goalName: "Lose 20kg", timeEstimate: "30 min", completed: true, priority: "high" },
  { id: "3", title: "Log all meals", goalEmoji: "💪", goalName: "Lose 20kg", timeEstimate: "5 min", completed: false, priority: "medium" },
  { id: "4", title: "10,000 steps", goalEmoji: "💪", goalName: "Lose 20kg", timeEstimate: "~1 hour", completed: false, priority: "medium" },
  { id: "5", title: "Read 30 pages", goalEmoji: "📚", goalName: "Read 24 Books", timeEstimate: "45 min", completed: false, priority: "high" },
  { id: "6", title: "Take reading notes", goalEmoji: "📚", goalName: "Read 24 Books", timeEstimate: "15 min", completed: false, priority: "low" },
  { id: "7", title: "Post content on 2 platforms", goalEmoji: "💰", goalName: "Earn ₦500K", timeEstimate: "30 min", completed: false, priority: "high" },
  { id: "8", title: "Respond to 5 client inquiries", goalEmoji: "💰", goalName: "Earn ₦500K", timeEstimate: "20 min", completed: false, priority: "high" },
  { id: "9", title: "Sleep 8 hours", goalEmoji: "💪", goalName: "Lose 20kg", timeEstimate: "Tonight", completed: false, priority: "medium" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Group by goal
  const groupedTasks = pendingTasks.reduce((acc, task) => {
    if (!acc[task.goalName]) acc[task.goalName] = [];
    acc[task.goalName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Today's Mission 🎯</h1>
              <p className="text-muted-foreground">
                Complete all tasks for a Perfect Day bonus! (+100 XP)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="hero" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <ProgressRing progress={progress} size={100} strokeWidth={8}>
                  <div className="text-center">
                    <span className="text-2xl font-bold">{completedCount}/{tasks.length}</span>
                  </div>
                </ProgressRing>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Tuesday, January 7</h3>
                  <p className="text-muted-foreground">
                    {progress === 100 
                      ? "🎉 Perfect Day achieved!" 
                      : `${tasks.length - completedCount} tasks remaining`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time left</span>
                  </div>
                  <p className="text-xl font-bold">8h 45m</p>
                </div>
                <Button variant="premium" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Focus Mode
                </Button>
              </div>
            </div>
          </div>

          {/* Tasks by Goal */}
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([goalName, goalTasks]) => (
              <div key={goalName} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{goalTasks[0].goalEmoji}</span>
                  <h3 className="font-semibold text-lg">{goalName}</h3>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {goalTasks.filter(t => t.completed).length}/{goalTasks.length} complete
                  </span>
                </div>
                <div className="space-y-2">
                  {goalTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      goalName={task.goalName}
                      goalEmoji={task.goalEmoji}
                      timeEstimate={task.timeEstimate}
                      priority={task.priority}
                      completed={task.completed}
                      onComplete={() => handleToggle(task.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                ✓ {completedTasks.length} Completed Tasks
              </h3>
              <div className="glass-card p-6 rounded-2xl opacity-60">
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      goalName={task.goalName}
                      goalEmoji={task.goalEmoji}
                      priority={task.priority}
                      completed={task.completed}
                      onComplete={() => handleToggle(task.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
