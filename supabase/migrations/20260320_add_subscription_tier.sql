-- Add subscription_tier column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'pro', 'business'));

-- Update existing profiles to have 'free' as default if they don't already
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;
