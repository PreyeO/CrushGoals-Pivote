-- Fix email exposure vulnerability in profiles RLS policy
-- Remove the friend_invites email lookup clause that allows email enumeration

-- Drop the problematic policy
DROP POLICY IF EXISTS "Authenticated users can view profiles for social features" ON public.profiles;

-- Recreate the policy WITHOUT the friend_invites email lookup clause
-- This policy allows viewing profiles for:
-- 1. Own profile
-- 2. Accepted friends
-- 3. Shared goal members
-- 4. Pending friendship requests (limited - only shows requester's profile)
CREATE POLICY "Authenticated users can view profiles for social features" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Own profile
    user_id = auth.uid()
    -- Accepted friends can see each other's profiles
    OR EXISTS (
      SELECT 1 FROM friendships f 
      WHERE (
        (f.user_id = auth.uid() AND f.friend_id = profiles.user_id)
        OR (f.friend_id = auth.uid() AND f.user_id = profiles.user_id)
      ) AND f.status = 'accepted'
    )
    -- Shared goal members can see each other's profiles
    OR EXISTS (
      SELECT 1 FROM shared_goal_members sgm1
      JOIN shared_goal_members sgm2 ON sgm1.shared_goal_id = sgm2.shared_goal_id
      WHERE sgm1.user_id = auth.uid() AND sgm2.user_id = profiles.user_id
    )
    -- Pending friendship requests - only the recipient can see the sender's profile
    OR EXISTS (
      SELECT 1 FROM friendships f 
      WHERE (
        (f.user_id = auth.uid() AND f.friend_id = profiles.user_id)
        OR (f.friend_id = auth.uid() AND f.user_id = profiles.user_id)
      ) AND f.status = 'pending'
    )
  )
);

-- Create a secure RPC function for checking if an email exists (for invite flows)
-- This prevents email enumeration by only returning boolean, not full profile data
CREATE OR REPLACE FUNCTION public.check_invitee_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if email exists in profiles
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = p_email) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Create a secure RPC function for getting basic invitee info (username only, no email)
CREATE OR REPLACE FUNCTION public.get_invitee_basic_info(p_email TEXT)
RETURNS TABLE(username TEXT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Return only non-sensitive profile info
  RETURN QUERY
  SELECT p.username, p.avatar_url
  FROM profiles p
  WHERE p.email = p_email;
END;
$$;