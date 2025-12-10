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
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: goalData.name,
          emoji: goalData.emoji,
          category: goalData.category,
          target_value: goalData.target_value || null,
          start_date: goalData.start_date || new Date().toISOString().split('T')[0],
          deadline: goalData.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data as Goal, ...prev]);
      toast.success('Goal created successfully! 🎯');
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
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast.success('Goal deleted');
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
