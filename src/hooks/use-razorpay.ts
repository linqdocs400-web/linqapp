import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  plan?: string;
  expiry?: string;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (amount: number, receipt?: string): Promise<CreateOrderResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke("create-order", {
        body: { amount, currency: "INR", receipt },
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create order";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    planType?: string
  ): Promise<VerifyPaymentResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke("verify-payment", {
        body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType },
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify payment";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    verifyPayment,
    loading,
    error,
  };
}
