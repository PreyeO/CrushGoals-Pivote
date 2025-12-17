import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Target } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { logError } from "@/lib/logger";

interface TaskDay {
  date: Date;
  totalTasks: number;
  completedTasks: number;
  isPerfect: boolean;
}

interface TaskCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function TaskCalendar({ onDateSelect, selectedDate }: TaskCalendarProps) {
  const { user } = useAuth();
  const [month, setMonth] = useState<Date>(new Date());
  const [taskDays, setTaskDays] = useState<Map<string, TaskDay>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasksForMonth = async () => {
      if (!user) return;
      setIsLoading(true);

      const start = startOfMonth(month);
      const end = endOfMonth(month);

      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('due_date, completed')
          .eq('user_id', user.id)
          .gte('due_date', format(start, 'yyyy-MM-dd'))
          .lte('due_date', format(end, 'yyyy-MM-dd'));

        if (error) throw error;

        const dayMap = new Map<string, TaskDay>();
        
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
        dayMap.forEach((day, key) => {
          day.isPerfect = day.totalTasks > 0 && day.completedTasks === day.totalTasks;
          dayMap.set(key, day);
        });

        setTaskDays(dayMap);
      } catch (error) {
        logError('Error fetching tasks for calendar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksForMonth();
  }, [user, month]);

  const getDayContent = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const taskDay = taskDays.get(key);

    if (!taskDay || taskDay.totalTasks === 0) {
      return null;
    }

    const percentage = (taskDay.completedTasks / taskDay.totalTasks) * 100;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {taskDay.isPerfect ? (
          <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-success animate-pulse" />
        ) : taskDay.completedTasks > 0 ? (
          <div 
            className="absolute -bottom-1 w-2 h-2 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%)`
            }}
          />
        ) : (
          <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-muted" />
        )}
      </div>
    );
  };

  const selectedDayData = selectedDate 
    ? taskDays.get(format(selectedDate, 'yyyy-MM-dd'))
    : null;

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect?.(date)}
        month={month}
        onMonthChange={setMonth}
        className="rounded-xl border border-border/50 p-3"
        classNames={{
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
        }}
        components={{
          DayContent: ({ date }) => (
            <div className="relative flex flex-col items-center">
              <span>{date.getDate()}</span>
              {getDayContent(date)}
            </div>
          ),
        }}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Perfect Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span>Tasks Due</span>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayData && selectedDayData.totalTasks > 0 && (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-2">
          <h4 className="font-semibold text-sm">
            {format(selectedDate, 'EEEE, MMM d')}
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {selectedDayData.isPerfect ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Target className="w-4 h-4 text-primary" />
              )}
              <span>
                {selectedDayData.completedTasks}/{selectedDayData.totalTasks} tasks completed
              </span>
            </div>
            {selectedDayData.isPerfect && (
              <Badge className="bg-success/20 text-success border-success/30">
                🔥 Perfect!
              </Badge>
            )}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all rounded-full",
                selectedDayData.isPerfect ? "bg-success" : "bg-primary"
              )}
              style={{ 
                width: `${(selectedDayData.completedTasks / selectedDayData.totalTasks) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
