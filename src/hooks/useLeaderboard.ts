import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar: string;
  tasks_completed: number;
  current_streak: number;
  total_xp: number;
  change: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all user stats with profiles for leaderboard
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('user_id, tasks_completed, current_streak, total_xp')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (statsError) throw statsError;

      if (!statsData || statsData.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch profiles for all users
      const userIds = statsData.map(s => s.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const leaderboardEntries: LeaderboardEntry[] = statsData.map((stat, index) => {
        const profile = profilesMap.get(stat.user_id);
        const name = profile?.full_name || 'Anonymous';
        return {
          rank: index + 1,
          user_id: stat.user_id,
          name: name,
          avatar: name.charAt(0).toUpperCase(),
          tasks_completed: stat.tasks_completed || 0,
          current_streak: stat.current_streak || 0,
          total_xp: stat.total_xp || 0,
          change: 0, // Would need historical data to calculate
        };
      });

      setEntries(leaderboardEntries);

      // Find user's rank
      if (user) {
        const userEntry = leaderboardEntries.find(e => e.user_id === user.id);
        if (userEntry) {
          setUserRank(userEntry);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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
