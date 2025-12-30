import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';
import { playSoundEffect } from '@/hooks/useSoundEffects';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  category: string;
  target_value: string | null;
  current_value: string;
  start_date: string | null;
  deadline: string | null;
  status: 'on-track' | 'ahead' | 'behind' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  task_frequency: 'daily' | 'weekly' | 'monthly';
  is_paused: boolean;
  paused_at: string | null;
  pause_reason: string | null;
}

// Parse target value to extract number and unit
// e.g., "30 pages" -> { value: 30, unit: "pages" }
// e.g., "10kg" -> { value: 10, unit: "kg" }
function parseTargetValue(target: string): { value: number; unit: string } | null {
  if (!target) return null;
  
  // Match patterns like "30 pages", "10kg", "5000 words", "$10000"
  const match = target.match(/^\$?(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].trim() || 'units'
    };
  }
  return null;
}

// Calculate days between two dates
function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
}

// Generate daily task title based on goal and daily target
function generateDailyTaskTitle(goalName: string, dailyTarget: number, unit: string): string {
  // Round to 2 decimal places if needed
  const displayTarget = dailyTarget % 1 === 0 ? dailyTarget : dailyTarget.toFixed(1);
  
  // Smart task naming based on unit
  const unitLower = unit.toLowerCase();
  if (unitLower.includes('page')) {
    return `Write ${displayTarget} ${unit}`;
  } else if (unitLower.includes('word')) {
    return `Write ${displayTarget} ${unit}`;
  } else if (unitLower.includes('kg') || unitLower.includes('lb') || unitLower.includes('pound')) {
    return `Work towards losing ${displayTarget}${unit}`;
  } else if (unitLower.includes('min') || unitLower.includes('hour')) {
    return `${goalName} - ${displayTarget} ${unit}`;
  } else if (unitLower.includes('$') || unitLower.includes('dollar') || unitLower.includes('naira')) {
    return `Save/earn ${displayTarget} ${unit}`;
  } else if (unitLower.includes('chapter')) {
    return `Complete ${displayTarget} ${unit}`;
  } else if (unitLower.includes('lesson') || unitLower.includes('module')) {
    return `Complete ${displayTarget} ${unit}`;
  } else {
    return `${goalName}: ${displayTarget} ${unit}`;
  }
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstGoalCelebration, setFirstGoalCelebration] = useState(false);

  const clearFirstGoalCelebration = useCallback(() => {
    setFirstGoalCelebration(false);
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data as Goal[]).map((g) => ({
        ...g,
        current_value: g.current_value ?? '0',
        progress: g.progress ?? 0,
        status: (g.status as any) ?? 'on-track',
        is_paused: g.is_paused ?? false,
      })));
    } catch (error) {
      logError('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateTasks = async (
    goalId: string, 
    goalName: string, 
    emoji: string, 
    targetValue: string, 
    startDate: string, 
    deadline: string,
    frequency: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) => {
    if (!user) return;

    const parsed = parseTargetValue(targetValue);
    const totalDays = getDaysBetween(startDate, deadline);
    
    // Calculate how many tasks based on frequency
    let taskInterval: number;
    switch (frequency) {
      case 'weekly': taskInterval = 7; break;
      case 'monthly': taskInterval = 30; break;
      default: taskInterval = 1; // daily
    }
    
    const numberOfTasks = Math.max(1, Math.ceil(totalDays / taskInterval));
    const targetPerTask = parsed ? parsed.value / numberOfTasks : 0;
    
    const tasks = [];
    for (let i = 0; i < numberOfTasks; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + (i * taskInterval));
      
      // Don't create tasks after deadline
      if (taskDate > new Date(deadline)) break;
      
      const dateStr = taskDate.toISOString().split('T')[0];
      
      let taskTitle: string;
      if (parsed && targetPerTask > 0) {
        const displayTarget = targetPerTask % 1 === 0 ? targetPerTask : targetPerTask.toFixed(1);
        taskTitle = `${emoji} ${generateDailyTaskTitle(goalName, targetPerTask, parsed.unit)}`;
      } else {
        taskTitle = `${emoji} Work on: ${goalName}`;
      }
      
      tasks.push({
        user_id: user.id,
        goal_id: goalId,
        title: taskTitle,
        priority: 'medium',
        due_date: dateStr,
      });
    }

    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasks);
      if (error) {
        logError('Error generating tasks:', error);
      }
    }
  };

  const addGoal = async (goalData: {
    name: string;
    emoji: string;
    category: string;
    target_value?: string;
    start_date?: string;
    deadline?: string;
    task_frequency?: 'daily' | 'weekly' | 'monthly';
  }) => {
    if (!user) return null;

    try {
      // Check if this is the user's first goal
      const isFirstGoal = goals.length === 0;
      
      const startDate = goalData.start_date || new Date().toISOString().split('T')[0];
      const frequency = goalData.task_frequency || 'daily';
      
       const { data, error } = await supabase
         .from('goals')
         .insert({
           user_id: user.id,
           name: goalData.name,
           emoji: goalData.emoji,
           category: goalData.category,
           target_value: goalData.target_value || null,
           current_value: '0',
           progress: 0,
           status: 'on-track',
           is_paused: false,
           start_date: startDate,
           deadline: goalData.deadline || null,
           task_frequency: frequency,
         })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data as Goal, ...prev]);
      
      // Play level up sound for goal creation
      playSoundEffect('levelUp');
      
      // Trigger first goal celebration if this is the first goal
      if (isFirstGoal) {
        setFirstGoalCelebration(true);
      }
      
      // Auto-generate tasks based on frequency
      if (startDate && goalData.deadline) {
        await generateTasks(
          data.id,
          goalData.name,
          goalData.emoji,
          goalData.target_value || '',
          startDate,
          goalData.deadline,
          frequency
        );
        
        const freqLabel = frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'weekly' : 'monthly';
        toast.success(`Goal created with ${freqLabel} tasks! 🎯`, {
          description: 'Check your Tasks page to see your missions.'
        });
      } else {
        toast.success('Goal created successfully! 🎯');
      }
      
      return data as Goal;
    } catch (error) {
      logError('Error adding goal:', error);
      toast.error('Failed to create goal');
      return null;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => prev.map(g => g.id === goalId ? data as Goal : g));
      return data as Goal;
    } catch (error) {
      logError('Error updating goal:', error);
      toast.error('Failed to update goal');
      return null;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      // First delete all associated tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('goal_id', goalId);

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast.success('Goal and associated tasks deleted');
    } catch (error) {
      logError('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const duplicateGoal = async (goalId: string) => {
    if (!user) return null;

    const originalGoal = goals.find(g => g.id === goalId);
    if (!originalGoal) return null;

    try {
      // Calculate new dates (starting from today)
      const today = new Date();
      const originalDuration = originalGoal.deadline && originalGoal.start_date
        ? getDaysBetween(originalGoal.start_date, originalGoal.deadline)
        : 365;
      
      const newStartDate = today.toISOString().split('T')[0];
      const newDeadline = new Date(today);
      newDeadline.setDate(newDeadline.getDate() + originalDuration);
      const newDeadlineStr = newDeadline.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: `${originalGoal.name} (Copy)`,
          emoji: originalGoal.emoji,
          category: originalGoal.category,
          target_value: originalGoal.target_value,
          start_date: newStartDate,
          deadline: newDeadlineStr,
          task_frequency: originalGoal.task_frequency,
          progress: 0,
          current_value: '0',
          status: 'on-track',
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data as Goal, ...prev]);

      // Generate tasks for the duplicated goal
      if (originalGoal.target_value) {
        await generateTasks(
          data.id,
          data.name,
          data.emoji,
          originalGoal.target_value,
          newStartDate,
          newDeadlineStr,
          originalGoal.task_frequency
        );
      }
      
      toast.success('Goal duplicated! 🎯', {
        description: 'A new copy has been created with fresh dates.'
      });
      
      return data as Goal;
    } catch (error) {
      logError('Error duplicating goal:', error);
      toast.error('Failed to duplicate goal');
      return null;
    }
  };

  const pauseGoal = async (goalId: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          is_paused: true,
          paused_at: new Date().toISOString(),
          pause_reason: reason,
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => prev.map(g => g.id === goalId ? data as Goal : g));
      toast.success('Goal paused! Your progress is safe 💪');
      return data as Goal;
    } catch (error) {
      logError('Error pausing goal:', error);
      toast.error('Failed to pause goal');
      return null;
    }
  };

  const resumeGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.paused_at) return null;

    try {
      // Calculate days paused and extend deadline
      const pausedDays = Math.ceil(
        (new Date().getTime() - new Date(goal.paused_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let newDeadline = goal.deadline;
      if (goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        deadlineDate.setDate(deadlineDate.getDate() + pausedDays);
        newDeadline = deadlineDate.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('goals')
        .update({
          is_paused: false,
          paused_at: null,
          pause_reason: null,
          deadline: newDeadline,
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => prev.map(g => g.id === goalId ? data as Goal : g));
      toast.success(`Goal resumed! Deadline extended by ${pausedDays} days 🎯`);
      return data as Goal;
    } catch (error) {
      logError('Error resuming goal:', error);
      toast.error('Failed to resume goal');
      return null;
    }
  };

  const recalculateProgress = async (goalId: string) => {
    if (!user) return null;

    try {
      // Get all tasks for this goal
      const { data: goalTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, completed')
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return null;

      let progress = 0;
      let status: 'on-track' | 'ahead' | 'behind' | 'completed' = 'on-track';

      if (goalTasks && goalTasks.length > 0) {
        const completedCount = goalTasks.filter(t => t.completed).length;
        const totalCount = goalTasks.length;
        progress = Math.round((completedCount / totalCount) * 100);

        // Determine status based on progress vs timeline
        if (progress >= 100) {
          status = 'completed';
        } else if (goal.start_date && goal.deadline) {
          const start = new Date(goal.start_date).getTime();
          const end = new Date(goal.deadline).getTime();
          const now = Date.now();
          const totalDuration = end - start;
          const elapsed = now - start;
          const expectedProgress = totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 0;

          if (progress > expectedProgress + 10) {
            status = 'ahead';
          } else if (progress + 5 < expectedProgress) {
            status = 'behind';
          } else {
            status = 'on-track';
          }
        }
      }

      // Update goal with recalculated values
      const updates: any = { progress, status };
      
      if (progress >= 100) {
        updates.completed_at = new Date().toISOString();
      }

      // Also update current_value if target_value exists
      if (goal.target_value && goalTasks && goalTasks.length > 0) {
        const match = goal.target_value.match(/^\$?(\d+(?:\.\d+)?)\s*(.*)$/);
        if (match) {
          const totalValue = parseFloat(match[1]);
          const unit = match[2].trim();
          const completedCount = goalTasks.filter(t => t.completed).length;
          const totalCount = goalTasks.length;
          const currentValue = ((completedCount / totalCount) * totalValue).toFixed(1);
          updates.current_value = `${currentValue} ${unit}`.trim();
        }
      }

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === goalId ? data as Goal : g));
      toast.success(`Progress recalculated: ${progress}%`);
      return data as Goal;
    } catch (error) {
      logError('Error recalculating progress:', error);
      toast.error('Failed to recalculate progress');
      return null;
    }
  };

  useEffect(() => {
    fetchGoals();

    // Set up realtime subscription
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    duplicateGoal,
    pauseGoal,
    resumeGoal,
    recalculateProgress,
    refreshGoals: fetchGoals,
    firstGoalCelebration,
    clearFirstGoalCelebration,
  };
}
