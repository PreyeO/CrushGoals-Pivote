import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProgressRing } from "@/components/ProgressRing";
import { TrendingUp, Flame, Target, CheckSquare, Trophy, Loader2, Calendar, BarChart3 } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type TimeRange = "week" | "month" | "year";

interface DayData {
  date: string;
  day: string;
  completed: number;
  total: number;
  percent: number;
}

export default function Analytics() {
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [streakHistory, setStreakHistory] = useState<{ date: string; streak: number }[]>([]);
  const [xpHistory, setXpHistory] = useState<{ date: string; xp: number }[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  // Fetch chart data based on time range
  useEffect(() => {
    const fetchChartData = async () => {
      if (!user) return;
      setIsLoadingChart(true);

      try {
        const now = new Date();
        let startDate = new Date();
        let labels: string[] = [];

        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 6);
          labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return d.toISOString().split('T')[0];
          });
        } else if (timeRange === "month") {
          startDate.setDate(now.getDate() - 29);
          labels = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            return d.toISOString().split('T')[0];
          });
        } else {
          startDate.setMonth(now.getMonth() - 11);
          startDate.setDate(1);
          labels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(startDate);
            d.setMonth(startDate.getMonth() + i);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          });
        }

        // Fetch tasks for the range
        const { data: tasks } = await supabase
          .from('tasks')
          .select('due_date, completed, completed_at')
          .eq('user_id', user.id)
          .gte('due_date', startDate.toISOString().split('T')[0])
          .lte('due_date', now.toISOString().split('T')[0]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const data: DayData[] = labels.map(label => {
          let tasksForPeriod: typeof tasks = [];
          let displayLabel = '';

          if (timeRange === "year") {
            const [year, month] = label.split('-');
            tasksForPeriod = tasks?.filter(t => {
              const taskDate = new Date(t.due_date);
              return taskDate.getFullYear() === parseInt(year) && 
                     taskDate.getMonth() === parseInt(month) - 1;
            }) || [];
            displayLabel = monthNames[parseInt(month) - 1];
          } else {
            tasksForPeriod = tasks?.filter(t => t.due_date === label) || [];
            const d = new Date(label);
            displayLabel = timeRange === "week" 
              ? dayNames[d.getDay()]
              : `${d.getDate()}`;
          }

          const completed = tasksForPeriod.filter(t => t.completed).length;
          const total = tasksForPeriod.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return { date: label, day: displayLabel, completed, total, percent };
        });

        setChartData(data);

        // Generate streak history (simulated based on current data)
        const streaks = data.map((d, i) => ({
          date: d.day,
          streak: d.percent === 100 ? Math.min(i + 1, stats?.current_streak || 0) : 0
        }));
        setStreakHistory(streaks);

        // Generate XP history (estimated)
        let cumulativeXp = 0;
        const xpData = data.map(d => {
          cumulativeXp += d.completed * 10 + (d.percent === 100 ? 100 : 0);
          return { date: d.day, xp: cumulativeXp };
        });
        setXpHistory(xpData);

      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [user?.id, timeRange, stats]);

  const isLoading = statsLoading || goalsLoading;

  // Calculate success rate from chart data
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = chartData.reduce((sum, d) => sum + d.total, 0);
  const successRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Get active goals for progress display
  const activeGoals = goals.filter(g => g.status !== 'completed').slice(0, 3);

  const bestDay = chartData.reduce((best, day) => day.percent > best.percent ? day : best, chartData[0] || { day: '-', percent: 0 });
  const maxXp = Math.max(...xpHistory.map(x => x.xp), 1);

  const insights = [
    { 
      text: successRate >= 80 
        ? "Outstanding! You're completing most of your tasks. Keep up the momentum!" 
        : successRate >= 50
        ? "You're making good progress. Try to complete a few more tasks each day."
        : "Focus on completing your high-priority tasks first to build momentum.",
      type: successRate >= 80 ? "praise" : successRate >= 50 ? "insight" : "tip" 
    },
    { 
      text: (stats?.current_streak || 0) >= 7
        ? `Incredible ${stats?.current_streak}-day streak! You're building a powerful habit.`
        : "Consistency is key. Complete all your tasks today to start building a streak!",
      type: (stats?.current_streak || 0) >= 7 ? "praise" : "tip"
    },
    { 
      text: activeGoals.length > 0
        ? `You have ${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''}. Stay focused on your top priority!`
        : "Create a goal to start tracking your progress and stay motivated.",
      type: "insight"
    },
  ];

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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analytics Dashboard 📊</h1>
              <p className="text-muted-foreground">Deep insights into your goal-crushing performance</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <CheckSquare className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                <span className="flex items-center gap-1 text-success text-xs sm:text-sm">
                  <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" /> Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{stats?.tasks_completed || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Tasks Completed</p>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Target className="w-5 sm:w-6 h-5 sm:h-6 text-success" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{successRate}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Success Rate ({timeRange})</p>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Flame className="w-5 sm:w-6 h-5 sm:h-6 text-orange-500" />
                {(stats?.current_streak || 0) >= 7 && (
                  <span className="text-premium text-xs sm:text-sm">🔥 Hot!</span>
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{stats?.current_streak || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Current Streak</p>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Trophy className="w-5 sm:w-6 h-5 sm:h-6 text-premium" />
                <span className="text-muted-foreground text-xs sm:text-sm">Level {stats?.level || 1}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{(stats?.total_xp || 0).toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Task Completion Chart */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Task Completion
                </h3>
              </div>
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-36 sm:h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between h-36 sm:h-48 gap-1">
                    {chartData.slice(-7).map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-full bg-white/10 rounded-lg relative overflow-hidden" style={{ height: "120px" }}>
                          <div 
                            className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                            style={{ 
                              height: `${day.percent}%`,
                              background: day.percent >= 80 
                                ? "linear-gradient(to top, hsl(var(--success)), hsl(var(--success)/0.5))"
                                : day.percent >= 60
                                ? "linear-gradient(to top, hsl(var(--warning)), hsl(var(--warning)/0.5))"
                                : day.percent > 0
                                ? "linear-gradient(to top, hsl(var(--danger)), hsl(var(--danger)/0.5))"
                                : "transparent"
                            }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                    Best: <span className="text-success font-medium">{bestDay?.day} ({bestDay?.percent || 0}%)</span>
                  </p>
                </>
              )}
            </div>

            {/* XP Progression Chart */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-premium" />
                  XP Progression
                </h3>
              </div>
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-36 sm:h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between h-36 sm:h-48 gap-1">
                    {xpHistory.slice(-7).map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-full bg-white/10 rounded-lg relative overflow-hidden" style={{ height: "120px" }}>
                          <div 
                            className="absolute bottom-0 w-full rounded-lg transition-all duration-500 bg-gradient-to-t from-primary to-primary/50"
                            style={{ height: `${(day.xp / maxXp) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{day.date}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                    Total XP earned this {timeRange}: <span className="text-primary font-medium">{xpHistory[xpHistory.length - 1]?.xp || 0}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Goal Progress */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Goal Progress
              </h3>
              {activeGoals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active goals yet</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {activeGoals.map((goal) => (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                          <span>{goal.emoji}</span> {goal.name}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{goal.progress || 0}%</span>
                      </div>
                      <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500" 
                          style={{ width: `${goal.progress || 0}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Calendar */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Streak History
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {chartData.slice(-28).map((day, i) => {
                  const isPerfect = day.percent === 100;
                  const hasActivity = day.total > 0;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                        isPerfect 
                          ? 'bg-success/30 text-success border border-success/50' 
                          : hasActivity && day.percent > 0
                          ? 'bg-warning/20 text-warning border border-warning/30'
                          : 'bg-white/5 text-muted-foreground'
                      }`}
                      title={`${day.date}: ${day.completed}/${day.total} tasks`}
                    >
                      {isPerfect ? '🔥' : day.percent > 0 ? Math.round(day.percent / 10) : '·'}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-success/30 border border-success/50" /> Perfect
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-warning/20 border border-warning/30" /> Partial
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-white/5" /> No tasks
                </span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl">
            <h3 className="text-base sm:text-lg font-semibold mb-4">💡 Insights</h3>
            <div className="space-y-3 sm:space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="p-3 sm:p-4 rounded-xl bg-white/5 border-l-4"
                  style={{
                    borderColor: insight.type === "praise" 
                      ? "hsl(var(--success))" 
                      : insight.type === "tip"
                      ? "hsl(var(--warning))"
                      : "hsl(var(--primary))"
                  }}
                >
                  <p className="text-xs sm:text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
