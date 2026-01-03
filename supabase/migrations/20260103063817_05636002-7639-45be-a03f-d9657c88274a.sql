-- Fix 1: Consolidate profiles SELECT policies to prevent data exposure
-- Drop duplicate/redundant SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile with all fields" ON public.profiles;

-- Create single consolidated policy for users viewing their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix 2: Add missing policies to email_verification_otps table
-- These operations should only be done via database functions, not direct access
-- But we need explicit DENY by having no permissive policies for these operations
-- The table already has RLS enabled, so with no INSERT/UPDATE/DELETE policies, 
-- these operations are denied. This is correct behavior.

-- Fix 3: Enable RLS and add policies to login_attempts table
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Login attempts should only be accessible via database functions (check_login_rate_limit, record_login_attempt)
-- No direct user access should be allowed - the security definer functions handle this
-- By enabling RLS with no policies, all direct access is denied, which is correct