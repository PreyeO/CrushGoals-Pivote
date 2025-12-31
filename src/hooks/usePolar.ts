import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export type PolarPlan = 'monthly' | 'annual';

export interface PolarInitResponse {
  checkoutUrl: string;
  success: boolean;
}

export interface PolarVerifyResponse {
  success: boolean;
  plan?: string;
  amount?: number;
  currency?: string;
}

export function usePolar() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Pricing in USD cents
  const getAmountInCents = useCallback((plan: PolarPlan): number => {
    switch (plan) {
      case 'monthly':
        return 300; // $3.00
      case 'annual':
        return 3300; // $33.00
      default:
        return 300;
    }
  }, []);

  const initializePayment = useCallback(async (plan: PolarPlan): Promise<PolarInitResponse | null> => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return null;
    }

    setIsLoading(true);
    try {
      const amount = getAmountInCents(plan);
      const planName = plan === 'annual' ? 'basic_annual' : 'basic_monthly';

      const { data, error } = await supabase.functions.invoke('polar-payment', {
        body: {
          action: 'initialize',
          plan: planName,
          amount,
          callbackUrl: '/settings?section=subscription'
        }
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = data.checkoutUrl;
        return { checkoutUrl: data.checkoutUrl, success: true };
      }

      throw new Error('No checkout URL returned');
    } catch (error: any) {
      logError('Error initializing Polar payment:', error);
      toast.error(error.message || 'Failed to start payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAmountInCents]);

  const verifyPayment = useCallback(async (checkoutId: string): Promise<PolarVerifyResponse | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('polar-payment', {
        body: {
          action: 'verify',
          checkoutId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Payment verified! Welcome to CrushGoals Premium!');
        return data;
      }

      throw new Error(data?.error || 'Verification failed');
    } catch (error: any) {
      logError('Error verifying Polar payment:', error);
      toast.error(error.message || 'Failed to verify payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    getAmountInCents,
  };
}
