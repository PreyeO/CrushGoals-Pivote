import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

export function useAdminRateLimiter() {
  const checkRateLimit = useCallback(async (email: string): Promise<{ allowed: boolean; remainingAttempts: number }> => {
    try {
      const { data, error } = await supabase.rpc('check_admin_login_rate_limit', {
        check_email: email.toLowerCase().trim()
      });

      if (error) {
        logError('Admin rate limit check error:', error);
        // Fail closed for admin - deny attempt if rate limit check fails
        return { allowed: false, remainingAttempts: 0 };
      }

      const remaining = data as number;
      return { allowed: remaining > 0, remainingAttempts: remaining };
    } catch {
      // Fail closed for admin security
      return { allowed: false, remainingAttempts: 0 };
    }
  }, []);

  const recordAttempt = useCallback(async (email: string, success: boolean) => {
    try {
      await supabase.rpc('record_login_attempt', {
        attempt_email: email.toLowerCase().trim(),
        attempt_success: success
      });
    } catch (error) {
      logError('Failed to record admin login attempt:', error);
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
  };
}
