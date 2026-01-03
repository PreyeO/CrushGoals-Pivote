import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  friend_profile?: {
    user_id: string;
    full_name: string;
    username?: string;
  };
  user_profile?: {
    user_id: string;
    full_name: string;
    username?: string;
  };
}

export interface FriendWithStats {
  user_id: string;
  name: string;
  avatar: string;
  tasks_completed: number;
  current_streak: number;
  total_xp: number;
  level: number;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendsWithStats, setFriendsWithStats] = useState<FriendWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // Get accepted friends where user sent the request
      const { data: sentFriends, error: sentError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (sentError) throw sentError;

      // Get accepted friends where user received the request
      const { data: receivedFriends, error: receivedError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      if (receivedError) throw receivedError;

      // Get pending requests sent to user
      const { data: pending, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get friend IDs
      const friendIds = [
        ...(sentFriends?.map(f => f.friend_id) || []),
        ...(receivedFriends?.map(f => f.user_id) || [])
      ];

      // Get pending request user IDs
      const pendingUserIds = pending?.map(f => f.user_id) || [];

      // Fetch profiles for friends using secure RPC (no email exposure)
      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .rpc('get_social_profiles', { p_user_ids: friendIds });

        const { data: stats } = await supabase
          .from('user_stats')
          .select('user_id, tasks_completed, current_streak, total_xp, level')
          .in('user_id', friendIds);

        const friendsData: FriendWithStats[] = friendIds.map(friendId => {
          const profile = profiles?.find((p: { user_id: string }) => p.user_id === friendId);
          const stat = stats?.find(s => s.user_id === friendId);
          return {
            user_id: friendId,
            name: profile?.full_name || 'Unknown',
            avatar: (profile?.full_name || 'U').charAt(0).toUpperCase(),
            tasks_completed: stat?.tasks_completed || 0,
            current_streak: stat?.current_streak || 0,
            total_xp: stat?.total_xp || 0,
            level: stat?.level || 1,
          };
        });

        setFriendsWithStats(friendsData.sort((a, b) => b.total_xp - a.total_xp));
      } else {
        setFriendsWithStats([]);
      }

      // Fetch profiles for pending requests using secure RPC (no email exposure)
      if (pendingUserIds.length > 0) {
        const { data: pendingProfiles } = await supabase
          .rpc('get_social_profiles', { p_user_ids: pendingUserIds });

        const enrichedPending = pending?.map(p => ({
          ...p,
          status: p.status as 'pending' | 'accepted' | 'rejected',
          user_profile: pendingProfiles?.find((pr: { user_id: string }) => pr.user_id === p.user_id),
        })) || [];

        setPendingRequests(enrichedPending);
      } else {
        setPendingRequests([]);
      }

      setFriends([...(sentFriends || []), ...(receivedFriends || [])] as Friend[]);
    } catch (error) {
      logError('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (email: string) => {
    if (!user) return false;

    try {
      // Check if user exists using secure RPC (avoids email enumeration)
      const { data: userExists, error: existsError } = await supabase.rpc('check_invitee_email_exists', {
        p_email: email.toLowerCase().trim()
      });

      if (existsError) throw existsError;

      if (!userExists) {
        toast.error('User not found', { description: 'No user with that email exists.' });
        return false;
      }

      // Get basic user info using secure RPC
      const { data: basicInfo, error: infoError } = await supabase.rpc('get_invitee_basic_info', {
        p_email: email.toLowerCase().trim()
      });

      if (infoError) throw infoError;

      // We need to get the user_id - use an edge function or RPC for this
      // For now, create a friend invite instead of direct friendship
      // The friendship will be established when they accept
      const displayName = basicInfo?.[0]?.username || 'this user';
      
      // Check own email to prevent self-add
      const { data: ownProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();
      
      if (ownProfile?.email?.toLowerCase() === email.toLowerCase().trim()) {
        toast.error("You can't add yourself as a friend!");
        return false;
      }

      // Since we can't get the target user_id directly due to RLS,
      // we create a friend_invite record instead. The friendship
      // will be established when the invitee processes it.
      const { error: inviteError } = await supabase
        .from('friend_invites')
        .insert({
          inviter_id: user.id,
          invitee_email: email.toLowerCase().trim(),
        });

      if (inviteError) {
        // Check for duplicate
        if (inviteError.code === '23505') {
          toast.info('Friend request already sent to this email!');
          return false;
        }
        throw inviteError;
      }

      toast.success('Friend request sent!', { description: `Sent to ${displayName}` });
      return true;
    } catch (error) {
      logError('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request accepted!');
      await fetchFriends();
    } catch (error) {
      logError('Error accepting friend request:', error);
      toast.error('Failed to accept request');
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request declined');
      await fetchFriends();
    } catch (error) {
      logError('Error rejecting friend request:', error);
      toast.error('Failed to decline request');
    }
  };

  const removeFriend = async (friendUserId: string) => {
    if (!user) return;

    try {
      // Delete friendship in either direction (using separate queries to avoid string interpolation)
      const { error: error1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendUserId);

      const { error: error2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendUserId)
        .eq('friend_id', user.id);

      const error = error1 || error2;

      if (error) throw error;

      toast.success('Friend removed');
      await fetchFriends();
    } catch (error) {
      logError('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user?.id]);

  return {
    friends,
    friendsWithStats,
    pendingRequests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends: fetchFriends,
  };
}
