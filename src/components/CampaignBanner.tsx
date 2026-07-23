import { useState, useEffect } from "react";
import { activeCampaigns } from "@/lib/campaigns";
import { useCouponStore } from "@/lib/coupon-provider";
import { X } from "lucide-react";

export function CampaignBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { openPopup } = useCouponStore();

  const featuredCampaign = activeCampaigns.find((c) => c.isFeatured && c.isActive);

  useEffect(() => {
    if (featuredCampaign) {
      const dismissed = localStorage.getItem(`campaign_dismissed_${featuredCampaign.id}`);
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [featuredCampaign]);

  if (!featuredCampaign || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`campaign_dismissed_${featuredCampaign.id}`, "true");
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-background border-b border-border shadow-sm flex items-center justify-between px-4 py-3 animate-in slide-in-from-top-full duration-500">
      <div className="flex items-center gap-3 relative before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r-full">
        <p className="text-sm font-medium">
          {featuredCampaign.bannerText}{" "}
          <span className="font-bold text-primary ml-1">{featuredCampaign.bannerSubtext}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 pl-4">
        <button
          onClick={() => openPopup()}
          className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
        >
          APPLY
        </button>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss campaign"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
