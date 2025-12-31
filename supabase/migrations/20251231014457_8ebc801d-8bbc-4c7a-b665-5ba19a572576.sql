-- Fix email_verification_otps missing RLS policies
-- This table should only be accessible via RPC functions

-- Enable RLS on email_verification_otps (should already be enabled)
ALTER TABLE public.email_verification_otps ENABLE ROW LEVEL SECURITY;

-- Revoke direct access - all access should be through RPC functions
REVOKE ALL ON public.email_verification_otps FROM authenticated;
REVOKE ALL ON public.email_verification_otps FROM anon;

-- Grant access to service_role for RPC functions (SECURITY DEFINER functions)
GRANT ALL ON public.email_verification_otps TO service_role;

-- Also fix the login_attempts table which should also not be directly accessible
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.login_attempts FROM authenticated;
REVOKE ALL ON public.login_attempts FROM anon;
GRANT ALL ON public.login_attempts TO service_role;