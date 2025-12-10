import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  plan: string | null;
  status: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  amount_paid: number | null;
  currency: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as Subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = () => {
    if (!subscription) return false;
    if (subscription.status === 'trial') {
      const trialEnd = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
      return trialEnd ? trialEnd > new Date() : false;
    }
    return subscription.status === 'active' && subscription.plan !== 'free';
  };

  const getTrialDaysLeft = () => {
    if (!subscription || subscription.status !== 'trial' || !subscription.trial_ends_at) return 0;
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  return {
    subscription,
    isLoading,
    isPremium,
    getTrialDaysLeft,
    refreshSubscription: fetchSubscription,
  };
}
