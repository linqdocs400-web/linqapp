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

export type MatchScoreData = {
  finalScore: number;
  routeOverlapPct: number;
  pickupDist: number;
  dropDist: number;
  timeDiffMins: number;
};

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

export function isValidCoord(lat?: number, lon?: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    !(lat === 0 && lon === 0)
  );
}

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
      let otherUsersRides: RidePost[] = [];

      if (showAll || !query || (!isValidCoord(query.pickupLat, query.pickupLon) && !isValidCoord(query.dropLat, query.dropLon))) {
        // Fallback: fetch active rides
        const { data, error } = await (supabase as any)
          .from("ride_posts")
          .select("*, profiles:owner_id(name, connect_method, connect_id)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        otherUsersRides = (data || [])
          .map((d: any) => ({
            ...d,
            owner_name: d.profiles?.name || "Member",
            connect_method: d.profiles?.connect_method,
            connect_id: d.profiles?.connect_id,
          }))
          .filter((r: any) => r.owner_id !== query?.userId && !excludeSet.has(r.owner_id));
      } else {
        // STAGE 1 - CHEAP DATABASE FILTERING via RPC
        const { data, error } = await supabase.rpc("search_ride_matches_by_route", {
          p_pickup_lat: query.pickupLat!,
          p_pickup_lon: query.pickupLon!,
          p_drop_lat: query.dropLat!,
          p_drop_lon: query.dropLon!,
          p_limit: 30, // Get top 30 closest candidates
          p_max_route_km: 800,
          p_exclude_owner_id: query.userId || null,
        });

        if (error) {
          console.warn("RPC failed, falling back to standard select", error);
          const { data: fbData, error: fbError } = await (supabase as any)
            .from("ride_posts")
            .select("*, profiles:owner_id(name, connect_method, connect_id)")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(100);
          
          if (fbError) throw fbError;
          otherUsersRides = (fbData || [])
            .map((d: any) => ({
              ...d,
              owner_name: d.profiles?.name || "Member",
              connect_method: d.profiles?.connect_method,
              connect_id: d.profiles?.connect_id,
            }))
            .filter((r: any) => r.owner_id !== query?.userId && !excludeSet.has(r.owner_id));
        } else {
          // RPC success, fetch full rows
          const candidateIds = (data || []).map((d: any) => d.ride_id);
          
          if (candidateIds.length > 0) {
            const { data: fullRides, error: fullError } = await (supabase as any)
              .from("ride_posts")
              .select("*, profiles:owner_id(name, connect_method, connect_id, bio)")
              .in("id", candidateIds);

            if (fullError) throw fullError;

            otherUsersRides = (fullRides || [])
              .map((d: any) => ({
                ...d,
                owner_name: d.profiles?.name || "Member",
                connect_method: d.profiles?.connect_method,
                connect_id: d.profiles?.connect_id,
                bio: d.profiles?.bio,
              }))
              .filter((r: any) => !excludeSet.has(r.owner_id));
          }
        }
      }

      if (otherUsersRides.length === 0) {
        return {
          exact: [], nearby: [], routeOverlap: [], other: [],
          hasMore: false, totalExact: 0, totalNearby: 0, totalRouteOverlap: 0, totalOther: 0,
        };
      }

      if (showAll) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRides = otherUsersRides.slice(startIndex, endIndex);
        return {
          exact: paginatedRides, nearby: [], routeOverlap: [], other: [],
          hasMore: endIndex < otherUsersRides.length,
          totalExact: otherUsersRides.length, totalNearby: 0, totalRouteOverlap: 0, totalOther: 0,
        };
      }

      // STAGE 2 - ROUTE ANALYSIS
      let userRoute: RouteData | null = null;
      if (isValidCoord(query.pickupLat, query.pickupLon) && isValidCoord(query.dropLat, query.dropLon)) {
        try {
          userRoute = await getRoute(
            { lat: query.pickupLat!, lng: query.pickupLon! },
            { lat: query.dropLat!, lng: query.dropLon! }
          );
        } catch (err) {
          console.warn("Could not fetch user route for matching:", err);
        }
      }

      const processCandidateRides = async (rides: RidePost[]) => {
        if (!query?.pickup || !query?.drop) {
          return rides.map((ride) => ({ ride, matchData: calculateFallbackMatchScore(ride, query) }));
        }

        const MAX_OSRM_CANDIDATES = 15;
        // Pre-score to pick top 15
        const initialScored = rides.map((ride) => ({
          ride,
          matchData: calculateFallbackMatchScore(ride, query),
        }));
        initialScored.sort((a, b) => b.matchData.finalScore - a.matchData.finalScore);

        const topCandidates = initialScored.slice(0, MAX_OSRM_CANDIDATES);
        const remainingCandidates = initialScored.slice(MAX_OSRM_CANDIDATES);

        const refinedTopScores = await Promise.all(
          topCandidates.map(async (item) => {
            try {
              const matchData = await calculateMatchScoreAsync(item.ride, query, userRoute);
              return { ride: item.ride, matchData };
            } catch {
              return item;
            }
          })
        );

        return [...refinedTopScores, ...remainingCandidates];
      };

      const scoredRides = await processCandidateRides(otherUsersRides);
      
      // Sort final results by finalScore descending
      scoredRides.sort((a, b) => b.matchData.finalScore - a.matchData.finalScore);

      const result: MatchResult = { exact: [], nearby: [], routeOverlap: [], other: [] };

      scoredRides.forEach(({ ride, matchData }) => {
        (ride as any).matchData = matchData; // Inject matchData directly into the ride object for the UI
        
        const score = matchData.finalScore;
        // Suggested categories:
        // 90–100%: Excellent Route Match (exact)
        // 75–89%: Very High Route Match (exact)
        // 50–74%: High Route Match (routeOverlap)
        // 30–49%: Moderate Route Match (nearby)
        // Below 30%: Other
        if (score >= 75) {
          result.exact.push(ride);
        } else if (score >= 50) {
          result.routeOverlap.push(ride);
        } else if (score >= 30) {
          result.nearby.push(ride);
        } else {
          result.other.push(ride);
        }
      });

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return {
        exact: result.exact.slice(startIndex, endIndex),
        nearby: result.nearby.slice(startIndex, endIndex),
        routeOverlap: result.routeOverlap.slice(startIndex, endIndex),
        other: result.other.slice(startIndex, endIndex),
        hasMore: endIndex < scoredRides.length,
        totalExact: result.exact.length,
        totalNearby: result.nearby.length,
        totalRouteOverlap: result.routeOverlap.length,
        totalOther: result.other.length,
      };
    },
    enabled: !!query || showAll,
  });
}

