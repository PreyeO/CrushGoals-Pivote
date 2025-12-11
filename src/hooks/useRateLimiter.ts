import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRateLimiter() {
  const checkRateLimit = useCallback(async (email: string): Promise<{ allowed: boolean; remainingAttempts: number }> => {
    try {
      const { data, error } = await supabase.rpc('check_login_rate_limit', {
        check_email: email.toLowerCase().trim()
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // Fail open - allow attempt if rate limit check fails
        return { allowed: true, remainingAttempts: 5 };
      }

      const remaining = data as number;
      return { allowed: remaining > 0, remainingAttempts: remaining };
    } catch {
      return { allowed: true, remainingAttempts: 5 };
    }
  }, []);

  const recordAttempt = useCallback(async (email: string, success: boolean) => {
    try {
      await supabase.rpc('record_login_attempt', {
        attempt_email: email.toLowerCase().trim(),
        attempt_success: success
      });
    } catch (error) {
      console.error('Failed to record login attempt:', error);
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
  };
}
