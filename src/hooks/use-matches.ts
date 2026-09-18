/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type RidePost } from "./use-ride-posts";
import Fuse from "fuse.js";
import { getRoute, calculateRouteMatch, type RouteData } from "@/lib/routing";

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

      const hasUserCoords =
        typeof query?.pickupLat === "number" &&
        typeof query?.pickupLon === "number" &&
        typeof query?.dropLat === "number" &&
        typeof query?.dropLon === "number";

      let userRoute: RouteData | null = null;
      if (hasUserCoords && query) {
        try {
          userRoute = await getRoute(
            { lat: query.pickupLat!, lng: query.pickupLon! },
            { lat: query.dropLat!, lng: query.dropLon! }
          );
        } catch (err) {
          console.warn("Could not fetch user route for matching:", err);
          userRoute = null;
        }
      }

      // Helper for batched concurrent processing of candidate routes
      const processCandidateRides = async (rides: RidePost[]) => {
        const BATCH_SIZE = 4;
        const scoredRides: { ride: RidePost; score: number }[] = [];

        for (let i = 0; i < rides.length; i += BATCH_SIZE) {
          const batch = rides.slice(i, i + BATCH_SIZE);
          const batchScores = await Promise.all(
            batch.map(async (ride) => {
              if (query?.pickup && query?.drop) {
                const score = await calculateMatchScoreAsync(ride, query, userRoute);
                return { ride, score };
              }
              return { ride, score: 0 };
            })
          );
          scoredRides.push(...batchScores);
        }

        return scoredRides;
      };

      const scoredRides = await processCandidateRides(otherUsersRides);

      scoredRides.forEach(({ ride, score }) => {
        if (score > 70) {
          result.exact.push(ride); // Strong Match
        } else if (score > 30) {
          result.nearby.push(ride); // Moderate Match
        } else {
          result.other.push(ride); // Weak Match / Other
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
    enabled: !!query || showAll,
  });
}

// Helper functions for matching logic
export function haversineDist(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return Infinity;
  }
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

export function calcTimeSimilarity(timeStr1?: string, timeStr2?: string) {
  if (!timeStr1 || !timeStr2) return 0;
  try {
    const parse = (t: string) => {
      const [time, modifier] = t.trim().split(" ");
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
      return 1 - diff / 30; // returns 0 to 1
    }
  } catch (e) {
    console.error("Time parsing error", e);
  }
  return 0;
}

/**
 * Cheap spatial pre-filtering to decide if OSRM route fetch is plausible
 */
function isRouteFetchPlausible(ride: RidePost, query: RideQuery): boolean {
  if (
    typeof query.pickupLat !== "number" ||
    typeof query.pickupLon !== "number" ||
    typeof query.dropLat !== "number" ||
    typeof query.dropLon !== "number" ||
    typeof ride.pickup_lat !== "number" ||
    typeof ride.pickup_lon !== "number" ||
    typeof ride.drop_lat !== "number" ||
    typeof ride.drop_lon !== "number"
  ) {
    return false;
  }

  const pDist = haversineDist(query.pickupLat, query.pickupLon, ride.pickup_lat, ride.pickup_lon);
  const dDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);

  // If pickup or drop is within 25 km, route matching is plausible
  if (pDist <= 25 || dDist <= 25) return true;

  // Bounding box overlap check (with 0.2 deg margin ~ 22km)
  const margin = 0.2;
  const qMinLat = Math.min(query.pickupLat, query.dropLat) - margin;
  const qMaxLat = Math.max(query.pickupLat, query.dropLat) + margin;
  const qMinLon = Math.min(query.pickupLon, query.dropLon) - margin;
  const qMaxLon = Math.max(query.pickupLon, query.dropLon) + margin;

  const rMinLat = Math.min(ride.pickup_lat, ride.drop_lat);
  const rMaxLat = Math.max(ride.pickup_lat, ride.drop_lat);
  const rMinLon = Math.min(ride.pickup_lon, ride.drop_lon);
  const rMaxLon = Math.max(ride.pickup_lon, ride.drop_lon);

  const latOverlap = qMinLat <= rMaxLat && qMaxLat >= rMinLat;
  const lonOverlap = qMinLon <= rMaxLon && qMaxLon >= rMinLon;

  return latOverlap && lonOverlap;
}

/**
 * Async Route-Aware Match Score Calculation (V2 Engine)
 * Total Score = 100 max:
 * - Route Overlap: 60 pts (weighted by direction compatibility)
 * - Direction Compatibility: 15 pts
 * - Pickup Proximity: 10 pts
 * - Drop Proximity: 10 pts
 * - Time Similarity: 5 pts
 */
