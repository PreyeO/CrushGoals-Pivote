-- Add username and leaderboard opt-in to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT false;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the get_leaderboard_data function to use usernames and respect opt-in
CREATE OR REPLACE FUNCTION public.get_leaderboard_data(limit_count integer DEFAULT 50)
RETURNS TABLE(user_id uuid, display_name text, tasks_completed integer, current_streak integer, total_xp integer, level integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id,
    COALESCE(p.username, 'Anonymous') AS display_name,
    COALESCE(us.tasks_completed, 0) AS tasks_completed,
    COALESCE(us.current_streak, 0) AS current_streak,
    COALESCE(us.total_xp, 0) AS total_xp,
    COALESCE(us.level, 1) AS level
  FROM user_stats us
  LEFT JOIN profiles p ON p.user_id = us.user_id
  -- Only show users who opted in to leaderboard
  WHERE p.show_on_leaderboard = true
  -- Exclude admin users from leaderboard
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = us.user_id 
    AND ur.role = 'admin'
  )
  ORDER BY us.total_xp DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

-- Add goal pausing fields
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT;