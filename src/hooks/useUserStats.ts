import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  tasks_completed: number;
  total_xp: number;
  level: number;
  perfect_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setStats(data as UserStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setStats(data as UserStats);
      return data as UserStats;
    } catch (error) {
      console.error('Error updating stats:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    stats,
    isLoading,
    updateStats,
    refreshStats: fetchStats,
  };
}