export function haversineDist(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if (!isValidCoord(lat1, lon1) || !isValidCoord(lat2, lon2)) return Infinity;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2! - lat1!);
  const dLon = toRad(lon2! - lon1!);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1!)) * Math.cos(toRad(lat2!)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcTimeSimilarity(timeStr1?: string, timeStr2?: string) {
  if (!timeStr1 || !timeStr2) return 0;
  try {
    const parse = (t: string) => {
      const [time, modifier] = t.trim().split(" ");
      if (!time) return 0;
      const parts = time.split(":").map(Number);
      let h = parts[0]; const m = parts[1];
      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return h * 60 + (m || 0);
    };
    const diff = Math.abs(parse(timeStr1) - parse(timeStr2));
    if (diff <= 60) return 1 - diff / 60; // Up to 60 mins diff
  } catch (e) {}
  return 0;
}

export async function calculateMatchScoreAsync(
  ride: RidePost,
  query: RideQuery,
  prefetchedUserRoute: RouteData | null = null
): Promise<MatchScoreData> {
  const hasUserCoords = isValidCoord(query.pickupLat, query.pickupLon) && isValidCoord(query.dropLat, query.dropLon);
  const hasCandidateCoords = isValidCoord(ride.pickup_lat, ride.pickup_lon) && isValidCoord(ride.drop_lat, ride.drop_lon);
  
  const pickupDist = haversineDist(query.pickupLat, query.pickupLon, ride.pickup_lat, ride.pickup_lon);
  const dropDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);
  
  const timeSim = calcTimeSimilarity(query.time || query.returnTime, ride.journey_time || ride.return_time);

  let userRoute = prefetchedUserRoute;
  let candidateRoute: RouteData | null = null;
  let routeFetchSuccess = false;

  if (hasUserCoords && hasCandidateCoords) {
    try {
      if (!userRoute) {
        userRoute = await getRoute({ lat: query.pickupLat!, lng: query.pickupLon! }, { lat: query.dropLat!, lng: query.dropLon! });
      }
      candidateRoute = await getRoute({ lat: ride.pickup_lat!, lng: ride.pickup_lon! }, { lat: ride.drop_lat!, lng: ride.drop_lon! });
      routeFetchSuccess = !!(userRoute && candidateRoute);
    } catch (e) {
      console.warn("OSRM routing failed for candidate ride", ride.id);
    }
  }

  if (routeFetchSuccess && userRoute && candidateRoute) {
    const routeMatch = calculateRouteMatch(userRoute, candidateRoute);
    
    const routeOverlapPct = routeMatch.symmetricOverlapPct;
    const routeOverlapScore = routeOverlapPct * routeMatch.directionCompatibility;
    
    const pickupScore = Math.max(0, 100 - (pickupDist / 5) * 100);
    const dropScore = Math.max(0, 100 - (dropDist / 5) * 100);
    const timeScore = timeSim * 100;

    const finalScore = (routeOverlapScore * 0.60) + (pickupScore * 0.20) + (dropScore * 0.15) + (timeScore * 0.05);

    return {
      finalScore: Math.min(100, Math.max(0, Math.round(finalScore))),
      routeOverlapPct: Math.round(routeOverlapPct),
      pickupDist: Math.round(pickupDist * 10) / 10,
      dropDist: Math.round(dropDist * 10) / 10,
      timeDiffMins: Math.round((1 - timeSim) * 60)
    };
  }

  return calculateFallbackMatchScore(ride, query);
}

