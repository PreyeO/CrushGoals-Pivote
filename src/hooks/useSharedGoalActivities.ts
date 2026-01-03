import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface SharedGoalComment {
  id: string;
  shared_goal_id: string;
  user_id: string;
  content: string;
  comment_type: 'comment' | 'encouragement' | 'celebration';
  created_at: string;
  username?: string;
}

export interface SharedGoalActivity {
  id: string;
  shared_goal_id: string;
  user_id: string;
  activity_type: 'task_completed' | 'goal_joined' | 'streak_milestone';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
  username?: string;
}

export function useSharedGoalActivities(sharedGoalId: string | null) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<SharedGoalComment[]>([]);
  const [activities, setActivities] = useState<SharedGoalActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!sharedGoalId || !user) return;

    try {
      // Fetch comments with profiles
      const { data: commentsData, error: commentsError } = await supabase
        .from('shared_goal_comments')
        .select('*')
        .eq('shared_goal_id', sharedGoalId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (commentsError) throw commentsError;

      // Fetch activities with profiles  
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('shared_goal_activities')
        .select('*')
        .eq('shared_goal_id', sharedGoalId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      // Get unique user IDs to fetch profiles
      const userIds = new Set<string>();
      commentsData?.forEach(c => userIds.add(c.user_id));
      activitiesData?.forEach(a => userIds.add(a.user_id));

      // Use secure RPC function to fetch profiles (prevents direct table access)
      const { data: profiles } = await supabase
        .rpc('get_social_profiles', { p_user_ids: Array.from(userIds) });

      const userMap: Record<string, string> = {};
      profiles?.forEach((p: { user_id: string; username: string | null; full_name: string | null }) => {
        userMap[p.user_id] = p.username || (p.full_name ? p.full_name.split(' ')[0] : null) || 'Anonymous';
      });

      setComments((commentsData || []).map(c => ({
        ...c,
        comment_type: c.comment_type as 'comment' | 'encouragement' | 'celebration',
        username: userMap[c.user_id]
      })));

      setActivities((activitiesData || []).map(a => ({
        ...a,
        activity_type: a.activity_type as 'task_completed' | 'goal_joined' | 'streak_milestone',
        metadata: a.metadata as Record<string, any> | undefined,
        username: userMap[a.user_id]
      })));
    } catch (error) {
      logError('Error fetching shared goal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sharedGoalId, user]);

  // Subscribe to real-time activity updates
  useEffect(() => {
    if (!sharedGoalId) return;

    fetchData();

    // Set up realtime subscription for activities
    const channel = supabase
      .channel(`shared-goal-activities-${sharedGoalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_goal_activities',
          filter: `shared_goal_id=eq.${sharedGoalId}`,
        },
        async (payload) => {
          const newActivity = payload.new as SharedGoalActivity;
          
          // Don't show toast for own activities
          if (newActivity.user_id !== user?.id) {
            // Use secure RPC function to fetch profile data
            const { data: profileDataArray } = await supabase
              .rpc('get_social_profiles', { p_user_ids: [newActivity.user_id] });
            
            const profileData = profileDataArray?.[0] as { username: string | null; full_name: string | null } | undefined;

            const username = profileData?.username || profileData?.full_name?.split(' ')[0] || 'Someone';

            // Show toast notification
            if (newActivity.activity_type === 'task_completed') {
              toast.success(`${username} completed a task! 🎉`, {
                description: newActivity.message
              });
            }

            setActivities(prev => [{
              ...newActivity,
              username
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sharedGoalId, user?.id, fetchData]);

  const addComment = async (content: string, commentType: 'comment' | 'encouragement' | 'celebration' = 'comment') => {
    if (!user || !sharedGoalId || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('shared_goal_comments')
        .insert({
          shared_goal_id: sharedGoalId,
          user_id: user.id,
          content: content.trim(),
          comment_type: commentType,
        })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [{
        ...data,
        comment_type: data.comment_type as 'comment' | 'encouragement' | 'celebration',
        username: profile?.username || profile?.full_name?.split(' ')[0] || 'You'
      }, ...prev]);

      toast.success(commentType === 'encouragement' ? '💪 Encouragement sent!' : 'Comment added!');
      return true;
    } catch (error) {
      logError('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('shared_goal_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      logError('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const logActivity = async (
    activityType: 'task_completed' | 'goal_joined' | 'streak_milestone',
    message: string,
    metadata?: Record<string, any>
  ) => {
    if (!user || !sharedGoalId) return;

    try {
      await supabase
        .from('shared_goal_activities')
        .insert({
          shared_goal_id: sharedGoalId,
          user_id: user.id,
          activity_type: activityType,
          message,
          metadata,
        });
    } catch (error) {
      logError('Error logging activity:', error);
    }
  };

  return {
    comments,
    activities,
    isLoading,
    addComment,
    deleteComment,
    logActivity,
    refreshData: fetchData,
  };
}

// Utility function to log task completion across all shared goals for a user's goal
export async function logTaskCompletionToSharedGoals(
  userId: string,
  goalId: string,
  taskTitle: string,
  username: string
) {
  try {
    // Find shared goals that include this goal
    const { data: memberships } = await supabase
      .from('shared_goal_members')
      .select('shared_goal_id')
      .eq('user_id', userId)
      .eq('goal_id', goalId);

    if (!memberships || memberships.length === 0) return;

    // Log activity for each shared goal
    for (const membership of memberships) {
      await supabase
        .from('shared_goal_activities')
        .insert({
          shared_goal_id: membership.shared_goal_id,
          user_id: userId,
          activity_type: 'task_completed',
          message: taskTitle,
          metadata: { goal_id: goalId },
        });
    }
  } catch (error) {
    logError('Error logging task completion to shared goals:', error);
  }
}
