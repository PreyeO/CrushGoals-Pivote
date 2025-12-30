import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export type PaystackPlan = 'monthly' | 'annual';

interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyResponse {
  success: boolean;
  plan: string;
  amount: number;
  currency: string;
}

export function usePaystack() {
  const { user } = useAuth();
  const { getPricing } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const getAmountInKobo = useCallback((plan: PaystackPlan): number => {
    const pricing = getPricing();
    
    switch (plan) {
      case 'monthly':
        return Math.round(pricing.monthly.amount * 100);
      case 'annual':
        return Math.round(pricing.annual.amount * 100);
      default:
        return 0;
    }
  }, [getPricing]);

  const initializePayment = useCallback(async (plan: PaystackPlan): Promise<PaystackInitResponse | null> => {
    if (!user) {
      toast.error('Please sign in to continue');
      return null;
    }

    setIsLoading(true);
    
    try {
      const amount = getAmountInKobo(plan);
      
      if (amount <= 0) {
        throw new Error('Invalid plan amount');
      }

      console.log(`Initializing Paystack payment for plan: ${plan}, amount: ${amount} kobo`);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('paystack-payment', {
        body: { amount, plan },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to initialize payment');
      }

      const data = response.data as PaystackInitResponse;
      
      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }

      return data;
    } catch (error) {
      logError('Paystack initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAmountInKobo]);

  const verifyPayment = useCallback(async (reference: string): Promise<PaystackVerifyResponse | null> => {
    if (!user) {
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`Verifying Paystack payment: ${reference}`);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('paystack-payment', {
        body: { reference },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment verification failed');
      }

      const data = response.data as PaystackVerifyResponse;
      
      if (data.success) {
        toast.success('Payment successful! Your subscription is now active.');
      }

      return data;
    } catch (error) {
      logError('Paystack verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    getAmountInKobo,
  };
}
