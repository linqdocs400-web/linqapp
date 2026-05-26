import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RideType = "instant" | "daily" | "long";
export type VehicleType = "car" | "bike" | "auto" | "";

export type ConnectMethod = "instagram" | "whatsapp" | "telegram";

export type RideQuery = {
  rideType: RideType;
  pickup: string;
  pickupLat?: number;
  pickupLon?: number;
  drop: string;
  dropLat?: number;
  dropLon?: number;
  hasVehicle: boolean;
  vehicleType?: VehicleType;
  seats: number;
  days?: string[];
  returnJourney?: boolean;
  returnTime?: string;
  travelTime?: string;
  date?: string;
  time?: string;
  userId?: string;
  hotspotId?: string;
  hotspotName?: string;
};

type Ctx = {
  lastQuery: RideQuery | null;
  setLastQuery: (q: RideQuery | null) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lastQuery, setLastQuery] = useState<RideQuery | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      lastQuery,
      setLastQuery,
    }),
    [lastQuery],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