export async function calculateMatchScoreAsync(
  ride: RidePost,
  query: RideQuery,
  prefetchedUserRoute: RouteData | null = null
): Promise<number> {
  const hasUserCoords =
    typeof query.pickupLat === "number" &&
    typeof query.pickupLon === "number" &&
    typeof query.dropLat === "number" &&
    typeof query.dropLon === "number";

  const hasCandidateCoords =
    typeof ride.pickup_lat === "number" &&
    typeof ride.pickup_lon === "number" &&
    typeof ride.drop_lat === "number" &&
    typeof ride.drop_lon === "number";

  const pickupDist = haversineDist(query.pickupLat, query.pickupLon, ride.pickup_lat, ride.pickup_lon);
  const dropDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);
  const timeSim = calcTimeSimilarity(
    query.time || query.returnTime,
    ride.journey_time || ride.return_time
  );

  let userRoute = prefetchedUserRoute;
  let candidateRoute: RouteData | null = null;
  let routeFetchSuccess = false;

  if (hasUserCoords && hasCandidateCoords && isRouteFetchPlausible(ride, query)) {
    try {
      if (!userRoute) {
        userRoute = await getRoute(
          { lat: query.pickupLat!, lng: query.pickupLon! },
          { lat: query.dropLat!, lng: query.dropLon! }
        );
      }
      candidateRoute = await getRoute(
        { lat: ride.pickup_lat!, lng: ride.pickup_lon! },
        { lat: ride.drop_lat!, lng: ride.drop_lon! }
      );
      routeFetchSuccess = !!(userRoute && candidateRoute);
    } catch (e) {
      console.warn(`OSRM routing failed for candidate ride ${ride.id}:`, e);
      routeFetchSuccess = false;
    }
  }

  // If road route matching succeeds: use V2 100-point model
  if (routeFetchSuccess && userRoute && candidateRoute) {
    const routeMatch = calculateRouteMatch(userRoute, candidateRoute);

    // 1. Route Overlap Score (60 pts max, scaled by direction compatibility)
    const routeOverlapScore =
      (routeMatch.symmetricOverlapPct / 100) * 60 * routeMatch.directionCompatibility;

    // 2. Direction Compatibility Score (15 pts max)
    const directionScore = routeMatch.directionCompatibility * 15;

    // 3. Pickup Proximity (10 pts max within 5km)
    let pickupScore = 0;
    if (pickupDist <= 5) {
      pickupScore = 10 * (1 - pickupDist / 5);
    }

    // 4. Drop Proximity (10 pts max within 5km)
    let dropScore = 0;
    if (dropDist <= 5) {
      dropScore = 10 * (1 - dropDist / 5);
    }

    // 5. Time Similarity (5 pts max within 30 mins)
    const timeScore = timeSim * 5;

    const totalScore = routeOverlapScore + directionScore + pickupScore + dropScore + timeScore;
    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }

  // Graceful Fallback if OSRM is unavailable / failed / coordinates missing:
  return calculateFallbackMatchScore(ride, query, pickupDist, dropDist, timeSim);
}

/**
 * Synchronous Fallback Match Score (Proximity & Time based)
 */
function calculateFallbackMatchScore(
  ride: RidePost,
  query: RideQuery,
  pickupDist: number,
  dropDist: number,
  timeSim: number
): number {
  let score = 0;

  // 1. Pickup Proximity (40 pts) -> Within 5km
  if (pickupDist <= 5) score += 40 * (1 - pickupDist / 5);

  // 2. Drop Proximity (40 pts) -> Within 5km
  if (dropDist <= 5) score += 40 * (1 - dropDist / 5);

  // 3. Time Similarity (10 pts)
  score += timeSim * 10;

  // 4. Name Similarity (10 pts) -> Fuzzy match
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
    const nameScore = Math.min(10, ((pScore + dScore) / 2) * 10);
    score += nameScore;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Legacy synchronous calculateMatchScore export for backwards compatibility
 */
export function calculateMatchScore(ride: RidePost, query: RideQuery): number {
  const pickupDist = haversineDist(query.pickupLat, query.pickupLon, ride.pickup_lat, ride.pickup_lon);
  const dropDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);
  const timeSim = calcTimeSimilarity(
    query.time || query.returnTime,
    ride.journey_time || ride.return_time
  );
  return calculateFallbackMatchScore(ride, query, pickupDist, dropDist, timeSim);
}
