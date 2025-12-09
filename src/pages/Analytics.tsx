import { Sidebar } from "@/components/Sidebar";
import { ProgressRing } from "@/components/ProgressRing";
import { TrendingUp, TrendingDown, Flame, Target, CheckSquare, Trophy } from "lucide-react";

const weeklyData = [
  { day: "Mon", completed: 92, total: 100 },
  { day: "Tue", completed: 85, total: 100 },
  { day: "Wed", completed: 78, total: 100 },
  { day: "Thu", completed: 88, total: 100 },
  { day: "Fri", completed: 75, total: 100 },
  { day: "Sat", completed: 55, total: 100 },
  { day: "Sun", completed: 62, total: 100 },
];

const heatmapData = [
  [90, 85, 100, 75, 80, 60, 70],
  [95, 90, 85, 88, 75, 55, 60],
  [100, 88, 92, 80, 78, 50, 65],
  [85, 92, 88, 95, 82, 58, 72],
];

const insights = [
  { text: "You complete 85% of tasks on weekdays but only 40% on weekends. Try setting weekend reminders!", type: "tip" },
  { text: "Your best performance is in the morning. Schedule important tasks before noon.", type: "insight" },
  { text: "You're most consistent when you log tasks immediately. Keep that momentum!", type: "praise" },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard 📊</h1>
            <p className="text-muted-foreground">Deep insights into your goal-crushing performance</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <CheckSquare className="w-6 h-6 text-primary" />
                <span className="flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="w-4 h-4" /> +12%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">1,247</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-6 h-6 text-success" />
                <span className="flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="w-4 h-4" /> +5%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">78%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-premium text-sm">🔥 Record!</span>
              </div>
              <p className="text-3xl font-bold mb-1">23</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-6 h-6 text-premium" />
                <span className="text-muted-foreground text-sm">Level 7</span>
              </div>
              <p className="text-3xl font-bold mb-1">15,340</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Weekly Performance */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-6">Weekly Performance</h3>
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-white/10 rounded-lg relative overflow-hidden" style={{ height: "160px" }}>
                      <div 
                        className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                        style={{ 
                          height: `${day.completed}%`,
                          background: day.completed >= 80 
                            ? "linear-gradient(to top, hsl(var(--success)), hsl(var(--success)/0.5))"
                            : day.completed >= 60
                            ? "linear-gradient(to top, hsl(var(--warning)), hsl(var(--warning)/0.5))"
                            : "linear-gradient(to top, hsl(var(--danger)), hsl(var(--danger)/0.5))"
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Best day: <span className="text-success font-medium">Monday (92%)</span>
              </p>
            </div>

            {/* Goal Progress */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-6">Goal Progress</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <span>💪</span> Lose 20kg
                    </span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full" style={{ width: "34%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <span>📚</span> Read 24 Books
                    </span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" style={{ width: "25%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <span>💰</span> Earn ₦500K
                    </span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-warning to-orange-400 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <h3 className="text-lg font-semibold mb-6">Activity Heatmap</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-muted-foreground">Less</span>
              <div className="flex gap-1">
                {[20, 40, 60, 80, 100].map(level => (
                  <div 
                    key={level} 
                    className="w-4 h-4 rounded"
                    style={{ 
                      backgroundColor: `hsl(var(--success) / ${level / 100})` 
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">More</span>
            </div>
            <div className="space-y-1">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((day, dayIndex) => (
                    <div 
                      key={dayIndex}
                      className="w-8 h-8 rounded cursor-pointer hover:ring-2 hover:ring-white/30 transition-all"
                      style={{ 
                        backgroundColor: day === 100 
                          ? "hsl(var(--success))"
                          : `hsl(var(--success) / ${day / 100})` 
                      }}
                      title={`${day}% completion`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4">🤖 AI Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl bg-white/5 border-l-4"
                  style={{
                    borderColor: insight.type === "praise" 
                      ? "hsl(var(--success))" 
                      : insight.type === "tip"
                      ? "hsl(var(--warning))"
                      : "hsl(var(--primary))"
                  }}
                >
                  <p className="text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
