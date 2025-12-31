-- Add payment_history table for tracking transactions
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  payment_provider TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Add trial_reminder_sent column to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_reminder_sent BOOLEAN DEFAULT false;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_reminder ON public.subscriptions(status, trial_ends_at) WHERE status = 'trial';