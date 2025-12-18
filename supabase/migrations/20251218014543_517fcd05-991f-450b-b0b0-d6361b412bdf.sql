-- Create function for time-based leaderboard filtering
CREATE OR REPLACE FUNCTION public.get_leaderboard_data_filtered(
  limit_count integer DEFAULT 50,
  time_filter text DEFAULT 'alltime'
)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  tasks_completed integer,
  current_streak integer,
  total_xp integer,
  level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF time_filter = 'week' THEN
    -- Return users who have had activity in the last 7 days
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
    WHERE p.show_on_leaderboard = true
    AND us.last_activity_date >= CURRENT_DATE - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = us.user_id 
      AND ur.role = 'admin'
    )
    ORDER BY us.total_xp DESC NULLS LAST
    LIMIT limit_count;
  ELSE
    -- Return all-time leaderboard
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
    WHERE p.show_on_leaderboard = true
    AND NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = us.user_id 
      AND ur.role = 'admin'
    )
    ORDER BY us.total_xp DESC NULLS LAST
    LIMIT limit_count;
  END IF;
END;
$$;

-- Create shared_goals table for group goal tracking
CREATE TABLE public.shared_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create shared_goal_members table
CREATE TABLE public.shared_goal_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_goal_id uuid NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(shared_goal_id, user_id)
);

-- Create shared_goal_invites table for pending invitations
CREATE TABLE public.shared_goal_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_goal_id uuid NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL,
  invitee_email text NOT NULL,
  invitee_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  invite_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on new tables
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goal_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_goals
CREATE POLICY "Users can view shared goals they own or are members of"
ON public.shared_goals FOR SELECT
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM shared_goal_members sgm 
    WHERE sgm.shared_goal_id = id AND sgm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create shared goals"
ON public.shared_goals FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update shared goals"
ON public.shared_goals FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete shared goals"
ON public.shared_goals FOR DELETE
USING (auth.uid() = owner_id);

-- RLS policies for shared_goal_members
CREATE POLICY "Members can view their shared goal members"
ON public.shared_goal_members FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM shared_goals sg 
    WHERE sg.id = shared_goal_id AND sg.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM shared_goal_members sgm2 
    WHERE sgm2.shared_goal_id = shared_goal_id AND sgm2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join shared goals"
ON public.shared_goal_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave shared goals"
ON public.shared_goal_members FOR DELETE
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM shared_goals sg WHERE sg.id = shared_goal_id AND sg.owner_id = auth.uid()
));

-- RLS policies for shared_goal_invites
CREATE POLICY "Inviters and invitees can view invites"
ON public.shared_goal_invites FOR SELECT
USING (
  inviter_id = auth.uid() OR 
  invitee_user_id = auth.uid() OR
  invitee_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create invites for their shared goals"
ON public.shared_goal_invites FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id AND
  EXISTS (
    SELECT 1 FROM shared_goals sg WHERE sg.id = shared_goal_id AND sg.owner_id = auth.uid()
  )
);

CREATE POLICY "Inviters can update invites"
ON public.shared_goal_invites FOR UPDATE
USING (inviter_id = auth.uid() OR invitee_user_id = auth.uid());

CREATE POLICY "Inviters can delete invites"
ON public.shared_goal_invites FOR DELETE
USING (inviter_id = auth.uid());

-- Function to get shared goal progress for members
CREATE OR REPLACE FUNCTION public.get_shared_goal_progress(p_shared_goal_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  tasks_completed_today integer,
  tasks_completed_week integer,
  current_streak integer,
  goal_progress integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is a member or owner
  IF NOT EXISTS (
    SELECT 1 FROM shared_goal_members sgm WHERE sgm.shared_goal_id = p_shared_goal_id AND sgm.user_id = auth.uid()
    UNION
    SELECT 1 FROM shared_goals sg WHERE sg.id = p_shared_goal_id AND sg.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    sgm.user_id,
    COALESCE(p.username, 'Anonymous') AS username,
    (SELECT COUNT(*)::integer FROM tasks t WHERE t.user_id = sgm.user_id AND t.goal_id = sgm.goal_id AND t.completed = true AND t.completed_at::date = CURRENT_DATE) AS tasks_completed_today,
    (SELECT COUNT(*)::integer FROM tasks t WHERE t.user_id = sgm.user_id AND t.goal_id = sgm.goal_id AND t.completed = true AND t.completed_at >= CURRENT_DATE - INTERVAL '7 days') AS tasks_completed_week,
    COALESCE(us.current_streak, 0) AS current_streak,
    COALESCE(g.progress, 0) AS goal_progress
  FROM shared_goal_members sgm
  LEFT JOIN profiles p ON p.user_id = sgm.user_id
  LEFT JOIN user_stats us ON us.user_id = sgm.user_id
  LEFT JOIN goals g ON g.id = sgm.goal_id
  WHERE sgm.shared_goal_id = p_shared_goal_id
  ORDER BY goal_progress DESC;
END;
$$;