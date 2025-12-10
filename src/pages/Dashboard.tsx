import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { GoalCard } from "@/components/GoalCard";
import { TaskItem } from "@/components/TaskItem";
import { StreakCounter } from "@/components/StreakCounter";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { AddTaskModal, TaskData } from "@/components/AddTaskModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { Target, Zap, Trophy, Plus, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";

const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Small steps every day lead to big changes.", author: "Unknown" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, stats } = useAuth();
  const { goals, isLoading: goalsLoading, addGoal } = useGoals();
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, celebrationTrigger, clearCelebration } = useTasks(today);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  // Determine if we should show milestone celebration
  const showMilestoneCelebration = stats?.current_streak === 7 || stats?.current_streak === 30;

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleTaskComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      toggleTask(id, !task.completed);
    }
  };

  const handleAddGoal = async (goalData: { 
    category: string; 
    emoji: string; 
    name: string; 
    target: string; 
    startDate: string;
    deadline: string 
  }) => {
    await addGoal({
      name: goalData.name,
      emoji: goalData.emoji,
      category: goalData.category,
      target_value: goalData.target,
      start_date: goalData.startDate,
      deadline: goalData.deadline,
    });
  };

  const handleAddTask = async (taskData: TaskData) => {
    await addTask({
      title: taskData.title,
      goal_id: taskData.goal_id,
      due_date: taskData.due_date || today,
      priority: taskData.priority as 'high' | 'medium' | 'low',
      time_estimate: taskData.time_estimate,
    });
  };

  // Calculate level progress
  const currentXP = stats?.total_xp || 0;
  const currentLevel = stats?.level || 1;
  const xpForNextLevel = currentLevel * 1000; // Simple formula: level * 1000 XP needed
  const xpProgress = currentXP % 1000;
  const xpToNext = xpForNextLevel - xpProgress;

  const isLoading = goalsLoading || tasksLoading;

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
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Champion'}! ☀️
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
            subtitle={totalTasks === 0 ? "No tasks yet" : "Keep going! 💪"}
            variant="progress"
            progress={progressPercent}
            delay={0}
          />
          
          {/* Enhanced Streak Counter */}
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
            <StreakCounter 
              streak={stats?.current_streak || 0} 
              longestStreak={stats?.longest_streak || 0}
            />
          </div>
          
          <StatCard
            icon={Target}
            title="Active Goals"
            value={goals.filter(g => g.status !== 'completed').length.toString()}
            subtitle={goals.length > 0 ? "Keep crushing it!" : "Add your first goal"}
            delay={200}
          />
          <StatCard
            icon={Zap}
            title="Level & XP"
            value={`Level ${currentLevel}`}
            subtitle={`${xpToNext} XP to Level ${currentLevel + 1}`}
            trend={{ value: `${currentXP} XP total`, positive: true }}
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
            <Button variant="ghost" className="text-primary hidden sm:flex" onClick={() => navigate('/tasks')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <Card variant="glass" className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading your tasks...</p>
            </Card>
          ) : tasks.length === 0 ? (
            <Card variant="glass" className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No tasks for today yet</p>
              <Button variant="outline" onClick={() => setAddGoalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add a goal to get started
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task, index) => (
                <div
                  key={task.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TaskItem
                    id={task.id}
                    title={task.title}
                    goalName={task.goal?.name || 'General'}
                    goalEmoji={task.goal?.emoji || '📌'}
                    timeEstimate={task.time_estimate || undefined}
                    priority={task.priority}
                    completed={task.completed}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quick Add */}
          <Button variant="glass" className="w-full mt-4" onClick={() => setAddTaskOpen(true)}>
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
            <Button variant="ghost" className="text-primary hidden sm:flex" onClick={() => navigate('/goals')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {goalsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="glass" className="p-6 animate-pulse">
                  <div className="h-12 bg-white/10 rounded mb-4" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <Card variant="glass" className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No goals yet. Let's crush some!</p>
              <Button variant="hero" onClick={() => setAddGoalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.filter(g => g.status !== 'completed').slice(0, 6).map((goal, index) => (
                <div
                  key={goal.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <GoalCard
                    id={goal.id}
                    emoji={goal.emoji}
                    name={goal.name}
                    progress={goal.progress}
                    currentValue={goal.current_value}
                    targetValue={goal.target_value || 'Complete'}
                    timeRemaining={goal.deadline ? `Until ${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'No deadline'}
                    status={goal.status}
                    tasksToday={{ completed: 0, total: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
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
            {stats && stats.tasks_completed > 0 ? (
              <>
                {stats.tasks_completed >= 1 && (
                  <Card
                    variant="glass"
                    className="p-4 min-w-[160px] sm:min-w-[200px] flex-shrink-0 text-center animate-slide-up opacity-0 hover-lift"
                  >
                    <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                    <p className="font-semibold mb-1 text-sm sm:text-base">First Task</p>
                    <p className="text-xs text-muted-foreground">Completed your first task</p>
                  </Card>
                )}
                {stats.current_streak >= 3 && (
                  <Card
                    variant="glass"
                    className="p-4 min-w-[160px] sm:min-w-[200px] flex-shrink-0 text-center animate-slide-up opacity-0 hover-lift"
                    style={{ animationDelay: '100ms' }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">🔥</div>
                    <p className="font-semibold mb-1 text-sm sm:text-base">On Fire</p>
                    <p className="text-xs text-muted-foreground">3 day streak</p>
                  </Card>
                )}
                {stats.tasks_completed >= 10 && (
                  <Card
                    variant="glass"
                    className="p-4 min-w-[160px] sm:min-w-[200px] flex-shrink-0 text-center animate-slide-up opacity-0 hover-lift"
                    style={{ animationDelay: '200ms' }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">💪</div>
                    <p className="font-semibold mb-1 text-sm sm:text-base">Task Master</p>
                    <p className="text-xs text-muted-foreground">10 tasks completed</p>
                  </Card>
                )}
              </>
            ) : (
              <Card variant="glass" className="p-6 w-full text-center">
                <p className="text-muted-foreground">Complete tasks to earn achievements!</p>
              </Card>
            )}
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

                return (
                  <div
                    key={day}
                    className={`flex-1 text-center p-2 sm:p-3 rounded-xl transition-all ${
                      isToday
                        ? "bg-primary/20 border border-primary/50"
                        : isPast
                        ? "bg-success/20"
                        : "bg-white/5"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{day}</p>
                    <div className="text-sm sm:text-lg">
                      {isToday ? `${completedTasks}/${totalTasks}` : isPast ? "✓" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-success font-medium">{stats?.perfect_days || 0}</span> perfect days this week
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

      {/* Add Task Modal */}
      <AddTaskModal
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onSuccess={handleAddTask}
      />
      
      {/* Confetti Celebration */}
      <ConfettiCelebration 
        trigger={celebrationTrigger === 'perfectDay'}
        type="perfectDay"
        particleCount={150}
        onComplete={clearCelebration}
      />
      <ConfettiCelebration 
        trigger={showMilestoneCelebration}
        type="milestone"
        particleCount={100}
      />
    </div>
  );
}
