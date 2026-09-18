import { Plan } from "@/routes/pricing";

export interface Campaign {
  id: string;
  name: string;
  code: string;
  planTarget: Plan;
  discountPercentage: number;
  discountAmount: number;
  expiryDate: string;
  isActive: boolean;
  maxRedemptions?: number;
  isFeatured: boolean;
  bannerText?: string;
  bannerSubtext?: string;
  successMessage?: string;
}

export const activeCampaigns: Campaign[] = [
  {
    id: "camp_pool2save",
    name: "Pool To Save",
    code: "POOL2SAVE",
    planTarget: "monthly",
    discountPercentage: 100,
    discountAmount: 49,
    expiryDate: "2026-12-31T23:59:59Z",
    isActive: true,
    isFeatured: true,
    bannerText: "Got a coupon? - redeem it now",
    bannerSubtext: "Text us on Insta to get the coupon code",
    successMessage: "Your Monthly Membership has been activated.",
  },
  {
    id: "camp_greenfuture",
    name: "Green Future",
    code: "GREENFUTURE",
    planTarget: "weekly",
    discountPercentage: 100,
    discountAmount: 19,
    expiryDate: "2026-12-31T23:59:59Z",
    isActive: true,
    isFeatured: false,
    successMessage: "Your Weekly Membership has been activated.",
  },
  {
    id: "camp_cutco2",
    name: "Cut CO2",
    code: "CUTCO2",
    planTarget: "weekly",
    discountPercentage: 100,
    discountAmount: 19,
    expiryDate: "2026-12-31T23:59:59Z",
    isActive: true,
    isFeatured: false,
    successMessage: "Your Weekly Membership has been activated.",
  },
  {
    id: "camp_bettertogether",
    name: "Better Together",
    code: "BETTERTOGETHER",
    planTarget: "monthly",
    discountPercentage: 100,
    discountAmount: 49,
    expiryDate: "2026-12-31T23:59:59Z",
    isActive: true,
    isFeatured: false,
    successMessage: "Your Monthly Membership has been activated.",
  }
];

export function validateCouponCode(code: string): { valid: boolean; campaign?: Campaign; error?: string } {
  const upperCode = code.trim().toUpperCase();
  if (!upperCode) return { valid: false, error: "Please enter a coupon code." };

  const campaign = activeCampaigns.find((c) => c.code === upperCode && c.isActive);

  if (!campaign) {
    return { valid: false, error: "Invalid coupon code." };
  }

  if (new Date(campaign.expiryDate) < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  return { valid: true, campaign };
}
