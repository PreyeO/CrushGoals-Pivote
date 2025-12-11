-- Drop the overly permissive RLS policy that exposes user emails
DROP POLICY IF EXISTS "Users can view profiles for leaderboard" ON profiles;