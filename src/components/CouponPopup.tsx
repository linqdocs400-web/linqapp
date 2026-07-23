import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { useCouponStore } from "@/lib/coupon-provider";
import { validateCouponCode, Campaign } from "@/lib/campaigns";
import { X, Gift, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-provider";
import { useNavigate } from "@tanstack/react-router";

export function CouponPopup() {
  const { isOpen, closePopup, selectedPlan } = useCouponStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Campaign | null>(null);

  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleApply = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Please enter a coupon code.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = validateCouponCode(trimmedCode);

    if (!result.valid || !result.campaign) {
      setError(result.error || "Invalid coupon code.");
      setLoading(false);
      return;
    }

    // Success!
    setSuccess(result.campaign);
    setLoading(false);
  };

  const handleActivate = async () => {
    if (!success) return;
    if (!user) {
      closePopup();
      navigate({ to: "/login" });
      return;
    }

    // Auto-add to "🚩 Protest Travelers" hotspot
    try {
      const { data: hotspots } = await supabase
        .from("hotspots")
        .select("id")
        .eq("name", "🚩 Protest Travelers");
        
      let hotspotId = hotspots?.[0]?.id;
      
      if (!hotspotId) {
        const { data: newHotspot } = await supabase
          .from("hotspots")
          .insert({ name: "🚩 Protest Travelers", type: "college" })
          .select("id")
          .single();
        hotspotId = newHotspot?.id;
      }
      
      if (hotspotId) {
        await updateProfile({
          plan: success.planTarget,
          plan_expiry: success.expiryDate,
          institution_hotspot_id: hotspotId,
        });
        
        await supabase
          .from("hotspot_members")
          .upsert({ hotspot_id: hotspotId, user_id: user.id, role: "member" });
      } else {
        await updateProfile({
          plan: success.planTarget,
          plan_expiry: success.expiryDate,
        });
      }
    } catch (err) {
      console.error("Error auto-adding to hotspot:", err);
      // Fallback
      await updateProfile({
        plan: success.planTarget,
        plan_expiry: success.expiryDate,
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success(success.successMessage || "Plan activated successfully!");
    closePopup();
  };

  const handleSkip = () => {
    closePopup();
    // If selectedPlan exists, it means we came from pricing and should proceed to payment.
    // However, the payment logic is in pricing.tsx. 
    // We can emit a custom event or let the pricing page observe the store.
    if (selectedPlan) {
      // In a real app we might trigger Razorpay here, but for simplicity we can dispatch an event
      window.dispatchEvent(new CustomEvent("resume-payment", { detail: { plan: selectedPlan } }));
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && closePopup()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-[32px] bg-background border-t border-border focus:outline-none max-w-md mx-auto">
          <div className="flex-1 rounded-t-[32px] bg-card p-6">
            <div className="mx-auto mb-6 h-1.5 w-12 flex-shrink-0 rounded-full bg-border" />
            
            {success ? (
              <div className="flex flex-col items-center text-center pb-6">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PartyPopper className="size-8" />
                </div>
                <Drawer.Title className="mb-2 text-2xl font-bold">Coupon Applied Successfully</Drawer.Title>
                <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left w-full">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Offer</p>
                  <p className="text-lg font-bold">{success.discountPercentage}% OFF {success.planTarget.toUpperCase()} PLAN</p>
                  <Drawer.Description className="text-sm text-muted-foreground mt-2">{success.successMessage}</Drawer.Description>
                </div>
                <button
                  onClick={handleActivate}
                  className="w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <Drawer.Title className="text-xl font-bold flex items-center gap-2">
                    <Gift className="size-5 text-primary" /> Redeem Coupon
                  </Drawer.Title>
                  <Drawer.Close asChild>
                    <button className="rounded-full p-2 bg-secondary text-muted-foreground hover:text-foreground transition">
                      <X className="size-4" />
                    </button>
                  </Drawer.Close>
                </div>
                <Drawer.Description className="text-sm text-muted-foreground mb-6">
                  Enter your coupon code below to unlock exclusive offers.
                </Drawer.Description>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    className={`w-full rounded-2xl border ${error ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"} bg-background px-4 py-4 text-center text-lg font-bold uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4`}
                  />
                  {error && (
                    <p className="mt-2 text-center text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  {selectedPlan ? (
                    <button
                      onClick={handleSkip}
                      className="flex-1 rounded-full bg-secondary py-3.5 font-semibold text-foreground hover:bg-secondary/80"
                    >
                      Skip to Payment
                    </button>
                  ) : (
                    <Drawer.Close asChild>
                      <button className="flex-1 rounded-full bg-secondary py-3.5 font-semibold text-foreground hover:bg-secondary/80">
                        Cancel
                      </button>
                    </Drawer.Close>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="flex-1 flex items-center justify-center rounded-full bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : "Apply Coupon"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
