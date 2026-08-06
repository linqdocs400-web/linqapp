import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/bottom-nav";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-provider";
import {
  Search as SearchIcon,
  Building2,
  GraduationCap,
  Share2,
  MessageCircle,
  Smartphone,
  Flame,
} from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Hotspots — linQ" }] }),
  component: SearchPage,
});

const mockOrgs = [
  // fallback while loading or empty
];

function ReferCard({ compact = false }: { compact?: boolean }) {
  const referralMsg = encodeURIComponent(
    "Hey! Try linQ — find verified ride partners going your way. www.linqrides.in",
  );
  return (
    <section className={`rounded-3xl border border-border bg-card ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-center gap-2">
        <Share2 className="size-5 text-primary" />
        <h2 className={compact ? "text-base font-bold" : "text-lg font-bold"}>Refer your circle</h2>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        More riders from your college / office = better matches. Invite them in one tap.
      </p>
      <div className={`mt-4 grid ${compact ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
        <a
          href={`https://wa.me/?text=${referralMsg}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        <a
          href={`sms:?body=${referralMsg}`}
          className="flex items-center justify-center gap-2 rounded-full bg-foreground px-3 py-2.5 text-xs font-semibold text-background"
        >
          <Smartphone className="size-4" /> SMS
        </a>
      </div>
    </section>
  );
}

function LaunchPadCard({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/launchpadx-2026"
      className={`block rounded-3xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors ${compact ? "p-4" : "p-6"}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🚀</span>
        <h2 className={compact ? "text-base font-bold text-primary" : "text-lg font-bold text-primary"}>LaunchPadX 2026</h2>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Attending the VetriaAI LaunchPadX 2026 event? Connect with other participants before the event!
      </p>
      <div className="mt-4 text-xs font-semibold text-primary flex items-center gap-1">
        Join Networking Hub →
      </div>
    </Link>
  );
}

function SearchPage() {
  const { setLastQuery } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [orgs, setOrgs] = useState<
    { id: string; name: string; type: string; memberCount: number }[]
  >([]);

  useEffect(() => {
    async function fetchHotspots() {
      const { data: hotspotsData, error: hotspotsError } = await supabase
        .from("hotspots")
        .select("id, name, type")
        .order("name", { ascending: true });
      
      if (hotspotsError) {
        console.error("Error fetching hotspots:", hotspotsError);
        return;
      }

      if (!hotspotsData) return;

      // Fetch member counts for each hotspot
      const hotspotsWithCounts = await Promise.all(
        hotspotsData.map(async (hotspot) => {
          console.log("Fetching member count for hotspot:", hotspot.id, hotspot.name);
          const { count, error: countError } = await supabase
            .from("hotspot_members")
            .select("*", { count: "exact", head: true })
            .eq("hotspot_id", hotspot.id);

          console.log("Hotspot member count response:", hotspot.name, count, countError);

          if (countError) {
            console.error("Error fetching member count for hotspot:", hotspot.id, countError);
            return { ...hotspot, memberCount: 0 };
          }

          return { ...hotspot, memberCount: count || 0 };
        })
      );

      setOrgs(
        (hotspotsWithCounts as { id: string; name: string; type: string; memberCount: number }[]).sort((a, b) => b.memberCount - a.memberCount)
      );
    }
    fetchHotspots();
  }, []);

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));

  const handleOrgClick = (org: (typeof orgs)[0]) => {
    setLastQuery({
      rideType: "instant",
      pickup: "",
      drop: org.name,
      hasVehicle: false,
      seats: 1,
      userId: user?.id,
      hotspotId: org.id,
      hotspotName: org.name,
    });
    navigate({ to: "/matches" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title="Find Hotspots"
        description="Search for popular colleges and office destinations on linQ to find your perfect carpool match."
        canonical="https://linqrides.in/search"
        schemas={[
          SchemaBuilders.breadcrumb([
            { name: "Home", url: "https://linqrides.in" },
            { name: "Search Hotspots", url: "https://linqrides.in/search" },
          ]),
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-32 lg:px-8 lg:pt-12">
        <div className="flex items-center gap-2">
          <Flame className="size-7 text-primary" />
          <h1 className="text-3xl font-bold lg:text-4xl">Hotspots</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by your college, office, or destination.
        </p>

        {/* Mobile: refer at top */}
        <div className="mt-5 lg:hidden space-y-4">
          <LaunchPadCard compact />
          <ReferCard compact />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pickup or drop location, college, or office..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <h2 className="mt-7 text-sm font-semibold text-muted-foreground">RESULTS</h2>
            <div className="mt-3 space-y-2">
              {filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleOrgClick(o)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    {o.type === "college" ? (
                      <GraduationCap className="size-4 text-primary" />
                    ) : (
                      <Building2 className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{o.type} · {o.memberCount} user{o.memberCount !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-xs text-primary font-medium">View matches →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: refer on right side */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-6 space-y-4">
              <LaunchPadCard />
              <ReferCard />
            </div>
          </aside>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
