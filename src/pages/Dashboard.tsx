import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { GoalCard } from "@/components/GoalCard";
import { TaskItem } from "@/components/TaskItem";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { AddTaskModal, TaskData } from "@/components/AddTaskModal";
import { WeeklySummary } from "@/components/WeeklySummary";
import { ProductTour } from "@/components/ProductTour";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { Target, Zap, Trophy, Plus, ChevronRight, Loader2, Flame, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useStreakNotifications } from "@/hooks/useStreakNotifications";
import { useInviteHandler } from "@/hooks/useInviteHandler";
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
  const { goals, isLoading: goalsLoading, addGoal, refreshGoals } = useGoals();
  const today = new Date().toISOString().split('T')[0];
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, celebrationTrigger, clearCelebration } = useTasks(today);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [weeklySummaryOpen, setWeeklySummaryOpen] = useState(false);
  const [weekData, setWeekData] = useState<{ date: string; day: string; completed: number; total: number }[]>([]);
  const [showProductTour, setShowProductTour] = useState(false);
  
  useStreakNotifications();
  const { processedInvites } = useInviteHandler();
  
  useEffect(() => {
    if (processedInvites) {
      refreshGoals();
    }
  }, [processedInvites, refreshGoals]);

  useEffect(() => {
    const checkProductTour = () => {
      const hasSeenProductTour = localStorage.getItem('hasSeenProductTour');
      const isNewUser = goals.length === 0 && stats?.tasks_completed === 0;
      
      if (!hasSeenProductTour && isNewUser && !goalsLoading) {
        setShowProductTour(true);
      }
    };
    
    checkProductTour();
  }, [goals, stats, goalsLoading]);

  // Listen for custom event from ProductTour to open Add Goal modal
  useEffect(() => {
    const handleOpenAddGoal = () => setAddGoalOpen(true);
    window.addEventListener('openAddGoalModal', handleOpenAddGoal);
    return () => window.removeEventListener('openAddGoalModal', handleOpenAddGoal);
  }, []);

  const handleProductTourComplete = () => {
    localStorage.setItem('hasSeenProductTour', 'true');
    setShowProductTour(false);
  };

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

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Champion'}
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
              data-tour="new-goal"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Goal
            </Button>
          </div>
        </header>

        {/* Quick Stats Grid - Compact Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-slide-up opacity-0" style={{ animationDelay: '50ms' }}>
          {/* Today's Progress */}
          <Card variant="glass" className="p-3 hover-scale">
            <div className="flex items-center gap-3">
              <ProgressRing
                progress={progressPercent}
                size={44}
                strokeWidth={4}
                variant={progressPercent >= 70 ? "success" : progressPercent >= 40 ? "default" : "warning"}
              >
                <span className="text-[10px] font-bold">{progressPercent}%</span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</p>
                <p className="text-base font-bold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </Card>

          {/* Streak */}
          <Card variant="glass" className="p-3 hover-scale">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center",
                (stats?.current_streak || 0) > 0 
                  ? "bg-gradient-to-br from-orange-500 to-red-500" 
                  : "bg-muted"
              )}>
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</p>
                <p className="text-base font-bold">{stats?.current_streak || 0} days</p>
              </div>
            </div>
          </Card>

          {/* Active Goals */}
          <Card variant="glass" className="p-3 hover-scale">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Goals</p>
                <p className="text-base font-bold">{activeGoals.length}</p>
              </div>
            </div>
          </Card>

          {/* Level */}
          <Card variant="glass" className="p-3 hover-scale">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Level</p>
                <p className="text-base font-bold">{currentLevel}</p>
              </div>
            </div>
          </Card>
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
        {localStorage.getItem('hasSeenProductTour') && stats && stats.tasks_completed > 0 && (
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
              {stats.tasks_completed >= 1 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="text-xs font-medium">First Task</p>
                </Card>
              )}
              {(stats.current_streak || 0) >= 3 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">🔥</div>
                  <p className="text-xs font-medium">On Fire</p>
                </Card>
              )}
              {stats.tasks_completed >= 10 && (
                <Card variant="glass" className="p-3 min-w-[120px] flex-shrink-0 text-center hover-scale">
                  <div className="text-2xl mb-1">💪</div>
                  <p className="text-xs font-medium">Task Master</p>
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

        {/* Product Tour */}
        <ProductTour 
          open={showProductTour} 
          onComplete={handleProductTourComplete} 
        />
      </main>
    </div>
  );
}