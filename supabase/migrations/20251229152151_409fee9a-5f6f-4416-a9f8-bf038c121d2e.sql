-- Fix 1: Add database-level rate limiting to generate_email_otp function
CREATE OR REPLACE FUNCTION public.generate_email_otp(p_user_id uuid, p_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_otp TEXT;
  v_recent_count INTEGER;
  v_last_created TIMESTAMPTZ;
BEGIN
  -- Rate limit: Check last OTP creation time (must wait 1 minute between requests)
  SELECT created_at INTO v_last_created
  FROM email_verification_otps
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_last_created IS NOT NULL AND v_last_created > now() - interval '1 minute' THEN
    RAISE EXCEPTION 'Please wait before requesting another verification code';
  END IF;

  -- Rate limit: max 5 OTP generations per user per 10 minutes
  SELECT COUNT(*) INTO v_recent_count
  FROM email_verification_otps
  WHERE user_id = p_user_id
    AND created_at > now() - interval '10 minutes';
  
  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many OTP requests. Please wait before requesting another code.';
  END IF;

  -- Generate 6-digit OTP using cryptographically secure random bytes
  v_otp := LPAD(
    (('x' || encode(gen_random_bytes(3), 'hex'))::bit(24)::int % 1000000)::TEXT, 
    6, 
    '0'
  );
  
  -- Delete any existing OTPs for this user
  DELETE FROM email_verification_otps WHERE user_id = p_user_id;
  
  -- Insert new OTP
  INSERT INTO email_verification_otps (user_id, email, otp_code)
  VALUES (p_user_id, p_email, v_otp);
  
  RETURN v_otp;
END;
$function$;

-- Fix 2: Drop the existing overly permissive policy and replace with one that respects show_on_leaderboard
DROP POLICY IF EXISTS "Authenticated users can view stats for leaderboard" ON public.user_stats;

-- Create new policy that respects user's leaderboard visibility preference
CREATE POLICY "Authenticated users can view public stats"
ON public.user_stats
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR -- Users can always see their own stats
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = user_stats.user_id 
      AND p.show_on_leaderboard = true
    )
  )
);