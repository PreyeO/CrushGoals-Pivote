-- Enable RLS on login_attempts table
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Block all other access to login_attempts (managed via edge functions with service role)
CREATE POLICY "Deny all direct access"
ON login_attempts
FOR ALL
USING (false);

-- Add policy for email_verification_otps to deny anonymous access
CREATE POLICY "Deny anonymous access to OTPs"
ON email_verification_otps
FOR ALL
TO anon
USING (false);

-- Add admin access to email_verification_otps for management
CREATE POLICY "Admins can manage OTPs"
ON email_verification_otps
FOR ALL
USING (has_role(auth.uid(), 'admin'));