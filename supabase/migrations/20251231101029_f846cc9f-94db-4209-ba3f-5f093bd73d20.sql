-- Fix: Restrict goal_templates access to authenticated users only
-- This prevents unauthenticated access to business-sensitive template data

-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view templates" ON public.goal_templates;

-- Create new policy that requires authentication to view templates
CREATE POLICY "Authenticated users can view templates" 
ON public.goal_templates 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);