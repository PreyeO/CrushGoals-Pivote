import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay } from "date-fns";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";

interface GoalTaskDay {
  date: Date;
  totalTasks: number;
  completedTasks: number;
  isPerfect: boolean;
}

interface GoalHabitCalendarProps {
  goalId: string;
  goalName: string;
  goalEmoji: string;
  startDate?: string;
  endDate?: string;
}

export function GoalHabitCalendar({ goalId, goalName, goalEmoji, startDate, endDate }: GoalHabitCalendarProps) {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
  const [taskDays, setTaskDays] = useState<Map<string, GoalTaskDay>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    completedDays: 0,
    perfectDays: 0,
    currentStreak: 0,
  });

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    const fetchGoalTasks = async () => {
      if (!user || !goalId) return;
      setIsLoading(true);

      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('due_date, completed')
          .eq('user_id', user.id)
          .eq('goal_id', goalId)
          .gte('due_date', format(weekStart, 'yyyy-MM-dd'))
          .lte('due_date', format(weekEnd, 'yyyy-MM-dd'));

        if (error) throw error;

        const dayMap = new Map<string, GoalTaskDay>();
        
        // Initialize all days in the week
        weekDays.forEach(day => {
          const key = format(day, 'yyyy-MM-dd');
          dayMap.set(key, {
            date: day,
            totalTasks: 0,
            completedTasks: 0,
            isPerfect: false,
          });
        });

        // Populate with task data
        tasks?.forEach(task => {
          const key = task.due_date;
          const existing = dayMap.get(key);
          if (existing) {
            existing.totalTasks++;
            if (task.completed) existing.completedTasks++;
          }
        });

        // Calculate perfect days
        let perfectCount = 0;
        let completedCount = 0;
        let totalWithTasks = 0;

        dayMap.forEach((day, key) => {
          if (day.totalTasks > 0) {
            totalWithTasks++;
            day.isPerfect = day.completedTasks === day.totalTasks;
            if (day.isPerfect) perfectCount++;
            if (day.completedTasks > 0) completedCount++;
          }
          dayMap.set(key, day);
        });

        setTaskDays(dayMap);

        // Calculate streak (within current week)
        let streak = 0;
        const today = new Date();
        const sortedDays = Array.from(dayMap.entries())
          .filter(([_, d]) => d.totalTasks > 0 && d.date <= today)
          .sort((a, b) => b[0].localeCompare(a[0]));

        for (const [_, day] of sortedDays) {
          if (day.completedTasks > 0) {
            streak++;
          } else {
            break;
          }
        }

        setStats({
          totalDays: totalWithTasks,
          completedDays: completedCount,
          perfectDays: perfectCount,
          currentStreak: streak,
        });
      } catch (error) {
        logError('Error fetching goal tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoalTasks();
  }, [user, goalId, weekStart]);

  const goToPreviousWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const goToNextWeek = () => setWeekStart(addWeeks(weekStart, 1));
  const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const completionRate = stats.totalDays > 0 
    ? Math.round((stats.perfectDays / stats.totalDays) * 100) 
    : 0;

  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-3 max-w-full overflow-hidden">
      {/* Goal Header - Compact */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
        <span className="text-lg">{goalEmoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{goalName}</h3>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousWeek}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <p className="text-xs font-medium">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
          {!isCurrentWeek && (
            <button 
              onClick={goToCurrentWeek}
              className="text-[10px] text-primary hover:underline"
            >
              Go to current week
            </button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const taskDay = taskDays.get(key);
          const dayIsToday = isToday(day);
          const hasTasks = taskDay && taskDay.totalTasks > 0;
          const isPerfect = taskDay?.isPerfect;
          const hasPartial = taskDay && taskDay.completedTasks > 0 && !isPerfect;
          const isMissed = hasTasks && taskDay.completedTasks === 0;

          return (
            <div 
              key={key}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg border transition-all",
                dayIsToday && "ring-2 ring-primary/50",
                isPerfect && "bg-success/20 border-success/50",
                hasPartial && "bg-primary/20 border-primary/30",
                isMissed && "bg-muted/50 border-muted",
                !hasTasks && "bg-card/30 border-border/30"
              )}
            >
              <p className="text-[10px] text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </p>
              <p className={cn(
                "text-sm font-bold",
                dayIsToday && "text-primary"
              )}>
                {format(day, 'd')}
              </p>
              {hasTasks ? (
                <div className="mt-1">
                  {isPerfect ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {taskDay.completedTasks}/{taskDay.totalTasks}
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-1 w-4 h-4" /> 
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Row - Compact 4 column grid */}
      <div className="grid grid-cols-4 gap-1">
        <div className="p-1.5 rounded-lg bg-primary/10 text-center">
          <p className="text-sm font-bold text-primary">{stats.currentStreak}</p>
          <p className="text-[9px] text-muted-foreground">Streak</p>
        </div>
        <div className="p-1.5 rounded-lg bg-success/10 text-center">
          <p className="text-sm font-bold text-success">{stats.perfectDays}</p>
          <p className="text-[9px] text-muted-foreground">Perfect</p>
        </div>
        <div className="p-1.5 rounded-lg bg-warning/10 text-center">
          <p className="text-sm font-bold text-warning">{stats.completedDays}</p>
          <p className="text-[9px] text-muted-foreground">Active</p>
        </div>
        <div className="p-1.5 rounded-lg bg-accent/50 text-center">
          <p className="text-sm font-bold">{completionRate}%</p>
          <p className="text-[9px] text-muted-foreground">Rate</p>
        </div>
      </div>

      {/* Legend - Compact inline */}
      <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success/20 ring-1 ring-success/50" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/20 ring-1 ring-primary/30" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted/50" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
