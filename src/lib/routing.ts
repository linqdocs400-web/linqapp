import { lineString } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';
import distance from '@turf/distance';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][]; // [lon, lat] for turf/geojson
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
}

export interface OverlapMetrics {
  overlapPct: number;
  sharedDistanceKm: number;
  sharedDurationSec: number;
  sharedGeometry: GeoJSON.LineString | GeoJSON.MultiLineString | null;
}

export interface DetailedRouteMatch {
  symmetricOverlapPct: number;
  overlapAtoB: number;
  overlapBtoA: number;
  sharedDistanceKm: number;
  sharedDurationSec: number;
  directionDifferenceDeg: number;
  directionCompatibility: number;
  sharedGeometry: GeoJSON.LineString | GeoJSON.MultiLineString | null;
}

export const ROUTE_OVERLAP_TOLERANCE_METERS = 150;
export const ROUTE_OVERLAP_TOLERANCE_KM = ROUTE_OVERLAP_TOLERANCE_METERS / 1000;
export const DIRECTION_DIFF_THRESHOLD_DEG = 55;

// Simple in-memory cache for OSRM routes
const routeCache = new Map<string, RouteData>();

export async function getRoute(start: Coordinates, end: Coordinates): Promise<RouteData> {
  if (
    typeof start.lat !== 'number' ||
    typeof start.lng !== 'number' ||
    typeof end.lat !== 'number' ||
    typeof end.lng !== 'number'
  ) {
    throw new Error('Invalid coordinates for routing');
  }

  const cacheKey = `${start.lat.toFixed(5)},${start.lng.toFixed(5)}-${end.lat.toFixed(5)},${end.lng.toFixed(5)}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM routing failed');
    
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
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
    console.error('Routing error:', error);
    throw error;
  }
}

/**
 * Calculates initial bearing in degrees (0-360) between two [lon, lat] points.
 */
export function calculateBearing(pt1: [number, number], pt2: [number, number]): number {
  const lon1 = (pt1[0] * Math.PI) / 180;
  const lat1 = (pt1[1] * Math.PI) / 180;
  const lon2 = (pt2[0] * Math.PI) / 180;
  const lat2 = (pt2[1] * Math.PI) / 180;
  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Densifies a list of [lon, lat] points by adding intermediate points along long segments
 * at most maxIntervalKm apart. Returns samples with step lengths.
 */
function densifyRoute(coordinates: [number, number][], maxIntervalKm = 0.05): { point: [number, number]; distKm: number }[] {
  if (coordinates.length < 2) {
    return coordinates.map((pt) => ({ point: pt, distKm: 0 }));
  }

  const samples: { point: [number, number]; distKm: number }[] = [];
  samples.push({ point: coordinates[0], distKm: 0 });

  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const segDist = distance(p1, p2, { units: 'kilometers' });

    if (segDist <= maxIntervalKm) {
      samples.push({ point: p2, distKm: segDist });
    } else {
      const steps = Math.ceil(segDist / maxIntervalKm);
      const stepDist = segDist / steps;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const interpPt: [number, number] = [
          p1[0] + (p2[0] - p1[0]) * t,
          p1[1] + (p2[1] - p1[1]) * t,
        ];
        samples.push({ point: interpPt, distKm: stepDist });
      }
    }
  }

  return samples;
}

/**
 * Robust Route Overlap V2 Comparison
 */
export function calculateRouteMatch(routeA: RouteData, routeB: RouteData): DetailedRouteMatch {
  if (
    !routeA.geometry ||
    !routeB.geometry ||
    !routeA.coordinates ||
    !routeB.coordinates ||
    routeA.coordinates.length < 2 ||
    routeB.coordinates.length < 2
  ) {
    return {
      symmetricOverlapPct: 0,
      overlapAtoB: 0,
      overlapBtoA: 0,
      sharedDistanceKm: 0,
      sharedDurationSec: 0,
      directionDifferenceDeg: 180,
      directionCompatibility: 0,
      sharedGeometry: null,
    };
  }

  const lineA = lineString(routeA.coordinates);
  const lineB = lineString(routeB.coordinates);

  const totalDistA = length(lineA, { units: 'kilometers' });
  const totalDistB = length(lineB, { units: 'kilometers' });

  if (totalDistA <= 0 || totalDistB <= 0) {
    return {
      symmetricOverlapPct: 0,
      overlapAtoB: 0,
      overlapBtoA: 0,
      sharedDistanceKm: 0,
      sharedDurationSec: 0,
      directionDifferenceDeg: 180,
      directionCompatibility: 0,
      sharedGeometry: null,
    };
  }

  // 1. Densify routes for continuous corridor evaluation
  const samplesA = densifyRoute(routeA.coordinates, 0.05);
  const samplesB = densifyRoute(routeB.coordinates, 0.05);

  // Evaluate Route A against Line B
  let sharedDistA = 0;
  const sharedSegmentsA: [number, number][][] = [];
  let currentSegment: [number, number][] = [];

  for (const sample of samplesA) {
    let isClose = false;
    try {
      const nearest = nearestPointOnLine(lineB, sample.point);
      // Fix dist = 0 falsy bug with explicit typeof check
      if (nearest && typeof nearest.properties.dist === 'number' && nearest.properties.dist <= ROUTE_OVERLAP_TOLERANCE_KM) {
        isClose = true;
      }
    } catch {
      isClose = false;
    }

    if (isClose) {
      sharedDistA += sample.distKm;
      currentSegment.push(sample.point);
    } else {
      if (currentSegment.length > 1) {
        sharedSegmentsA.push([...currentSegment]);
      }
      currentSegment = [];
    }
  }
  if (currentSegment.length > 1) {
    sharedSegmentsA.push([...currentSegment]);
  }

  // Evaluate Route B against Line A
  let sharedDistB = 0;
  for (const sample of samplesB) {
    try {
      const nearest = nearestPointOnLine(lineA, sample.point);
      if (nearest && typeof nearest.properties.dist === 'number' && nearest.properties.dist <= ROUTE_OVERLAP_TOLERANCE_KM) {
        sharedDistB += sample.distKm;
      }
    } catch {
      // ignore point errors
    }
  }

  // Percentage overlaps
  const overlapAtoB = Math.min(100, Math.max(0, (sharedDistA / totalDistA) * 100));
  const overlapBtoA = Math.min(100, Math.max(0, (sharedDistB / totalDistB) * 100));

  // 2. Conservative Symmetric Overlap
  const symmetricOverlapPct = Math.round(Math.min(overlapAtoB, overlapBtoA));

  // 3. Direction Compatibility
  const bearingA = calculateBearing(routeA.coordinates[0], routeA.coordinates[routeA.coordinates.length - 1]);
  const bearingB = calculateBearing(routeB.coordinates[0], routeB.coordinates[routeB.coordinates.length - 1]);

  let directionDifferenceDeg = Math.abs(bearingA - bearingB) % 360;
  if (directionDifferenceDeg > 180) {
    directionDifferenceDeg = 360 - directionDifferenceDeg;
  }

  let directionCompatibility = 0;
  if (directionDifferenceDeg <= DIRECTION_DIFF_THRESHOLD_DEG) {
    directionCompatibility = 1 - 0.5 * (directionDifferenceDeg / DIRECTION_DIFF_THRESHOLD_DEG);
  } else {
    directionCompatibility = Math.max(
      0,
      0.5 * ((180 - directionDifferenceDeg) / (180 - DIRECTION_DIFF_THRESHOLD_DEG))
    );
  }

  // 4. Shared Geometry (derived from Route A fragments)
  // Filter out tiny disconnected segments (< 50 meters)
  const validSegments = sharedSegmentsA.filter((seg) => {
    if (seg.length < 2) return false;
    return length(lineString(seg), { units: 'kilometers' }) >= 0.05;
  });

  let sharedGeometry: GeoJSON.LineString | GeoJSON.MultiLineString | null = null;
  if (validSegments.length === 1) {
    sharedGeometry = { type: 'LineString', coordinates: validSegments[0] };
  } else if (validSegments.length > 1) {
    sharedGeometry = { type: 'MultiLineString', coordinates: validSegments };
  }

  // 5. Shared Distance & Duration (relative to user route A)
  const actualRouteAKm = routeA.distanceMeters / 1000;
  const userOverlapPct = Math.min(100, (sharedDistA / totalDistA) * 100);
  const sharedDistanceKm = Number(((userOverlapPct / 100) * actualRouteAKm).toFixed(2));
  const sharedDurationSec = Math.round((userOverlapPct / 100) * routeA.durationSeconds);

  return {
    symmetricOverlapPct,
    overlapAtoB: Math.round(overlapAtoB),
    overlapBtoA: Math.round(overlapBtoA),
    sharedDistanceKm,
    sharedDurationSec,
    directionDifferenceDeg: Math.round(directionDifferenceDeg),
    directionCompatibility: Number(directionCompatibility.toFixed(3)),
    sharedGeometry,
  };
}

export function calculateOverlap(routeA: RouteData, routeB: RouteData): OverlapMetrics {
  const match = calculateRouteMatch(routeA, routeB);
  return {
    overlapPct: match.symmetricOverlapPct,
    sharedDistanceKm: match.sharedDistanceKm,
    sharedDurationSec: match.sharedDurationSec,
    sharedGeometry: match.sharedGeometry,
  };
}
