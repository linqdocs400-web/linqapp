import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useProfile } from "@/hooks/use-profile";
import { useRazorpay } from "@/hooks/use-razorpay";
import { RazorpayCheckout } from "@/components/razorpay-checkout";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-provider";
import { useQueryClient } from "@tanstack/react-query";

export type Plan = "free" | "weekly" | "monthly";
export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — linQ" },
      { name: "description", content: "Free, weekly and monthly plans for linQ ride matching." },
    ],
  }),
  component: Pricing,
});

const tiers: {
  id: Plan;
  name: string;
  price: string;
  per: string;
  perks: string[];
  highlight?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    per: "forever",
    perks: ["2 profile unlocks + 1/day", "Post your ride", "Basic matching"],
  },
  {
    id: "weekly",
    name: "Weekly pass",
    price: "₹19",
    per: "7 days",
    perks: ["10 unlocks per day", "Priority matching", "All connect options"],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹49",
    per: "30 days",
    perks: ["Unlimited unlocks", "Priority matching", "Boosted ride post visibility"],
    highlight: true,
  },
];

function Pricing() {
  const { profile, updateProfile } = useProfile();
  const { createOrder, verifyPayment, loading, error } = useRazorpay();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const plan = profile?.plan || "free";
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleUpgrade = async (p: Plan) => {
    if (p === "free") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      updateProfile({ plan: p, plan_expiry: expiry.toISOString() });
      return;
    }

    // Auth check: Redirect non-authenticated users to login page
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const amount = p === "weekly" ? 1900 : 4900;
    try {
      const order = await createOrder(amount, `plan_${p}_${Date.now()}`);
      setOrderId(order.id);
      setSelectedPlan(p);
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log("Payment successful, verifying with planType:", selectedPlan);
      const verification = await verifyPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature,
        selectedPlan
      );

      console.log("Verification response:", verification);

      if (verification.success) {
        toast.success("Plan activated successfully!");
        // Invalidate profile query to refresh data
        queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        setSelectedPlan(null);
        setOrderId(null);
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setSelectedPlan(null);
    setOrderId(null);
  };

  const handlePaymentClose = () => {
    setSelectedPlan(null);
    setOrderId(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-32 lg:px-8 lg:pt-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Pricing</p>
          <h1 className="mt-2 text-3xl font-bold lg:text-5xl">Simple, fair, ride-shared</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground lg:text-base">
            Start free. Upgrade only when you want more matches.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => {
            const current = plan === t.id;
            return (
              <div
                key={t.id}
                className={`relative rounded-3xl border p-7 ${
                  t.highlight
                    ? "border-primary bg-primary/5 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]"
                    : "border-border bg-card"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h3 className="font-semibold">{t.name}</h3>
                </div>
                <p className="mt-4">
                  <span className="text-4xl font-bold">{t.price}</span>
                  <span className="ml-2 text-sm text-muted-foreground">/ {t.per}</span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={current || loading}
                  onClick={() => handleUpgrade(t.id)}
                  className={`mt-7 w-full rounded-full py-3 text-sm font-semibold transition ${
                    current
                      ? "bg-secondary text-muted-foreground"
                      : t.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground text-background"
                  }`}
                >
                  {loading && selectedPlan === t.id
                    ? "Processing..."
                    : current
                      ? "Current plan"
                      : t.id === "free"
                        ? "Downgrade"
                        : `Pay ${t.price}`}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {selectedPlan && orderId && (
          <RazorpayCheckout
            amount={selectedPlan === "weekly" ? 19 : 49}
            orderId={orderId}
            name="GoTogetherRides"
            description={`${selectedPlan} plan`}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onClose={handlePaymentClose}
          />
        )}
      </div>
      <BottomNav />
    </main>
  );
}
