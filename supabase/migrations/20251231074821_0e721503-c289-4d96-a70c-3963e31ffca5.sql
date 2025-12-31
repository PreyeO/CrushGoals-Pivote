-- Enable RLS on email_verification_otps table (if not already enabled)
ALTER TABLE public.email_verification_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own OTP records
CREATE POLICY "Users can view their own OTPs"
ON public.email_verification_otps
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only database functions (SECURITY DEFINER) should insert/update OTPs
-- No direct user insert/update policies - handled by generate_email_otp and verify_email_otp functions