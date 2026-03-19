-- Add Telegram fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_user_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_link_code TEXT;

-- Index for fast lookups by link code and telegram ID
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_user_id ON public.profiles(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_link_code ON public.profiles(telegram_link_code);
