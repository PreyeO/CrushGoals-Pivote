-- Fix OTP generation to use cryptographically secure random and add rate limiting
CREATE OR REPLACE FUNCTION public.generate_email_otp(p_user_id uuid, p_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_otp TEXT;
  v_recent_count INTEGER;
BEGIN
  -- Rate limit: max 5 OTP generations per user per 10 minutes
  SELECT COUNT(*) INTO v_recent_count
  FROM email_verification_otps
  WHERE user_id = p_user_id
    AND created_at > now() - interval '10 minutes';
  
  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many OTP requests. Please wait before requesting another code.';
  END IF;

  -- Generate 6-digit OTP using cryptographically secure random bytes
  -- gen_random_bytes(3) gives 3 bytes = 24 bits of entropy
  -- We convert to integer and modulo 1000000 for 6 digits
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