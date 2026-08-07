import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SEO } from "@/components/seo";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Search as SearchIcon, MapPin, Car } from "lucide-react";
import { LaunchpadRegistrationForm } from "@/components/LaunchpadRegistrationForm";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/launchpadx-2026")({
  head: () => ({
    meta: [
      { title: "VetriaAI LaunchPadX 2026 Networking Hub" },
      { name: "description", content: "A dedicated space for everyone attending the VetriaAI LaunchPadX 2026 event to discover, connect, and network with fellow participants before the event." },
    ],
  }),
  component: LaunchPadXHub,
});

function LaunchPadXHub() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Fetch Event details
  const { data: event } = useQuery({
    queryKey: ["event", "launchpadx-2026"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", "launchpadx-2026")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Check if current user is registered
  const { data: myRegistration } = useQuery({
    queryKey: ["event_registration", event?.id, user?.id],
    enabled: !!event?.id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", event!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch all participants
  const { data: participantsData } = useQuery({
    queryKey: ["event_participants", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", event!.id);
      if (error) throw error;
      return data;
    },
  });

  const handleAddParticipantClick = () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/launchpadx-2026" } });
      return;
    }
    if (!profile) {
      navigate({ to: "/onboarding", search: { redirect: "/launchpadx-2026" } });
      return;
    }
    setIsRegistrationModalOpen(true);
  };

  const handleConnectClick = (participantId: string) => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/launchpadx-2026" } });
      return;
    }
    if (!profile) {
      navigate({ to: "/onboarding", search: { redirect: "/launchpadx-2026" } });
      return;
    }
    if (!myRegistration) {
      setIsRegistrationModalOpen(true);
      return;
    }
    // Handle connection request logic here...
    alert("Connection request functionality coming soon!");
  };

  const participants = useMemo(() => {
    let list = participantsData || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.team_name && p.team_name.toLowerCase().includes(q)) ||
        (p.origin_city && p.origin_city.toLowerCase().includes(q)) ||
        (p.local_location && p.local_location.toLowerCase().includes(q))
      );
    }
    return list;
  }, [participantsData, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 text-foreground pb-24">
      <SEO
        title="VetriaAI LaunchPadX 2026 Networking Hub"
        description="A dedicated space for everyone attending the VetriaAI LaunchPadX 2026 event to discover, connect, and network with fellow participants before the event."
        canonical="https://linqrides.in/launchpadx-2026"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 md:top-16 z-30 bg-slate-50/90 backdrop-blur-md px-2 py-3 border-b border-border shadow-sm">
          <div className="max-w-5xl mx-auto space-y-3">
            
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search participants, pickup, or drop location..."
                  className="w-full rounded-full border border-input bg-white pl-9 pr-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {!myRegistration && (
                <button
                  onClick={handleAddParticipantClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors shrink-0"
                >
                  <UserPlus className="size-4" />
                  Add Participant
                </button>
              )}
            </div>

            <TabsList className="grid w-full grid-cols-4 h-12 bg-white shadow-sm border border-border rounded-xl">
              <TabsTrigger value="directory" className="text-[11px] sm:text-sm rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium px-1">
                Participants
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-[11px] sm:text-sm rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium px-1">
                Sent
              </TabsTrigger>
              <TabsTrigger value="incoming" className="text-[11px] sm:text-sm rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium px-1">
                Incoming
              </TabsTrigger>
              <TabsTrigger value="connections" className="text-[11px] sm:text-sm rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium px-1 truncate">
                Connections
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-primary px-6 py-12 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {event?.title || "VetriaAI LaunchPadX 2026"}
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              {event?.subtitle || "Connect, discover, and network with fellow participants before the event."}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="mt-8">
            <TabsContent value="directory" className="space-y-4 focus-visible:outline-none">
              {participants.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-white rounded-2xl border border-border">
                  <Users className="size-12 mx-auto mb-4 opacity-20" />
                  <p>No participants found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-border p-5 flex flex-col shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">{p.full_name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate text-foreground">{p.full_name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{p.profession} at {p.organization}</p>
                        </div>
                      </div>

                      {(p.team_name || p.origin_city || p.local_location) && (
                        <div className="mt-4 p-3 bg-secondary/50 rounded-xl space-y-2 border border-border/50">
                          {p.team_name && (
                            <div className="flex items-start gap-2 text-xs">
                              <Users className="size-3.5 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1 text-muted-foreground">
                                <span className="font-medium text-foreground">Team:</span> {p.team_name} ({p.team_size} members)
                              </div>
                            </div>
                          )}
                          
                          {p.is_local ? (
                            <>
                              <div className="flex items-start gap-2 text-xs">
                                <MapPin className="size-3.5 text-green-600 mt-0.5 shrink-0" />
                                <div className="flex-1 text-muted-foreground">
                                  <span className="font-medium text-foreground text-green-700">Local:</span> {p.local_location || "Not specified"}
                                </div>
                              </div>
                              {p.travel_time && (
                                <div className="flex items-start gap-2 text-xs pl-5 text-muted-foreground">
                                  <span className="font-medium text-foreground">Time & Date:</span> {p.travel_time}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-start gap-2 text-xs">
                                <MapPin className="size-3.5 text-blue-600 mt-0.5 shrink-0" />
                                <div className="flex-1 text-muted-foreground">
                                  <span className="font-medium text-foreground text-blue-700">Travelling From:</span> {p.origin_city || "Not specified"}
                                </div>
                              </div>
                              {(p.travel_medium || p.pickup_station) && (
                                <div className="flex items-start gap-2 text-xs pl-5 text-muted-foreground flex-col sm:flex-row sm:gap-4">
                                  {p.travel_medium && <span><span className="font-medium text-foreground">By:</span> {p.travel_medium}</span>}
                                  {p.pickup_station && <span><span className="font-medium text-foreground">Pickup:</span> {p.pickup_station}</span>}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-4 flex gap-2">
                        {p.id !== user?.id && (
                          <button
                            onClick={() => handleConnectClick(p.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent">
               <div className="text-center py-20 text-muted-foreground bg-white rounded-2xl border border-border">
                <p>Sent connection requests goes here.</p>
              </div>
            </TabsContent>
            <TabsContent value="incoming">
               <div className="text-center py-20 text-muted-foreground bg-white rounded-2xl border border-border">
                <p>Incoming connection requests goes here.</p>
              </div>
            </TabsContent>
            <TabsContent value="connections">
               <div className="text-center py-20 text-muted-foreground bg-white rounded-2xl border border-border">
                <p>Mutually accepted connections goes here.</p>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <BottomNav />

      {/* Registration Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 bg-white rounded-3xl shadow-xl">
            <button
              onClick={() => setIsRegistrationModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Join the Networking Hub</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your profile to connect with others and share rides to the event.
                </p>
              </div>
              <LaunchpadRegistrationForm 
                eventId={event?.id as string} 
                onSuccess={() => {
                  setIsRegistrationModalOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
