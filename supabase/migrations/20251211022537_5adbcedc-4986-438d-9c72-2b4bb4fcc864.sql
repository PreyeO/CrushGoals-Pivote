-- Create table for tracking login attempts server-side
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_time timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts for tracking attempts
CREATE POLICY "Allow anonymous inserts for tracking"
ON public.login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow service role to read/manage (for cleanup)
CREATE POLICY "Service role full access"
ON public.login_attempts
FOR ALL
TO service_role
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);

-- Function to check rate limit (returns remaining attempts, 0 if locked out)
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(check_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count integer;
  lockout_until timestamp with time zone;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_count
  FROM login_attempts
  WHERE email = check_email
    AND success = false
    AND attempt_time > now() - interval '15 minutes';
  
  -- Max 5 attempts
  IF failed_count >= 5 THEN
    RETURN 0;
  END IF;
  
  RETURN 5 - failed_count;
END;
$$;

-- Function to record a login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(attempt_email text, attempt_success boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Record the attempt
  INSERT INTO login_attempts (email, success)
  VALUES (attempt_email, attempt_success);
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM login_attempts
  WHERE attempt_time < now() - interval '24 hours';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_login_rate_limit(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean) TO anon, authenticated;