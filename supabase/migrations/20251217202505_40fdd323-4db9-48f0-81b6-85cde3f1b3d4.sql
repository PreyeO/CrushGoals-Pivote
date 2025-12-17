-- Create SECURITY DEFINER function for admin to get all users data
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  plan text,
  subscription_status text,
  trial_ends_at timestamptz,
  total_xp integer,
  level integer,
  current_streak integer,
  goals_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    s.plan,
    s.status as subscription_status,
    s.trial_ends_at,
    COALESCE(us.total_xp, 0) as total_xp,
    COALESCE(us.level, 1) as level,
    COALESCE(us.current_streak, 0) as current_streak,
    COALESCE(g.goals_count, 0) as goals_count
  FROM profiles p
  LEFT JOIN subscriptions s ON s.user_id = p.user_id
  LEFT JOIN user_stats us ON us.user_id = p.user_id
  LEFT JOIN (
    SELECT goals.user_id, COUNT(*) as goals_count
    FROM goals
    GROUP BY goals.user_id
  ) g ON g.user_id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Create SECURITY DEFINER function for admin to get dashboard stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE (
  total_users bigint,
  active_subscribers bigint,
  trial_users bigint,
  total_goals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM subscriptions WHERE plan IN ('monthly', 'annual') AND status = 'active') as active_subscribers,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'trial') as trial_users,
    (SELECT COUNT(*) FROM goals) as total_goals;
END;
$$;

-- Create SECURITY DEFINER function for admin to get audit logs
CREATE OR REPLACE FUNCTION public.admin_get_audit_logs(limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  admin_id uuid,
  action text,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.admin_id,
    a.action,
    a.target_table,
    a.target_id,
    a.old_values,
    a.new_values,
    a.created_at
  FROM admin_audit_logs a
  ORDER BY a.created_at DESC
  LIMIT limit_count;
END;
$$;