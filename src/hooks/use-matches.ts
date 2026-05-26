/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type RidePost } from "./use-ride-posts";
import Fuse from "fuse.js";

export type RideQuery = {
  rideType: "instant" | "daily" | "long";
  pickup: string;
  pickupLat?: number;
  pickupLon?: number;
  drop: string;
  dropLat?: number;
  dropLon?: number;
  hasVehicle: boolean;
  vehicleType?: string;
  seats: number;
  days?: string[];
  returnJourney?: boolean;
  returnTime?: string;
  date?: string;
  time?: string;
  userId?: string;
  hotspotId?: string;
  hotspotName?: string;
};

export type MatchCategory = "exact" | "nearby" | "route_overlap" | "other";

export type MatchResult = {
  exact: RidePost[];
  nearby: RidePost[];
  routeOverlap: RidePost[];
  other: RidePost[];
};

export type PaginatedMatchResult = MatchResult & {
  hasMore: boolean;
  totalExact: number;
  totalNearby: number;
  totalRouteOverlap: number;
  totalOther: number;
};

export function useMatches(
  query: RideQuery | null,
  page: number = 1,
  limit: number = 10,
  showAll: boolean = false,
  excludeOwnerIds: string[] = [],
) {
  const excludeSet = new Set(excludeOwnerIds);
  return useQuery({
    queryKey: ["matches", query, page, limit, showAll, excludeOwnerIds],
    queryFn: async (): Promise<PaginatedMatchResult> => {
      if (!query)
        return {
          exact: [] as RidePost[],
          nearby: [] as RidePost[],
          routeOverlap: [] as RidePost[],
          other: [] as RidePost[],
          hasMore: false,
          totalExact: 0,
          totalNearby: 0,
          totalRouteOverlap: 0,
          totalOther: 0,
        };

      // Get all rides (regardless of type) - matching will filter by location compatibility
      const { data, error } = await (supabase as any)
        .from("ride_posts")
        .select("*, profiles:owner_id(name, connect_method, connect_id)")
        .order("created_at", { ascending: false });

      const allRides = (data || []).map((d: any) => ({
        ...d,
        owner_name: d.profiles?.name || "Member",
        connect_method: d.profiles?.connect_method,
        connect_id: d.profiles?.connect_id,
      })) as RidePost[] | null;

      if (error) throw error;

      if (!allRides || allRides.length === 0) {
        return {
          exact: [] as RidePost[],
          nearby: [] as RidePost[],
          routeOverlap: [] as RidePost[],
          other: [] as RidePost[],
          hasMore: false,
          totalExact: 0,
          totalNearby: 0,
          totalRouteOverlap: 0,
          totalOther: 0,
        };
      }

      // Filter out current user's rides and hotspot members (shown in dedicated section)
      const otherUsersRides = allRides.filter(
        (ride) =>
          ride.owner_id !== query?.userId &&
          ride.status === "active" &&
          !excludeSet.has(ride.owner_id),
      );

      // If showAll is true, return all rides without matching logic
      if (showAll) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRides = otherUsersRides.slice(startIndex, endIndex);

        return {
          exact: paginatedRides, // Put all rides in exact category for display
          nearby: [] as RidePost[],
          routeOverlap: [] as RidePost[],
          other: [] as RidePost[],
          hasMore: endIndex < otherUsersRides.length,
          totalExact: otherUsersRides.length,
          totalNearby: 0,
          totalRouteOverlap: 0,
          totalOther: 0,
        };
      }

      // Categorize matches
      const result: MatchResult = {
        exact: [],
        nearby: [],
        routeOverlap: [],
        other: [],
      };

      const allMatches: RidePost[] = [];

      otherUsersRides.forEach((ride) => {
        if (query?.pickup && query?.drop) {
          const matchScore = calculateMatchScore(ride, query);

          if (matchScore > 70) {
            result.exact.push(ride); // Strong Match
          } else if (matchScore > 30) {
            result.nearby.push(ride); // Moderate Match
          } else {
            result.other.push(ride); // Weak Match / Other
          }
        } else {
          result.other.push(ride);
        }

        allMatches.push(ride);
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExact = result.exact.slice(startIndex, endIndex);
      const paginatedNearby = result.nearby.slice(startIndex, endIndex);
      const paginatedRouteOverlap = result.routeOverlap.slice(startIndex, endIndex);
      const paginatedOther = result.other.slice(startIndex, endIndex);

      return {
        exact: paginatedExact,
        nearby: paginatedNearby,
        routeOverlap: paginatedRouteOverlap,
        other: paginatedOther,
        hasMore: endIndex < allMatches.length,
        totalExact: result.exact.length,
        totalNearby: result.nearby.length,
        totalRouteOverlap: result.routeOverlap.length,
        totalOther: result.other.length,
      };
    },
    enabled: !!query,
  });
}

// Helper functions for matching logic
function haversineDist(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcTimeSimilarity(timeStr1?: string, timeStr2?: string) {
  if (!timeStr1 || !timeStr2) return 0;
  try {
    const parse = (t: string) => {
      const [time, modifier] = t.split(" ");
      if (!time) return 0;
      const parts = time.split(":").map(Number);
      let h = parts[0];
      const m = parts[1];
      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return h * 60 + (m || 0);
    };
    const diff = Math.abs(parse(timeStr1) - parse(timeStr2));
    if (diff <= 30) {
      return 10 * (1 - diff / 30);
    }
  } catch (e) {
    console.error("Time parsing error", e);
  }
  return 0;
}

export function calculateMatchScore(ride: RidePost, query: RideQuery) {
  let score = 0;

  // 1. Pickup Proximity (40 pts) -> Within 2km
  const pickupDist = haversineDist(
    query.pickupLat,
    query.pickupLon,
    ride.pickup_lat,
    ride.pickup_lon,
  );
  if (pickupDist <= 2) score += 40 * (1 - pickupDist / 2);

  // 2. Drop Proximity (40 pts) -> Within 3km
  const dropDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);
  if (dropDist <= 3) score += 40 * (1 - dropDist / 3);

  // 3. Time Similarity (10 pts) -> Within 30 mins
  score += calcTimeSimilarity(
    query.time || query.returnTime,
    ride.journey_time || ride.return_time,
  );

  // 4. Name Similarity (10 pts) -> Fuzzy match
  let nameScore = 0;
  if (query.pickup || query.drop) {
    const list = [{ name: ride.pickup_location }, { name: ride.drop_location }];
    const fuse = new Fuse(list, { keys: ["name"], includeScore: true, threshold: 0.6 });
    let pScore = 0,
      dScore = 0;
    if (query.pickup) {
      const pRes = fuse.search(query.pickup);
      if (pRes.length > 0) pScore = 1 - (pRes[0].score || 0);
    }
    if (query.drop) {
      const dRes = fuse.search(query.drop);
      if (dRes.length > 0) dScore = 1 - (dRes[0].score || 0);
    }
    nameScore = Math.min(10, ((pScore + dScore) / 2) * 10);
    score += nameScore;
  }

  return score;
}
