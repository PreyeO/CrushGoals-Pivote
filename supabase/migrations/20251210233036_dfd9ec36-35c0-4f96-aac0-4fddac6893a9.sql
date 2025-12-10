-- Add task_frequency column to goals table
ALTER TABLE public.goals 
ADD COLUMN task_frequency text DEFAULT 'daily' CHECK (task_frequency IN ('daily', 'weekly', 'biweekly', 'monthly'));

-- Add comment
COMMENT ON COLUMN public.goals.task_frequency IS 'How often tasks should be generated: daily, weekly, biweekly, monthly';