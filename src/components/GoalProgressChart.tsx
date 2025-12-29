import { useMemo } from "react";
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Flame, TrendingUp, CheckCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
}

interface GoalProgressChartProps {
  tasks: Task[];
  goalName?: string;
  showStreak?: boolean;
  days?: number;
}

export function GoalProgressChart({ 
  tasks, 
  goalName,
  showStreak = true,
  days = 14 
}: GoalProgressChartProps) {
  const today = new Date();
  
  // Calculate daily completion data
  const dailyData = useMemo(() => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      data.push({
        date,
        dateStr,
        dayLabel: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        completed,
        total,
        rate,
        isToday: isSameDay(date, today),
      });
    }
    return data;
  }, [tasks, days, today]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      const day = dailyData[i];
      // Skip today if no tasks yet
      if (day.isToday && day.total === 0) continue;
      
      if (day.total > 0 && day.completed === day.total) {
        streak++;
      } else if (day.total > 0) {
        break;
      }
    }
    return streak;
  }, [dailyData]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    
    const thisWeekDays = eachDayOfInterval({ start: thisWeekStart, end: today });
    const lastWeekDays = eachDayOfInterval({ start: lastWeekStart, end: subDays(thisWeekStart, 1) });
    
    const getWeekStats = (daysList: Date[]) => {
      let completed = 0;
      let total = 0;
      daysList.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        completed += dayTasks.filter(t => t.completed).length;
        total += dayTasks.length;
      });
      return { completed, total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };
    
    const thisWeek = getWeekStats(thisWeekDays);
    const lastWeek = getWeekStats(lastWeekDays);
    const improvement = thisWeek.rate - lastWeek.rate;
    
    return { thisWeek, lastWeek, improvement };
  }, [tasks, today]);

  // Overall completion rate
  const overallRate = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  const getBarColor = (rate: number, isToday: boolean) => {
    if (isToday) return 'bg-primary';
    if (rate >= 100) return 'bg-success';
    if (rate >= 50) return 'bg-amber-500';
    if (rate > 0) return 'bg-orange-500';
    return 'bg-muted';
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        {showStreak && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-xl font-bold text-orange-500">{currentStreak} days</p>
          </div>
        )}
        
        <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-emerald-500/20 border border-success/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">This Week</span>
          </div>
          <p className="text-xl font-bold text-success">{weeklyStats.thisWeek.rate}%</p>
        </div>
        
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className={cn("w-4 h-4", weeklyStats.improvement >= 0 ? "text-success" : "text-destructive")} />
            <span className="text-xs text-muted-foreground">vs Last Week</span>
          </div>
          <p className={cn("text-xl font-bold", weeklyStats.improvement >= 0 ? "text-success" : "text-destructive")}>
            {weeklyStats.improvement >= 0 ? '+' : ''}{weeklyStats.improvement}%
          </p>
        </div>
      </div>

      {/* Daily Completion Chart */}
      <div className="p-4 rounded-xl bg-card/50 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Daily Completion Rate
          </h4>
          <span className="text-xs text-muted-foreground">Last {days} days</span>
        </div>
        
        {/* Bar Chart */}
        <div className="flex items-end gap-1 h-24">
          {dailyData.map((day, i) => (
            <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-16">
                {day.total > 0 ? (
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all",
                      getBarColor(day.rate, day.isToday),
                      day.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    )}
                    style={{ height: `${Math.max(day.rate, 8)}%` }}
                    title={`${day.completed}/${day.total} completed (${day.rate}%)`}
                  />
                ) : (
                  <div className="w-full h-2 bg-muted/50 rounded" title="No tasks" />
                )}
              </div>
              <span className={cn(
                "text-[10px]",
                day.isToday ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-muted-foreground">50-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-muted-foreground">&lt;50%</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Completion</span>
          <span className="text-sm font-bold text-primary">{overallRate}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
            style={{ width: `${overallRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
        </p>
      </div>
    </div>
  );
}