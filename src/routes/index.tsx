import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Users,
  Activity,
  Zap,
  Briefcase,
  Plane,
  Search,
  ArrowUpDown,
  Star,
  BadgeCheck,
  MapPin,
  Sun,
  Moon,
  Car,
  Bike,
  Truck,
  CalendarDays,
  RefreshCw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Gift,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { useTheme } from "@/lib/theme";
import { useStore, type RideType, type RideQuery, type VehicleType } from "@/lib/store";
import { useLiveRiderCount } from "@/lib/live-count";
import { Logo } from "@/components/logo";
import LocationInput from "@/components/LocationInput";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useRidePosts } from "@/hooks/use-ride-posts";
import { CampaignBanner } from "@/components/CampaignBanner";
import { useCouponStore } from "@/lib/coupon-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "linQ — Share the way" },
      {
        name: "description",
        content:
          "Verified ride-sharing for instant trips, daily commutes, and planned long-distance journeys.",
      },
      { property: "og:title", content: "linQ — Share the way" },
      { property: "og:description", content: "Verified ride-sharing carpools." },
    ],
  }),
  component: Home,
});

const rideTypes: {
  id: RideType;
  tag: string;
  title: string;
  subtitle: string;
  Icon: typeof Zap;
}[] = [
    { id: "instant", tag: "NOW", title: "Instant", subtitle: "Match in minutes", Icon: Zap },
    {
      id: "daily",
      tag: "COMMUTE",
      title: "Daily",
      subtitle: "Office / college route",
      Icon: Briefcase,
    },
    {
      id: "long",
      tag: "PLANNED",
      title: "Planned / Long Distance",
      subtitle: "Scheduled & city-to-city",
      Icon: Plane,
    },
  ];

function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <CampaignBanner />
      <div className="lg:hidden">
        <MobileHome />
      </div>
      <div className="hidden lg:block">
        <DesktopHome />
      </div>
      <BottomNav />
    </main>
  );
}

