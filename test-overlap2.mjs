import { lineString } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';

const routeA = {
  distanceMeters: 4120, // 4.12 km actual
  durationSeconds: 1500,
  coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]],
};

const routeB = {
  distanceMeters: 4120,
  durationSeconds: 1500,
  coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]], // identical
};

const lineA = lineString(routeA.coordinates);
const lineB = lineString(routeB.coordinates);
const TOLERANCE_KM = 0.15;
const sharedSegments = [];
let currentSegment = [];

for (let i = 0; i < routeA.coordinates.length; i++) {
  const pt = routeA.coordinates[i];
  const nearest = nearestPointOnLine(lineB, pt);
  if (nearest && nearest.properties.dist !== undefined && nearest.properties.dist <= TOLERANCE_KM) {
    currentSegment.push(pt);
  } else {
    if (currentSegment.length > 1) sharedSegments.push([...currentSegment]);
    currentSegment = [];
  }
}
if (currentSegment.length > 1) sharedSegments.push([...currentSegment]);

let totalSharedDistanceKm = 0;
for (const segment of sharedSegments) {
  totalSharedDistanceKm += length(lineString(segment), { units: 'kilometers' });
}

// FIX: Use Turf length for the whole route to ensure consistent numerator/denominator
const routeAKm = length(lineA, { units: 'kilometers' });

let overlapPct = Math.round((totalSharedDistanceKm / routeAKm) * 100);
console.log("Turf A Length:", routeAKm, "Shared Length:", totalSharedDistanceKm);
console.log("Overlap pct:", overlapPct);
