import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { GoalCard } from "@/components/GoalCard";
import { TaskItem } from "@/components/TaskItem";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { AddTaskModal, TaskData } from "@/components/AddTaskModal";

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ProductTour } from "@/components/ProductTour";
import { TrialExpiryModal } from "@/components/TrialExpiryModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Trophy, Plus, ChevronRight, Flame, ListTodo, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useStreakNotifications } from "@/hooks/useStreakNotifications";
import { useInviteHandler } from "@/hooks/useInviteHandler";
import { useTrialNotifications } from "@/hooks/useTrialNotifications";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialBanner } from "@/components/TrialBanner";
import { TrialExpiredOverlay } from "@/components/TrialExpiredOverlay";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getDisplayStatus } from "@/lib/goalUtils";
import { ProgressRing } from "@/components/ProgressRing";
import { useMainLayout } from "@/hooks/useMainLayout";
import { supabase } from "@/integrations/supabase/client";

const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Small steps every day lead to big changes.", author: "Unknown" },
  { quote: "Progress, not perfection.", author: "Julia Cameron" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, stats, user } = useAuth();
  const { mainPaddingClass } = useMainLayout();
  const { goals, isLoading: goalsLoading, addGoal, refreshGoals, firstGoalCelebration, clearFirstGoalCelebration } = useGoals();
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, celebrationTrigger, clearCelebration } = useTasks(today);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [goalTaskCounts, setGoalTaskCounts] = useState<{ [goalId: string]: { totalCompleted: number; totalCount: number } }>({});

  // Fetch task counts for active goals
  useEffect(() => {
    const fetchTaskCounts = async () => {
      if (!user || goals.length === 0) return;

      const activeGoalIds = goals.filter(g => g.status !== 'completed').map(g => g.id);
      if (activeGoalIds.length === 0) return;

      try {
        const { data: allTasks, error } = await supabase
          .from('tasks')
          .select('id, goal_id, completed')
          .eq('user_id', user.id)
          .in('goal_id', activeGoalIds);

        if (error) throw error;

        const counts: { [goalId: string]: { totalCompleted: number; totalCount: number } } = {};
        for (const goalId of activeGoalIds) {
          const goalTasks = allTasks?.filter(t => t.goal_id === goalId) || [];
          counts[goalId] = {
            totalCompleted: goalTasks.filter(t => t.completed).length,
            totalCount: goalTasks.length,
          };
        }
        setGoalTaskCounts(counts);
      } catch (error) {
        console.error('Error fetching task counts:', error);
      }
    };

    fetchTaskCounts();
  }, [user, goals]);

  // Show onboarding for new users with no goals (check localStorage to not show again)
  useEffect(() => {
    // Wait for user and goals to load
    if (!user || goalsLoading) return;
    
    try {
      const hasSeenTour = localStorage.getItem('crushgoals_onboarding_completed');
      // Show tour if: goals are loaded, user has no goals, and hasn't seen the tour
      if (goals.length === 0 && !hasSeenTour) {
        // Small delay to ensure dashboard is fully rendered
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // localStorage might not be available in some contexts
      console.warn('localStorage not available:', e);
    }
  }, [user, goalsLoading, goals.length]);

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
  const { showExpiryModal, acknowledgeExpiry } = useTrialNotifications();
  const { canPerformActions, isTrialExpired } = useTrialStatus();
  const [showTrialExpiredOverlay, setShowTrialExpiredOverlay] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  useEffect(() => {
    if (processedInvites) {
      refreshGoals();
    }
  }, [processedInvites, refreshGoals]);
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

  const activeGoals = goals.filter(g => g.status !== 'completed');

  const isLoading = goalsLoading || tasksLoading;

  // Show loading skeleton for the entire dashboard
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 lg:pr-8 pt-16 lg:pt-8 transition-all duration-300", mainPaddingClass)}>
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
  const displayName = profile?.username || profile?.full_name?.split(' ')[0] || 'Champion';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 lg:pr-8 pt-16 lg:pt-8 transition-all duration-300", mainPaddingClass)}>
        {/* Trial Banner */}
        <TrialBanner onUpgradeClick={() => navigate('/settings?section=subscription')} />

        {/* Header with Greeting and Motivation */}
        <header className="mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-sm text-muted-foreground italic mt-1">
                "{randomQuote.quote}" <span className="text-muted-foreground">— {randomQuote.author}</span>
              </p>
            </div>
            <Button 
              variant="hero" 
              size="sm"
              className="w-full sm:w-auto" 
              onClick={() => {
                if (!canPerformActions) {
                  setShowTrialExpiredOverlay(true);
                } else {
                  setAddGoalOpen(true);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Goal
            </Button>
          </div>
        </header>

        {/* 4 Stat Cards Grid - 2 columns on mobile, 4 on sm+ */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 animate-slide-up opacity-0" style={{ animationDelay: '50ms' }}>
          {/* Today's Tasks */}
          <Card variant="glass" className="p-2 sm:p-4 hover-scale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative flex flex-col items-center text-center gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <ListTodo className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">
                  <span className="text-primary">{completedTasks}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">/{totalTasks}</span>
                </p>
                <p className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wide">Tasks</p>
              </div>
            </div>
          </Card>

          {/* Day Streak */}
          <Card variant="glass" className="p-2 sm:p-4 hover-scale relative overflow-hidden">
            <div className={cn(
              "absolute inset-0",
              (stats?.current_streak || 0) > 0 
                ? "bg-gradient-to-br from-orange-500/10 to-red-500/5" 
                : "bg-gradient-to-br from-muted/20 to-transparent"
            )} />
            <div className="relative flex flex-col items-center text-center gap-1 sm:gap-2">
              <div className={cn(
                "w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center",
                (stats?.current_streak || 0) > 0 
                  ? "bg-gradient-to-br from-orange-500 to-red-500" 
                  : "bg-muted"
              )}>
                <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{stats?.current_streak || 0}</p>
                <p className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wide">Streak</p>
              </div>
            </div>
          </Card>

          {/* Active Goals */}
          <Card variant="glass" className="p-2 sm:p-4 hover-scale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5" />
            <div className="relative flex flex-col items-center text-center gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wide">Goals</p>
              </div>
            </div>
          </Card>

          {/* Completed All Time */}
          <Card variant="glass" className="p-2 sm:p-4 hover-scale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5" />
            <div className="relative flex flex-col items-center text-center gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{stats?.tasks_completed || 0}</p>
                <p className="text-[8px] sm:text-xs text-muted-foreground uppercase tracking-wide">Done</p>
              </div>
            </div>
          </Card>
        </section>

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
              {tasks.slice(0, 5).map((task, index) => {
                const goalData = goals.find(g => g.id === task.goal?.id);
                return (
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
                      goalAction={goalData?.target_value || undefined}
                      timeEstimate={task.time_estimate || undefined}
                      priority={task.priority}
                      completed={task.completed}
                      status={task.completed ? 'completed' : 'pending'}
                      onComplete={() => handleTaskComplete(task.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Goals Overview - Show only 4 */}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    status={getDisplayStatus(goal)}
                    tasksToday={{ completed: 0, total: 0 }}
                    totalTasksCompleted={goalTaskCounts[goal.id]?.totalCompleted}
                    totalTasksCount={goalTaskCounts[goal.id]?.totalCount}
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
          trigger={celebrationTrigger === 'perfectDay' || celebrationTrigger === 'goalComplete' || showMilestoneCelebration}
          onComplete={clearCelebration}
          type={
            celebrationTrigger === 'perfectDay'
              ? "perfectDay"
              : celebrationTrigger === 'goalComplete'
              ? "goalComplete"
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