/* ----------------- shared ride form hook ----------------- */
function useRideForm() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { setLastQuery, lastQuery } = useStore();
  const { createPost } = useRidePosts();
  const navigate = useNavigate();

  const signedIn = !!user && !!profile;

  const [selected, setSelected] = useState<RideType>(lastQuery?.rideType ?? "instant");
  const [pickup, setPickup] = useState(lastQuery?.pickup ?? "");
  const [drop, setDrop] = useState(lastQuery?.drop ?? "");
  const [hasVehicle, setHasVehicle] = useState(lastQuery?.hasVehicle ?? false);
  const [vehicleType, setVehicleType] = useState<VehicleType>(lastQuery?.vehicleType ?? "");
  const [seats, setSeats] = useState(lastQuery?.seats ?? 1);

  // Auto-set seats to 1 when vehicle type changes to bike
  useEffect(() => {
    if (vehicleType === "bike") {
      setSeats(1);
    }
  }, [vehicleType]);

  // Clear location error when pickup or drop changes
  useEffect(() => {
    if (locationError) {
      setLocationError("");
    }
  }, [pickup, drop]);
  const [days, setDays] = useState<string[]>(lastQuery?.days ?? []);
  const [returnJourney, setReturnJourney] = useState(lastQuery?.returnJourney ?? false);
  const [returnTime, setReturnTime] = useState(lastQuery?.returnTime ?? "");
  const [travelTime, setTravelTime] = useState(lastQuery?.travelTime ?? "07:00");
  const [date, setDate] = useState(lastQuery?.date ?? "");
  const [time, setTime] = useState(lastQuery?.time ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [pickupCoords, setPickupCoords] = useState({
    lat: lastQuery?.pickupLat || 0,
    lon: lastQuery?.pickupLon || 0,
  });

  const [dropCoords, setDropCoords] = useState({
    lat: lastQuery?.dropLat || 0,
    lon: lastQuery?.dropLon || 0,
  });

  const swap = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupCoords(dropCoords);
    setDropCoords(pickupCoords);
  };

  function buildQuery(): RideQuery {
    return {
      rideType: selected,
      pickup,
      pickupLat: pickupCoords.lat,
      pickupLon: pickupCoords.lon,
      drop,
      dropLat: dropCoords.lat,
      dropLon: dropCoords.lon,
      hasVehicle,
      vehicleType,
      seats,
      days,
      returnJourney,
      returnTime,
      travelTime,
      date,
      time,
      userId: user?.id,
    };
  }

  function findMatch() {
    if (!pickup || !drop) return;
    if (pickup === drop) {
      setLocationError("Pickup and drop locations must be different");
      return;
    }
    setLocationError("");
    setConfirmOpen(true);
  }

  async function confirmPost(post: boolean) {
    const q = buildQuery();
    setLastQuery(q);

    if (post && user && profile) {
      try {
        // Map time fields based on ride type
        let journeyDate = q.date;
        let journeyTime = q.time;

        if (q.rideType === "daily") {
          // For daily rides, use travelTime as journey_time
          journeyTime = q.travelTime;
        } else if (q.rideType === "instant") {
          // For instant rides, use current date/time if not provided
          const now = new Date();
          journeyDate = now.toISOString().split('T')[0];
          journeyTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        }

        console.log("Creating ride post with data:", {
          ride_type: q.rideType,
          journey_date: journeyDate,
          journey_time: journeyTime,
          return_time: q.returnTime,
          travelTime: q.travelTime,
        });
        await createPost({
          ride_type: q.rideType,
          pickup_location: q.pickup,
          pickup_lat: pickupCoords.lat,
          pickup_lon: pickupCoords.lon,
          drop_location: q.drop,
          drop_lat: dropCoords.lat,
          drop_lon: dropCoords.lon,
          vehicle_type: q.vehicleType,
          seats: q.seats,
          days: q.days,
          return_journey: q.returnJourney,
          return_time: q.returnTime,
          journey_date: journeyDate,
          journey_time: journeyTime,
        });
      } catch (err) {
        console.error("Post Error:", err);
      }
    } else if (post) {
      if (!user) navigate({ to: "/login" });
    }

    setConfirmOpen(false);
    if (!user || !profile) navigate({ to: "/login" });
    else navigate({ to: "/matches" });
  }

  return {
    state: {
      selected,
      pickup,
      drop,
      hasVehicle,
      vehicleType,
      seats,
      days,
      returnJourney,
      locationError,
      returnTime,
      travelTime,
      date,
      time,
      confirmOpen,
    },
    set: {
      setSelected,
      setPickup,
      setDrop,
      setHasVehicle,
      setVehicleType,
      setSeats,
      setDays,
      setReturnJourney,
      setLocationError,
      setReturnTime,
      setTravelTime,
      setDate,
      setTime,
      setConfirmOpen,
      setPickupCoords,
      setDropCoords,
    },
    swap,
    findMatch,
    confirmPost,
    pickupCoords,
    dropCoords,
  };
}

