-- Update the handle_new_user function to include username and show_on_leaderboard
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile with username from metadata
  INSERT INTO public.profiles (user_id, full_name, email, username, show_on_leaderboard)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'), 
    NEW.email,
    LOWER(NEW.raw_user_meta_data ->> 'username'),
    COALESCE((NEW.raw_user_meta_data ->> 'show_on_leaderboard')::boolean, true)
  );
  
  -- Create user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create user role (default to user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create free trial subscription (3 days as per requirements)
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', NOW() + INTERVAL '3 days');
  
  RETURN NEW;
END;
$$;