function calculateFallbackMatchScore(ride: RidePost, query: RideQuery): MatchScoreData {
  const pickupDist = haversineDist(query.pickupLat, query.pickupLon, ride.pickup_lat, ride.pickup_lon);
  const dropDist = haversineDist(query.dropLat, query.dropLon, ride.drop_lat, ride.drop_lon);
  const timeSim = calcTimeSimilarity(query.time || query.returnTime, ride.journey_time || ride.return_time);

  let pScore = Math.max(0, 100 - (pickupDist / 10) * 100);
  let dScore = Math.max(0, 100 - (dropDist / 10) * 100);
  
  if (query.pickup || query.drop) {
    const fuse = new Fuse([{ name: ride.pickup_location }, { name: ride.drop_location }], { keys: ["name"], includeScore: true, threshold: 0.6 });
    if (query.pickup) {
      const pRes = fuse.search(query.pickup);
      if (pRes.length > 0) pScore = Math.max(pScore, (1 - (pRes[0].score || 0)) * 100);
    }
    if (query.drop) {
      const dRes = fuse.search(query.drop);
      if (dRes.length > 0) dScore = Math.max(dScore, (1 - (dRes[0].score || 0)) * 100);
    }
  }

  const finalScore = (pScore * 0.45) + (dScore * 0.45) + (timeSim * 100 * 0.10);
  
  return {
    finalScore: Math.min(100, Math.max(0, Math.round(finalScore))),
    routeOverlapPct: 0,
    pickupDist: pickupDist === Infinity ? 0 : Math.round(pickupDist * 10) / 10,
    dropDist: dropDist === Infinity ? 0 : Math.round(dropDist * 10) / 10,
    timeDiffMins: Math.round((1 - timeSim) * 60)
  };
}

export function calculateMatchScore(ride: RidePost, query: RideQuery): number {
  return calculateFallbackMatchScore(ride, query).finalScore;
}