/* -------------------------------------------------------------------------- */
/*  MOBILE                                                                    */
/* -------------------------------------------------------------------------- */
function MobileHome() {
  const { posts, isLoading } = useRidePosts();
  const form = useRideForm();
  const { state, set, swap, findMatch, confirmPost } = form;
  const { openPopup } = useCouponStore();

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="large" />
          <div>
            <p className="text-xs text-muted-foreground">Welcome to</p>
            <p className="text-base font-semibold">linQ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPopup()}
            className="flex items-center justify-center rounded-full bg-secondary/80 size-8 text-primary hover:bg-secondary transition-colors"
            aria-label="Redeem Coupon"
          >
            <Gift className="size-4 text-primary" />
          </button>
          <ThemeToggleBtn />
          <a
            href="https://tally.so/r/5BedVQ"
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            <Briefcase className="size-3.5" />
            Career
          </a>
        </div>
      </header>

      <p className="mt-7 text-xs font-semibold tracking-[0.2em] text-primary">WHERE TO TODAY?</p>
      <BlinkingHero className="mt-2 text-5xl font-bold leading-[1.05] tracking-tight" />

      <div className="mt-5 flex flex-wrap gap-2">
        <LiveCountPill />
      </div>

      {/* Ride type */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Choose ride type</h2>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="size-3" /> Swipe <ChevronRight className="size-3" />
          </span>
        </div>
        <SwipeRail>
          {rideTypes.map((r) => (
            <RideCard
              key={r.id}
              r={r}
              active={state.selected === r.id}
              onClick={() => set.setSelected(r.id)}
            />
          ))}
        </SwipeRail>
      </section>

      {/* Search/Plan card */}
      <RideForm form={form} className="mt-5" />

      {/* Preview matches */}
      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Available matches</h2>
          </div>
          <a href="/matches?all=1" className="text-sm font-medium text-primary">
            See all
          </a>
        </div>
        <div className="mt-3 space-y-3">
          {posts.slice(0, 3).map((m) => (
            <article key={m.id} className="flex items-center gap-4 rounded-2xl bg-card p-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Users className="size-6 text-primary/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{m.owner_name}</p>
                  <BadgeCheck className="size-3 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {m.pickup_location?.split(", ").slice(0, 2).join(", ")} →{" "}
                  {m.drop_location?.split(", ").slice(0, 2).join(", ")}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="size-3 fill-primary text-primary" /> 4.9 · {m.ride_type}
                </p>
              </div>
            </article>
          ))}
          {posts.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active rides found. Build yours!
            </p>
          )}
        </div>
      </section>

      {state.confirmOpen && (
        <ConfirmPostModal onCancel={() => set.setConfirmOpen(false)} onChoose={confirmPost} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DESKTOP                                                                    */
/* -------------------------------------------------------------------------- */
function DesktopOnboardingHint() {
  return (
    <div
      className="absolute -top-[45px] -right-[15px] pointer-events-none hidden md:flex flex-col items-center animate-[floathint_3s_ease-in-out_infinite]"
      style={{ opacity: 0.85, zIndex: 40 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap');
        @keyframes floathint {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
      <span
        style={{
          fontFamily: "'Caveat', cursive",
          color: "#6b7280",
          fontSize: "1.2rem",
          lineHeight: "1",
          whiteSpace: "nowrap",
        }}
      >
        select this 1st
      </span>
      {/* Hand-drawn looking arrow curving down-left */}
      <svg
        width="35"
        height="30"
        viewBox="0 0 35 30"
        fill="none"
        className="-mt-1 mr-2 text-gray-500"
      >
        <path
          d="M 28 2 Q 15 10 5 24 M 5 15 L 5 24 L 15 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function DesktopHome() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const form = useRideForm();
  const signedIn = !!profile;
  const { state, set, confirmPost } = form;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/50">
        <div
          className="pointer-events-none absolute -top-40 -left-40 size-[40rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-32 size-[40rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 60%)" }}
        />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-10 px-8 py-20">
          <div className="col-span-7 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="text-primary">✨</span> Verified ride-sharing, reimagined
            </span>
            <p className="mt-6 text-sm font-semibold tracking-[0.25em] text-primary">
              WHERE TO TODAY?
            </p>
            <BlinkingHero
              className="mt-3 text-7xl font-bold leading-[1.02] tracking-tight"
              desktop
            />
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Match with verified riders heading the same way at the same time. Instant pickups,
              daily commutes, and planned long-distance trips — all in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LiveCountPill />
              {signedIn && (
                <Pill>
                  <Star className="size-3.5 fill-primary text-primary" />
                  4.9 avg rating
                </Pill>
              )}
            </div>

            {!state.confirmOpen && (
              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Choose ride type
                  </h2>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground relative">
                    <ChevronLeft className="size-3.5" /> Explore options{" "}
                    <ChevronRight className="size-3.5" />
                    <DesktopOnboardingHint />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {rideTypes.map((r) => (
                    <RideCard
                      key={r.id}
                      r={r}
                      active={state.selected === r.id}
                      onClick={() => set.setSelected(r.id)}
                      fullWidth
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-center">
            <div className="rounded-3xl border border-border bg-card/80 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Plan your ride</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.selected === "instant"
                      ? "Get matched in minutes"
                      : state.selected === "daily"
                        ? "Recurring commute"
                        : "Scheduled / long distance"}
                  </p>
                </div>
                <span
                  className="flex size-11 items-center justify-center rounded-2xl"
                  style={{
                    background: "color-mix(in oklab, var(--color-primary) 15%, transparent)",
                    color: "var(--color-primary)",
                  }}
                >
                  <MapPin className="size-5" />
                </span>
              </div>
              <RideForm form={form} embedded />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-8 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight">Three taps to a shared ride</h2>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { Icon: MapPin, title: "Set your route", desc: "Pickup, drop, ride type — done." },
            { Icon: Users, title: "Match instantly", desc: "Verified riders going the same way." },
            {
              Icon: Activity,
              title: "Ride together",
              desc: "Split costs, save the planet, stay connected.",
            },
          ].map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 items-center justify-center rounded-2xl"
                  style={{
                    background: "color-mix(in oklab, var(--color-primary) 15%, transparent)",
                    color: "var(--color-primary)",
                  }}
                >
                  <s.Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">STEP 0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} linQ — Share the way.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Support
            </a>
          </div>
        </div>
      </footer>

      {state.confirmOpen && (
        <ConfirmPostModal onCancel={() => set.setConfirmOpen(false)} onChoose={confirmPost} />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ride form (shared mobile + desktop)                                       */
/* -------------------------------------------------------------------------- */
function RideForm({
  form,
  className = "",
  embedded = false,
}: {
  form: ReturnType<typeof useRideForm>;
  className?: string;
  embedded?: boolean;
}) {
  const { state, set, swap, findMatch } = form;
  void embedded;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const presets = useMemo(
    () => [
      { label: "Mon–Fri", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      { label: "Mon–Sat", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    ],
    [],
  );

  const timeOptions = useMemo(() => {
    const all = Array.from({ length: 48 }).map((_, i) => {
      const hour = Math.floor(i / 2);
      const min = i % 2 === 0 ? "00" : "30";
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      return {
        value: `${hour.toString().padStart(2, "0")}:${min}`,
        label: `${h12}:${min} ${ampm}`,
      };
    });
    return [...all.slice(14), ...all.slice(0, 14)];
  }, []);

  return (
    <div className={`${embedded ? "" : "rounded-3xl bg-card p-5"} ${className}`}>
      {/* Pickup / drop */}
      <div className="flex items-start gap-3">
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
              value={state.pickup}
              onChange={set.setPickup}
              onSelect={(data) => {
                set.setPickup(data.address);

                set.setPickupCoords({
                  lat: data.lat,
                  lon: data.lon,
                });
              }}
            />
          </div>
          <div className="h-px bg-border" />
          <div>
            <p className="text-[10px] font-medium tracking-wider text-muted-foreground">DROP</p>
            <LocationInput
              placeholder="Drop location"
              value={state.drop}
              onChange={set.setDrop}
              onSelect={(data) => {
                set.setDrop(data.address);

                set.setDropCoords({
                  lat: data.lat,
                  lon: data.lon,
                });
              }}
            />
          </div>
        </div>
        <button
          onClick={swap}
          className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary"
        >
          <ArrowUpDown className="size-4" />
        </button>
      </div>

      {/* Vehicle */}
      <div className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Car className="size-4 text-primary" /> Do you have a vehicle?
          </span>
          <Switch on={state.hasVehicle} onChange={set.setHasVehicle} />
        </div>
        {state.hasVehicle && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle type
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "car", label: "Car", Icon: Car },
                    { id: "bike", label: "Bike", Icon: Bike },
                    { id: "auto", label: "Auto", Icon: Truck },
                  ] as const
                ).map((v) => {
                  const on = state.vehicleType === v.id;
                  return (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => set.setVehicleType(v.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition ${on
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background"
                        }`}
                    >
                      <v.Icon className="size-4" /> {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {state.hasVehicle && state.vehicleType !== "bike" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Seats available</span>
                <NumberStep value={state.seats} setValue={set.setSeats} min={1} max={6} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily extras */}
      {state.selected === "daily" && (
        <div className="mt-3 rounded-2xl border border-border/60 bg-background/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Travel days
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dayLabels.map((d) => {
              const on = state.days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() =>
                    set.setDays(on ? state.days.filter((x) => x !== d) : [...state.days, d])
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => set.setDays(p.days)}
                className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <span className="text-xs text-muted-foreground">Travel time</span>
            <div className="lg:hidden">
              <input
                type="time"
                value={state.travelTime}
                onChange={(e) => set.setTravelTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm touch-manipulation"
              />
            </div>
            <div className="hidden lg:block">
              <select
                value={state.travelTime}
                onChange={(e) => set.setTravelTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="size-4 text-primary" /> Open to return journey?
            </span>
            <Switch on={state.returnJourney} onChange={set.setReturnJourney} />
          </div>
          {state.returnJourney && (
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">Return time</span>
              <input
                type="time"
                value={state.returnTime}
                onChange={(e) => set.setReturnTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Long distance */}
      {state.selected === "long" && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 rounded-2xl border border-border/60 bg-background/40 p-4 sm:p-3">
          <label className="block">
            <span className="mb-2 sm:mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </span>
            <input
              type="date"
              value={state.date}
              onChange={(e) => set.setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-3 sm:px-2 sm:py-2 text-sm touch-manipulation"
            />
          </label>
          <label className="block">
            <span className="mb-2 sm:mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </span>
            <input
              type="time"
              value={state.time}
              onChange={(e) => set.setTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-3 sm:px-2 sm:py-2 text-sm touch-manipulation"
            />
          </label>
          <p className="col-span-1 sm:col-span-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3 flex-shrink-0" /> For all planned, scheduled &
            city-to-city trips.
          </p>
        </div>
      )}

      {state.locationError && (
        <p className="mt-3 text-xs text-destructive font-medium">{state.locationError}</p>
      )}

      <button
        onClick={findMatch}
        disabled={!state.pickup || !state.drop}
        className="mt-4 sm:mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 sm:py-4 font-semibold text-background transition hover:opacity-90 disabled:opacity-50 touch-manipulation"
      >
        <Search className="size-4 flex-shrink-0" /> Find a match
      </button>
    </div>
  );
}

/* ---------- bits ---------- */
function ConfirmPostModal({
  onCancel,
  onChoose,
}: {
  onCancel: () => void;
  onChoose: (post: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-5 backdrop-blur">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>
        <span className="text-primary">✨</span>
        <h2 className="mt-3 text-xl font-bold">Post this ride too?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Make your route visible so others heading the same way can match with you. You can edit or
          delete it from Trips later.
        </p>
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs font-medium leading-relaxed text-primary">
          ✨ Yayyyyy! You just chose an eco-friendly way to travel — helping reduce fuel usage,
          traffic, and travel expenses. Kudosss 🌍💚
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => onChoose(false)}
            className="rounded-full border border-border bg-background py-3 text-sm font-semibold"
          >
            Just find matches
          </button>
          <button
            onClick={() => onChoose(true)}
            className="flex items-center justify-center gap-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            <Check className="size-4" /> Post & match
          </button>
        </div>
      </div>
    </div>
  );
}

function RideCard({
  r,
  active,
  onClick,
  fullWidth,
}: {
  r: (typeof rideTypes)[number];
  active: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? {
            background: "color-mix(in oklab, var(--color-primary) 18%, var(--color-card))",
            borderColor: "var(--color-primary)",
            boxShadow:
              "0 10px 30px -12px color-mix(in oklab, var(--color-primary) 45%, transparent)",
          }
          : undefined
      }
      className={`relative flex h-44 ${fullWidth ? "w-full" : "min-w-[10.5rem] shrink-0 snap-start"} flex-col justify-between rounded-3xl border p-4 text-left transition ${active ? "border-primary" : "border-border bg-card/60 hover:border-primary/40"}`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium tracking-wider text-muted-foreground">
          {r.tag}
        </span>
        <span
          className={`flex size-9 items-center justify-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
        >
          <r.Icon className="size-4" />
        </span>
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight">{r.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{r.subtitle}</p>
      </div>
    </button>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition ${on ? "left-[1.4rem]" : "left-0.5"}`}
      />
    </button>
  );
}

function NumberStep({
  value,
  setValue,
  min,
  max,
}: {
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setValue(Math.max(min, value - 1))}
        className="flex size-7 items-center justify-center rounded-full bg-secondary"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-bold">{value}</span>
      <button
        onClick={() => setValue(Math.min(max, value + 1))}
        className="flex size-7 items-center justify-center rounded-full bg-secondary"
      >
        +
      </button>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
      {children}
    </button>
  );
}

function ThemeToggleBtn() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "sapphire";
  return (
    <button
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggle}
      className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/80"
    >
      {isLight ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function BlinkingHero({
  className = "",
  desktop = false,
}: {
  className?: string;
  desktop?: boolean;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % 2), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <h1 className={className}>
      <span key={i} className="inline-block animate-in fade-in zoom-in-95 duration-500">
        {i === 0 ? (
          <>
            Go Together
            <br />
            Rides.
          </>
        ) : desktop ? (
          <>
            Travel smarter,
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              with linQ.
            </span>
          </>
        ) : (
          <>
            Travel smarter,
            <br />
            together.
          </>
        )}
      </span>
    </h1>
  );
}
function LiveCountPill() {
  const count = useLiveRiderCount();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <Activity className="size-3.5" /> {count} riders · live
    </span>
  );
}

function SwipeRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className="relative -mx-5">
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute left-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute right-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-lg"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
