-- Add stricter admin rate limiting functions
CREATE OR REPLACE FUNCTION public.check_admin_login_rate_limit(check_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  failed_count integer;
BEGIN
  -- Count failed attempts in last 30 minutes (stricter than regular 15 min)
  SELECT COUNT(*) INTO failed_count
  FROM login_attempts
  WHERE email = check_email
    AND success = false
    AND attempt_time > now() - interval '30 minutes';
  
  -- Max 3 attempts (stricter than regular 5)
  IF failed_count >= 3 THEN
    RETURN 0;
  END IF;
  
  RETURN 3 - failed_count;
END;
$$;

-- Update leaderboard function to exclude admin users
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
    p.full_name AS display_name,
    COALESCE(us.tasks_completed, 0) AS tasks_completed,
    COALESCE(us.current_streak, 0) AS current_streak,
    COALESCE(us.total_xp, 0) AS total_xp,
    COALESCE(us.level, 1) AS level
  FROM user_stats us
  LEFT JOIN profiles p ON p.user_id = us.user_id
  -- Exclude admin users from leaderboard
  WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = us.user_id 
    AND ur.role = 'admin'
  )
  ORDER BY us.total_xp DESC NULLS LAST
  LIMIT limit_count;
END;
$$;