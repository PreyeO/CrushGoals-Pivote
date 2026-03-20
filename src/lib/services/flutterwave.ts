import { AppState } from "../store";

export const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

export interface PaymentData {
  amount: number;
  email: string;
  name: string;
  tier: "pro" | "business";
  currency?: string;
  tx_ref: string;
  callback_url: string;
}

export const flutterwaveService = {
  initializePayment: async (data: PaymentData) => {
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  verifyTransaction: async (transactionId: string) => {
    const response = await fetch(`/api/payments/verify?transaction_id=${transactionId}`);
    return await response.json();
  }
};
