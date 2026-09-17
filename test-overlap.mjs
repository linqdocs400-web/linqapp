import { lineString } from '@turf/helpers';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';

const routeA = {
  distanceMeters: 4120, // 4.12 km actual
  durationSeconds: 1500,
  coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]],
  geometry: { type: "LineString", coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]] }
};

const routeB = {
  distanceMeters: 4120,
  durationSeconds: 1500,
  coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]], // identical
  geometry: { type: "LineString", coordinates: [[78.4867, 17.3850], [78.4900, 17.3900], [78.5000, 17.4000], [78.5100, 17.4100]] }
};

const lineA = lineString(routeA.coordinates);
const lineB = lineString(routeB.coordinates);
const TOLERANCE_KM = 0.15;
const sharedSegments = [];
let currentSegment = [];

for (let i = 0; i < routeA.coordinates.length; i++) {
  const pt = routeA.coordinates[i];
  try {
    const nearest = nearestPointOnLine(lineB, pt);
    if (nearest && nearest.properties.dist !== undefined && nearest.properties.dist <= TOLERANCE_KM) {
      currentSegment.push(pt);
    } else {
      if (currentSegment.length > 1) {
        sharedSegments.push([...currentSegment]);
      }
      currentSegment = [];
    }
  } catch (e) {
    console.error(e);
  }
}
if (currentSegment.length > 1) {
  sharedSegments.push([...currentSegment]);
}

console.log("Shared segments:", JSON.stringify(sharedSegments));
let totalSharedDistanceKm = 0;
for (const segment of sharedSegments) {
  const segLine = lineString(segment);
  totalSharedDistanceKm += length(segLine, { units: 'kilometers' });
}
console.log("Total shared km turf length:", totalSharedDistanceKm);
const routeAKm = routeA.distanceMeters / 1000;
let overlapPct = Math.round((totalSharedDistanceKm / routeAKm) * 100);
console.log("Overlap pct:", overlapPct);
