import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useProfile, type Hotspot } from "@/hooks/use-profile";
import { type ConnectMethod } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Instagram, MessageCircle, Send, ChevronLeft, Plus, X, GraduationCap, Building2, Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Create profile — linQ" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [created, setCreated] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
    if (!profileLoading && profile) navigate({ to: "/" });
  }, [user, authLoading, profile, profileLoading, navigate]);

  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [bio, setBio] = useState("");
  const [connect, setConnect] = useState<ConnectMethod>("whatsapp");
  const [connectId, setConnectId] = useState("");
  const [samePhone, setSamePhone] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hotspotSearch, setHotspotSearch] = useState("");
  const [hotspotDropdownOpen, setHotspotDropdownOpen] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [addHotspotModalOpen, setAddHotspotModalOpen] = useState(false);
  const [newHotspotName, setNewHotspotName] = useState("");
  const [newHotspotType, setNewHotspotType] = useState<"college" | "office">("college");

  const bioWords = bio.trim() ? bio.trim().split(/\s+/).length : 0;
  const phoneValid = /^\d{10}$/.test(phone);
  const emergencyPhoneValid = /^\d{10}$/.test(emergencyPhone);
  const valid =
    name &&
    phoneValid &&
    gender &&
    bio &&
    bioWords <= 20 &&
    connectId &&
    emergencyName &&
    emergencyPhoneValid;

  // Auto-fill connect ID with phone number when same phone is checked and WhatsApp is selected
  useEffect(() => {
    if (samePhone && connect === "whatsapp" && phone && !connectId) {
      setConnectId(phone);
    }
  }, [samePhone, connect, phone, connectId]);

  // Fetch hotspots on mount
  useEffect(() => {
    async function fetchHotspots() {
      const { data, error } = await supabase
        .from("hotspots")
        .select("id, name, type")
        .order("name", { ascending: true });
      if (data && !error) {
        const sortedData = [...data].sort((a, b) => {
          if (a.name.toLowerCase() === "cjp hyd") return -1;
          if (b.name.toLowerCase() === "cjp hyd") return 1;
          return 0;
        });
        setHotspots(sortedData as Hotspot[]);
      }
    }
    fetchHotspots();
  }, []);

  // Filter hotspots based on search
  const filteredHotspots = hotspots.filter((h) =>
    h.name.toLowerCase().includes(hotspotSearch.toLowerCase())
  );

  async function handleCreateHotspot() {
    if (!newHotspotName) return;
    try {
      const { data, error } = await supabase
        .from("hotspots")
        .insert({ name: newHotspotName, type: newHotspotType })
        .select()
        .single();
      if (error) throw error;
      const newHotspot = data as Hotspot;
      setHotspots([...hotspots, newHotspot]);
      setSelectedHotspot(newHotspot);
      setHotspotSearch(newHotspot.name);
      setAddHotspotModalOpen(false);
      setNewHotspotName("");
    } catch (err) {
      console.error("Error creating hotspot:", err);
      alert("Error creating institution. Please try again.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !user) {
      console.log("Validation failed:", {
        name,
        phone,
        gender,
        bio,
        connectId,
        emergencyName,
        emergencyPhone,
      });
      return;
    }

    try {
      await updateProfile({
        name,
        email: user.email ?? "",
        phone,
        gender,
        bio,
        connect_method: connect,
        connect_id: connectId,
        emergency_name: emergencyName,
        emergency_phone: emergencyPhone,
        institution_hotspot_id: selectedHotspot?.id || undefined,
        plan: "free",
        active_days: [new Date().toISOString().split("T")[0]],
        unlocked_ids: [],
      });

      // Add user to hotspot_members if a hotspot was selected
      if (selectedHotspot) {
        await supabase
          .from("hotspot_members")
          .upsert({
            hotspot_id: selectedHotspot.id,
            user_id: user.id,
            role: "member"
          });
      }

      setCreated(true);
      setTimeout(() => navigate({ to: "/" }), 1400);
    } catch (err) {
      console.error("Profile creation error:", err);
      alert("Error creating profile. Please check your connection and try again.");
    }
  }

  if (created) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
          <CheckCircle2 className="size-16 text-primary" />
          <h1 className="text-2xl font-bold">Account created!</h1>
          <p className="text-sm text-muted-foreground">
            Taking you back home with your trip details…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background px-5 py-10">
      <button
        onClick={() => signOut()}
        className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-secondary"
      >
        <ChevronLeft className="size-4" />
        Log out
      </button>
      <form
        onSubmit={submit}
        className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-7"
      >
        <h1 className="text-2xl font-bold">Tell us about you</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A short profile helps riders trust you.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field label="Phone number">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
              className="input"
            />
          </Field>

          <Field label="Gender">
            <div className="flex gap-2">
              {(["male", "female", "other"] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-full border px-4 py-2 text-sm capitalize transition ${
                    gender === g
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Short bio (${bioWords}/20 words)`}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="e.g. Engineer who loves indie music and quiet morning rides."
            />
            {bioWords > 20 && (
              <p className="mt-1 text-xs text-destructive">Keep it under 20 words.</p>
            )}
          </Field>

          <Field label="College/Office (optional)">
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    value={hotspotSearch}
                    onChange={(e) => {
                      setHotspotSearch(e.target.value);
                      setHotspotDropdownOpen(true);
                    }}
                    onFocus={() => setHotspotDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setHotspotDropdownOpen(false), 200)}
                    placeholder="Search or add your institution…"
                    className="input pl-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAddHotspotModalOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium hover:bg-secondary/80 transition"
                >
                  <Plus className="size-3.5" /> Add New
                </button>
              </div>
              {hotspotDropdownOpen && hotspotSearch && (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  {filteredHotspots.length > 0 ? (
                    filteredHotspots.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setSelectedHotspot(h);
                          setHotspotSearch(h.name);
                          setHotspotDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                          {h.type === "college" ? (
                            <GraduationCap className="size-4 text-primary" />
                          ) : (
                            <Building2 className="size-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{h.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{h.type}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No institutions found. Click "Add New" to create one.
                    </div>
                  )}
                </div>
              )}
            </div>
          </Field>

          <Field label="How should others reach you?">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
                  { id: "instagram", label: "Instagram", Icon: Instagram },
                  { id: "telegram", label: "Telegram", Icon: Send },
                ] as const
              ).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setConnect(c.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition ${
                    connect === c.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  }`}
                >
                  <c.Icon className="size-5" />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label={
              connect === "whatsapp"
                ? "WhatsApp number"
                : `${connect[0].toUpperCase()}${connect.slice(1)} username`
            }
          >
            <input
              value={connectId}
              onChange={(e) => setConnectId(e.target.value)}
              placeholder={connect === "whatsapp" ? "+91 …" : "@yourhandle"}
              className="input"
            />
          </Field>

          {connect === "whatsapp" && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="same-phone"
                checked={samePhone}
                onChange={(e) => setSamePhone(e.target.checked)}
                className="size-4 rounded border-border text-primary"
              />
              <label htmlFor="same-phone" className="text-sm text-muted-foreground">
                Same phone number
              </label>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Emergency contact
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Used only when you tap SOS.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Name">
                <input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="input"
                  placeholder="e.g. Mom"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="input"
                  placeholder="+91 …"
                />
              </Field>
            </div>
          </div>
        </div>

        {showErrors && !valid && (
          <div className="mt-4 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            <p className="mb-2 uppercase tracking-wider">Required fields missing:</p>
            <ul className="list-inside list-disc space-y-1">
              {!name && <li>Full name</li>}
              {!phoneValid && <li>Phone number must be exactly 10 digits</li>}
              {!gender && <li>Gender</li>}
              {!bio && <li>Short bio</li>}
              {bioWords > 20 && <li>Bio must be under 20 words</li>}
              {!connectId && (
                <li>{connect === "whatsapp" ? "WhatsApp number" : "Social handle"}</li>
              )}
              {!emergencyName && <li>Emergency contact name</li>}
              {!emergencyPhoneValid && <li>Emergency phone must be exactly 10 digits</li>}
            </ul>
          </div>
        )}

        <button
          type="submit"
          onClick={() => !valid && setShowErrors(true)}
          className="mt-7 w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          Create account
        </button>
      </form>

      <style>{`.input { width:100%; border-radius: 0.75rem; border:1px solid hsl(var(--border)); background: var(--color-background); padding: 0.65rem 0.9rem; font-size: 0.95rem; outline: none; } .input:focus { border-color: var(--color-primary); }`}</style>

      <AddHotspotModal
        open={addHotspotModalOpen}
        onClose={() => setAddHotspotModalOpen(false)}
        onCreate={handleCreateHotspot}
        name={newHotspotName}
        onNameChange={setNewHotspotName}
        type={newHotspotType}
        onTypeChange={setNewHotspotType}
      />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function AddHotspotModal({
  open,
  onClose,
  onCreate,
  name,
  onNameChange,
  type,
  onTypeChange,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  name: string;
  onNameChange: (value: string) => void;
  type: "college" | "office";
  onTypeChange: (type: "college" | "office") => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-secondary"
        >
          <X className="size-4" />
        </button>
        <h2 className="text-xl font-bold">Add new institution</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new college or office hotspot
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Institution name">
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. IIT Bombay, Google, etc."
              className="input"
            />
          </Field>

          <Field label="Type">
            <div className="flex gap-2">
              {(["college", "office"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTypeChange(t)}
                  className={`flex-1 rounded-full border px-4 py-2 text-sm capitalize transition ${
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          onClick={onCreate}
          disabled={!name}
          className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          Create institution
        </button>
      </div>
    </div>
  );
}
