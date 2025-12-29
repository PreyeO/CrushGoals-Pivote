import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { GoalCard } from "@/components/GoalCard";
import { TaskItem } from "@/components/TaskItem";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { AddTaskModal, TaskData } from "@/components/AddTaskModal";
import { WeeklySummary } from "@/components/WeeklySummary";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ProductTour } from "@/components/ProductTour";
import { TrialExpiryModal } from "@/components/TrialExpiryModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Zap, Trophy, Plus, ChevronRight, Flame, Calendar, ListTodo, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useStreakNotifications } from "@/hooks/useStreakNotifications";
import { useInviteHandler } from "@/hooks/useInviteHandler";
import { useTrialNotifications } from "@/hooks/useTrialNotifications";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ProgressRing";

const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Small steps every day lead to big changes.", author: "Unknown" },
  { quote: "Progress, not perfection.", author: "Julia Cameron" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, stats } = useAuth();
  const { goals, isLoading: goalsLoading, addGoal, refreshGoals, firstGoalCelebration, clearFirstGoalCelebration } = useGoals();
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, celebrationTrigger, clearCelebration } = useTasks(today);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [weeklySummaryOpen, setWeeklySummaryOpen] = useState(false);
  const [weekData, setWeekData] = useState<{ date: string; day: string; completed: number; total: number }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users with no goals (check localStorage to not show again)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('crushgoals_onboarding_completed');
    if (!goalsLoading && goals.length === 0 && profile && !hasSeenTour) {
      // Small delay to ensure dashboard is fully rendered
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [goalsLoading, goals.length, profile]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('crushgoals_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Listen for the custom event to open the add goal modal
  useEffect(() => {
    const handleOpenAddGoalModal = () => {
      setAddGoalOpen(true);
    };
    window.addEventListener('openAddGoalModal', handleOpenAddGoalModal);
    return () => {
      window.removeEventListener('openAddGoalModal', handleOpenAddGoalModal);
    };
  }, []);
  
  useStreakNotifications();
  const { processedInvites } = useInviteHandler();
  const { showExpiryModal, acknowledgeExpiry, getTrialMessage } = useTrialNotifications();
  
  useEffect(() => {
    if (processedInvites) {
      refreshGoals();
    }
  }, [processedInvites, refreshGoals]);

  useEffect(() => {
    const fetchWeekData = async () => {
      if (!profile) return;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDates: { date: string; day: string; completed: number; total: number }[] = [];
      
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + mondayOffset + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayIndex = date.getDay();
        weekDates.push({
          date: dateStr,
          day: days[dayIndex],
          completed: 0,
          total: 0,
        });
      }

      try {
        const startDate = weekDates[0].date;
        const endDate = weekDates[6].date;

        const { data: weekTasks } = await supabase
          .from('tasks')
          .select('due_date, completed')
          .eq('user_id', profile.user_id)
          .gte('due_date', startDate)
          .lte('due_date', endDate);

        if (weekTasks) {
          weekTasks.forEach(task => {
            const dayData = weekDates.find(d => d.date === task.due_date);
            if (dayData) {
              dayData.total++;
              if (task.completed) dayData.completed++;
            }
          });
        }
      } catch (error) {
        logError('Error fetching week data:', error);
      }

      setWeekData(weekDates);
    };

    fetchWeekData();
  }, [profile, tasks]);

  const randomQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, []);
  
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
    deadline: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  }) => {
    await addGoal({
      name: goalData.name,
      emoji: goalData.emoji,
      category: goalData.category,
      target_value: goalData.target,
      start_date: goalData.startDate,
      deadline: goalData.deadline,
      task_frequency: goalData.frequency as 'daily' | 'weekly' | 'monthly',
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

  const currentXP = stats?.total_xp || 0;
  const currentLevel = stats?.level || 1;
  const xpForNextLevel = currentLevel * 1000;
  const xpProgress = currentXP % 1000;
  const xpToNext = xpForNextLevel - xpProgress;
  const activeGoals = goals.filter(g => g.status !== 'completed');

  const isLoading = goalsLoading || tasksLoading;

  // Show loading skeleton for the entire dashboard
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="space-y-6 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </div>
            
            {/* Quote skeleton */}
            <Skeleton className="h-12 rounded-xl" />
            
            {/* Tasks skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Get display name - prefer username, fallback to first name
  const displayName = profile?.username || profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {totalTasks > 0 ? (
                  <>You have <span className="text-primary font-semibold">{totalTasks - completedTasks} task{totalTasks - completedTasks !== 1 ? 's' : ''}</span> to crush today. Let's go!</>
                ) : (
                  "No tasks scheduled for today"
                )}
              </p>
            </div>
            <Button 
              variant="hero" 
              size="sm"
              className="w-full sm:w-auto" 
              onClick={() => setAddGoalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Goal
            </Button>
          </div>
        </header>

        {/* Main Stats - Today's Tasks + Active Goals in Flex */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 animate-slide-up opacity-0" style={{ animationDelay: '50ms' }}>
          {/* Today's Tasks Card */}
          <Card variant="glass" className="p-4 hover-scale">
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={progressPercent}
                size={64}
                strokeWidth={5}
                variant={progressPercent >= 70 ? "success" : progressPercent >= 40 ? "default" : "warning"}
              >
                <span className="text-sm font-bold">{progressPercent}%</span>
              </ProgressRing>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ListTodo className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Today's Tasks</h3>
                </div>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{completedTasks}</span>
                  <span className="text-muted-foreground text-lg"> / {totalTasks}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalTasks - completedTasks > 0 
                    ? `${totalTasks - completedTasks} remaining` 
                    : totalTasks > 0 ? "All done! 🎉" : "No tasks scheduled"}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <Card variant="glass" className="p-3 hover-scale">
              <div className="text-center">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2",
                  (stats?.current_streak || 0) > 0 
                    ? "bg-gradient-to-br from-orange-500 to-red-500" 
                    : "bg-muted"
                )}>
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold">{stats?.current_streak || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Day Streak</p>
              </div>
            </Card>

            {/* Goals */}
            <Card variant="glass" className="p-3 hover-scale">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold">{activeGoals.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Active Goals</p>
              </div>
            </Card>

            {/* Level */}
            <Card variant="glass" className="p-3 hover-scale">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold">{currentLevel}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Level</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Quote Card - Compact */}
        <Card variant="glass" className="p-3 mb-6 animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-foreground-secondary italic">"{randomQuote.quote}" <span className="text-muted-foreground">— {randomQuote.author}</span></p>
        </Card>

        {/* Today's Tasks */}
        <section className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Today's Tasks</h2>
            <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => navigate('/tasks')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <Card variant="glass" className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            </Card>
          ) : tasks.length === 0 ? (
            <Card variant="glass" className="p-6 text-center">
              <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
              <Button variant="outline" size="sm" onClick={() => setAddGoalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add a goal
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task, index) => (
                <div
                  key={task.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <TaskItem
                    id={task.id}
                    title={task.title}
                    goalName={task.goal?.name || 'General'}
                    goalEmoji={task.goal?.emoji || ''}
                    timeEstimate={task.time_estimate || undefined}
                    priority={task.priority}
                    completed={task.completed}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* This Week - Task Completion Summary */}
        <section className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                This Week
              </h2>
              <p className="text-xs text-muted-foreground">Daily task completion</p>
            </div>
          </div>
          <Card variant="glass" className="p-3">
            <div className="grid grid-cols-7 gap-1.5">
              {weekData.map((day, i) => {
                const isToday = day.date === today;
                const percent = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                return (
                  <div key={i} className="text-center">
                    <p className={cn(
                      "text-[10px] mb-1",
                      isToday ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>{day.day}</p>
                    <div className={cn(
                      "h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors",
                      day.total === 0 ? "bg-muted/50 text-muted-foreground" :
                      percent === 100 ? "bg-success/20 text-success" :
                      percent > 0 ? "bg-primary/20 text-primary" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {day.total > 0 ? `${day.completed}/${day.total}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Goals Overview - Show only 4 */}
        <section className="animate-slide-up opacity-0" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Active Goals</h2>
            {activeGoals.length > 4 && (
              <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => navigate('/goals')}>
                View All ({activeGoals.length})
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {goalsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="glass" className="p-4 animate-pulse">
                  <div className="h-8 bg-white/10 rounded mb-3" />
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <Card variant="glass" className="p-6 text-center">
              <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No active goals</p>
              <Button variant="hero" size="sm" onClick={() => setAddGoalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Goal
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activeGoals.slice(0, 4).map((goal, index) => (
                <div
                  key={goal.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <GoalCard
                    id={goal.id}
                    emoji={goal.emoji}
                    name={goal.name}
                    progress={goal.progress}
                    currentValue={goal.current_value}
                    targetValue={goal.target_value || 'Complete'}
                    timeRemaining={goal.deadline ? `${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short' })}` : ''}
                    status={goal.status}
                    tasksToday={{ completed: 0, total: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Achievements Preview - Compact Cards */}
        {stats && stats.tasks_completed > 0 && (
          <section className="mt-6 animate-slide-up opacity-0" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-premium" />
                Achievements
              </h2>
              <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => navigate('/achievements')}>
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {goals.length >= 1 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="text-xs font-medium">First Goal</p>
                </Card>
              )}
              {stats.tasks_completed >= 1 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">👣</div>
                  <p className="text-xs font-medium">First Step</p>
                </Card>
              )}
              {(stats.current_streak || 0) >= 3 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">🔥</div>
                  <p className="text-xs font-medium">On Fire</p>
                </Card>
              )}
              {activeGoals.length >= 3 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">🎪</div>
                  <p className="text-xs font-medium">Multi-Tasker</p>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Modals */}
        <WeeklySummary
          open={weeklySummaryOpen}
          onOpenChange={setWeeklySummaryOpen}
        />

        <AddGoalModal
          open={addGoalOpen}
          onOpenChange={setAddGoalOpen}
          onSuccess={handleAddGoal}
        />

        <AddTaskModal
          open={addTaskOpen}
          onOpenChange={setAddTaskOpen}
          onSuccess={handleAddTask}
        />

        {/* Celebrations */}
        <ConfettiCelebration
          trigger={celebrationTrigger === 'perfectDay' || showMilestoneCelebration}
          onComplete={clearCelebration}
          type={
            celebrationTrigger === 'perfectDay'
              ? "perfectDay"
              : stats?.current_streak === 30
              ? "milestone"
              : "default"
          }
        />

        {/* First Goal Celebration */}
        <ConfettiCelebration
          trigger={firstGoalCelebration}
          onComplete={clearFirstGoalCelebration}
          type="firstGoal"
        />


        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Onboarding Tour */}
        <ProductTour
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
        />

        {/* Trial Expiry Modal */}
        <TrialExpiryModal
          open={showExpiryModal}
          onAcknowledge={acknowledgeExpiry}
        />
      </main>
    </div>
  );
}