import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Target, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from "date-fns";
import { logError } from "@/lib/logger";

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
  const [month, setMonth] = useState<Date>(new Date());
  const [taskDays, setTaskDays] = useState<Map<string, GoalTaskDay>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    completedDays: 0,
    perfectDays: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    const fetchGoalTasks = async () => {
      if (!user || !goalId) return;
      setIsLoading(true);

      const start = startOfMonth(month);
      const end = endOfMonth(month);

      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('due_date, completed')
          .eq('user_id', user.id)
          .eq('goal_id', goalId)
          .gte('due_date', format(start, 'yyyy-MM-dd'))
          .lte('due_date', format(end, 'yyyy-MM-dd'));

        if (error) throw error;

        const dayMap = new Map<string, GoalTaskDay>();
        
        // Initialize all days in the month
        eachDayOfInterval({ start, end }).forEach(day => {
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

        // Calculate streak (simplified - within current month)
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
  }, [user, goalId, month]);

  const getDayContent = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const taskDay = taskDays.get(key);

    if (!taskDay || taskDay.totalTasks === 0) {
      return null;
    }

    const percentage = (taskDay.completedTasks / taskDay.totalTasks) * 100;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all",
            taskDay.isPerfect 
              ? "bg-success/20 text-success ring-1 ring-success/50" 
              : taskDay.completedTasks > 0 
                ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                : "bg-muted/50 text-muted-foreground"
          )}
        >
          {day.getDate()}
        </div>
      </div>
    );
  };

  const completionRate = stats.totalDays > 0 
    ? Math.round((stats.perfectDays / stats.totalDays) * 100) 
    : 0;

  return (
    <div className="space-y-3 max-w-full overflow-hidden">
      {/* Goal Header - Compact */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
        <span className="text-lg">{goalEmoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{goalName}</h3>
        </div>
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

      {/* Calendar - Compact and responsive */}
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        className="rounded-lg border border-border/50 p-2 w-full"
        classNames={{
          months: "flex flex-col",
          month: "space-y-1",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-xs font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex justify-between",
          head_cell: "text-muted-foreground w-8 font-normal text-[10px]",
          row: "flex w-full justify-between mt-1",
          cell: "text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
          day_today: "ring-1 ring-primary/50",
        }}
        components={{
          DayButton: ({ day, ...buttonProps }) => (
            <button {...buttonProps}>
              {getDayContent(day.date) || (
                <span className="text-[10px]">{day.date.getDate()}</span>
              )}
            </button>
          ),
        }}
        disabled={(date) => {
          if (startDate && date < new Date(startDate)) return true;
          if (endDate && date > new Date(endDate)) return true;
          return false;
        }}
      />

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
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning/20 ring-1 ring-warning/30" />
          <span>Paused</span>
        </div>
      </div>
    </div>
  );
}
