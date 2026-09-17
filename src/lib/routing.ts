import { lineString } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';
import lineSlice from '@turf/line-slice';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][]; // [lon, lat] for turf/geojson, Leaflet uses [lat, lon] so we need to be careful.
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
}

export interface OverlapMetrics {
  overlapPct: number;
  sharedDistanceKm: number;
  sharedDurationSec: number;
  sharedGeometry: GeoJSON.LineString | null;
}

// Simple in-memory cache for OSRM routes
const routeCache = new Map<string, RouteData>();

export async function getRoute(start: Coordinates, end: Coordinates): Promise<RouteData> {
  const cacheKey = `${start.lat.toFixed(5)},${start.lng.toFixed(5)}-${end.lat.toFixed(5)},${end.lng.toFixed(5)}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM routing failed");
    
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const route = data.routes[0];
    const result: RouteData = {
      coordinates: route.geometry.coordinates, // Array of [lon, lat]
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry,
    };

    routeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Routing error:", error);
    throw error;
  }
}

export function calculateOverlap(routeA: RouteData, routeB: RouteData): OverlapMetrics {
  if (!routeA.geometry || !routeB.geometry || routeA.coordinates.length < 2 || routeB.coordinates.length < 2) {
    return { overlapPct: 0, sharedDistanceKm: 0, sharedDurationSec: 0, sharedGeometry: null };
  }

  const lineA = lineString(routeA.coordinates);
  const lineB = lineString(routeB.coordinates);
  
  const TOLERANCE_KM = 0.05; // 50 meters tolerance for road matching
  
  let sharedCoords: [number, number][] = [];
  let currentSegment: [number, number][] = [];
  let longestSharedSegment: [number, number][] = [];

  // Sample points along route A
  for (let i = 0; i < routeA.coordinates.length; i++) {
    const pt = routeA.coordinates[i];
    
    try {
      const nearest = nearestPointOnLine(lineB, pt);
      if (nearest && nearest.properties.dist && nearest.properties.dist <= TOLERANCE_KM) {
        currentSegment.push(pt);
      } else {
        if (currentSegment.length > longestSharedSegment.length) {
          longestSharedSegment = [...currentSegment];
        }
        currentSegment = [];
      }
    } catch (e) {
      // Ignore calculation errors for single points
    }
  }

  // Check if the last segment was the longest
  if (currentSegment.length > longestSharedSegment.length) {
    longestSharedSegment = [...currentSegment];
  }

  // Require at least 2 points for a valid shared segment
  if (longestSharedSegment.length < 2) {
    return { overlapPct: 0, sharedDistanceKm: 0, sharedDurationSec: 0, sharedGeometry: null };
  }

  const sharedGeo = lineString(longestSharedSegment);
  const sharedDistanceKm = length(sharedGeo, { units: 'kilometers' });
  const routeAKm = routeA.distanceMeters / 1000;
  
  let overlapPct = 0;
  if (routeAKm > 0) {
    overlapPct = Math.round((sharedDistanceKm / routeAKm) * 100);
    // Cap at 100%
    if (overlapPct > 100) overlapPct = 100;
  }

  // Estimate shared duration based on average speed of route A
  const speedKmPerSec = routeAKm / (routeA.durationSeconds || 1);
  const sharedDurationSec = speedKmPerSec > 0 ? Math.round(sharedDistanceKm / speedKmPerSec) : 0;

  return {
    overlapPct,
    sharedDistanceKm: Number(sharedDistanceKm.toFixed(2)),
    sharedDurationSec,
    sharedGeometry: sharedGeo.geometry
  };
}
