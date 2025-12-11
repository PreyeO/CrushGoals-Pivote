import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStreakNotifications() {
  const { stats, user } = useAuth();

  const checkStreakStatus = useCallback(async () => {
    if (!stats || !user) return;

    const now = new Date();
    const currentHour = now.getHours();
    const today = new Date().toISOString().split('T')[0];

    // Check if user has completed any task today
    const { data: todaysTasks } = await supabase
      .from('tasks')
      .select('completed')
      .eq('user_id', user.id)
      .eq('due_date', today);

    const hasActivityToday = todaysTasks?.some(t => t.completed) || false;

    // If user has a streak and hasn't done activity today
    if (stats.current_streak > 0 && !hasActivityToday) {
      // Evening reminder (after 6 PM)
      if (currentHour >= 18 && currentHour < 22) {
        toast.warning(
          `🔥 Don't lose your ${stats.current_streak} day streak!`,
          {
            description: "Complete a task before midnight to keep it going!",
            duration: 10000,
            action: {
              label: "Go to Tasks",
              onClick: () => window.location.href = '/tasks',
            },
          }
        );
      }
      // Urgent reminder (after 10 PM)
      else if (currentHour >= 22) {
        toast.error(
          `⚠️ URGENT: ${stats.current_streak} day streak at risk!`,
          {
            description: "Only a few hours left! Complete any task now!",
            duration: 15000,
            action: {
              label: "Quick Task",
              onClick: () => window.location.href = '/tasks',
            },
          }
        );
      }
    }

    // Celebrate streak milestones
    if (stats.current_streak === 7) {
      toast.success("🔥 1 Week Streak!", {
        description: "You've been consistent for a whole week! Amazing!",
        duration: 8000,
      });
    } else if (stats.current_streak === 30) {
      toast.success("🏆 30 Day Streak!", {
        description: "One month of crushing goals! You're a legend!",
        duration: 10000,
      });
    } else if (stats.current_streak === 100) {
      toast.success("👑 100 Day Streak!", {
        description: "Triple digits! You're unstoppable!",
        duration: 12000,
      });
    }
  }, [stats, user]);

  useEffect(() => {
    // Check on mount
    const timeout = setTimeout(checkStreakStatus, 2000);
    
    // Check periodically (every 30 minutes)
    const interval = setInterval(checkStreakStatus, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [checkStreakStatus]);

  return { checkStreakStatus };
}
