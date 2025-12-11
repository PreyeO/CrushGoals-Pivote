import { useState, useCallback } from 'react';

interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
}

const STORAGE_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function useRateLimiter() {
  const getState = useCallback((): RateLimitState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { attempts: 0, lockoutUntil: null };
  }, []);

  const setState = useCallback((state: RateLimitState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const checkRateLimit = useCallback((): { allowed: boolean; remainingTime?: number } => {
    const state = getState();
    
    if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
      const remainingTime = Math.ceil((state.lockoutUntil - Date.now()) / 1000 / 60);
      return { allowed: false, remainingTime };
    }
    
    // Reset if lockout has expired
    if (state.lockoutUntil && Date.now() >= state.lockoutUntil) {
      setState({ attempts: 0, lockoutUntil: null });
      return { allowed: true };
    }
    
    return { allowed: true };
  }, [getState, setState]);

  const recordAttempt = useCallback((success: boolean) => {
    const state = getState();
    
    if (success) {
      // Reset on successful login
      setState({ attempts: 0, lockoutUntil: null });
      return;
    }
    
    const newAttempts = state.attempts + 1;
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setState({
        attempts: newAttempts,
        lockoutUntil: Date.now() + LOCKOUT_DURATION,
      });
    } else {
      setState({ ...state, attempts: newAttempts });
    }
  }, [getState, setState]);

  const getRemainingAttempts = useCallback((): number => {
    const state = getState();
    return Math.max(0, MAX_ATTEMPTS - state.attempts);
  }, [getState]);

  return {
    checkRateLimit,
    recordAttempt,
    getRemainingAttempts,
  };
}
