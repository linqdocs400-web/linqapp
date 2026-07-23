import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Plan } from "@/routes/pricing";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-provider";

interface CouponContextType {
  isOpen: boolean;
  selectedPlan: Plan | null;
  openPopup: (plan?: Plan | null) => void;
  closePopup: () => void;
}

const CouponContext = createContext<CouponContextType | null>(null);

export function CouponProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const value = useMemo<CouponContextType>(
    () => ({
      isOpen,
      selectedPlan,
      openPopup: (plan = null) => {
        if (!user) {
          navigate({ to: "/login" });
          return;
        }
        setSelectedPlan(plan);
        setIsOpen(true);
      },
      closePopup: () => {
        setIsOpen(false);
        setSelectedPlan(null);
      },
    }),
    [isOpen, selectedPlan, user, navigate]
  );

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
}

export function useCouponStore() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCouponStore must be used within a CouponProvider");
  }
  return context;
}
