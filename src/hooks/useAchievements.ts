import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface Achievement {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_emoji: string | null;
  earned_at: string;
}

// Simplified badges list - removed unnecessary ones
export const ALL_BADGES = [
  // Streak badges
  { id: "fire_starter", name: "Fire Starter", description: "Start a streak", emoji: "🔥", rarity: "common" as const, xpReward: 50, requirement: 1, type: "streak" },
  { id: "week_warrior", name: "Week Warrior", description: "7-day streak", emoji: "⚔️", rarity: "rare" as const, xpReward: 200, requirement: 7, type: "streak" },
  { id: "month_master", name: "Month Master", description: "30-day streak", emoji: "👑", rarity: "epic" as const, xpReward: 1000, requirement: 30, type: "streak" },
  { id: "consistency_king", name: "Consistency King", description: "100-day streak", emoji: "💎", rarity: "legendary" as const, xpReward: 5000, requirement: 100, type: "streak" },
  
  // Task badges
  { id: "first_step", name: "First Step", description: "Complete first task", emoji: "👣", rarity: "common" as const, xpReward: 25, requirement: 1, type: "tasks" },
  { id: "task_hunter", name: "Task Hunter", description: "Complete 50 tasks", emoji: "🎯", rarity: "rare" as const, xpReward: 300, requirement: 50, type: "tasks" },
  { id: "task_master", name: "Task Master", description: "Complete 100 tasks", emoji: "🏆", rarity: "epic" as const, xpReward: 750, requirement: 100, type: "tasks" },
  { id: "task_legend", name: "Task Legend", description: "Complete 500 tasks", emoji: "⚡", rarity: "legendary" as const, xpReward: 2000, requirement: 500, type: "tasks" },
  
  // Goal badges
  { id: "goal_crusher", name: "Goal Crusher", description: "Complete a goal", emoji: "🏅", rarity: "epic" as const, xpReward: 2000, requirement: 100, type: "goal_completion" },
  
  // Perfect day badges
  { id: "perfect_day", name: "Perfect Day", description: "All tasks in one day", emoji: "⭐", rarity: "common" as const, xpReward: 200, requirement: 1, type: "perfect_days" },
  { id: "perfect_week", name: "Perfect Week", description: "7 perfect days", emoji: "🌟", rarity: "rare" as const, xpReward: 1000, requirement: 7, type: "perfect_days" },
  
  // Level badges
  { id: "level_5", name: "Rising Star", description: "Reach Level 5", emoji: "⭐", rarity: "common" as const, xpReward: 250, requirement: 5, type: "level" },
  { id: "level_10", name: "Elite", description: "Reach Level 10", emoji: "🔟", rarity: "rare" as const, xpReward: 500, requirement: 10, type: "level" },
  { id: "level_25", name: "Legend", description: "Reach Level 25", emoji: "🏆", rarity: "legendary" as const, xpReward: 2500, requirement: 25, type: "level" },
  
  // Special
  { id: "multi_goal", name: "Multi-Tasker", description: "3 active goals", emoji: "🎪", rarity: "rare" as const, xpReward: 400, requirement: 3, type: "multi_goal" },
];

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data as Achievement[]);
    } catch (error) {
      logError('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockAchievement = async (badgeId: string, badgeName: string, badgeEmoji: string) => {
    if (!user) return null;

    const existing = achievements.find(a => a.badge_id === badgeId);
    if (existing) return existing;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
          badge_name: badgeName,
          badge_emoji: badgeEmoji,
        })
        .select()
        .single();

      if (error) throw error;
      
      setAchievements(prev => [data as Achievement, ...prev]);
      toast.success(`Badge Unlocked: ${badgeName}!`);
      return data as Achievement;
    } catch (error) {
      logError('Error unlocking achievement:', error);
      return null;
    }
  };

  const getBadgesWithStatus = (
    stats: { current_streak?: number; tasks_completed?: number; level?: number; perfect_days?: number } | null, 
    goals: { progress?: number; status?: string }[]
  ) => {
    return ALL_BADGES.map(badge => {
      const isUnlocked = achievements.some(a => a.badge_id === badge.id);
      const unlockedAchievement = achievements.find(a => a.badge_id === badge.id);
      
      let progress = 0;
      let progressText = '';

      if (!isUnlocked && stats) {
        switch (badge.type) {
          case 'streak':
            progress = Math.min(100, ((stats.current_streak || 0) / badge.requirement) * 100);
            progressText = `${stats.current_streak || 0}/${badge.requirement} days`;
            break;
          case 'tasks':
            progress = Math.min(100, ((stats.tasks_completed || 0) / badge.requirement) * 100);
            progressText = `${stats.tasks_completed || 0}/${badge.requirement} tasks`;
            break;
          case 'level':
            progress = Math.min(100, ((stats.level || 1) / badge.requirement) * 100);
            progressText = `Level ${stats.level || 1}/${badge.requirement}`;
            break;
          case 'perfect_days':
            progress = Math.min(100, ((stats.perfect_days || 0) / badge.requirement) * 100);
            progressText = `${stats.perfect_days || 0}/${badge.requirement} days`;
            break;
          case 'goal_completion':
            const maxProgress = Math.max(0, ...goals.map(g => g.progress || 0));
            progress = Math.min(100, (maxProgress / badge.requirement) * 100);
            progressText = `Best: ${maxProgress}%`;
            break;
          case 'multi_goal':
            const activeCount = goals.filter(g => g.status !== 'completed').length;
            progress = Math.min(100, (activeCount / badge.requirement) * 100);
            progressText = `${activeCount}/${badge.requirement} goals`;
            break;
        }
      }

      return {
        ...badge,
        unlocked: isUnlocked,
        unlockedDate: unlockedAchievement?.earned_at 
          ? new Date(unlockedAchievement.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : undefined,
        progress,
        progressText,
      };
    });
  };

  useEffect(() => {
    fetchAchievements();

    const channel = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    achievements,
    isLoading,
    unlockAchievement,
    getBadgesWithStatus,
    refreshAchievements: fetchAchievements,
  };
}