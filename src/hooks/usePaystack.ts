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

      // Map plan to full plan name for edge function
      const planName = plan === 'monthly' ? 'premium_monthly' : 'premium_annual';

      console.log(`Initializing Paystack payment for plan: ${planName}, amount: ${amount} kobo`);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Please sign in to continue');
        setIsLoading(false);
        return null;
      }

      // Use fetch directly with query parameter for action
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/paystack-payment?action=initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ amount, plan: planName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }
      
      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }

      return data as PaystackInitResponse;
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
      
      if (!session?.access_token) {
        setIsLoading(false);
        return null;
      }

      // Use fetch directly with query parameter for action
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/paystack-payment?action=verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }
      
      if (data.success) {
        toast.success('Payment successful! Your subscription is now active.');
      }

      return data as PaystackVerifyResponse;
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
