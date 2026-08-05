import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/components/seo";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Clock, UserCheck } from "lucide-react";
import { LaunchpadRegistrationForm } from "@/components/LaunchpadRegistrationForm";

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
  const [activeTab, setActiveTab] = useState("directory");

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

  return (
    <main className="min-h-screen bg-slate-50 text-foreground pb-24">
      <SEO
        title="VetriaAI LaunchPadX 2026 Networking Hub"
        description="A dedicated space for everyone attending the VetriaAI LaunchPadX 2026 event to discover, connect, and network with fellow participants before the event."
        canonical="https://linqrides.in/launchpadx-2026"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 md:top-16 z-40 bg-slate-50/90 backdrop-blur-md px-2 py-3 border-b border-border">
          <div className="max-w-5xl mx-auto">
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
        <div className="bg-primary px-6 py-16 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {event?.title || "VetriaAI LaunchPadX 2026"}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              {event?.subtitle || "Connect, discover, and network with fellow participants before the event."}
            </p>

            {!myRegistration && user && (
               <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left max-w-xl mx-auto border border-white/20">
                 <h3 className="text-xl font-bold mb-4">Register for the Hub</h3>
                 <LaunchpadRegistrationForm eventId={event?.id} onSuccess={() => {}} />
               </div>
            )}
            {!user && (
              <p className="text-sm mt-4 opacity-80">Please log in to join the networking hub.</p>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          
          <div className="mt-8">
            <TabsContent value="directory">
              <div className="text-center py-20 text-muted-foreground">
                <Users className="size-12 mx-auto mb-4 opacity-20" />
                <p>Participant directory goes here.</p>
              </div>
            </TabsContent>
            <TabsContent value="sent">
               <div className="text-center py-20 text-muted-foreground">
                <p>Sent connection requests goes here.</p>
              </div>
            </TabsContent>
            <TabsContent value="incoming">
               <div className="text-center py-20 text-muted-foreground">
                <p>Incoming connection requests goes here.</p>
              </div>
            </TabsContent>
            <TabsContent value="connections">
               <div className="text-center py-20 text-muted-foreground">
                <p>Mutually accepted connections goes here.</p>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <BottomNav />
    </main>
  );
}
