import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/logger';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  payment_provider: string;
  payment_reference: string;
  created_at: string;
}

export function usePaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as PaymentHistoryItem[]);
    } catch (error) {
      logError('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    payments,
    isLoading,
    refresh: fetchPaymentHistory,
  };
}
