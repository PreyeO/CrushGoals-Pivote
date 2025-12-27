import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

// Generate tasks for a goal based on its frequency and deadline
const generateTasksForGoal = async (userId: string, goal: any) => {
  try {
    const frequency = goal.task_frequency || 'daily';
    const startDate = new Date(goal.start_date || new Date());
    const endDate = goal.deadline ? new Date(goal.deadline) : addMonths(startDate, 1);
    
    const tasks: any[] = [];
    let currentDate = startDate;
    
    // Parse target value for daily task title
    const targetMatch = goal.target_value?.match(/(\d+)\s*(.+)?/);
    const totalTarget = targetMatch ? parseInt(targetMatch[1]) : 0;
    const unit = targetMatch?.[2] || 'units';
    
    // Calculate number of periods
    const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let periods = 0;
    
    switch (frequency) {
      case 'daily':
        periods = daysBetween || 30;
        break;
      case 'weekly':
        periods = Math.ceil(daysBetween / 7) || 4;
        break;
      case 'biweekly':
        periods = Math.ceil(daysBetween / 14) || 2;
        break;
      case 'monthly':
        periods = Math.ceil(daysBetween / 30) || 1;
        break;
    }
    
    const dailyTarget = totalTarget > 0 ? Math.ceil(totalTarget / periods) : 0;
    
    while (currentDate <= endDate && tasks.length < 365) {
      const taskTitle = dailyTarget > 0 
        ? `${goal.emoji || '🎯'} ${goal.name}: ${dailyTarget} ${unit}`
        : `${goal.emoji || '🎯'} ${goal.name}`;
      
      tasks.push({
        user_id: userId,
        goal_id: goal.id,
        title: taskTitle,
        due_date: format(currentDate, 'yyyy-MM-dd'),
        priority: 'medium',
      });
      
      switch (frequency) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
      }
    }
    
    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasks);
      if (error) {
        logError('Error generating tasks for shared goal:', error);
      }
    }
  } catch (error) {
    logError('Error in generateTasksForGoal:', error);
  }
};

export function useInviteHandler() {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedInvites, setProcessedInvites] = useState(false);

  const processInviteByToken = useCallback(async (inviteToken: string) => {
    if (!user || !profile) return false;

    try {
      // Look up friend invite by token
      const { data: friendInvite, error: friendInviteError } = await supabase
        .from('friend_invites')
        .select('*, goals(*)')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .maybeSingle();

      if (friendInviteError) throw friendInviteError;
      if (!friendInvite) return false;

      return await processInvite(friendInvite);
    } catch (error) {
      logError('Error processing invite by token:', error);
      return false;
    }
  }, [user, profile]);

  const processInvite = async (friendInvite: any) => {
    if (!user || !profile) return false;

    const inviterId = friendInvite.inviter_id;
    const goalData = friendInvite.goals;

    // Check if already friends
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${inviterId},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${inviterId})`)
      .maybeSingle();

  if (!existingFriendship) {
      // Create friendship (auto-accepted since they clicked the invite)
      // NOTE: user_id must be the current user (auth.uid()) to satisfy RLS policy
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: inviterId,
          status: 'accepted',
        });
      
      if (friendshipError) {
        logError('Error creating friendship:', friendshipError);
      }
    } else if (existingFriendship.status === 'pending') {
      // Accept pending request
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', existingFriendship.id);
    }

    // If there's a goal attached, create shared goal and copy for the invitee
    if (goalData) {
      // Check if shared goal already exists (should be created by inviter)
      let sharedGoalId: string | null = null;
      
      const { data: existingSharedGoal } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', friendInvite.goal_id)
        .eq('owner_id', inviterId)
        .maybeSingle();

      if (existingSharedGoal) {
        sharedGoalId = existingSharedGoal.id;
      }
      // Note: We can't create shared_goals here due to RLS (owner_id must be auth.uid())
      // The inviter should have created the shared goal when they sent the invite

      // Create a copy of the goal for the invitee regardless of shared goal status
      const startDate = new Date().toISOString().split('T')[0];
      const { data: newGoal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: goalData.name,
          emoji: goalData.emoji,
          category: goalData.category,
          target_value: goalData.target_value,
          deadline: goalData.deadline,
          task_frequency: goalData.task_frequency || 'daily',
          start_date: startDate,
        })
        .select('*')
        .single();

      if (goalError) {
        logError('Error creating goal for invitee:', goalError);
      }

      if (newGoal) {
        // Generate tasks for the new goal
        await generateTasksForGoal(user.id, newGoal);

        // Add invitee as member of the shared goal if it exists
        if (sharedGoalId) {
          // Check if invitee already has a membership
          const { data: existingMembership } = await supabase
            .from('shared_goal_members')
            .select('id')
            .eq('shared_goal_id', sharedGoalId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!existingMembership) {
            const { error: memberError } = await supabase.from('shared_goal_members').insert({
              shared_goal_id: sharedGoalId,
              user_id: user.id,
              goal_id: newGoal.id,
            });

            if (memberError) {
              logError('Error adding invitee to shared goal:', memberError);
            }
          }
        }
      }
    }

    // Update friend invite status
    await supabase
      .from('friend_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', friendInvite.id);

    return true;
  };

  const processPendingInvitesByEmail = useCallback(async () => {
    if (!user || !profile?.email) return 0;

    try {
      // Find all pending invites for this user's email
      const { data: pendingInvites, error } = await supabase
        .from('friend_invites')
        .select('*, goals(*)')
        .eq('invitee_email', profile.email.toLowerCase())
        .eq('status', 'pending')
        .neq('invitee_email', 'link-invite@placeholder.com'); // Exclude placeholder link invites

      if (error) throw error;
      if (!pendingInvites || pendingInvites.length === 0) return 0;

      let processedCount = 0;
      for (const invite of pendingInvites) {
        const success = await processInvite(invite);
        if (success) processedCount++;
      }

      return processedCount;
    } catch (error) {
      logError('Error processing pending invites by email:', error);
      return 0;
    }
  }, [user, profile]);

  useEffect(() => {
    const processAllInvites = async () => {
      if (!user || !profile || isProcessing || processedInvites) return;

      setIsProcessing(true);

      try {
        let invitesProcessed = 0;

        // Check for invite token in URL
        const urlParams = new URLSearchParams(window.location.search);
        let inviteToken = urlParams.get('invite');
        
        // Also check localStorage (saved during signup)
        if (!inviteToken) {
          inviteToken = localStorage.getItem('pendingInviteToken');
        }

        // Clear URL param and localStorage
        if (inviteToken) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('invite');
          window.history.replaceState({}, '', newUrl.pathname);
          localStorage.removeItem('pendingInviteToken');

          const tokenSuccess = await processInviteByToken(inviteToken);
          if (tokenSuccess) invitesProcessed++;
        }

        // Also process any pending invites by email match
        const emailProcessed = await processPendingInvitesByEmail();
        invitesProcessed += emailProcessed;

        if (invitesProcessed > 0) {
          toast.success(
            invitesProcessed === 1 
              ? "You've joined your friend's goal! 🎉" 
              : `You've joined ${invitesProcessed} shared goals! 🎉`
          );
        }

        setProcessedInvites(true);
      } catch (error) {
        logError('Error processing invites:', error);
        toast.error('Failed to process some invites');
      } finally {
        setIsProcessing(false);
      }
    };

    processAllInvites();
  }, [user, profile, isProcessing, processedInvites, processInviteByToken, processPendingInvitesByEmail]);

  return { isProcessing, processedInvites };
}
