import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyTasks = async (goalId: string, goalName: string, emoji: string, targetValue: string, startDate: string, deadline: string) => {
    if (!user) return;

    const parsed = parseTargetValue(targetValue);
    if (!parsed) {
      // If no parseable target, create a single daily reminder task for each day
      const days = getDaysBetween(startDate, deadline);
      const tasks = [];
      
      for (let i = 0; i < days; i++) {
        const taskDate = new Date(startDate);
        taskDate.setDate(taskDate.getDate() + i);
        const dateStr = taskDate.toISOString().split('T')[0];
        
        tasks.push({
          user_id: user.id,
          goal_id: goalId,
          title: `${emoji} Work on: ${goalName}`,
          priority: 'medium',
          due_date: dateStr,
        });
      }

      if (tasks.length > 0) {
        await supabase.from('tasks').insert(tasks);
      }
      return;
    }

    const days = getDaysBetween(startDate, deadline);
    const dailyTarget = parsed.value / days;
    const taskTitle = generateDailyTaskTitle(goalName, dailyTarget, parsed.unit);

    // Generate tasks for each day
    const tasks = [];
    for (let i = 0; i < days; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + i);
      const dateStr = taskDate.toISOString().split('T')[0];
      
      tasks.push({
        user_id: user.id,
        goal_id: goalId,
        title: `${emoji} ${taskTitle}`,
        priority: 'medium',
        due_date: dateStr,
      });
    }

    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasks);
      if (error) {
        console.error('Error generating tasks:', error);
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
  }) => {
    if (!user) return null;

    try {
      const startDate = goalData.start_date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: goalData.name,
          emoji: goalData.emoji,
          category: goalData.category,
          target_value: goalData.target_value || null,
          start_date: startDate,
          deadline: goalData.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data as Goal, ...prev]);
      
      // Auto-generate daily tasks if we have start date and deadline
      if (startDate && goalData.deadline) {
        await generateDailyTasks(
          data.id,
          goalData.name,
          goalData.emoji,
          goalData.target_value || '',
          startDate,
          goalData.deadline
        );
        toast.success('Goal created with daily tasks! 🎯', {
          description: 'Check your Tasks page to see today\'s mission.'
        });
      } else {
        toast.success('Goal created successfully! 🎯');
      }
      
      return data as Goal;
    } catch (error) {
      console.error('Error adding goal:', error);
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
      console.error('Error updating goal:', error);
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
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
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
    refreshGoals: fetchGoals,
  };
}
