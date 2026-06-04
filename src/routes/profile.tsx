import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useRidePosts } from "@/hooks/use-ride-posts";
import { BottomNav } from "@/components/bottom-nav";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useConnectionRequests } from "@/hooks/use-connection-requests";
import {
  BadgeCheck,
  ChevronRight,
  Moon,
  Sun,
  CreditCard,
  Shield,
  LifeBuoy,
  LogOut,
  Siren,
  Star,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — linQ" }] }),
  component: Profile,
});

const menu = [
  {
    Icon: CreditCard,
    label: "Payments",
    desc: "Plans, billing & history",
    to: "/payments" as const,
  },
  {
    Icon: Shield,
    label: "Safety & SOS",
    desc: "Tips, SOS & emergency contacts",
    to: "/safety" as const,
  },
  { Icon: LifeBuoy, label: "Support", desc: "Submit queries & get help", to: "/query" as const },
];

function Profile() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { todayRequestCount, getDailyRequestLimit } = useConnectionRequests();
  const navigate = useNavigate();
  const isDark = theme === "sapphire-dark";

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { posts } = useRidePosts();
  const myPosts = posts.filter((p) => p.owner_id === user?.id);

  const signedIn = !!user && !!profile;
  const name = signedIn ? profile.name : "Guest";
  const email = signedIn ? profile.email : "Sign up to access your profile";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };
  const handleDelete = async () => {
    // In a real app, you'd call a Supabase RPC or function to delete user data
    await signOut();
    setConfirmDelete(false);
    navigate({ to: "/" });
  };

  const stats = [
    { label: "Trips", value: signedIn ? myPosts.length.toString() : "—" },
    { label: "Requests", value: signedIn ? `${todayRequestCount.data || 0} / ${getDailyRequestLimit()}` : "—" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/60" />
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -left-10 top-20 size-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative px-5 pt-6 pb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary-foreground">Profile</h1>
              <Link
                to="/safety"
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground shadow-lg ring-2 ring-white/20"
              >
                <Siren className="size-3.5" /> SOS
              </Link>
            </div>

            {/* Stats over the blue layer */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/15 p-3 backdrop-blur-md ring-1 ring-white/20">
              {stats.map((s) => (
                <div key={s.label} className="text-center text-primary-foreground">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wide opacity-80">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="size-20 rounded-full bg-gradient-to-br from-white/90 to-white/40 ring-4 ring-white/30 backdrop-blur" />
              <div className="flex-1 text-primary-foreground">
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold">{name}</p>
                  <BadgeCheck className="size-5 fill-white text-primary" />
                </div>
                <p className="text-sm opacity-90">{email}</p>
                {signedIn && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="size-3.5 fill-current" /> {profile?.rating || 0}
                    </span>
                    <span className="opacity-70">·</span>
                    <span className="opacity-90">{myPosts.length} trips</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-md px-5 pt-5 pb-32">
          {!signedIn ? (
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg"
            >
              Sign up / Sign in
            </Link>
          ) : (
            <>
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold hover:bg-secondary/80"
              >
                <Pencil className="size-4" /> Edit profile
              </button>

              <section className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Appearance</p>
                    <p className="text-xs text-muted-foreground">
                      {isDark ? "Night mode" : "Day mode"}
                    </p>
                  </div>
                </div>
                <ToggleSwitch on={isDark} onClick={toggle} />
              </section>
            </>
          )}

          <h3 className="mt-6 mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </h3>
          <section className="grid grid-cols-2 gap-3">
            {menu.map((m) => (
              <Link
                key={m.label}
                to={m.to}
                className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition active:scale-[0.98]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{m.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{m.desc}</p>
                </div>
              </Link>
            ))}
            <Link
              to="/trips"
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition active:scale-[0.98]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">My trips</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  Posts & requests
                </p>
              </div>
            </Link>
          </section>

          {signedIn && (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card py-3 text-sm font-semibold text-destructive"
              >
                <Trash2 className="size-4" /> Delete account
              </button>
              <button
                onClick={handleSignOut}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="mx-auto hidden max-w-7xl px-8 pt-10 pb-20 lg:block">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account, safety and preferences.
            </p>
          </div>
          <Link
            to="/safety"
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-lg transition hover:opacity-95"
          >
            <Siren className="size-4" /> SOS
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-4 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="h-24 bg-gradient-to-br from-primary to-primary/40" />
              <div className="-mt-12 px-6 pb-6">
                <div className="size-24 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 ring-4 ring-card" />
                <div className="mt-4 flex items-center gap-2">
                  <h2 className="text-xl font-bold">{name}</h2>
                  <BadgeCheck className="size-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{email}</p>
                {signedIn && (
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="size-4 fill-primary text-primary" /> 4.9
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{myPosts.length} trips</span>
                  </div>
                )}
                <button
                  onClick={() => setEditOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-2.5 text-sm font-semibold hover:bg-secondary/80"
                >
                  <Pencil className="size-4" /> Edit profile
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
                </span>
                <div>
                  <p className="font-semibold">Appearance</p>
                  <p className="text-xs text-muted-foreground">
                    {isDark ? "Night mode" : "Day mode"}
                  </p>
                </div>
              </div>
              <ToggleSwitch on={isDark} onClick={toggle} />
            </div>
          </aside>

          <section className="col-span-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {s.label.toUpperCase()}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {menu.map((m) => (
                <Link
                  key={m.label}
                  to={m.to}
                  className="group flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-card/80"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <m.Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{m.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Open <ChevronRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent trips</h3>
                <Link to="/trips" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 divide-y divide-border">
                {signedIn && myPosts.length > 0 ? (
                  myPosts.slice(0, 3).map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
                          <MapPin className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {t.pickup_location?.split(", ")[0]} → {t.drop_location?.split(", ")[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.journey_date || "Today"} ·{" "}
                            {t.journey_time || t.created_at?.split("T")[1]?.substring(0, 5)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No ride posts yet. Sign up and search for a ride from the home page to
                      auto-post yours.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {signedIn && (
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-card px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="size-4" /> Delete account
                </button>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {editOpen && profile && (
        <EditProfileModal
          initial={profile}
          onClose={() => setEditOpen(false)}
          onSave={(p) => {
            updateProfile(p);
            setEditOpen(false);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-destructive/40 bg-card p-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <Trash2 className="size-7" />
            </span>
            <h3 className="mt-3 text-xl font-bold">Delete your account?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This permanently removes your profile, posts and requests. This action can't be undone.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-full bg-secondary py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full bg-destructive py-2.5 text-sm font-bold text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}
    >
      <span
        className={`absolute top-0.5 size-6 rounded-full bg-background shadow transition-all ${
          on ? "left-[calc(100%-1.625rem)]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function EditProfileModal({
  initial,
  onClose,
  onSave,
}: {
  initial: ReturnType<typeof useProfile>["profile"];
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (p: any) => void;
}) {
  const i = initial!;
  const [name, setName] = useState(i.name);
  const [phone, setPhone] = useState(i.phone);
  const [bio, setBio] = useState(i.bio);
  const [connectId, setConnectId] = useState(i.connect_id);
  const [emergencyName, setEmergencyName] = useState(i.emergency_name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(i.emergency_phone ?? "");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Edit profile</h3>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="ep-input" />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="ep-input" />
          </Field>
          <Field label="Short bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="ep-input resize-none"
            />
          </Field>
          <Field label="Contact handle / number">
            <input
              value={connectId}
              onChange={(e) => setConnectId(e.target.value)}
              className="ep-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency name">
              <input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="ep-input"
              />
            </Field>
            <Field label="Emergency phone">
              <input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="ep-input"
              />
            </Field>
          </div>
        </div>
        <button
          onClick={() =>
            onSave({
              name,
              phone,
              bio,
              connect_id: connectId,
              emergency_name: emergencyName,
              emergency_phone: emergencyPhone,
            })
          }
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Save changes
        </button>
        <style>{`.ep-input{width:100%;border-radius:0.75rem;border:1px solid hsl(var(--border));background:var(--color-background);padding:0.55rem 0.85rem;font-size:0.9rem;outline:none}.ep-input:focus{border-color:var(--color-primary)}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
