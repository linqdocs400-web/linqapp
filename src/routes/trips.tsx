import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useRidePosts } from "@/hooks/use-ride-posts";
import { useLiveRiderCount } from "@/lib/live-count";
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Lock,
  BadgeCheck,
  Star,
  Sparkles,
  Users,
  MessageCircle,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trips — linQ" }] }),
  component: Trips,
});

function Trips() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { posts, isLoading, deletePost } = useRidePosts();
  const liveCount = useLiveRiderCount();
  const [tab, setTab] = useState<"posts" | "unlocked">("posts");

  const myPosts = posts.filter((p) => user && p.owner_id === user.id);
  const unlocked = posts.filter((p) => profile?.unlocked_ids?.includes(p.id));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 pt-8 pb-32 lg:pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold lg:text-4xl">Your trips</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Post a ride
          </Link>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-foreground">
            <span className="font-semibold text-primary">Join {liveCount} riders</span> already
            saving every month. Your turn — post your trip and start saving!
          </p>
        </div>

        <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
          <TabBtn active={tab === "posts"} onClick={() => setTab("posts")}>
            My ride posts
          </TabBtn>
          <TabBtn active={tab === "unlocked"} onClick={() => setTab("unlocked")}>
            Unlocked profiles
          </TabBtn>
        </div>

        {tab === "posts" ? (
          <div className="mt-6 space-y-3">
            {myPosts.length === 0 && !isLoading && (
              <Empty msg="No ride posts yet. Search for a ride from the home page to auto-post yours." />
            )}
            {myPosts.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-primary">
                    {p.ride_type === "long" ? "Planned" : p.ride_type}
                  </span>
                  <button
                    onClick={() => deletePost(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-primary" />
                  <span className="font-medium">
                    {p.pickup_location} → {p.drop_location}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {!!p.vehicle_type && <Tag>{p.seats} seats available</Tag>}
                  {p.days && p.days.length > 0 && <Tag>{p.days.join(", ")}</Tag>}
                  {p.return_journey && <Tag>Return @ {p.return_time || "tbd"}</Tag>}
                  {p.journey_date && (
                    <Tag>
                      <Calendar className="size-3" /> {p.journey_date} {p.journey_time}
                    </Tag>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.length === 0 && <Empty msg="You haven't unlocked any profiles yet." />}
            {unlocked.map((m) => (
              <article key={m.id} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="size-6 text-primary/40" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">{m.owner_name}</p>
                      <BadgeCheck className="size-3.5 text-primary" />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-primary text-primary" /> 4.9 · {m.ride_type}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  <span>{m.pickup_location} → {m.drop_location}</span>
                </div>
                {m.bio && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">About them:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">"{m.bio}"</p>
                  </div>
                )}
                {m.connect_method && m.connect_id && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Contact:</p>
                    <a
                      href={getContactLink(m.connect_method, m.connect_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {getContactIcon(m.connect_method)}
                      {formatContactId(m.connect_method, m.connect_id)}
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
      {children}
    </span>
  );
}
function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
      <Lock className="size-6" />
      {msg}
    </div>
  );
}

function getContactLink(method: string, id: string): string {
  if (method === "whatsapp") {
    return `https://wa.me/${id.replace(/[^\d]/g, "")}`;
  } else if (method === "instagram") {
    return `https://instagram.com/${id.replace("@", "")}`;
  } else if (method === "telegram") {
    return `https://t.me/${id.replace("@", "")}`;
  }
  return "#";
}

function getContactIcon(method: string) {
  if (method === "whatsapp") {
    return <MessageCircle className="size-3.5" />;
  } else if (method === "instagram") {
    return <MessageCircle className="size-3.5" />;
  } else if (method === "telegram") {
    return <Send className="size-3.5" />;
  }
  return null;
}

function formatContactId(method: string, id: string): string {
  if (method === "whatsapp") {
    return id.replace(/[^\d]/g, "");
  }
  return id.replace("@", "");
}
