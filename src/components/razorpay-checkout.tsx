import { useEffect, useRef } from "react";

interface RazorpayCheckoutProps {
  amount: number;
  currency?: string;
  orderId: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({
  amount,
  currency = "INR",
  orderId,
  name = "GoTogetherRides",
  description = "Payment for ride matching",
  image,
  prefill,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayCheckoutProps) {
  const razorpayRef = useRef<any>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      initializeRazorpay();
    };
    script.onerror = () => {
      onFailure(new Error("Failed to load Razorpay checkout script"));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeRazorpay = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount, // Amount is already in paise
      currency,
      name,
      description,
      order_id: orderId,
      image,
      prefill,
      theme: {
        color: "#6366f1",
      },
      handler: function (response: any) {
        onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          if (onClose) onClose();
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return null;
}
