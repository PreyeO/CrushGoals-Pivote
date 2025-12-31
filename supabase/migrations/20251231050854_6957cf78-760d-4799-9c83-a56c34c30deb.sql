-- Update the subscription trigger to set 2-day trial instead of 3 days
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', NOW() + INTERVAL '2 days');
  RETURN NEW;
END;
$$;