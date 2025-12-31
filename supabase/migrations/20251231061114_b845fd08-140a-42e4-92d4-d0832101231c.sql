-- Create constant-time comparison function to prevent timing attacks
CREATE OR REPLACE FUNCTION public.constant_time_compare(a TEXT, b TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result INTEGER := 0;
  i INTEGER;
  len_a INTEGER;
  len_b INTEGER;
BEGIN
  len_a := LENGTH(a);
  len_b := LENGTH(b);
  
  -- Always compare full length to prevent timing leak on length
  IF len_a != len_b THEN
    -- Still do the comparison loop to maintain constant time
    FOR i IN 1..GREATEST(len_a, len_b) LOOP
      result := result | 1;
    END LOOP;
    RETURN FALSE;
  END IF;
  
  -- XOR each character to accumulate differences
  FOR i IN 1..len_a LOOP
    result := result | (ASCII(SUBSTRING(a FROM i FOR 1)) # ASCII(SUBSTRING(b FROM i FOR 1)));
  END LOOP;
  
  RETURN result = 0;
END;
$$;

-- Update verify_email_otp to use constant-time comparison
CREATE OR REPLACE FUNCTION public.verify_email_otp(p_user_id uuid, p_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record email_verification_otps%ROWTYPE;
BEGIN
  -- Get the OTP record
  SELECT * INTO v_record
  FROM email_verification_otps
  WHERE user_id = p_user_id
    AND verified = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if OTP exists
  IF v_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check attempts (max 5)
  IF v_record.attempts >= 5 THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE email_verification_otps
  SET attempts = attempts + 1
  WHERE id = v_record.id;
  
  -- Use constant-time comparison to prevent timing attacks
  IF constant_time_compare(v_record.otp_code, p_otp) THEN
    -- Mark as verified
    UPDATE email_verification_otps
    SET verified = true
    WHERE id = v_record.id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;