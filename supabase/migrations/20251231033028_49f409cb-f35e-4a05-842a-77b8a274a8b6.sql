-- Create a secure function to get social profiles without exposing email
CREATE OR REPLACE FUNCTION public.get_social_profiles(p_user_ids UUID[])
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  show_on_leaderboard BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.show_on_leaderboard
  FROM profiles p
  WHERE p.user_id = ANY(p_user_ids)
  AND (
    -- Can always see own profile
    p.user_id = auth.uid()
    -- Can see accepted friends
    OR EXISTS (
      SELECT 1 FROM friendships f
      WHERE ((f.user_id = auth.uid() AND f.friend_id = p.user_id) 
          OR (f.friend_id = auth.uid() AND f.user_id = p.user_id))
      AND f.status = 'accepted'
    )
    -- Can see shared goal members
    OR EXISTS (
      SELECT 1 FROM shared_goal_members sgm1
      JOIN shared_goal_members sgm2 ON sgm1.shared_goal_id = sgm2.shared_goal_id
      WHERE sgm1.user_id = auth.uid() AND sgm2.user_id = p.user_id
    )
    -- Can see pending friend requests
    OR EXISTS (
      SELECT 1 FROM friendships f
      WHERE ((f.user_id = auth.uid() AND f.friend_id = p.user_id) 
          OR (f.friend_id = auth.uid() AND f.user_id = p.user_id))
      AND f.status = 'pending'
    )
  );
END;
$$;

-- Update profiles RLS policy to restrict email access to own profile only
DROP POLICY IF EXISTS "Authenticated users can view profiles for social features" ON profiles;

-- New policy: Only allow viewing own profile with all fields
CREATE POLICY "Users can view own profile with all fields"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Note: Social profile access (without email) is now handled via the get_social_profiles function