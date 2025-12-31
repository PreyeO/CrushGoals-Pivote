import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Calendar, Check, AlertCircle, Pause } from "lucide-react";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, isWithinInterval, isSameWeek, addDays } from "date-fns";
import type { Task } from "@/hooks/useTasks";
import type { Goal } from "@/hooks/useGoals";

interface WeeklyGoalViewProps {
  tasks: Task[];
  goals: Goal[];
}

export function WeeklyGoalView({ tasks, goals }: WeeklyGoalViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });
  const today = new Date().toISOString().split('T')[0];

  // Filter tasks for this week
  const weekTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isWithinInterval(taskDate, { start: currentWeekStart, end: weekEnd });
    });
  }, [tasks, currentWeekStart, weekEnd]);

  // Group tasks by day
  const groupedByDay = useMemo(() => {
    const days: { date: Date; dayName: string; dateStr: string; tasks: Task[] }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = weekTasks.filter(task => task.due_date === dateStr);
      
      days.push({
        date,
        dayName: format(date, 'EEEE'),
        dateStr,
        tasks: dayTasks,
      });
    }
    
    return days;
  }, [weekTasks, currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const totalCompleted = weekTasks.filter(t => t.completed).length;
  const totalTasks = weekTasks.length;
  const weekProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Determine task status for display
  const getTaskStatus = (task: Task): 'completed' | 'missed' | 'paused' | 'pending' => {
    if (task.completed) return 'completed';
    
    // Check if the goal is paused
    const goal = goals.find(g => g.id === task.goal_id);
    if (goal?.is_paused) return 'paused';
    
    // Check if task is overdue (past date and not completed)
    if (task.due_date && task.due_date < today) return 'missed';
    
    return 'pending';
  };

  const statusConfig = {
    completed: { 
      label: 'Done', 
      className: 'bg-success/10 text-success border-success/20',
      icon: Check
    },
    missed: { 
      label: 'Missed', 
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertCircle
    },
    paused: { 
      label: 'Paused', 
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: Pause
    },
    pending: null,
  };

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

      {/* Days of the Week */}
      {totalTasks === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-semibold mb-1">No tasks this week</h3>
          <p className="text-sm text-muted-foreground">
            Tasks will appear here based on their due dates
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedByDay.map(day => {
            if (day.tasks.length === 0) return null;
            
            const isToday = day.dateStr === today;
            const completedCount = day.tasks.filter(t => t.completed).length;
            
            return (
              <Card 
                key={day.dateStr} 
                className={`p-4 ${isToday ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{day.dayName}</h4>
                    <span className="text-sm text-muted-foreground">
                      {format(day.date, 'MMM d')}
                    </span>
                    {isToday && (
                      <Badge variant="default" className="text-xs">Today</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completedCount}/{day.tasks.length}
                  </span>
                </div>

                {/* Task List - Read Only */}
                <div className="space-y-2">
                  {day.tasks.map(task => {
                    const status = getTaskStatus(task);
                    const statusBadge = statusConfig[status];
                    const goal = goals.find(g => g.id === task.goal_id);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          task.completed 
                            ? 'bg-success/10 border border-success/20' 
                            : status === 'missed'
                            ? 'bg-destructive/5 border border-destructive/20'
                            : status === 'paused'
                            ? 'bg-warning/5 border border-warning/20'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          task.completed 
                            ? 'bg-success text-success-foreground' 
                            : status === 'missed'
                            ? 'bg-destructive/20 text-destructive'
                            : status === 'paused'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {task.completed ? (
                            <Check className="w-4 h-4" />
                          ) : status === 'missed' ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : status === 'paused' ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                          )}
                        </div>
                        
                        {/* Goal Emoji */}
                        <span className="text-lg">{goal?.emoji || task.goal?.emoji || '📌'}</span>
                        
                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm block truncate ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </span>
                          {/* Goal Action Badge */}
                          {goal?.target_value && (
                            <Badge 
                              variant="outline" 
                              className="mt-1 text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              {goal.target_value}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        {statusBadge && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs gap-1 flex-shrink-0 ${statusBadge.className}`}
                          >
                            <statusBadge.icon className="w-3 h-3" />
                            {statusBadge.label}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
