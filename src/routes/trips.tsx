import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useRidePosts } from "@/hooks/use-ride-posts";
import { useConnectionRequests } from "@/hooks/use-connection-requests";
import { useLiveRiderCount } from "@/lib/live-count";
import { toast } from "sonner";
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
  Send as SendIcon,
  Pencil,
  X,
  Car,
  Bike,
  Truck,
  ArrowUpDown,
  RefreshCw,
  Check,
  Clock,
} from "lucide-react";
import LocationInput from "@/components/LocationInput";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trips — linQ" }] }),
  component: Trips,
});

function Trips() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { posts, isLoading, deletePost, updatePost, isUpdating } = useRidePosts();
  const { incomingRequests, sentRequests, unlockedProfiles, acceptRequest, rejectRequest } = useConnectionRequests();
  const liveCount = useLiveRiderCount();
  const [tab, setTab] = useState<"posts" | "incoming" | "sent" | "unlocked">("posts");
  const [editingPost, setEditingPost] = useState<typeof posts[0] | null>(null);

  const myPosts = posts.filter((p) => user && p.owner_id === user.id);
  const unlocked = posts.filter((p) => unlockedProfiles.data?.some((up) => up.profile_id === p.owner_id));

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
          <TabBtn active={tab === "incoming"} onClick={() => setTab("incoming")}>
            Incoming Requests
          </TabBtn>
          <TabBtn active={tab === "sent"} onClick={() => setTab("sent")}>
            My Requests
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPost(p)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => deletePost(p.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
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
        ) : tab === "incoming" ? (
          <div className="mt-6 space-y-3">
            {!incomingRequests.data || incomingRequests.data.length === 0 ? (
              <Empty msg="No incoming connection requests." />
            ) : (
              incomingRequests.data.map((request) => (
                <article key={request.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-yellow-600">
                      Pending Request
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <Users className="size-4 text-primary" />
                    <span className="font-medium">User ID: {request.sender_id.slice(0, 8)}...</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Ride ID: {request.ride_id.slice(0, 8)}...
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        acceptRequest.mutateAsync({
                          requestId: request.id,
                          senderId: request.sender_id,
                          rideId: request.ride_id,
                        });
                      }}
                      disabled={acceptRequest.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      <Check className="size-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => {
                        rejectRequest.mutateAsync({ requestId: request.id });
                      }}
                      disabled={rejectRequest.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-border bg-background py-2 text-xs font-semibold text-foreground disabled:opacity-50"
                    >
                      <X className="size-3.5" /> Decline
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : tab === "sent" ? (
          <div className="mt-6 space-y-3">
            {!sentRequests.data || sentRequests.data.length === 0 ? (
              <Empty msg="You haven't sent any connection requests yet." />
            ) : (
              sentRequests.data.map((request) => (
                <article key={request.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      request.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : request.status === "accepted"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <Users className="size-4 text-primary" />
                    <span className="font-medium">To: {request.receiver_id.slice(0, 8)}...</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Ride ID: {request.ride_id.slice(0, 8)}...
                  </div>
                </article>
              ))
            )}
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
      {editingPost && (
        <EditRideModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={async (updates) => {
            await updatePost({ postId: editingPost.id, updates });
            setEditingPost(null);
          }}
          isSaving={isUpdating}
        />
      )}
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

function EditRideModal({
  post,
  onClose,
  onSave,
  isSaving,
}: {
  post: any;
  onClose: () => void;
  onSave: (updates: any) => void;
  isSaving: boolean;
}) {
  const [pickup, setPickup] = useState(post.pickup_location || "");
  const [drop, setDrop] = useState(post.drop_location || "");
  const [vehicleType, setVehicleType] = useState(post.vehicle_type || "");
  const [seats, setSeats] = useState(post.seats || 1);
  const [days, setDays] = useState<string[]>(post.days || []);
  const [returnJourney, setReturnJourney] = useState(post.return_journey || false);
  const [returnTime, setReturnTime] = useState(post.return_time || "");
  const [travelTime, setTravelTime] = useState(post.journey_time || "");
  const [date, setDate] = useState(post.journey_date || "");
  const [time, setTime] = useState(post.journey_time || "");
  const [pickupCoords, setPickupCoords] = useState({ lat: post.pickup_lat || 0, lon: post.pickup_lon || 0 });
  const [dropCoords, setDropCoords] = useState({ lat: post.drop_lat || 0, lon: post.drop_lon || 0 });

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSave = async () => {
    const updates: any = {
      pickup_location: pickup,
      drop_location: drop,
      pickup_lat: pickupCoords.lat,
      pickup_lon: pickupCoords.lon,
      drop_lat: dropCoords.lat,
      drop_lon: dropCoords.lon,
      vehicle_type: vehicleType,
      seats,
      days,
      return_journey: returnJourney,
      return_time: returnTime,
    };

    if (post.ride_type === "daily") {
      updates.journey_time = travelTime;
    } else if (post.ride_type === "long") {
      updates.journey_date = date;
      updates.journey_time = time;
    }

    await onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-5 backdrop-blur">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-7">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>
        <h2 className="text-xl font-bold">Edit ride</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your ride details
        </p>

        {/* Pickup / drop */}
        <div className="mt-5 flex items-start gap-3">
          <div className="mt-3 flex flex-col items-center">
            <span className="size-3 rounded-full bg-foreground" />
            <span className="my-1 h-8 w-px bg-border" />
            <span className="size-3 rounded-full bg-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground">PICKUP</p>
              <LocationInput
                placeholder="Pickup location"
                value={pickup}
                onChange={setPickup}
                onSelect={(data) => {
                  setPickup(data.address);
                  setPickupCoords({ lat: data.lat, lon: data.lon });
                }}
              />
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground">DROP</p>
              <LocationInput
                placeholder="Drop location"
                value={drop}
                onChange={setDrop}
                onSelect={(data) => {
                  setDrop(data.address);
                  setDropCoords({ lat: data.lat, lon: data.lon });
                }}
              />
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle type
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "car", label: "Car", Icon: Car },
              { id: "bike", label: "Bike", Icon: Bike },
              { id: "auto", label: "Auto", Icon: Truck },
            ].map((v) => {
              const on = vehicleType === v.id;
              return (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setVehicleType(v.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition ${
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  }`}
                >
                  <v.Icon className="size-4" /> {v.label}
                </button>
              );
            })}
          </div>
          {vehicleType !== "bike" && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Seats available</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="flex size-7 items-center justify-center rounded-full bg-secondary text-sm"
                >
                  -
                </button>
                <span className="text-sm font-medium">{seats}</span>
                <button
                  onClick={() => setSeats(Math.min(6, seats + 1))}
                  className="flex size-7 items-center justify-center rounded-full bg-secondary text-sm"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Daily extras */}
        {post.ride_type === "daily" && (
          <div className="mt-3 rounded-2xl border border-border/60 bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Travel days
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dayLabels.map((d) => {
                const on = days.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">Travel time</span>
              <input
                type="time"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="size-4 text-primary" /> Open to return journey?
              </span>
              <button
                onClick={() => setReturnJourney(!returnJourney)}
                className={`w-12 h-6 rounded-full transition ${
                  returnJourney ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`block size-5 rounded-full bg-white transition-transform ${
                    returnJourney ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {returnJourney && (
              <div className="mt-3">
                <span className="text-xs text-muted-foreground">Return time</span>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Long distance */}
        {post.ride_type === "long" && (
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-background/40 p-3">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Time
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full border border-border bg-background py-3 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
