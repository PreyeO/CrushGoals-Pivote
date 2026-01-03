-- Ensure new signups always get a 7-day trial
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Extend any existing trial subscriptions that were created with shorter trials
UPDATE public.subscriptions
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE status = 'trial'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at < created_at + INTERVAL '7 days';