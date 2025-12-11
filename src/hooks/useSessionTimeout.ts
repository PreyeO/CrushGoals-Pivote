import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes of inactivity
const WARNING_DURATION = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export function useSessionTimeout(isAuthenticated: boolean, onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    clearTimers();
    toast.error('Session expired due to inactivity. Please sign in again.');
    await supabase.auth.signOut();
    onTimeout();
  }, [clearTimers, onTimeout]);

  const showWarning = useCallback(() => {
    toast.warning('Your session will expire in 5 minutes due to inactivity.', {
      duration: 10000,
      action: {
        label: 'Stay signed in',
        onClick: () => resetTimer(),
      },
    });
  }, []);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimers();

    if (!isAuthenticated) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning();
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, TIMEOUT_DURATION);
  }, [isAuthenticated, clearTimers, handleTimeout, showWarning]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      // Only reset if more than 1 second since last activity (debounce)
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [isAuthenticated, resetTimer, clearTimers]);

  return { resetTimer };
}
