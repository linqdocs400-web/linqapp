import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, memo, useMemo } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useMatches } from "@/hooks/use-matches";
import { useHotspotMembers } from "@/hooks/use-hotspot-members";
import { useStore } from "@/lib/store";
import { type RidePost } from "@/hooks/use-ride-posts";
import { useConnectionRequests } from "@/hooks/use-connection-requests";
import {
  BadgeCheck,
  Instagram,
  Lock,
  MessageCircle,
  Send as SendIcon,
  Star,
  X,
  Sparkles,
  Clock,
  CalendarDays,
  Car,
  Bike,
  Truck,
  Users,
  Check,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { generateConnectionMessage, encodeMessageForUrl, copyToClipboard } from "@/lib/connection-message";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Your matches — linQ" }] }),
  component: Matches,
});

function Matches() {
  const { lastQuery } = useStore();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { createRequest, sentRequests, unlockedProfiles, getRemainingRequests } = useConnectionRequests();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const hotspotId = lastQuery?.hotspotId;
  const hotspotName = lastQuery?.hotspotName;
  const { data: hotspotMembers, isLoading: hotspotLoading } = useHotspotMembers(
    hotspotId,
    user?.id,
  );
  const hotspotOwnerIds = useMemo(
    () => hotspotMembers?.map((m) => m.userId) ?? [],
    [hotspotMembers],
  );
  const { data: matchResult, isLoading } = useMatches(
    lastQuery,
    page,
    10,
    showAll,
    hotspotOwnerIds,
  );

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };
  const navigate = useNavigate();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [rateFor, setRateFor] = useState<RidePost | null>(null);

  // Helper function to check request status for a ride
  const getRequestStatus = (rideId: string, ownerId: string) => {
    const request = sentRequests.data?.find(
      (r) => r.ride_id === rideId && r.receiver_id === ownerId
    );
    return request?.status || null;
  };

  // Check if profile is unlocked via unlocked_profiles
  const isProfileUnlocked = (ownerId: string) => {
    return unlockedProfiles.data?.some((up) => up.profile_id === ownerId) || false;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowAll(new URLSearchParams(window.location.search).get("all") === "1");
    }
  }, []);

  const isLoadingMatches = isLoading || (!!hotspotId && hotspotLoading);
  const hotspotMemberCount = hotspotMembers?.length ?? 0;

  function handleOpen(m: RidePost) {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    // Only handle rating for unlocked profiles
    if (isProfileUnlocked(m.owner_id)) {
      setRateFor(m);
      return;
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-32 lg:px-8 lg:pt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {showAll ? "Available matches" : "Live matches"}
            </p>
            <h1 className="mt-2 text-3xl font-bold lg:text-4xl">
              {showAll
                ? "All available riders"
                : hotspotName
                  ? hotspotName
                  : lastQuery
                    ? `${lastQuery.pickup || "Anywhere"} → ${lastQuery.drop || "Anywhere"}`
                    : "All matches"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {hotspotId
                ? `${hotspotMemberCount} member${hotspotMemberCount !== 1 ? "s" : ""} at this hotspot`
                : `${(matchResult?.exact?.length || 0) + (matchResult?.nearby?.length || 0) + (matchResult?.routeOverlap?.length || 0) + (matchResult?.other?.length || 0)} riders ${showAll ? "available now" : "matched"}`}
              {hotspotId &&
                (matchResult?.exact?.length || 0) +
                  (matchResult?.nearby?.length || 0) +
                  (matchResult?.other?.length || 0) >
                  0 &&
                ` · ${(matchResult?.exact?.length || 0) + (matchResult?.nearby?.length || 0) + (matchResult?.other?.length || 0)} more route matches`}
              {" · "}
              {getRemainingRequests() > 0 ? `${getRemainingRequests()} requests left` : 'No requests left'}
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground border border-border hover:bg-muted transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
              <path d="m9 18 6-6-6-6" />
            </svg>
            Back
          </button>
        </div>

        {/* Loading Skeleton */}
        {isLoadingMatches && (
          <div className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                  </div>
                  <div className="mt-4 h-9 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingMatches &&
          hotspotMemberCount === 0 &&
          matchResult &&
          (matchResult?.exact?.length || 0) === 0 &&
          (matchResult?.nearby?.length || 0) === 0 &&
          (matchResult?.routeOverlap?.length || 0) === 0 &&
          (matchResult?.other?.length || 0) === 0 && (
            <div className="mt-8 text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new rides.
              </p>
              <button
                onClick={() => navigate({ to: "/" })}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                  <path d="m9 18 6-6-6-6" />
                </svg>
                Back to search
              </button>
            </div>
          )}

        {/* Load More Button */}
        {!isLoadingMatches && matchResult?.hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setLoadingMore(true);
                loadMore();
              }}
              disabled={loadingMore}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-transparent animate-spin rounded-full"></div>
                  Loading more...
                </>
              ) : (
                <>
                  Load More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9l6 6" />
                    <path d="m6 14l6-6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Hotspot members — same people counted on the Hotspots page */}
        {!isLoadingMatches && hotspotMemberCount > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {hotspotName ? `${hotspotName} members` : "Hotspot members"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hotspotMembers?.map((member) => {
                if (member.ride) {
                  const m = member.ride;
                  const unlocked = isProfileUnlocked(m.owner_id);
                  const requestStatus = getRequestStatus(m.id, m.owner_id);
                  const handleSendRequest = async () => {
                    try {
                      await createRequest.mutateAsync({
                        receiverId: m.owner_id,
                        rideId: m.id,
                      });
                      toast.success("Request sent successfully.");
                    } catch (error: any) {
                      toast.error(error.message || "Failed to send request");
                    }
                  };
                  return (
                    <MatchCard
                      key={m.id}
                      m={m}
                      unlocked={unlocked}
                      hideOverlap={showAll}
                      query={lastQuery}
                      onOpen={() => handleOpen(m)}
                      onRate={() => setRateFor(m)}
                      userName={profile?.name || "User"}
                      requestStatus={requestStatus}
                      onRequest={handleSendRequest}
                    />
                  );
                }
                return (
                  <HotspotMemberCard
                    key={member.userId}
                    name={member.name}
                    bio={member.bio}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Exact Matches Section */}
        {!isLoadingMatches && (matchResult?.exact?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary mb-4">Strong Matches (Score &gt; 70)</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchResult?.exact?.map((m: RidePost) => {
                const unlocked = isProfileUnlocked(m.owner_id);
                const requestStatus = getRequestStatus(m.id, m.owner_id);
                const handleSendRequest = async () => {
                  try {
                    await createRequest.mutateAsync({
                      receiverId: m.owner_id,
                      rideId: m.id,
                    });
                    toast.success("Request sent successfully.");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to send request");
                  }
                };
                return (
                  <MatchCard
                    key={m.id}
                    m={m}
                    unlocked={unlocked}
                    hideOverlap={showAll}
                    query={lastQuery}
                    onOpen={() => handleOpen(m)}
                    onRate={() => setRateFor(m)}
                    userName={profile?.name || "User"}
                    requestStatus={requestStatus}
                    onRequest={handleSendRequest}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Nearby Matches Section */}
        {(matchResult?.nearby?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              Moderate Matches (Score &gt; 30)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchResult?.nearby?.map((m: RidePost) => {
                const unlocked = isProfileUnlocked(m.owner_id);
                const requestStatus = getRequestStatus(m.id, m.owner_id);
                const handleSendRequest = async () => {
                  try {
                    await createRequest.mutateAsync({
                      receiverId: m.owner_id,
                      rideId: m.id,
                    });
                    toast.success("Request sent successfully.");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to send request");
                  }
                };
                return (
                  <MatchCard
                    key={m.id}
                    m={m}
                    unlocked={unlocked}
                    hideOverlap={showAll}
                    query={lastQuery}
                    onOpen={() => handleOpen(m)}
                    onRate={() => setRateFor(m)}
                    userName={profile?.name || "User"}
                    requestStatus={requestStatus}
                    onRequest={handleSendRequest}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Route Overlap removed since logic changed */}

        {/* Other Available Rides Section */}
        {(matchResult?.other?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {hotspotId ? "Other route matches" : "Other Available Rides"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchResult?.other?.map((m: RidePost) => {
                const unlocked = isProfileUnlocked(m.owner_id);
                const requestStatus = getRequestStatus(m.id, m.owner_id);
                const handleSendRequest = async () => {
                  try {
                    await createRequest.mutateAsync({
                      receiverId: m.owner_id,
                      rideId: m.id,
                    });
                    toast.success("Request sent successfully.");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to send request");
                  }
                };
                return (
                  <MatchCard
                    key={m.id}
                    m={m}
                    unlocked={unlocked}
                    hideOverlap={showAll}
                    query={lastQuery}
                    onOpen={() => handleOpen(m)}
                    onRate={() => setRateFor(m)}
                    userName={profile?.name || "User"}
                    requestStatus={requestStatus}
                    onRequest={handleSendRequest}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {paywallOpen && <Paywall onClose={() => setPaywallOpen(false)} />}
      {rateFor && <RatingModal m={rateFor} onClose={() => setRateFor(null)} />}
      <BottomNav />
    </main>
  );
}

function HotspotMemberCard({ name, bio }: { name: string; bio?: string }) {
  return (
    <article className="rounded-3xl border border-primary/30 bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Users className="size-7 text-primary/40" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{name}</p>
            <BadgeCheck className="size-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Hotspot member</p>
        </div>
      </div>
      {bio && (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">"{bio}"</p>
      )}
      <p className="mt-4 rounded-2xl bg-background/60 px-3 py-2 text-center text-xs text-muted-foreground">
        No active ride posted yet
      </p>
    </article>
  );
}

function vehicleMeta(v: string | undefined) {
  if (v === "car") return { Icon: Car, label: "Car" };
  if (v === "bike") return { Icon: Bike, label: "Bike" };
  if (v === "auto") return { Icon: Truck, label: "Auto" };
  return null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const MatchCard = memo(function MatchCard({
  m,
  unlocked,
  hideOverlap,
  query,
  onOpen,
  onRate,
  userName,
  requestStatus,
  onRequest,
}: {
  m: RidePost;
  unlocked: boolean;
  hideOverlap: boolean;
  query: import("@/lib/store").RideQuery | null;
  onOpen: () => void;
  onRate: () => void;
  userName: string;
  requestStatus: "pending" | "accepted" | "rejected" | null;
  onRequest: () => void;
}) {
  const vMeta = vehicleMeta(m.vehicle_type);

  const getRideTypeLabel = (type: string) => {
    if (type === "instant") return "Instant";
    if (type === "daily") return "Daily";
    if (type === "long") return "Planned";
    return type;
  };

  return (
    <article className="rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40">
      <div className="flex items-center gap-3">
        <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          <Users className="size-7 text-primary/40" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{m.owner_name}</p>
            <BadgeCheck className="size-4 text-primary" />
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-primary text-primary" /> 4.9 ·{" "}
            {m.journey_date && m.journey_time
              ? `${formatDate(m.journey_date)} at ${m.journey_time}`
              : m.journey_time || "Time not specified"}
            {m.return_time && ` · Return: ${m.return_time}`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-background/60 p-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="font-medium">
            {m.pickup_location.split(", ").slice(0, 2).join(", ")}
          </span>
        </div>
        <div className="my-1 ml-[3px] h-3 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="font-medium">{m.drop_location.split(", ").slice(0, 2).join(", ")}</span>
        </div>
      </div>

      {/* Trip details - only show data that user provided */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
          {getRideTypeLabel(m.ride_type)}
        </span>
        {m.journey_time && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium">
            <Clock className="size-3" /> {m.journey_time}
          </span>
        )}
        {m.days && m.days.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium">
            <CalendarDays className="size-3" /> {m.days.length} days/wk
          </span>
        )}
        {m.vehicle_type && vMeta ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
            <vMeta.Icon className="size-3" /> {vMeta.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">
            No vehicle
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium">
          <Users className="size-3" /> {m.seats} seat{m.seats > 1 ? "s" : ""}
        </span>
      </div>

      {m.bio && (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
          "{m.bio}"
        </p>
      )}

      {unlocked ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ConnectBtn
              method="whatsapp"
              id={m.connect_id || m.owner_id}
              active={m.connect_method === "whatsapp"}
              userName={userName}
            />
            <ConnectBtn
              method="instagram"
              id={m.connect_id || m.owner_id}
              active={m.connect_method === "instagram"}
              userName={userName}
            />
            <ConnectBtn
              method="telegram"
              id={m.connect_id || m.owner_id}
              active={m.connect_method === "telegram"}
              userName={userName}
            />
          </div>
          <button
            onClick={onRate}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 py-2 text-xs font-semibold text-primary"
          >
            <Star className="size-3.5" /> Rate this rider
          </button>
        </>
      ) : requestStatus === "pending" ? (
        <button
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-muted py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed"
        >
          <Clock className="size-4" /> Request Pending
        </button>
      ) : requestStatus === "rejected" ? (
        <button
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-muted py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed"
        >
          <X className="size-4" /> Request Declined
        </button>
      ) : (
        <button
          onClick={onRequest}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <SendIcon className="size-4" /> Send Request
        </button>
      )}
    </article>
  );
});

function ConnectBtn({
  method,
  id,
  active,
  userName,
}: {
  method: "whatsapp" | "instagram" | "telegram";
  id: string;
  active: boolean;
  userName: string;
}) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) return;

    const message = generateConnectionMessage(userName);
    const encodedMessage = encodeMessageForUrl(message);

    if (method === "whatsapp") {
      // WhatsApp: Open with pre-filled message
      const phone = id.replace(/[^\d]/g, "");
      if (!phone) {
        e.preventDefault();
        toast.error("Phone number not available");
        return;
      }
      e.currentTarget.href = `https://wa.me/${phone}?text=${encodedMessage}`;
    } else if (method === "telegram") {
      // Telegram: Try to pre-fill message, otherwise copy to clipboard
      const username = id.replace("@", "");
      if (!username) {
        e.preventDefault();
        toast.error("Telegram username not available");
        return;
      }
      // Telegram supports message prefill via share URL
      e.currentTarget.href = `https://t.me/share/url?url=${encodedMessage}`;
      // Also copy to clipboard as backup
      try {
        await copyToClipboard(message);
        toast.success("Message copied. Paste it into Telegram.");
      } catch (err) {
        console.error("Failed to copy message:", err);
      }
    } else if (method === "instagram") {
      // Instagram: Copy message to clipboard before redirecting
      const username = id.replace("@", "");
      if (!username) {
        e.preventDefault();
        toast.error("Instagram username not available");
        return;
      }
      try {
        await copyToClipboard(message);
        toast.success("Message copied. Paste it into Instagram DM.");
      } catch (err) {
        console.error("Failed to copy message:", err);
        toast.error("Failed to copy message to clipboard");
      }
    }
  };

  const meta = {
    whatsapp: {
      label: "WhatsApp",
      Icon: MessageCircle,
      href: `https://wa.me/${id.replace(/[^\d]/g, "")}`,
    },
    instagram: {
      label: "Instagram",
      Icon: Instagram,
      href: `https://instagram.com/${id.replace("@", "")}`,
    },
    telegram: { label: "Telegram", Icon: SendIcon, href: `https://t.me/${id.replace("@", "")}` },
  }[method];

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium border-border bg-background text-muted-foreground opacity-50 cursor-not-allowed">
        <meta.Icon className="size-4" />
        {meta.label}
      </div>
    );
  }
  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium transition border-primary bg-primary/10 text-primary`}
    >
      <meta.Icon className="size-4" />
      {meta.label}
    </a>
  );
}

/* ----------------------------- Rating modal ----------------------------- */
type Step = "answered" | "rode" | "ontime" | "stars" | "done" | "thanks";

function RatingModal({ m, onClose }: { m: RidePost; onClose: () => void }) {
  const [step, setStep] = useState<Step>("answered");
  const [stars, setStars] = useState(0);

  function next(s: Step) {
    setStep(s);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Users className="size-6 text-primary/40" />
          </div>
          <div>
            <p className="font-semibold">{m.owner_name}</p>
            <p className="text-xs text-muted-foreground">Quick feedback</p>
          </div>
        </div>

        <div className="mt-5">
          {step === "answered" && (
            <RatingQuestion
              q="Did they answer back?"
              onYes={() => next("rode")}
              onNo={() => next("thanks")}
            />
          )}
          {step === "rode" && (
            <RatingQuestion
              q="Did you share a ride with them?"
              onYes={() => next("ontime")}
              onNo={() => next("stars")}
            />
          )}
          {step === "ontime" && (
            <RatingQuestion
              q="Were they on time?"
              onYes={() => next("stars")}
              onNo={() => next("stars")}
            />
          )}
          {step === "stars" && (
            <div>
              <p className="text-sm font-semibold">Rate them out of 5</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStars(n)}
                    className="transition hover:scale-110"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`size-9 ${n <= stars ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => next("done")}
                disabled={stars === 0}
                className="mt-5 flex w-full items-center justify-center gap-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Check className="size-4" /> Submit rating
              </button>
            </div>
          )}
          {(step === "done" || step === "thanks") && (
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-7" />
              </span>
              <p className="mt-3 text-base font-semibold">
                {step === "done" ? "Thanks for rating!" : "No worries — noted."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your feedback keeps the linQ community trusted.
              </p>
              <button
                onClick={onClose}
                className="mt-5 w-full rounded-full bg-secondary py-3 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingQuestion({ q, onYes, onNo }: { q: string; onYes: () => void; onNo: () => void }) {
  return (
    <div>
      <p className="text-base font-semibold">{q}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onNo}
          className="rounded-full border border-border bg-background py-3 text-sm font-semibold"
        >
          No
        </button>
        <button
          onClick={onYes}
          className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Yes
        </button>
      </div>
    </div>
  );
}

function Paywall({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useProfile();
  const { todayRequestCount, getDailyRequestLimit } = useConnectionRequests();

  const todayCount = todayRequestCount.data || 0;
  const dailyLimit = getDailyRequestLimit();
  const plan = profile?.plan || "free";

  function pick(plan: "weekly" | "monthly") {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (plan === "weekly" ? 7 : 30));
    updateProfile({ plan, plan_expiry: expiry.toISOString() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-5 backdrop-blur">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>
        <Sparkles className="size-8 text-primary" />
        <h2 className="mt-3 text-2xl font-bold">Send more requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You've used all {dailyLimit} requests for today. Pick a plan to send more.
        </p>

        <div className="mt-6 space-y-3">
          <PlanRow title="Free" price="₹0" desc="2 Requests Per Day" current={plan === "free"} />
          <PlanRow
            title="Weekly"
            price="₹19"
            desc="5 Requests Per Day, Valid For 7 Days"
            cta="Pay ₹19"
            onClick={() => pick("weekly")}
          />
          <PlanRow
            title="Monthly"
            price="₹49"
            desc="8 Requests Per Day, Valid For 30 Days"
            highlight
            cta="Pay ₹49"
            onClick={() => pick("monthly")}
          />
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Razorpay coming soon. Mock upgrade for now.
        </p>
        <Link to="/pricing" className="mt-2 block text-center text-xs font-medium text-primary">
          See full pricing
        </Link>
      </div>
    </div>
  );
}

function PlanRow({
  title,
  price,
  desc,
  cta,
  onClick,
  current,
  highlight,
}: {
  title: string;
  price: string;
  desc: string;
  cta?: string;
  onClick?: () => void;
  current?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border p-4 ${highlight ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{title}</p>
          {current && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">CURRENT</span>
          )}
          {highlight && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
              BEST
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">{price}</p>
        {cta && (
          <button
            onClick={onClick}
            className="mt-1 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
          >
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
