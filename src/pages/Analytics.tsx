import { Sidebar } from "@/components/Sidebar";
import { ProgressRing } from "@/components/ProgressRing";
import { TrendingUp, Flame, Target, CheckSquare, Trophy, Loader2 } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";

export default function Analytics() {
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { tasks, isLoading: tasksLoading } = useTasks();

  const isLoading = statsLoading || goalsLoading || tasksLoading;

  // Calculate weekly data from tasks
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      
      return {
        day,
        completed: total > 0 ? Math.round((completed / total) * 100) : 0,
        total: 100
      };
    });
  };

  const weeklyData = getWeeklyData();
  const bestDay = weeklyData.reduce((best, day) => day.completed > best.completed ? day : best, weeklyData[0]);

  // Calculate success rate
  const totalTasksCompleted = stats?.tasks_completed || 0;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get active goals for progress display
  const activeGoals = goals.filter(g => g.status !== 'completed').slice(0, 3);

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
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analytics Dashboard 📊</h1>
            <p className="text-muted-foreground">Deep insights into your goal-crushing performance</p>
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
              <p className="text-2xl sm:text-3xl font-bold mb-1">{totalTasksCompleted}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Tasks Completed</p>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Target className="w-5 sm:w-6 h-5 sm:h-6 text-success" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{successRate}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
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
            {/* Weekly Performance */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Weekly Performance</h3>
              <div className="flex items-end justify-between h-36 sm:h-48 gap-1 sm:gap-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                    <div className="w-full bg-white/10 rounded-lg relative overflow-hidden" style={{ height: "120px" }}>
                      <div 
                        className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                        style={{ 
                          height: `${day.completed}%`,
                          background: day.completed >= 80 
                            ? "linear-gradient(to top, hsl(var(--success)), hsl(var(--success)/0.5))"
                            : day.completed >= 60
                            ? "linear-gradient(to top, hsl(var(--warning)), hsl(var(--warning)/0.5))"
                            : day.completed > 0
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
                Best day: <span className="text-success font-medium">{bestDay.day} ({bestDay.completed}%)</span>
              </p>
            </div>

            {/* Goal Progress */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Goal Progress</h3>
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
