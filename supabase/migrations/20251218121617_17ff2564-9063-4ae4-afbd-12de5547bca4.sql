-- Create table to store OTP verification codes
CREATE TABLE public.email_verification_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_verification_otps ENABLE ROW LEVEL SECURITY;

-- Users can only view their own OTPs
CREATE POLICY "Users can view their own OTPs"
ON public.email_verification_otps
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own OTPs (for marking verified)
CREATE POLICY "Users can update their own OTPs"
ON public.email_verification_otps
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow insert for authenticated users
CREATE POLICY "Users can create OTPs"
ON public.email_verification_otps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to generate and store OTP
CREATE OR REPLACE FUNCTION public.generate_email_otp(p_user_id UUID, p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_otp TEXT;
BEGIN
  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Delete any existing OTPs for this user
  DELETE FROM email_verification_otps WHERE user_id = p_user_id;
  
  -- Insert new OTP
  INSERT INTO email_verification_otps (user_id, email, otp_code)
  VALUES (p_user_id, p_email, v_otp);
  
  RETURN v_otp;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_email_otp(p_user_id UUID, p_otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Verify OTP
  IF v_record.otp_code = p_otp THEN
    -- Mark as verified
    UPDATE email_verification_otps
    SET verified = true
    WHERE id = v_record.id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Index for faster lookups
CREATE INDEX idx_email_otp_user_id ON public.email_verification_otps(user_id);
CREATE INDEX idx_email_otp_expires_at ON public.email_verification_otps(expires_at);