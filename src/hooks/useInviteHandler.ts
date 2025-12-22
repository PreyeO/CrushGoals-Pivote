import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

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
      await supabase
        .from('friendships')
        .insert({
          user_id: inviterId,
          friend_id: user.id,
          status: 'accepted',
        });
    } else if (existingFriendship.status === 'pending') {
      // Accept pending request
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', existingFriendship.id);
    }

    // If there's a goal attached, create shared goal for the invitee
    if (goalData) {
      // Check if shared goal already exists
      let sharedGoalId: string | null = null;
      
      const { data: existingSharedGoal } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', friendInvite.goal_id)
        .eq('owner_id', inviterId)
        .maybeSingle();

      if (existingSharedGoal) {
        sharedGoalId = existingSharedGoal.id;
      } else {
        // Create shared goal
        const { data: newSharedGoal } = await supabase
          .from('shared_goals')
          .insert({
            goal_id: friendInvite.goal_id,
            owner_id: inviterId,
            name: `${goalData.name} Challenge`,
          })
          .select('id')
          .single();

        if (newSharedGoal) {
          sharedGoalId = newSharedGoal.id;

          // Add owner as member
          await supabase.from('shared_goal_members').insert({
            shared_goal_id: sharedGoalId,
            user_id: inviterId,
            goal_id: friendInvite.goal_id,
          });
        }
      }

      if (sharedGoalId) {
        // Check if invitee already has a membership
        const { data: existingMembership } = await supabase
          .from('shared_goal_members')
          .select('id')
          .eq('shared_goal_id', sharedGoalId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingMembership) {
          // Create a copy of the goal for the invitee
          const { data: newGoal } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              name: goalData.name,
              emoji: goalData.emoji,
              category: goalData.category,
              target_value: goalData.target_value,
              deadline: goalData.deadline,
              task_frequency: goalData.task_frequency,
              start_date: new Date().toISOString().split('T')[0],
            })
            .select('id')
            .single();

          if (newGoal) {
            // Add invitee as member of the shared goal
            await supabase.from('shared_goal_members').insert({
              shared_goal_id: sharedGoalId,
              user_id: user.id,
              goal_id: newGoal.id,
            });
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
