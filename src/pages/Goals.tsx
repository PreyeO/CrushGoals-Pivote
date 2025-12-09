import { Sidebar } from "@/components/Sidebar";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp, Calendar, Trophy } from "lucide-react";

const mockGoals = [
  {
    id: "1",
    name: "Lose 20kg by June",
    emoji: "💪",
    progress: 34,
    currentValue: "6.8kg lost",
    targetValue: "20kg",
    timeRemaining: "18 weeks",
    status: "on-track" as const,
    tasksToday: { completed: 3, total: 5 },
  },
  {
    id: "2",
    name: "Read 24 Books",
    emoji: "📚",
    progress: 25,
    currentValue: "6 books",
    targetValue: "24 books",
    timeRemaining: "11 months",
    status: "on-track" as const,
    tasksToday: { completed: 2, total: 2 },
  },
  {
    id: "3",
    name: "Earn ₦500K Side Hustle",
    emoji: "💰",
    progress: 15,
    currentValue: "₦75,000",
    targetValue: "₦500,000",
    timeRemaining: "10 months",
    status: "behind" as const,
    tasksToday: { completed: 1, total: 4 },
  },
];

const completedGoals = [
  {
    id: "4",
    title: "Complete JavaScript Course",
    emoji: "🎓",
    progress: 100,
    completedDate: "Dec 15, 2025",
  },
];

export default function Goals() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Goals 🎯</h1>
              <p className="text-muted-foreground">Track and manage all your goals in one place</p>
            </div>
            <Button variant="hero" className="gap-2">
              <Plus className="w-5 h-5" />
              Add New Goal
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">25%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Jun</p>
                  <p className="text-sm text-muted-foreground">Next Deadline</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
            <div className="grid grid-cols-3 gap-6">
              {mockGoals.map((goal) => (
                <GoalCard key={goal.id} {...goal} />
              ))}
            </div>
          </div>

          {/* Completed Goals */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Goals 🏆</h2>
            <div className="grid grid-cols-3 gap-6">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="glass-card p-6 rounded-2xl border-success/30">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="text-sm text-success">Completed on {goal.completedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">100% Complete</span>
                    <Trophy className="w-5 h-5 text-premium" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
