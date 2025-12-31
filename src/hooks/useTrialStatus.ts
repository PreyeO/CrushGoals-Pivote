import { useMemo, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface TrialStatus {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  canPerformActions: boolean;
  hoursLeft: number;
  daysLeft: number;
  trialEndsAt: Date | null;
}

export function useTrialStatus(): TrialStatus {
  const { subscription, isPremium, getTrialDaysLeft } = useSubscription();

  const trialEndsAt = useMemo(() => {
    if (!subscription?.trial_ends_at) return null;
    return new Date(subscription.trial_ends_at);
  }, [subscription?.trial_ends_at]);

  const hoursLeft = useMemo(() => {
    if (!trialEndsAt) return 0;
    const now = Date.now();
    const diff = trialEndsAt.getTime() - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }, [trialEndsAt]);

  const daysLeft = useMemo(() => getTrialDaysLeft(), [getTrialDaysLeft]);

  const isOnTrial = subscription?.status === 'trial';
  const isPremiumUser = useMemo(() => isPremium(), [isPremium]);

  // Trial is active if user is on trial and trial hasn't expired
  const isTrialActive = useMemo(() => {
    if (!isOnTrial) return false;
    if (!trialEndsAt) return false;
    return trialEndsAt.getTime() > Date.now();
  }, [isOnTrial, trialEndsAt]);

  // Trial is expired if user was on trial but time has passed
  const isTrialExpired = useMemo(() => {
    if (isPremiumUser) return false;
    if (subscription?.status === 'active') return false;
    if (!trialEndsAt) return false;
    return trialEndsAt.getTime() <= Date.now();
  }, [isPremiumUser, subscription?.status, trialEndsAt]);

  // User can perform actions if:
  // 1. They are premium (paid subscription)
  // 2. They have an active trial
  // 3. They have an active subscription status
  const canPerformActions = useMemo(() => {
    // Premium users can always perform actions
    if (isPremiumUser) return true;
    
    // Active subscription
    if (subscription?.status === 'active') return true;
    
    // Active trial
    if (isTrialActive) return true;
    
    // Trial expired and not subscribed = cannot perform actions
    return false;
  }, [isPremiumUser, subscription?.status, isTrialActive]);

  return {
    isTrialActive,
    isTrialExpired,
    canPerformActions,
    hoursLeft,
    daysLeft,
    trialEndsAt,
  };
}
