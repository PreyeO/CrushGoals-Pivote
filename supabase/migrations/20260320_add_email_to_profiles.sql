-- Add email column to profiles table for easier lookups
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update existing profiles with their email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');
