-- Tighten profile visibility: remove leaderboard-based broad access
DROP POLICY IF EXISTS "Authenticated users can view profiles for social features" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles for social features"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() IS NOT NULL)
  AND (
    (user_id = auth.uid())
    OR (
      EXISTS (
        SELECT 1
        FROM friendships f
        WHERE (
          (
            ((f.user_id = auth.uid()) AND (f.friend_id = profiles.user_id))
            OR ((f.friend_id = auth.uid()) AND (f.user_id = profiles.user_id))
          )
          AND (f.status = 'accepted')
        )
      )
    )
    OR (
      EXISTS (
        SELECT 1
        FROM (shared_goal_members sgm1
          JOIN shared_goal_members sgm2 ON (sgm1.shared_goal_id = sgm2.shared_goal_id))
        WHERE (sgm1.user_id = auth.uid())
          AND (sgm2.user_id = profiles.user_id)
      )
    )
    OR (
      EXISTS (
        SELECT 1
        FROM friendships f
        WHERE (
          (
            ((f.user_id = auth.uid()) AND (f.friend_id = profiles.user_id))
            OR ((f.friend_id = auth.uid()) AND (f.user_id = profiles.user_id))
          )
          AND (f.status = 'pending')
        )
      )
    )
    OR (
      EXISTS (
        SELECT 1
        FROM friend_invites fi
        WHERE (fi.inviter_id = auth.uid())
          AND (fi.invitee_email = profiles.email)
      )
    )
  )
);


-- Prevent OTP theft/bypass: users should never be able to read or write OTP rows directly
DROP POLICY IF EXISTS "Users can view their own OTPs" ON public.email_verification_otps;
DROP POLICY IF EXISTS "Users can create OTPs" ON public.email_verification_otps;
DROP POLICY IF EXISTS "Users can update their own OTPs" ON public.email_verification_otps;

REVOKE ALL ON TABLE public.email_verification_otps FROM anon, authenticated;


-- Protect login_attempts: only security-definer functions should touch this table
DROP POLICY IF EXISTS "Allow anonymous inserts for tracking" ON public.login_attempts;
DROP POLICY IF EXISTS "Service role full access" ON public.login_attempts;

REVOKE ALL ON TABLE public.login_attempts FROM anon, authenticated;
