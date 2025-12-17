import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Target, CheckCircle2, Circle, Calendar } from "lucide-react";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, isWithinInterval, isSameWeek } from "date-fns";
import type { Task } from "@/hooks/useTasks";
import type { Goal } from "@/hooks/useGoals";

interface WeeklyGoalViewProps {
  tasks: Task[];
  goals: Goal[];
  onToggleTask?: (taskId: string, completed: boolean) => void;
}

interface WeeklyGoalSummary {
  goal: Goal;
  tasks: Task[];
  completed: number;
  total: number;
  weeklyTarget: number;
  targetMet: boolean;
}

export function WeeklyGoalView({ tasks, goals, onToggleTask }: WeeklyGoalViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  // Filter tasks for this week
  const weekTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isWithinInterval(taskDate, { start: currentWeekStart, end: weekEnd });
    });
  }, [tasks, currentWeekStart, weekEnd]);

  // Group by goal and calculate weekly summaries
  const weeklySummaries: WeeklyGoalSummary[] = useMemo(() => {
    const goalMap = new Map<string, WeeklyGoalSummary>();

    weekTasks.forEach(task => {
      const goalId = task.goal_id || 'no-goal';
      const goal = goals.find(g => g.id === task.goal_id);
      
      if (!goalMap.has(goalId)) {
        // Calculate weekly target based on frequency
        let weeklyTarget = 7; // default daily
        if (goal?.task_frequency === 'weekly') weeklyTarget = 1;
        else if (goal?.task_frequency === 'biweekly') weeklyTarget = 0.5;
        else if (goal?.task_frequency === 'monthly') weeklyTarget = 0.25;

        goalMap.set(goalId, {
          goal: goal || {
            id: 'no-goal',
            name: 'Unlinked Tasks',
            emoji: '📌',
            category: 'other',
            progress: 0,
            status: 'on-track',
            user_id: '',
            created_at: '',
            updated_at: '',
          } as Goal,
          tasks: [],
          completed: 0,
          total: 0,
          weeklyTarget: Math.ceil(weeklyTarget),
          targetMet: false,
        });
      }

      const summary = goalMap.get(goalId)!;
      summary.tasks.push(task);
      summary.total++;
      if (task.completed) summary.completed++;
    });

    // Calculate if target is met
    goalMap.forEach(summary => {
      summary.targetMet = summary.completed >= summary.weeklyTarget;
    });

    return Array.from(goalMap.values()).sort((a, b) => b.total - a.total);
  }, [weekTasks, goals]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const totalCompleted = weekTasks.filter(t => t.completed).length;
  const totalTasks = weekTasks.length;
  const weekProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>
        
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">
              {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </span>
          </div>
          {isCurrentWeek && (
            <Badge variant="secondary" className="mt-1 text-xs">This Week</Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="gap-1"
          disabled={isCurrentWeek}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Overview Card */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Weekly Progress</span>
          <span className="text-2xl font-bold">{totalCompleted}/{totalTasks}</span>
        </div>
        <Progress value={weekProgress} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {weekProgress === 100 ? '🎉 Perfect Week!' : `${totalTasks - totalCompleted} remaining`}
          </span>
          <span className="text-xs font-medium text-primary">{weekProgress}%</span>
        </div>
      </Card>

      {/* Goal Summaries */}
      {weeklySummaries.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-semibold mb-1">No tasks this week</h3>
          <p className="text-sm text-muted-foreground">
            Tasks will appear here based on their due dates
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {weeklySummaries.map(summary => (
            <Card key={summary.goal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{summary.goal.emoji}</span>
                  <div>
                    <h4 className="font-medium">{summary.goal.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Target: {summary.weeklyTarget}x this week
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={summary.targetMet ? "default" : "secondary"}
                  className={summary.targetMet ? "bg-success text-success-foreground" : ""}
                >
                  {summary.completed}/{summary.weeklyTarget} {summary.targetMet ? '✓' : ''}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <Progress 
                  value={Math.min((summary.completed / summary.weeklyTarget) * 100, 100)} 
                  className="h-1.5"
                />
              </div>

              {/* Individual tasks */}
              <div className="space-y-2">
                {summary.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      task.completed ? 'bg-success/10' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask?.(task.id, task.completed || false)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.due_date!), 'EEE')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Target status message */}
              {summary.targetMet && (
                <div className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-xs text-success font-medium flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Weekly target achieved! 🎯
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}