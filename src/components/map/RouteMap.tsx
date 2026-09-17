import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RouteData, OverlapMetrics } from '@/lib/routing';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for better distinction
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const userPickupIcon = createCustomIcon('#2563eb'); // blue-600
const userDropIcon = createCustomIcon('#dc2626');   // red-600
const matchPickupIcon = createCustomIcon('#4b5563'); // gray-600
const matchDropIcon = createCustomIcon('#9ca3af');   // gray-400

interface RouteMapProps {
  userRoute: RouteData | null;
  matchRoute: RouteData | null;
  sharedGeometry: GeoJSON.LineString | null;
}

// Component to handle auto-fitting bounds when routes change
const MapBounds = ({ userRoute, matchRoute }: { userRoute: RouteData | null, matchRoute: RouteData | null }) => {
  const map = useMap();
  
  useEffect(() => {
    const allCoords: [number, number][] = [];
    
    if (userRoute) {
      userRoute.coordinates.forEach(coord => allCoords.push([coord[1], coord[0]])); // leaflet wants [lat, lon]
    }
    
    if (matchRoute) {
      matchRoute.coordinates.forEach(coord => allCoords.push([coord[1], coord[0]]));
    }

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [map, userRoute, matchRoute]);

  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ userRoute, matchRoute, sharedGeometry }) => {
  // Convert [lon, lat] from Turf/GeoJSON to [lat, lon] for Leaflet
  const formatCoords = (coords: [number, number][]) => coords.map(c => [c[1], c[0]] as [number, number]);

  return (
    <div className="h-[300px] sm:h-[400px] w-full rounded-2xl overflow-hidden border border-border relative z-0">
      <MapContainer 
        center={[17.3850, 78.4867]} // Default Hyderabad
        zoom={11} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds userRoute={userRoute} matchRoute={matchRoute} />

        {/* Matched User Route - Gray */}
        {matchRoute && (
          <>
            <Polyline 
              positions={formatCoords(matchRoute.coordinates)} 
              pathOptions={{ color: '#9ca3af', weight: 4, opacity: 0.6, dashArray: '5, 10' }} 
            />
            <Marker position={[matchRoute.coordinates[0][1], matchRoute.coordinates[0][0]]} icon={matchPickupIcon}>
              <Popup>Their Pickup</Popup>
            </Marker>
            <Marker position={[matchRoute.coordinates[matchRoute.coordinates.length - 1][1], matchRoute.coordinates[matchRoute.coordinates.length - 1][0]]} icon={matchDropIcon}>
              <Popup>Their Drop</Popup>
            </Marker>
          </>
        )}

        {/* Current User Route - Blue */}
        {userRoute && (
          <>
            <Polyline 
              positions={formatCoords(userRoute.coordinates)} 
              pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} 
            />
            <Marker position={[userRoute.coordinates[0][1], userRoute.coordinates[0][0]]} icon={userPickupIcon}>
              <Popup>Your Pickup</Popup>
            </Marker>
            <Marker position={[userRoute.coordinates[userRoute.coordinates.length - 1][1], userRoute.coordinates[userRoute.coordinates.length - 1][0]]} icon={userDropIcon}>
              <Popup>Your Drop</Popup>
            </Marker>
          </>
        )}

        {/* Shared Route - Thick Primary Color */}
        {sharedGeometry && (
          <Polyline 
            positions={formatCoords(sharedGeometry.coordinates as [number, number][])} 
            pathOptions={{ color: '#8b5cf6', weight: 8, opacity: 0.9 }} 
          />
        )}
      </MapContainer>
    </div>
  );
};
