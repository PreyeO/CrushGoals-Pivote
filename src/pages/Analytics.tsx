import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProgressRing } from "@/components/ProgressRing";
import {
  TrendingUp,
  Flame,
  Target,
  CheckSquare,
  Trophy,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/contexts/AuthContext";
import { useMainLayout } from "@/hooks/useMainLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";

type TimeRange = "week" | "month" | "year";

interface DayData {
  date: string;
  day: string;
  completed: number;
  total: number;
  percent: number;
  fullDate: Date;
}

export default function Analytics() {
  const { mainPaddingClass } = useMainLayout();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<
    Map<string, { completed: number; total: number }>
  >(new Map());
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  // Fetch chart data based on time range
  useEffect(() => {
    const fetchChartData = async () => {
      if (!user) return;
      setIsLoadingChart(true);

      try {
        const now = new Date();
        const startDate = new Date();
        let labels: string[] = [];

        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 6);
          labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return d.toISOString().split("T")[0];
          });
        } else if (timeRange === "month") {
          startDate.setDate(now.getDate() - 29);
          labels = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return d.toISOString().split("T")[0];
          });
        } else {
          startDate.setMonth(now.getMonth() - 11);
          startDate.setDate(1);
          labels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(startDate);
            d.setMonth(startDate.getMonth() + i);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}`;
          });
        }

        // Fetch tasks for the range
        const { data: tasks } = await supabase
          .from("tasks")
          .select("due_date, completed, completed_at")
          .eq("user_id", user.id)
          .gte("due_date", startDate.toISOString().split("T")[0])
          .lte("due_date", now.toISOString().split("T")[0]);

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const data: DayData[] = labels.map((label) => {
          let tasksForPeriod: typeof tasks = [];
          let displayLabel = "";
          let fullDate = new Date();

          if (timeRange === "year") {
            const [year, month] = label.split("-");
            tasksForPeriod =
              tasks?.filter((t) => {
                const taskDate = new Date(t.due_date);
                return (
                  taskDate.getFullYear() === parseInt(year) &&
                  taskDate.getMonth() === parseInt(month) - 1
                );
              }) || [];
            displayLabel = monthNames[parseInt(month) - 1];
            fullDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          } else {
            tasksForPeriod = tasks?.filter((t) => t.due_date === label) || [];
            const d = new Date(label);
            displayLabel =
              timeRange === "week" ? dayNames[d.getDay()] : `${d.getDate()}`;
            fullDate = d;
          }

          const completed = tasksForPeriod.filter((t) => t.completed).length;
          const total = tasksForPeriod.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            date: label,
            day: displayLabel,
            completed,
            total,
            percent,
            fullDate,
          };
        });

        setChartData(data);
      } catch (error) {
        logError("Error fetching chart data:", error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [user?.id, timeRange, stats, user]);

  // Fetch calendar data for streak calendar
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user) return;

      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      try {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("due_date, completed")
          .eq("user_id", user.id)
          .gte("due_date", firstDay.toISOString().split("T")[0])
          .lte("due_date", lastDay.toISOString().split("T")[0]);

        const dataMap = new Map<string, { completed: number; total: number }>();

        tasks?.forEach((task) => {
          const dateKey = task.due_date;
          const existing = dataMap.get(dateKey) || { completed: 0, total: 0 };
          dataMap.set(dateKey, {
            completed: existing.completed + (task.completed ? 1 : 0),
            total: existing.total + 1,
          });
        });

        setCalendarData(dataMap);
      } catch (error) {
        logError("Error fetching calendar data:", error);
      }
    };

    fetchCalendarData();
  }, [user?.id, calendarMonth, user]);

  const isLoading = statsLoading || goalsLoading;

  // Calculate success rate from chart data
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = chartData.reduce((sum, d) => sum + d.total, 0);
  const successRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Get active goals for progress display
  const activeGoals = goals.filter((g) => g.status !== "completed").slice(0, 4);

  const bestDay = chartData.reduce(
    (best, day) => (day.percent > best.percent ? day : best),
    chartData[0] || { day: "-", percent: 0 }
  );

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: {
      date: Date | null;
      dateStr: string;
      data: { completed: number; total: number } | null;
    }[] = [];

    // Add padding for days before the month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dateStr: "", data: null });
    }

    // Add days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date,
        dateStr,
        data: calendarData.get(dateStr) || null,
      });
    }

    return days;
  }, [calendarMonth, calendarData]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const insights = [
    {
      text:
        successRate >= 80
          ? "Outstanding! You're completing most of your tasks. Keep up the momentum!"
          : successRate >= 50
          ? "You're making good progress. Try to complete a few more tasks each day."
          : "Focus on completing your high-priority tasks first to build momentum.",
      type:
        successRate >= 80 ? "praise" : successRate >= 50 ? "insight" : "tip",
    },
    {
      text:
        (stats?.current_streak || 0) >= 7
          ? `Incredible ${stats?.current_streak}-day streak! You're building a powerful habit.`
          : "Consistency is key. Complete all your tasks today to start building a streak!",
      type: (stats?.current_streak || 0) >= 7 ? "praise" : "tip",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main
          className={cn(
            "min-h-screen flex items-center justify-center transition-all duration-300",
            mainPaddingClass
          )}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          mainPaddingClass
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Analytics</h1>
              <p className="text-muted-foreground text-sm">
                Track your progress and performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "year" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("year")}
              >
                Year
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.tasks_completed || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {successRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.current_streak || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-premium/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-premium" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats?.perfect_days || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Perfect Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Streak Calendar */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Streak Calendar
                </h3>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1
                        )
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-center px-2 min-w-0 flex-1 sm:flex-none sm:min-w-[100px]">
                    <span className="hidden sm:inline">
                      {monthNames[calendarMonth.getMonth()]}{" "}
                      {calendarMonth.getFullYear()}
                    </span>
                    <span className="sm:hidden">
                      {monthNames[calendarMonth.getMonth()].slice(0, 3)}{" "}
                      {calendarMonth.getFullYear()}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1
                        )
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs text-muted-foreground py-1 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day.date) {
                    return <div key={i} className="aspect-square" />;
                  }

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayDate = new Date(day.date);
                  dayDate.setHours(0, 0, 0, 0);

                  const isPast = dayDate < today;
                  const isFuture = dayDate > today;
                  const isToday =
                    day.dateStr === new Date().toISOString().split("T")[0];

                  const isPerfect =
                    day.data &&
                    day.data.total > 0 &&
                    day.data.completed === day.data.total;
                  const hasPartial =
                    day.data &&
                    day.data.total > 0 &&
                    day.data.completed > 0 &&
                    day.data.completed < day.data.total;
                  const hasMissed =
                    day.data &&
                    day.data.total > 0 &&
                    day.data.completed === 0 &&
                    isPast;
                  const hasScheduled =
                    day.data && day.data.total > 0 && isFuture;

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all min-w-0 ${
                        isPerfect
                          ? "bg-success text-success-foreground"
                          : hasPartial
                          ? "bg-warning/30 text-warning"
                          : hasMissed
                          ? "bg-destructive/30 text-destructive"
                          : hasScheduled
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted/20 text-muted-foreground"
                      } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
                      title={
                        day.data
                          ? isFuture
                            ? `${day.data.total} tasks scheduled`
                            : `${day.data.completed}/${day.data.total} tasks`
                          : "No tasks"
                      }
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-success flex-shrink-0" />
                  <span>100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-warning/30 flex-shrink-0" />
                  <span>Partial</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-destructive/30 flex-shrink-0" />
                  <span>Missed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30 flex-shrink-0" />
                  <span>Scheduled</span>
                </div>
              </div>
            </div>

            {/* Task Completion Chart */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Task Completion
                </h3>
              </div>
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-32 sm:h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between h-32 sm:h-40 gap-1 sm:gap-2">
                    {chartData.slice(-7).map((day, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-0"
                      >
                        <div
                          className="w-full bg-muted/30 rounded-lg relative overflow-hidden"
                          style={{ height: "100px", maxWidth: "100%" }}
                        >
                          <div
                            className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                            style={{
                              height: `${day.percent}%`,
                              background:
                                day.percent >= 80
                                  ? "hsl(var(--success))"
                                  : day.percent >= 50
                                  ? "hsl(var(--warning))"
                                  : day.percent > 0
                                  ? "hsl(var(--destructive))"
                                  : "transparent",
                            }}
                          />
                        </div>
                        <span
                          className="text-xs sm:text-sm text-muted-foreground text-center leading-tight min-w-0 truncate"
                          style={{ maxWidth: "100%" }}
                        >
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                    Best:{" "}
                    <span className="text-success font-medium">
                      {bestDay?.day} ({bestDay?.percent || 0}%)
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Goal Progress & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Goal Progress */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Goal Progress
              </h3>
              {activeGoals.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground text-sm">
                    No active goals yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="flex items-center gap-2 text-sm min-w-0 flex-1">
                          <span className="flex-shrink-0">{goal.emoji}</span>
                          <span className="truncate min-w-0">{goal.name}</span>
                        </span>
                        <span className="text-xs font-medium flex-shrink-0">
                          {goal.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm leading-relaxed ${
                      insight.type === "praise"
                        ? "bg-success/10 text-success border border-success/20"
                        : insight.type === "insight"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-warning/10 text-warning border border-warning/20"
                    }`}
                  >
                    {insight.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
