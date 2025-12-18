import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';
import { useEmailService } from '@/hooks/useEmailService';

export interface SharedGoal {
  id: string;
  goal_id: string;
  owner_id: string;
  name: string;
  created_at: string;
  goal?: {
    name: string;
    emoji: string;
    category: string;
    target_value: string;
    deadline: string;
    task_frequency: string;
  };
  members_count?: number;
}

export interface SharedGoalMember {
  user_id: string;
  username: string;
  tasks_completed_today: number;
  tasks_completed_week: number;
  current_streak: number;
  goal_progress: number;
}

export interface SharedGoalInvite {
  id: string;
  shared_goal_id: string;
  invitee_email: string;
  status: string;
  invite_token: string;
  created_at: string;
  shared_goal?: SharedGoal;
}

export function useSharedGoals() {
  const { user, profile } = useAuth();
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [pendingInvites, setPendingInvites] = useState<SharedGoalInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sendSharedGoalInviteEmail } = useEmailService();

  const fetchSharedGoals = async () => {
    if (!user) return;

    try {
      // Get shared goals user owns or is member of
      const { data: ownedGoals, error: ownedError } = await supabase
        .from('shared_goals')
        .select(`
          *,
          goal:goals(name, emoji, category, target_value, deadline, task_frequency)
        `)
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Get shared goals user is member of
      const { data: memberOf, error: memberError } = await supabase
        .from('shared_goal_members')
        .select('shared_goal_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const memberGoalIds = memberOf?.map(m => m.shared_goal_id) || [];
      
      let memberGoals: SharedGoal[] = [];
      if (memberGoalIds.length > 0) {
        const { data: memberGoalsData, error: memberGoalsError } = await supabase
          .from('shared_goals')
          .select(`
            *,
            goal:goals(name, emoji, category, target_value, deadline, task_frequency)
          `)
          .in('id', memberGoalIds);

        if (memberGoalsError) throw memberGoalsError;
        memberGoals = (memberGoalsData as any) || [];
      }

      // Combine and dedupe
      const allGoals = [...(ownedGoals || []), ...memberGoals];
      const uniqueGoals = allGoals.filter((g, i, arr) => 
        arr.findIndex(x => x.id === g.id) === i
      );

      setSharedGoals(uniqueGoals as SharedGoal[]);

      // Get pending invites for user
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();

      if (profile?.email) {
        const { data: invites, error: invitesError } = await supabase
          .from('shared_goal_invites')
          .select(`
            *,
            shared_goal:shared_goals(
              *,
              goal:goals(name, emoji, category)
            )
          `)
          .eq('invitee_email', profile.email.toLowerCase())
          .eq('status', 'pending');

        if (invitesError) throw invitesError;
        setPendingInvites((invites as any) || []);
      }
    } catch (error) {
      logError('Error fetching shared goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSharedGoal = async (goalId: string, name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('shared_goals')
        .insert({
          goal_id: goalId,
          owner_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as member
      await supabase.from('shared_goal_members').insert({
        shared_goal_id: data.id,
        user_id: user.id,
        goal_id: goalId,
      });

      toast.success('Shared goal created!');
      await fetchSharedGoals();
      return data;
    } catch (error) {
      logError('Error creating shared goal:', error);
      toast.error('Failed to create shared goal');
      return null;
    }
  };

  const inviteToSharedGoal = async (sharedGoalId: string, email: string) => {
    if (!user) return false;

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      // Get shared goal details for the email
      const { data: sharedGoalData } = await supabase
        .from('shared_goals')
        .select(`
          name,
          goal:goals(name, emoji)
        `)
        .eq('id', sharedGoalId)
        .single();

      const { error } = await supabase
        .from('shared_goal_invites')
        .insert({
          shared_goal_id: sharedGoalId,
          inviter_id: user.id,
          invitee_email: email.toLowerCase().trim(),
          invitee_user_id: existingUser?.user_id || null,
        });

      if (error) throw error;

      // Send invite email (non-blocking)
      const goalInfo = sharedGoalData?.goal as { name: string; emoji: string } | null;
      const inviterName = profile?.full_name || profile?.username || 'A CrushGoals user';
      sendSharedGoalInviteEmail(
        email.toLowerCase().trim(),
        inviterName,
        goalInfo?.name || sharedGoalData?.name || 'a shared goal',
        goalInfo?.emoji || '🎯',
        !!existingUser
      ).catch(() => {
        // Silent fail - invitation already created in DB
      });

      toast.success('Invitation sent!', { description: `Sent to ${email}` });
      return true;
    } catch (error: any) {
      logError('Error inviting to shared goal:', error);
      if (error.code === '23505') {
        toast.error('Already invited');
      } else {
        toast.error('Failed to send invitation');
      }
      return false;
    }
  };

  const acceptInvite = async (inviteId: string, sharedGoalId: string, goalData: any) => {
    if (!user) return false;

    try {
      // Create a copy of the goal for the user
      const { data: newGoal, error: goalError } = await supabase
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
        .select()
        .single();

      if (goalError) throw goalError;

      // Add user as member
      const { error: memberError } = await supabase
        .from('shared_goal_members')
        .insert({
          shared_goal_id: sharedGoalId,
          user_id: user.id,
          goal_id: newGoal.id,
        });

      if (memberError) throw memberError;

      // Update invite status
      await supabase
        .from('shared_goal_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      toast.success('Joined shared goal!');
      await fetchSharedGoals();
      return true;
    } catch (error) {
      logError('Error accepting invite:', error);
      toast.error('Failed to join shared goal');
      return false;
    }
  };

  const declineInvite = async (inviteId: string) => {
    try {
      await supabase
        .from('shared_goal_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      toast.success('Invitation declined');
      await fetchSharedGoals();
    } catch (error) {
      logError('Error declining invite:', error);
    }
  };

  const getSharedGoalProgress = async (sharedGoalId: string): Promise<SharedGoalMember[]> => {
    try {
      const { data, error } = await supabase.rpc('get_shared_goal_progress', {
        p_shared_goal_id: sharedGoalId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError('Error fetching shared goal progress:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchSharedGoals();
  }, [user?.id]);

  return {
    sharedGoals,
    pendingInvites,
    isLoading,
    createSharedGoal,
    inviteToSharedGoal,
    acceptInvite,
    declineInvite,
    getSharedGoalProgress,
    refreshSharedGoals: fetchSharedGoals,
  };
}
