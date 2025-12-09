import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { GoalCard } from "@/components/GoalCard";
import { TaskItem } from "@/components/TaskItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { Target, Zap, Trophy, Plus, Sparkles, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data
const initialGoals = [
  {
    id: "1",
    emoji: "💪",
    name: "Lose 20kg by June",
    progress: 34,
    currentValue: "6.8kg lost",
    targetValue: "20kg",
    timeRemaining: "18 weeks",
    status: "on-track" as const,
    tasksToday: { completed: 3, total: 5 },
  },
  {
    id: "2",
    emoji: "📚",
    name: "Read 24 Books",
    progress: 42,
    currentValue: "10 books",
    targetValue: "24 books",
    timeRemaining: "48 weeks",
    status: "ahead" as const,
    tasksToday: { completed: 1, total: 2 },
  },
  {
    id: "3",
    emoji: "💰",
    name: "Save $10,000",
    progress: 28,
    currentValue: "$2,800",
    targetValue: "$10,000",
    timeRemaining: "24 weeks",
    status: "behind" as const,
    tasksToday: { completed: 1, total: 3 },
  },
];

const todaysTasks = [
  {
    id: "t1",
    title: "Drink 3L water",
    goalName: "Fitness",
    goalEmoji: "💪",
    timeEstimate: "All day",
    priority: "medium" as const,
    completed: false,
  },
  {
    id: "t2",
    title: "30min cardio workout",
    goalName: "Fitness",
    goalEmoji: "💪",
    timeEstimate: "30 min",
    priority: "high" as const,
    completed: true,
  },
  {
    id: "t3",
    title: "Read 30 pages",
    goalName: "Reading",
    goalEmoji: "📚",
    timeEstimate: "45 min",
    priority: "medium" as const,
    completed: false,
  },
  {
    id: "t4",
    title: "Transfer to savings",
    goalName: "Savings",
    goalEmoji: "💰",
    timeEstimate: "5 min",
    priority: "high" as const,
    completed: false,
  },
  {
    id: "t5",
    title: "Log all meals",
    goalName: "Fitness",
    goalEmoji: "💪",
    timeEstimate: "5 min",
    priority: "low" as const,
    completed: false,
  },
];

const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Small steps every day lead to big changes.", author: "Unknown" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(todaysTasks);
  const [goals, setGoals] = useState(initialGoals);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const { toast } = useToast();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: true } : task))
    );
  };

  const handleAddGoal = (goalData: { category: string; emoji: string; name: string; target: string; deadline: string }) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      emoji: goalData.emoji,
      name: goalData.name,
      progress: 0,
      currentValue: "0",
      targetValue: goalData.target || "Complete",
      timeRemaining: goalData.deadline ? `Until ${new Date(goalData.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : "No deadline",
      status: "on-track" as const,
      tasksToday: { completed: 0, total: 3 },
    };
    setGoals((prev) => [...prev, newGoal]);
    toast({
      title: "🎯 Goal Created!",
      description: `"${goalData.name}" has been added to your goals.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 animate-slide-up">
                {getGreeting()}, Champion! ☀️
              </h1>
              <p className="text-muted-foreground animate-slide-up opacity-0" style={{ animationDelay: "50ms" }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button variant="hero" className="animate-fade-in w-full sm:w-auto" onClick={() => setAddGoalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Motivational Quote */}
          <Card variant="glass" className="mt-6 p-4 animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-premium flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground-secondary italic">"{randomQuote.quote}"</p>
                <p className="text-sm text-muted-foreground mt-1">— {randomQuote.author}</p>
              </div>
            </div>
          </Card>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <StatCard
            title="Today's Progress"
            value={`${completedTasks}/${totalTasks} tasks`}
            subtitle="Keep going! 💪"
            variant="progress"
            progress={progressPercent}
            delay={0}
          />
          <StatCard
            title="Current Streak"
            value="23 days"
            subtitle="Longest: 31 days"
            variant="streak"
            delay={100}
          />
          <StatCard
            icon={Target}
            title="Active Goals"
            value={goals.length.toString()}
            subtitle="All on track"
            delay={200}
          />
          <StatCard
            icon={Zap}
            title="Level & XP"
            value="Level 7"
            subtitle="660 XP to Level 8"
            trend={{ value: "+240 XP this week", positive: true }}
            delay={300}
          />
        </section>

        {/* Today's Tasks */}
        <section className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Today's Mission 🎯
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete all tasks for a Perfect Day bonus! (+100 XP)
              </p>
            </div>
            <Button variant="ghost" className="text-primary hidden sm:flex">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 5).map((task, index) => (
              <div
                key={task.id}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskItem
                  {...task}
                  onComplete={handleTaskComplete}
                />
              </div>
            ))}
          </div>

          {/* Quick Add */}
          <Button variant="glass" className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add custom task for today
          </Button>
        </section>

        {/* Goals Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              Your Active Goals 🎯
            </h2>
            <Button variant="ghost" className="text-primary hidden sm:flex">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, index) => (
              <div
                key={goal.id}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GoalCard {...goal} />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Achievements */}
        <section className="mt-6 lg:mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-premium" />
              Recent Achievements
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {["Week Warrior", "Early Bird", "Consistency King"].map((badge, index) => (
              <Card
                key={badge}
                variant="glass"
                className="p-4 min-w-[160px] sm:min-w-[200px] flex-shrink-0 text-center animate-slide-up opacity-0 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                <p className="font-semibold mb-1 text-sm sm:text-base">{badge}</p>
                <p className="text-xs text-muted-foreground">Earned 2 days ago</p>
              </Card>
            ))}
          </div>
        </section>

        {/* This Week at a Glance */}
        <section className="mt-6 lg:mt-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">This Week at a Glance 📅</h2>
          <Card variant="glass" className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const isToday = index === new Date().getDay() - 1;
                const isPast = index < new Date().getDay() - 1;
                const status = isPast
                  ? Math.random() > 0.2
                    ? "complete"
                    : "partial"
                  : isToday
                  ? "current"
                  : "future";

                return (
                  <div
                    key={day}
                    className={`flex-1 text-center p-2 sm:p-3 rounded-xl transition-all ${
                      isToday
                        ? "bg-primary/20 border border-primary/50"
                        : status === "complete"
                        ? "bg-success/20"
                        : status === "partial"
                        ? "bg-warning/20"
                        : "bg-white/5"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{day}</p>
                    <div className="text-sm sm:text-lg">
                      {status === "complete" && "✓"}
                      {status === "partial" && "7/10"}
                      {status === "current" && `${completedTasks}/${totalTasks}`}
                      {status === "future" && "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-success font-medium">5/7</span> perfect days — 71% success rate
              </p>
            </div>
          </Card>
        </section>
      </main>

      {/* Add Goal Modal */}
      <AddGoalModal 
        open={addGoalOpen} 
        onOpenChange={setAddGoalOpen} 
        onSuccess={handleAddGoal}
      />
    </div>
  );
}
