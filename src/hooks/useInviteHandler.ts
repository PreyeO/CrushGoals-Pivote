import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export function useInviteHandler() {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processInviteToken = async () => {
      if (!user || !profile || isProcessing) return;

      // Check for invite token in URL
      const urlParams = new URLSearchParams(window.location.search);
      let inviteToken = urlParams.get('invite');
      
      // Also check localStorage (saved during signup)
      if (!inviteToken) {
        inviteToken = localStorage.getItem('pendingInviteToken');
      }

      if (!inviteToken) return;

      setIsProcessing(true);

      try {
        // Clear URL param and localStorage
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('invite');
        window.history.replaceState({}, '', newUrl.pathname);
        localStorage.removeItem('pendingInviteToken');

        // Look up friend invite by token
        const { data: friendInvite, error: friendInviteError } = await supabase
          .from('friend_invites')
          .select('*, goals(*)')
          .eq('invite_token', inviteToken)
          .eq('status', 'pending')
          .maybeSingle();

        if (friendInvite) {
          // Process friend invite
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

          // Update friend invite status
          await supabase
            .from('friend_invites')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', friendInvite.id);

          toast.success('You\'ve joined your friend\'s goal! 🎉');
        }
      } catch (error) {
        logError('Error processing invite:', error);
        toast.error('Failed to process invite');
      } finally {
        setIsProcessing(false);
      }
    };

    processInviteToken();
  }, [user, profile, isProcessing]);

  return { isProcessing };
}