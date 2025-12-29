import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { AddGoalModal } from "@/components/AddGoalModal";
import { AddTaskModal, TaskData } from "@/components/AddTaskModal";
import { EditGoalModal } from "@/components/EditGoalModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { GoalHabitCalendar } from "@/components/GoalHabitCalendar";
import { PauseGoalModal } from "@/components/PauseGoalModal";
import { WhyBehindModal } from "@/components/WhyBehindModal";
import { CreateSharedGoalModal } from "@/components/CreateSharedGoalModal";
import { SharedGoalModal } from "@/components/SharedGoalModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, TrendingUp, Calendar, Trophy, Loader2, Pause, Filter } from "lucide-react";
import { useGoals, Goal } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useSharedGoals } from "@/hooks/useSharedGoals";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type StatusFilter = 'all' | 'on-track' | 'ahead' | 'behind' | 'paused' | 'completed';
type CategoryFilter = 'all' | 'health' | 'finance' | 'career' | 'learning' | 'relationships' | 'personal' | 'fitness' | 'mindfulness' | 'content' | 'habits' | 'custom';

export default function Goals() {
  const { user } = useAuth();
  const { goals, isLoading, addGoal, updateGoal, deleteGoal, duplicateGoal, pauseGoal, resumeGoal } = useGoals();
  const { addTask } = useTasks();
  const { sharedGoals } = useSharedGoals();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addTaskGoal, setAddTaskGoal] = useState<Goal | null>(null);
  const [calendarGoal, setCalendarGoal] = useState<Goal | null>(null);
  const [pauseGoalTarget, setPauseGoalTarget] = useState<Goal | null>(null);
  const [whyBehindGoal, setWhyBehindGoal] = useState<Goal | null>(null);
  const [shareGoal, setShareGoal] = useState<Goal | null>(null);
  const [viewSharedGoal, setViewSharedGoal] = useState<{ id: string; name: string; isOwner: boolean } | null>(null);

  const handleAddGoal = async (goalData: { 
    category: string; 
    emoji: string; 
    name: string; 
    target: string; 
    startDate: string; 
    deadline: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  }) => {
    const result = await addGoal({
      name: goalData.name,
      emoji: goalData.emoji,
      category: goalData.category,
      target_value: goalData.target || undefined,
      start_date: goalData.startDate || undefined,
      deadline: goalData.deadline || undefined,
      task_frequency: goalData.frequency as 'daily' | 'weekly' | 'monthly',
    });
    
    if (result) {
      // Toast handled in useGoals
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteGoalId) return;
    setIsDeleting(true);
    try {
      await deleteGoal(deleteGoalId);
      setDeleteGoalId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTask = async (taskData: TaskData) => {
    const result = await addTask({
      title: taskData.title,
      goal_id: taskData.goal_id,
      due_date: taskData.due_date,
      priority: taskData.priority as 'high' | 'medium' | 'low',
      time_estimate: taskData.time_estimate,
    });
    
    if (result) {
      toast.success(`✅ Task added to "${addTaskGoal?.name}"`);
    }
  };

  const goalToDelete = goals.find(g => g.id === deleteGoalId);

  // Category options
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'health', label: '🍎 Health' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'career', label: '💼 Career' },
    { value: 'learning', label: '📚 Learning' },
    { value: 'relationships', label: '❤️ Relationships' },
    { value: 'mindfulness', label: '🧘 Mindfulness' },
    { value: 'content', label: '📱 Content' },
    { value: 'habits', label: '✨ Habits' },
    { value: 'personal', label: '🎯 Personal' },
    { value: 'custom', label: '⚡ Custom' },
  ];

  // Filtered goals based on status and category
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      // Category filter
      if (categoryFilter !== 'all' && goal.category !== categoryFilter) {
        return false;
      }
      
      // Status filter
      switch (statusFilter) {
        case 'on-track':
          return goal.status === 'on-track' && !goal.is_paused;
        case 'ahead':
          return goal.status === 'ahead' && !goal.is_paused;
        case 'behind':
          return goal.status === 'behind' && !goal.is_paused;
        case 'paused':
          return goal.is_paused;
        case 'completed':
          return goal.status === 'completed';
        default:
          return true;
      }
    });
  }, [goals, statusFilter, categoryFilter]);

  const activeGoals = filteredGoals.filter(g => g.status !== 'completed' && !g.is_paused);
  const pausedGoals = filteredGoals.filter(g => g.is_paused);
  const completedGoals = filteredGoals.filter(g => g.status === 'completed');
  
  // Stats based on all goals (not filtered)
  const allActiveGoals = goals.filter(g => g.status !== 'completed' && !g.is_paused);
  const avgProgress = allActiveGoals.length > 0 
    ? Math.round(allActiveGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / allActiveGoals.length)
    : 0;

  // Find next deadline
  const upcomingDeadlines = allActiveGoals
    .filter(g => g.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  const nextDeadline = upcomingDeadlines[0]?.deadline 
    ? new Date(upcomingDeadlines[0].deadline).toLocaleDateString('en-US', { month: 'short' })
    : 'None';

  // Calculate expected progress for "why behind" modal
  const calculateExpectedProgress = (goal: Goal) => {
    if (!goal.start_date || !goal.deadline) return goal.progress || 0;
    const start = new Date(goal.start_date).getTime();
    const end = new Date(goal.deadline).getTime();
    const now = Date.now();
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.round((elapsed / totalDuration) * 100));
  };

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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Goals 🎯</h1>
              <p className="text-muted-foreground">Track and manage all your goals in one place</p>
            </div>
            <Button variant="hero" className="gap-2 w-full sm:w-auto" onClick={() => setAddGoalOpen(true)}>
              <Plus className="w-5 h-5" />
              Add New Goal
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{allActiveGoals.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{avgProgress}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{nextDeadline}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Next Deadline</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {goals.length > 0 && (
            <div className="mb-6 lg:mb-8 space-y-4">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <TabsList className="bg-secondary/50 h-auto flex-wrap">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="on-track" className="text-xs sm:text-sm">✅ On Track</TabsTrigger>
                    <TabsTrigger value="ahead" className="text-xs sm:text-sm">🚀 Crushing It</TabsTrigger>
                    <TabsTrigger value="behind" className="text-xs sm:text-sm">⚠️ Behind</TabsTrigger>
                    <TabsTrigger value="paused" className="text-xs sm:text-sm">⏸️ Paused</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs sm:text-sm">🏆 Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat.value}
                    variant={categoryFilter === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat.value as CategoryFilter)}
                    className="text-xs"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
              
              {/* Active filter indicator */}
              {(statusFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <span>
                    Showing {filteredGoals.length} of {goals.length} goals
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}
                    className="text-primary h-auto p-1"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {goals.length === 0 && (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-6">Create your first goal and start crushing it!</p>
              <Button variant="hero" onClick={() => setAddGoalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          )}
          
          {/* No filtered results */}
          {goals.length > 0 && filteredGoals.length === 0 && (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No matching goals</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more goals.</p>
              <Button variant="outline" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Active Goals</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {activeGoals.map((goal) => {
                  // Check if this goal is already shared
                  const existingSharedGoal = sharedGoals.find(sg => sg.goal_id === goal.id);
                  
                  return (
                    <GoalCard 
                      key={goal.id} 
                      id={goal.id}
                      name={goal.name}
                      emoji={goal.emoji || '🎯'}
                      progress={goal.progress || 0}
                      currentValue={goal.current_value || '0'}
                      targetValue={goal.target_value || 'Complete'}
                      timeRemaining={goal.deadline 
                        ? `Until ${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                        : 'No deadline'
                      }
                      status={goal.status as 'on-track' | 'ahead' | 'behind' | 'completed'}
                      tasksToday={{ completed: 0, total: 0 }}
                      startDate={goal.start_date || undefined}
                      endDate={goal.deadline || undefined}
                      isPaused={goal.is_paused}
                      onEdit={() => setEditGoal(goal)}
                      onDelete={() => setDeleteGoalId(goal.id)}
                      onAddTask={() => setAddTaskGoal(goal)}
                      onViewCalendar={() => setCalendarGoal(goal)}
                      onDuplicate={() => duplicateGoal(goal.id)}
                      onPauseToggle={() => setPauseGoalTarget(goal)}
                      onWhyBehind={goal.status === 'behind' ? () => setWhyBehindGoal(goal) : undefined}
                      onShare={() => {
                        if (existingSharedGoal) {
                          setViewSharedGoal({
                            id: existingSharedGoal.id,
                            name: existingSharedGoal.name,
                            isOwner: existingSharedGoal.owner_id === user?.id
                          });
                        } else {
                          setShareGoal(goal);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Paused Goals */}
          {pausedGoals.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <Pause className="w-5 h-5 text-muted-foreground" />
                Paused Goals
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pausedGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    id={goal.id}
                    name={goal.name}
                    emoji={goal.emoji || '🎯'}
                    progress={goal.progress || 0}
                    currentValue={goal.current_value || '0'}
                    targetValue={goal.target_value || 'Complete'}
                    timeRemaining={goal.deadline 
                      ? `Until ${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'No deadline'
                    }
                    status={goal.status as 'on-track' | 'ahead' | 'behind' | 'completed'}
                    tasksToday={{ completed: 0, total: 0 }}
                    startDate={goal.start_date || undefined}
                    endDate={goal.deadline || undefined}
                    isPaused={goal.is_paused}
                    onEdit={() => setEditGoal(goal)}
                    onDelete={() => setDeleteGoalId(goal.id)}
                    onPauseToggle={() => setPauseGoalTarget(goal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Completed Goals 🏆</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="glass-card p-4 sm:p-6 rounded-2xl border-success/30">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl sm:text-3xl">{goal.emoji}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{goal.name}</h3>
                        <p className="text-sm text-success">
                          Completed {goal.completed_at 
                            ? new Date(goal.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'recently'
                          }
                        </p>
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
          )}
        </div>
      </main>

      <AddGoalModal 
        open={addGoalOpen} 
        onOpenChange={setAddGoalOpen}
        onSuccess={handleAddGoal}
      />

      <EditGoalModal
        open={!!editGoal}
        onOpenChange={(open) => !open && setEditGoal(null)}
        goal={editGoal}
        onSave={updateGoal}
      />

      <DeleteConfirmDialog
        open={!!deleteGoalId}
        onOpenChange={(open) => !open && setDeleteGoalId(null)}
        title="Delete Goal"
        description={`Are you sure you want to delete "${goalToDelete?.name}"? This will also delete all tasks linked to this goal. This action cannot be undone.`}
        onConfirm={handleDeleteGoal}
        isLoading={isDeleting}
      />

      <AddTaskModal
        open={!!addTaskGoal}
        onOpenChange={(open) => !open && setAddTaskGoal(null)}
        goalId={addTaskGoal?.id}
        goalName={addTaskGoal?.name}
        goalEmoji={addTaskGoal?.emoji || '🎯'}
        onSuccess={handleAddTask}
      />

      {/* Habit Calendar Modal */}
      <Dialog open={!!calendarGoal} onOpenChange={(open) => !open && setCalendarGoal(null)}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Habit Tracking</DialogTitle>
          </DialogHeader>
          {calendarGoal && (
            <GoalHabitCalendar
              goalId={calendarGoal.id}
              goalName={calendarGoal.name}
              goalEmoji={calendarGoal.emoji || '🎯'}
              startDate={calendarGoal.start_date || undefined}
              endDate={calendarGoal.deadline || undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Pause Goal Modal */}
      <PauseGoalModal
        open={!!pauseGoalTarget}
        onOpenChange={(open) => !open && setPauseGoalTarget(null)}
        isPaused={pauseGoalTarget?.is_paused || false}
        goalName={pauseGoalTarget?.name || ''}
        pauseReason={pauseGoalTarget?.pause_reason}
        pausedAt={pauseGoalTarget?.paused_at}
        onPause={(reason) => {
          if (pauseGoalTarget) {
            pauseGoal(pauseGoalTarget.id, reason);
            setPauseGoalTarget(null);
          }
        }}
        onResume={() => {
          if (pauseGoalTarget) {
            resumeGoal(pauseGoalTarget.id);
            setPauseGoalTarget(null);
          }
        }}
      />

      {/* Why Behind Modal */}
      <WhyBehindModal
        open={!!whyBehindGoal}
        onOpenChange={(open) => !open && setWhyBehindGoal(null)}
        goalName={whyBehindGoal?.name || ''}
        progress={whyBehindGoal?.progress || 0}
        expectedProgress={whyBehindGoal ? calculateExpectedProgress(whyBehindGoal) : 0}
        daysRemaining={whyBehindGoal?.deadline 
          ? Math.max(0, Math.ceil((new Date(whyBehindGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0
        }
        missedTasks={0}
        totalTasks={0}
        onPauseGoal={() => {
          setWhyBehindGoal(null);
          if (whyBehindGoal) setPauseGoalTarget(whyBehindGoal);
        }}
      />

      {/* Create Shared Goal Modal */}
      <CreateSharedGoalModal
        open={!!shareGoal}
        onOpenChange={(open) => !open && setShareGoal(null)}
        goal={shareGoal ? { id: shareGoal.id, name: shareGoal.name, emoji: shareGoal.emoji || '🎯' } : null}
        onSuccess={(sharedGoalId) => {
          setViewSharedGoal({
            id: sharedGoalId,
            name: shareGoal?.name || '',
            isOwner: true
          });
        }}
      />

      {/* View Shared Goal Modal */}
      {viewSharedGoal && (
        <SharedGoalModal
          open={!!viewSharedGoal}
          onOpenChange={(open) => !open && setViewSharedGoal(null)}
          sharedGoalId={viewSharedGoal.id}
          sharedGoalName={viewSharedGoal.name}
          isOwner={viewSharedGoal.isOwner}
        />
      )}
    </div>
  );
}
