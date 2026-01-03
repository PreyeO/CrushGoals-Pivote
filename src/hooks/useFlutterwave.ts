import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export type FlutterwavePlan = 'monthly' | 'annual';

interface FlutterwaveInitResponse {
  authorization_url: string;
  tx_ref: string;
  success: boolean;
}

interface FlutterwaveVerifyResponse {
  success: boolean;
  plan: string;
  amount: number;
  currency: string;
}

export function useFlutterwave() {
  const { user } = useAuth();
  const { getPricing } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const getPaymentDetails = useCallback((plan: FlutterwavePlan) => {
    const pricing = getPricing();
    
    // Get amount in the smallest unit based on currency
    // Flutterwave expects the actual amount, not kobo/cents
    const amount = plan === 'monthly' 
      ? pricing.monthly.amount 
      : pricing.annual.amount;
    
    return {
      amount,
      currency: pricing.code,
      planName: plan === 'annual' ? 'basic_annual' : 'basic_monthly',
    };
  }, [getPricing]);

  const initializePayment = useCallback(async (plan: FlutterwavePlan): Promise<FlutterwaveInitResponse | null> => {
    if (!user) {
      toast.error('Please sign in to continue');
      return null;
    }

    setIsLoading(true);
    
    try {
      const { amount, currency, planName } = getPaymentDetails(plan);

      console.log(`[Flutterwave] Initializing payment - plan: ${planName}, amount: ${amount} ${currency}`);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Please sign in to continue');
        setIsLoading(false);
        return null;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/flutterwave-payment?action=initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          amount, 
          currency, 
          plan: planName,
          callbackUrl: '/settings?section=subscription',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }
      
      // Redirect to Flutterwave checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return {
          authorization_url: data.authorization_url,
          tx_ref: data.tx_ref,
          success: true,
        };
      }

      throw new Error('No checkout URL returned');
    } catch (error: any) {
      logError('Flutterwave initialization error:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getPaymentDetails]);

  const verifyPayment = useCallback(async (transactionId?: string, txRef?: string): Promise<FlutterwaveVerifyResponse | null> => {
    if (!user) {
      return null;
    }

    if (!transactionId && !txRef) {
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`[Flutterwave] Verifying payment - tx_id: ${transactionId}, tx_ref: ${txRef}`);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setIsLoading(false);
        return null;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/flutterwave-payment?action=verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          transaction_id: transactionId,
          tx_ref: txRef,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }
      
      if (data.success) {
        toast.success('Payment successful! Your subscription is now active.');
        return data as FlutterwaveVerifyResponse;
      }

      throw new Error(data.error || 'Payment verification failed');
    } catch (error: any) {
      logError('Flutterwave verification error:', error);
      toast.error(error.message || 'Payment verification failed. Please contact support.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    getPaymentDetails,
  };
}
