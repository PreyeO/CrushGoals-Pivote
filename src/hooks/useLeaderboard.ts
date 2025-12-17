import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/logger';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar: string;
  tasks_completed: number;
  current_streak: number;
  total_xp: number;
  level: number;
  change: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Use the secure database function to get leaderboard data
      const { data, error } = await supabase.rpc('get_leaderboard_data', {
        limit_count: 50
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }

      const leaderboardEntries: LeaderboardEntry[] = data.map((entry: any, index: number) => {
        const name = entry.display_name || 'Anonymous';
        return {
          rank: index + 1,
          user_id: entry.user_id,
          name: name,
          avatar: name.charAt(0).toUpperCase(),
          tasks_completed: entry.tasks_completed || 0,
          current_streak: entry.current_streak || 0,
          total_xp: entry.total_xp || 0,
          level: entry.level || 1,
          change: 0, // Would need historical data to calculate
        };
      });

      setEntries(leaderboardEntries);

      // Find user's rank
      const userEntry = leaderboardEntries.find(e => e.user_id === user.id);
      if (userEntry) {
        setUserRank(userEntry);
      }
    } catch (error) {
      logError('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    entries,
    userRank,
    isLoading,
    refreshLeaderboard: fetchLeaderboard,
  };
}