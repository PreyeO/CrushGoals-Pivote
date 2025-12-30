import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ALL_BADGES } from '@/hooks/useAchievements';
import { logError } from '@/lib/logger';
import { logTaskCompletionToSharedGoals } from '@/hooks/useSharedGoalActivities';
import { playSoundEffect } from '@/hooks/useSoundEffects';

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  time_estimate: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  due_date: string;
  created_at: string;
  completed_at: string | null;
  goal?: {
    id: string;
    name: string;
    emoji: string;
  };
}

export type CelebrationTrigger = 'perfectDay' | 'milestone' | 'goalComplete' | null;

export function useTasks(date?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [celebrationTrigger, setCelebrationTrigger] = useState<CelebrationTrigger>(null);

  const clearCelebration = () => setCelebrationTrigger(null);

  // Check and unlock achievements based on stats and time-based conditions
  const checkAndUnlockAchievements = async (
    userId: string, 
    stats: { current_streak?: number; tasks_completed?: number; perfect_days?: number; level?: number },
    options?: { isEarlyMorning?: boolean; isNightOwl?: boolean; isWeekend?: boolean; dailyTasksToday?: number }
  ) => {
    try {
      // Get existing achievements
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('badge_id')
        .eq('user_id', userId);

      const unlockedIds = new Set(existingAchievements?.map(a => a.badge_id) || []);

      // Get user's active goals count for multi_goal badge
      const { data: activeGoals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', userId)
        .neq('status', 'completed');

      const activeGoalsCount = activeGoals?.length || 0;

      // Get user's level
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('level')
        .eq('user_id', userId)
        .maybeSingle();

      const userLevel = userStats?.level || 1;

      // Check each badge
      for (const badge of ALL_BADGES) {
        if (unlockedIds.has(badge.id)) continue;

        let shouldUnlock = false;

        switch (badge.type) {
          case 'goal_created':
            // Check if user has at least the required number of goals
            const { data: goalsData } = await supabase
              .from('goals')
              .select('id')
              .eq('user_id', userId);
            shouldUnlock = (goalsData?.length || 0) >= badge.requirement;
            break;
          case 'streak':
            shouldUnlock = (stats.current_streak || 0) >= badge.requirement;
            break;
          case 'tasks':
            shouldUnlock = (stats.tasks_completed || 0) >= badge.requirement;
            break;
          case 'perfect_days':
            shouldUnlock = (stats.perfect_days || 0) >= badge.requirement;
            break;
          case 'level':
            shouldUnlock = userLevel >= badge.requirement;
            break;
          case 'early_morning':
            if (options?.isEarlyMorning) {
              shouldUnlock = badge.requirement === 1;
            }
            break;
          case 'night':
            shouldUnlock = options?.isNightOwl && badge.requirement === 1;
            break;
          case 'weekend':
            shouldUnlock = options?.isWeekend && badge.requirement <= 5;
            break;
          case 'daily_tasks':
            shouldUnlock = (options?.dailyTasksToday || 0) >= badge.requirement;
            break;
          case 'multi_goal':
            shouldUnlock = activeGoalsCount >= badge.requirement;
            break;
        }

        if (shouldUnlock) {
          await supabase.from('achievements').insert({
            user_id: userId,
            badge_id: badge.id,
            badge_name: badge.name,
            badge_emoji: badge.emoji,
          });
          
          // Play milestone sound for achievement unlock
          playSoundEffect('milestone');
          
          toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
            description: badge.description,
          });
        }
      }
    } catch (error) {
      logError('Error checking achievements:', error);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('due_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data as Task[]);
    } catch (error) {
      logError('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    goal_id?: string;
    time_estimate?: string;
    priority?: 'high' | 'medium' | 'low';
    due_date?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          goal_id: taskData.goal_id || null,
          time_estimate: taskData.time_estimate || null,
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date || new Date().toISOString().split('T')[0],
        })
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => [data as Task, ...prev]);
      toast.success('Task added!');
      return data as Task;
    } catch (error) {
      logError('Error adding task:', error);
      toast.error('Failed to add task');
      return null;
    }
  };

  const updateGoalProgress = async (goalId: string) => {
    if (!user || !goalId) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // IMPORTANT:
      // Goals often have many future tasks (e.g. 30/90-day challenges).
      // Progress should reflect only tasks that are due up to today, otherwise it stays ~0% forever.
      const { data: goalTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, completed, due_date')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .lte('due_date', todayStr);

      if (fetchError) throw fetchError;
      if (!goalTasks || goalTasks.length === 0) return;

      const completedCount = goalTasks.filter((t) => t.completed).length;
      const totalCount = goalTasks.length;
      const progress = Math.round((completedCount / totalCount) * 100);

      const updates: Record<string, any> = { progress };

      // Status based on challenge completion so far
      if (progress === 100) {
        updates.status = 'on-track';
      } else if (progress >= 70) {
        updates.status = 'ahead';
      } else if (progress >= 30) {
        updates.status = 'on-track';
      } else {
        updates.status = 'behind';
      }

      // Mark as completed ONLY when all tasks (including future ones) are completed
      // (otherwise people would “complete” a 90-day challenge on day 1)
      const { data: allGoalTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('id, completed')
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      if (!allTasksError && allGoalTasks && allGoalTasks.length > 0) {
        const allDone = allGoalTasks.every((t) => t.completed);
        if (allDone) {
          updates.status = 'completed';
          updates.completed_at = new Date().toISOString();
          // Return true to indicate goal completion for celebration
          await supabase
            .from('goals')
            .update(updates)
            .eq('id', goalId);
          return { goalCompleted: true };
        }
      }

      // Update current_value if target_value exists
      const { data: goal } = await supabase
        .from('goals')
        .select('target_value')
        .eq('id', goalId)
        .single();

      if (goal?.target_value) {
        const match = goal.target_value.match(/^\$?(\d+(?:\.\d+)?)\s*(.*)$/);
        if (match) {
          const totalValue = parseFloat(match[1]);
          const unit = match[2].trim();
          const currentValue = ((completedCount / totalCount) * totalValue).toFixed(1);
          updates.current_value = `${currentValue} ${unit}`.trim();
        }
      }

      await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId);
    } catch (error) {
      logError('Error updating goal progress:', error);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updates: any = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      const updatedTasks = tasks.map(t => t.id === taskId ? data as Task : t);
      setTasks(updatedTasks);

      // Play sound for task completion
      if (completed) {
        playSoundEffect('taskComplete');
      }

      // Auto-update goal progress
      if (data.goal_id) {
        const goalResult = await updateGoalProgress(data.goal_id);
        
        // Trigger goal completion celebration
        if (goalResult?.goalCompleted) {
          setCelebrationTrigger('goalComplete');
        }
        // Log activity to shared goals for real-time notifications
        if (completed && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', user.id)
            .single();
          
          const username = profile?.username || profile?.full_name?.split(' ')[0] || 'Someone';
          await logTaskCompletionToSharedGoals(user.id, data.goal_id, data.title, username);
        }
      }

      // Update user stats if completing task
      if (completed && user) {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const todayStr = now.toISOString().split('T')[0];
        
        // Time-based achievement checks
        const isEarlyMorning = hour < 7;
        const isNightOwl = hour >= 22;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Count tasks completed today
        const todayCompletedTasks = updatedTasks.filter(
          t => t.due_date === todayStr && t.completed
        ).length;

        // Get or create user stats
        let { data: currentStats } = await supabase
          .from('user_stats')
          .select('tasks_completed, current_streak, longest_streak, perfect_days, last_activity_date')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // Create user_stats if it doesn't exist
        if (!currentStats) {
          const { data: newStats, error: createError } = await supabase
            .from('user_stats')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (createError) {
            logError('Error creating user stats:', createError);
          } else {
            currentStats = newStats;
          }
        }
        
        if (currentStats) {
          const newTasksCompleted = (currentStats.tasks_completed || 0) + 1;
          const statsUpdate: any = {
            tasks_completed: newTasksCompleted,
          };

          // Update streak on ANY task completion (not just perfect days)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const lastActivity = currentStats.last_activity_date 
            ? new Date(currentStats.last_activity_date)
            : null;
          
          if (lastActivity) {
            lastActivity.setHours(0, 0, 0, 0);
          }

          // Check if we already updated streak today
          const alreadyUpdatedToday = lastActivity && lastActivity.getTime() === today.getTime();

          if (!alreadyUpdatedToday) {
            // Check if yesterday had activity (continuing streak)
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const isConsecutive = lastActivity && lastActivity.getTime() === yesterday.getTime();
            
            const newStreak = isConsecutive 
              ? (currentStats.current_streak || 0) + 1 
              : 1;
            
            statsUpdate.current_streak = newStreak;
            statsUpdate.longest_streak = Math.max(newStreak, currentStats.longest_streak || 0);
            statsUpdate.last_activity_date = todayStr;

            if (newStreak > 1) {
              toast.success(`🔥 ${newStreak} day streak!`);
            }
          }

          // Check for achievements
          await checkAndUnlockAchievements(user.id, {
            current_streak: statsUpdate.current_streak || currentStats.current_streak || 0,
            tasks_completed: newTasksCompleted,
            perfect_days: currentStats.perfect_days || 0,
          }, {
            isEarlyMorning,
            isNightOwl,
            isWeekend,
            dailyTasksToday: todayCompletedTasks,
          });

          // Check if all tasks for today are now completed (Perfect Day)
          const todayTasks = updatedTasks.filter(t => t.due_date === todayStr);
          const allCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);

          if (allCompleted && !alreadyUpdatedToday) {
            statsUpdate.perfect_days = (currentStats.perfect_days || 0) + 1;
            setCelebrationTrigger('perfectDay');
            toast.success('🎉 Perfect Day! All tasks completed!');
          }

          await supabase
            .from('user_stats')
            .update(statsUpdate)
            .eq('user_id', user.id);
        }
      }

      return data as Task;
    } catch (error) {
      logError('Error toggling task:', error);
      toast.error('Failed to update task');
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(t => t.id === taskId ? data as Task : t));
      toast.success('Task updated');
      return data as Task;
    } catch (error) {
      logError('Error updating task:', error);
      toast.error('Failed to update task');
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      logError('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();

    // Set up realtime subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, date]);

  return {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
    celebrationTrigger,
    clearCelebration,
  };
}
