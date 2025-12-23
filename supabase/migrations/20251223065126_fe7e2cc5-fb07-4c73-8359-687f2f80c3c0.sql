-- Create shared goal comments/encouragement table
CREATE TABLE public.shared_goal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_goal_id UUID NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'encouragement', 'celebration'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared goal activity log for real-time notifications
CREATE TABLE public.shared_goal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_goal_id UUID NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'task_completed', 'goal_joined', 'streak_milestone'
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.shared_goal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goal_activities ENABLE ROW LEVEL SECURITY;

-- Comments policies - members can view and create comments
CREATE POLICY "Members can view shared goal comments"
ON public.shared_goal_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_goal_members sgm 
    WHERE sgm.shared_goal_id = shared_goal_comments.shared_goal_id 
    AND sgm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.shared_goals sg 
    WHERE sg.id = shared_goal_comments.shared_goal_id 
    AND sg.owner_id = auth.uid()
  )
);

CREATE POLICY "Members can create comments"
ON public.shared_goal_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.shared_goal_members sgm 
      WHERE sgm.shared_goal_id = shared_goal_comments.shared_goal_id 
      AND sgm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.shared_goals sg 
      WHERE sg.id = shared_goal_comments.shared_goal_id 
      AND sg.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.shared_goal_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Activities policies - members can view activities
CREATE POLICY "Members can view shared goal activities"
ON public.shared_goal_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_goal_members sgm 
    WHERE sgm.shared_goal_id = shared_goal_activities.shared_goal_id 
    AND sgm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.shared_goals sg 
    WHERE sg.id = shared_goal_activities.shared_goal_id 
    AND sg.owner_id = auth.uid()
  )
);

CREATE POLICY "Members can create activities"
ON public.shared_goal_activities
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.shared_goal_members sgm 
      WHERE sgm.shared_goal_id = shared_goal_activities.shared_goal_id 
      AND sgm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.shared_goals sg 
      WHERE sg.id = shared_goal_activities.shared_goal_id 
      AND sg.owner_id = auth.uid()
    )
  )
);

-- Enable realtime for activities (for live notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_goal_activities;

-- Create index for faster queries
CREATE INDEX idx_shared_goal_comments_shared_goal_id ON public.shared_goal_comments(shared_goal_id);
CREATE INDEX idx_shared_goal_activities_shared_goal_id ON public.shared_goal_activities(shared_goal_id);
CREATE INDEX idx_shared_goal_activities_created_at ON public.shared_goal_activities(created_at DESC);