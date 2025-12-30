-- Drop and recreate the broken shared_goals SELECT policy
DROP POLICY IF EXISTS "Users can view shared goals they own or are members of" ON public.shared_goals;

CREATE POLICY "Users can view shared goals they own or are members of" 
ON public.shared_goals 
FOR SELECT 
USING (
  (owner_id = auth.uid()) 
  OR 
  (EXISTS (
    SELECT 1 FROM shared_goal_members sgm
    WHERE sgm.shared_goal_id = shared_goals.id AND sgm.user_id = auth.uid()
  ))
);

-- Drop and recreate the broken shared_goal_members SELECT policy
DROP POLICY IF EXISTS "Members can view their shared goal members" ON public.shared_goal_members;

CREATE POLICY "Members can view their shared goal members" 
ON public.shared_goal_members 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR 
  (EXISTS (
    SELECT 1 FROM shared_goals sg
    WHERE sg.id = shared_goal_members.shared_goal_id AND sg.owner_id = auth.uid()
  ))
  OR
  (EXISTS (
    SELECT 1 FROM shared_goal_members sgm2
    WHERE sgm2.shared_goal_id = shared_goal_members.shared_goal_id AND sgm2.user_id = auth.uid()
  ))
);