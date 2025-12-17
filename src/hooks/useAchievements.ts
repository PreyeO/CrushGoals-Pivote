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

// Define all available badges
export const ALL_BADGES = [
  // Streak badges
  { id: "fire_starter", name: "Fire Starter", description: "Maintain a 1-day streak", emoji: "🔥", rarity: "common" as const, xpReward: 50, requirement: 1, type: "streak" },
  { id: "week_warrior", name: "Week Warrior", description: "Maintain a 7-day streak", emoji: "⚔️", rarity: "common" as const, xpReward: 200, requirement: 7, type: "streak" },
  { id: "fortnight_fighter", name: "Fortnight Fighter", description: "Maintain a 14-day streak", emoji: "🛡️", rarity: "rare" as const, xpReward: 500, requirement: 14, type: "streak" },
  { id: "month_master", name: "Month Master", description: "Maintain a 30-day streak", emoji: "👑", rarity: "epic" as const, xpReward: 1000, requirement: 30, type: "streak" },
  { id: "consistency_king", name: "Consistency King", description: "100-day streak", emoji: "💎", rarity: "legendary" as const, xpReward: 5000, requirement: 100, type: "streak" },
  
  // Task badges
  { id: "first_step", name: "First Step", description: "Complete your first task", emoji: "👣", rarity: "common" as const, xpReward: 25, requirement: 1, type: "tasks" },
  { id: "task_rookie", name: "Task Rookie", description: "Complete 10 tasks", emoji: "✅", rarity: "common" as const, xpReward: 100, requirement: 10, type: "tasks" },
  { id: "task_hunter", name: "Task Hunter", description: "Complete 50 tasks", emoji: "🎯", rarity: "rare" as const, xpReward: 300, requirement: 50, type: "tasks" },
  { id: "task_master", name: "Task Master", description: "Complete 100 tasks", emoji: "🏆", rarity: "epic" as const, xpReward: 750, requirement: 100, type: "tasks" },
  { id: "task_legend", name: "Task Legend", description: "Complete 500 tasks", emoji: "⚡", rarity: "legendary" as const, xpReward: 2000, requirement: 500, type: "tasks" },
  
  // Goal progress badges
  { id: "quarter_champion", name: "Quarter Champion", description: "Reach 25% of any goal", emoji: "🎯", rarity: "common" as const, xpReward: 300, requirement: 25, type: "goal_progress" },
  { id: "halfway_hero", name: "Halfway Hero", description: "Reach 50% of any goal", emoji: "🦸", rarity: "rare" as const, xpReward: 750, requirement: 50, type: "goal_progress" },
  { id: "almost_there", name: "Almost There", description: "Reach 75% of any goal", emoji: "🚀", rarity: "epic" as const, xpReward: 1000, requirement: 75, type: "goal_progress" },
  { id: "goal_crusher", name: "Goal Crusher", description: "Complete a goal 100%", emoji: "🏅", rarity: "epic" as const, xpReward: 2000, requirement: 100, type: "goal_completion" },
  
  // Perfect day badges
  { id: "perfect_day", name: "Perfect Day", description: "Complete all tasks in one day", emoji: "⭐", rarity: "common" as const, xpReward: 200, requirement: 1, type: "perfect_days" },
  { id: "perfect_week", name: "Perfect Week", description: "7 perfect days total", emoji: "🌟", rarity: "rare" as const, xpReward: 1000, requirement: 7, type: "perfect_days" },
  { id: "perfect_month", name: "Perfect Month", description: "30 perfect days total", emoji: "💫", rarity: "legendary" as const, xpReward: 3000, requirement: 30, type: "perfect_days" },
  
  // Time-based badges
  { id: "early_bird", name: "Early Bird", description: "Complete a task before 7 AM", emoji: "🌅", rarity: "rare" as const, xpReward: 150, requirement: 1, type: "early_morning" },
  { id: "morning_champion", name: "Morning Champion", description: "Complete 10 tasks before 9 AM", emoji: "☀️", rarity: "epic" as const, xpReward: 500, requirement: 10, type: "early_morning" },
  { id: "night_owl", name: "Night Owl", description: "Complete a task after 10 PM", emoji: "🦉", rarity: "rare" as const, xpReward: 150, requirement: 1, type: "night" },
  { id: "weekend_warrior", name: "Weekend Warrior", description: "Complete tasks on 5 weekends", emoji: "🎉", rarity: "rare" as const, xpReward: 400, requirement: 5, type: "weekend" },
  
  // Level badges
  { id: "level_5", name: "Rising Star", description: "Reach Level 5", emoji: "⭐", rarity: "common" as const, xpReward: 250, requirement: 5, type: "level" },
  { id: "level_10", name: "Level 10", description: "Reach Level 10", emoji: "🔟", rarity: "rare" as const, xpReward: 500, requirement: 10, type: "level" },
  { id: "level_25", name: "Elite Status", description: "Reach Level 25", emoji: "🏆", rarity: "legendary" as const, xpReward: 2500, requirement: 25, type: "level" },
  
  // Special badges
  { id: "comeback_kid", name: "Comeback Kid", description: "Return after 7+ days away", emoji: "💪", rarity: "rare" as const, xpReward: 300, requirement: 1, type: "special" },
  { id: "multi_goal", name: "Multi-Tasker", description: "Have 3 active goals", emoji: "🎪", rarity: "rare" as const, xpReward: 400, requirement: 3, type: "multi_goal" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete 5 tasks in one day", emoji: "⚡", rarity: "rare" as const, xpReward: 350, requirement: 5, type: "daily_tasks" },
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

    // Check if already unlocked
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
      toast.success(`🏆 Badge Unlocked: ${badgeName}!`);
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
          case 'goal_progress':
          case 'goal_completion':
            const maxProgress = Math.max(0, ...goals.map(g => g.progress || 0));
            progress = Math.min(100, (maxProgress / badge.requirement) * 100);
            progressText = `Best: ${maxProgress}%`;
            break;
          case 'early_morning':
            progressText = 'Complete tasks before 7 AM';
            break;
          case 'night':
            progressText = 'Complete tasks after 10 PM';
            break;
          case 'weekend':
            progressText = 'Complete tasks on weekends';
            break;
          case 'daily_tasks':
            progressText = `Complete ${badge.requirement} tasks in a day`;
            break;
          case 'multi_goal':
            const activeCount = goals.filter(g => g.status !== 'completed').length;
            progress = Math.min(100, (activeCount / badge.requirement) * 100);
            progressText = `${activeCount}/${badge.requirement} active goals`;
            break;
          case 'special':
            progressText = badge.description;
            break;
        }
      }

      return {
        ...badge,
        unlocked: isUnlocked,
        unlockedDate: unlockedAchievement?.earned_at 
          ? new Date(unlockedAchievement.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
