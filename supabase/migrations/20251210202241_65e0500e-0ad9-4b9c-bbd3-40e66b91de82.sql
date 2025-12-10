-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view stats for leaderboard" ON public.user_stats;

-- Create a new policy that only allows authenticated users to view leaderboard stats
CREATE POLICY "Authenticated users can view stats for leaderboard" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() IS NOT NULL);