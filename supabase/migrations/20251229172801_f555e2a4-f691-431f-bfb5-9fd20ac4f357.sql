-- Add policy to allow authenticated users to view profiles for social features
-- This enables friend invites, shared goals, and leaderboard functionality

CREATE POLICY "Authenticated users can view profiles for social features"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- Users can always view their own profile
    user_id = auth.uid()
    -- Users can view profiles of their friends
    OR EXISTS (
      SELECT 1 FROM friendships f
      WHERE ((f.user_id = auth.uid() AND f.friend_id = profiles.user_id)
      OR (f.friend_id = auth.uid() AND f.user_id = profiles.user_id))
      AND f.status = 'accepted'
    )
    -- Users can view profiles of shared goal members
    OR EXISTS (
      SELECT 1 FROM shared_goal_members sgm1
      JOIN shared_goal_members sgm2 ON sgm1.shared_goal_id = sgm2.shared_goal_id
      WHERE sgm1.user_id = auth.uid() AND sgm2.user_id = profiles.user_id
    )
    -- Users can view profiles of pending friend requests (both directions)
    OR EXISTS (
      SELECT 1 FROM friendships f
      WHERE ((f.user_id = auth.uid() AND f.friend_id = profiles.user_id)
      OR (f.friend_id = auth.uid() AND f.user_id = profiles.user_id))
      AND f.status = 'pending'
    )
    -- Users can look up profiles by email for sending invites
    OR EXISTS (
      SELECT 1 FROM friend_invites fi
      WHERE fi.inviter_id = auth.uid() AND fi.invitee_email = profiles.email
    )
    -- Users on leaderboard can be viewed by anyone authenticated
    OR show_on_leaderboard = true
  )
);