import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRidePosts } from "@/hooks/use-ride-posts";
import { Card } from "@/components/ui/card";

// Fix Leaflet default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function LiveRouteMap() {
  const { posts } = useRidePosts({ limit: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !posts || posts.length === 0) return null;

  // Find a reasonable center (average of pickups)
  let sumLat = 0;
  let sumLon = 0;
  let count = 0;
  
  const validPosts = posts.filter(p => p.pickup_lat && p.pickup_lon && p.drop_lat && p.drop_lon);
  
  validPosts.forEach(p => {
    sumLat += p.pickup_lat!;
    sumLon += p.pickup_lon!;
    count++;
  });

  const center: [number, number] = count > 0 
    ? [sumLat / count, sumLon / count] 
    : [28.6139, 77.2090]; // Default to New Delhi if no data

  return (
    <div className="w-full relative mt-8 mb-4 hidden lg:block">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">GO TOGETHER</h3>
          <p className="text-sm text-muted-foreground">See people travelling your way.</p>
        </div>
        <Card className="flex items-center gap-2 px-3 py-1.5 shadow-sm bg-primary/5 border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-primary">{validPosts.length} live routes</span>
        </Card>
      </div>

      <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border shadow-md relative z-0">
        <MapContainer 
          center={center} 
          zoom={11} 
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {validPosts.map(post => (
            <div key={post.id}>
              <Marker position={[post.pickup_lat!, post.pickup_lon!]} opacity={0.8}>
                <Tooltip direction="top" className="rounded-lg shadow-sm font-medium">
                  {post.owner_id ? "Rider" : "Driver"} going to {post.drop_location.split(',')[0]}
                </Tooltip>
              </Marker>
              
              <Polyline 
                positions={[
                  [post.pickup_lat!, post.pickup_lon!],
                  [post.drop_lat!, post.drop_lon!]
                ]} 
                color="hsl(var(--primary))"
                weight={3}
                opacity={0.4}
                dashArray="5, 10"
              />
            </div>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
