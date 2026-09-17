import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import { useConnectionRequests } from '@/hooks/use-connection-requests';
import { RouteMap } from '@/components/map/RouteMap';
import { getRoute, calculateOverlap, type RouteData, type OverlapMetrics } from '@/lib/routing';
import { ArrowLeft, MapPin, Clock, CalendarDays, Users, Star, Link as LinkIcon, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatTime } from '@/lib/utils';
import { ConnectBtn } from '@/components/ConnectBtn';

export const Route = createFileRoute('/ride/$id')({
  component: RideDetails,
});

function RideDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { lastQuery } = useStore();
  const { user } = useAuth();
  
  const [matchedRide, setMatchedRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userRoute, setUserRoute] = useState<RouteData | null>(null);
  const [matchRoute, setMatchRoute] = useState<RouteData | null>(null);
  const [metrics, setMetrics] = useState<OverlapMetrics | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState(false);

  const { createRequest, sentRequests, unlockedProfiles } = useConnectionRequests();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchRide() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ride_posts')
        .select('*, profiles:owner_id(name, connect_method, connect_id, bio)')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        toast.error("Ride not found");
        navigate({ to: '/' });
      } else {
        setMatchedRide(data);
      }
      setIsLoading(false);
    }
    fetchRide();
  }, [id, navigate]);

  useEffect(() => {
    async function generateRoutes() {
      if (!matchedRide) return;
      
      const hasMatchCoords = matchedRide.pickup_lat && matchedRide.pickup_lon && matchedRide.drop_lat && matchedRide.drop_lon;
      const hasUserCoords = lastQuery?.pickupLat && lastQuery?.pickupLon && lastQuery?.dropLat && lastQuery?.dropLon;
      
      if (!hasMatchCoords) {
        setRoutingError(true);
        return;
      }

      setIsRouting(true);
      setRoutingError(false);

      try {
        const mRoute = await getRoute(
          { lat: matchedRide.pickup_lat, lng: matchedRide.pickup_lon },
          { lat: matchedRide.drop_lat, lng: matchedRide.drop_lon }
        );
        setMatchRoute(mRoute);

        if (hasUserCoords) {
          const uRoute = await getRoute(
            { lat: lastQuery.pickupLat!, lng: lastQuery.pickupLon! },
            { lat: lastQuery.dropLat!, lng: lastQuery.dropLon! }
          );
          setUserRoute(uRoute);
          
          const overlap = calculateOverlap(uRoute, mRoute);
          setMetrics(overlap);
        }
      } catch (err) {
        console.error("Failed to generate routes:", err);
        setRoutingError(true);
      } finally {
        setIsRouting(false);
      }
    }
    
    generateRoutes();
  }, [matchedRide, lastQuery]);

  if (isLoading || !matchedRide) {
    return (
      <main className="min-h-screen bg-background text-foreground pb-20 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading ride details...</p>
      </main>
    );
  }

  const ownerName = matchedRide.profiles?.name || 'Rider';
  const bio = matchedRide.profiles?.bio;
  
  // connection logic
  const isProfileUnlocked = Array.isArray(unlockedProfiles.data) && unlockedProfiles.data.some((up) => up.profile_id === matchedRide.owner_id);
  const request = Array.isArray(sentRequests.data) ? sentRequests.data.find((r) => r.ride_id === id && r.receiver_id === matchedRide.owner_id) : null;
  const requestStatus = request?.status || null;

  const handleRequest = async () => {
    if (!user) {
      toast.error("Please sign in to send requests");
      navigate({ to: "/login", search: { redirect: `/ride/${id}` } });
      return;
    }
    setIsSending(true);
    try {
      await createRequest.mutateAsync({
        receiverId: matchedRide.owner_id,
        rideId: id,
      });
      toast.success("Request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => window.history.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-2xl font-bold">Ride Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Map & Metrics */}
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
            {isRouting ? (
              <div className="h-[300px] sm:h-[400px] w-full bg-muted flex flex-col items-center justify-center">
                <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground font-medium">Calculating actual road routes...</p>
              </div>
            ) : routingError ? (
              <div className="h-[300px] sm:h-[400px] w-full bg-muted flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
                Route map is temporarily unavailable or coordinates are missing.
              </div>
            ) : (
              <RouteMap userRoute={userRoute} matchRoute={matchRoute} sharedGeometry={metrics?.sharedGeometry || null} />
            )}
            
            {!isRouting && !routingError && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm p-3 rounded-xl border border-border/50 shadow-lg text-xs flex justify-between">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-blue-500 rounded"></div> Your Route</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-gray-400 rounded"></div> Their Route</div>
                {metrics && metrics.overlapPct > 0 && <div className="flex items-center gap-1.5 font-bold"><div className="w-3 h-1.5 bg-violet-500 rounded"></div> Shared</div>}
              </div>
            )}
          </div>

          {metrics && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <LinkIcon className="size-5 text-primary" /> Route Match Analysis
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl p-3 text-center border border-primary/20">
                  <p className="text-2xl font-bold text-primary">{metrics.overlapPct}%</p>
                  <p className="text-[10px] uppercase font-semibold text-primary/70">Overlap</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center border border-border">
                  <p className="text-lg font-bold">{metrics.sharedDistanceKm} <span className="text-sm font-medium">km</span></p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Shared</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center border border-border">
                  <p className="text-lg font-bold">~{Math.round(metrics.sharedDurationSec / 60)} <span className="text-sm font-medium">min</span></p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Together</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="font-medium">Your Route</span>
                  <span className="text-muted-foreground">
                    {userRoute ? `${(userRoute.distanceMeters / 1000).toFixed(1)} km · ~${Math.round(userRoute.durationSeconds / 60)} min` : "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Their Route</span>
                  <span className="text-muted-foreground">
                    {matchRoute ? `${(matchRoute.distanceMeters / 1000).toFixed(1)} km · ~${Math.round(matchRoute.durationSeconds / 60)} min` : "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: User & Ride Details */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                <Users className="size-8 text-primary/40" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{ownerName}</h2>
                  <BadgeCheck className="size-5 text-primary" />
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="size-4 fill-primary text-primary" /> 4.9 (12 rides)
                </p>
              </div>
            </div>

            {bio && <p className="text-sm text-muted-foreground mb-6 italic">"{bio}"</p>}

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="size-3 rounded-full bg-foreground" />
                  <div className="w-px h-10 bg-border my-1" />
                  <div className="size-3 rounded-full bg-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Pickup</p>
                    <p className="font-medium text-sm">{matchedRide.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Drop-off</p>
                    <p className="font-medium text-sm">{matchedRide.drop_location}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-primary" />
                  <span className="font-medium">{formatTime(matchedRide.journey_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-primary" />
                  <span className="font-medium">{matchedRide.seats} seat{matchedRide.seats > 1 ? 's' : ''}</span>
                </div>
                {matchedRide.journey_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="size-4 text-primary" />
                    <span className="font-medium">{matchedRide.journey_date}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                    {matchedRide.ride_type === 'long' ? 'Planned' : matchedRide.ride_type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              {isProfileUnlocked ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-center text-muted-foreground">Profile Unlocked! Connect directly:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <ConnectBtn
                      method="whatsapp"
                      id={matchedRide.profiles?.connect_id || matchedRide.owner_id}
                      active={matchedRide.profiles?.connect_method === "whatsapp"}
                      userName={user?.user_metadata?.full_name || ""}
                    />
                    <ConnectBtn
                      method="instagram"
                      id={matchedRide.profiles?.connect_id || matchedRide.owner_id}
                      active={matchedRide.profiles?.connect_method === "instagram"}
                      userName={user?.user_metadata?.full_name || ""}
                    />
                    <ConnectBtn
                      method="telegram"
                      id={matchedRide.profiles?.connect_id || matchedRide.owner_id}
                      active={matchedRide.profiles?.connect_method === "telegram"}
                      userName={user?.user_metadata?.full_name || ""}
                    />
                  </div>
                </div>
              ) : requestStatus === "pending" ? (
                <button disabled className="w-full py-3.5 rounded-xl bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Clock className="size-5" /> Request Pending
                </button>
              ) : (
                <button 
                  onClick={handleRequest}
                  disabled={isSending}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="size-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : (
                    <>Request to Pool</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
