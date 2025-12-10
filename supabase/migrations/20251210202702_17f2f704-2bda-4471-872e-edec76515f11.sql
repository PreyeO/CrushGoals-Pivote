-- Create a function to get leaderboard data securely
-- This function allows fetching user names for leaderboard without exposing emails
CREATE OR REPLACE FUNCTION public.get_leaderboard_data(limit_count INT DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  tasks_completed INT,
  current_streak INT,
  total_xp INT,
  level INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  ORDER BY us.total_xp DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users only
REVOKE ALL ON FUNCTION public.get_leaderboard_data(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_data(INT) TO authenticated;