import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  Siren,
  BadgeCheck,
  UserPlus,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & verification — linQ" },
      { name: "description", content: "Safety tips, ID verification, SOS and emergency contacts." },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  const [sosOpen, setSosOpen] = useState(false);
  const { profile } = useProfile();
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const handleShareLocation = async () => {
    if (!profile?.emergency_phone) {
      toast.error("Please add an emergency contact first.");
      return;
    }

    setIsSharingLocation(true);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const currentTime = new Date().toLocaleString();

      // Format phone number (remove non-digits)
      const phone = profile.emergency_phone.replace(/\D/g, "");

      // Create message
      const message = `🚗 Hi!

I'm travelling with LinqRides.

📍 Current Location:
${mapsLink}

🕒 Time:
${currentTime}

Please keep this location for safety.

- Sent via LinqRides`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");

      toast.success("Location shared via WhatsApp");
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("Failed to get location. Please try again.");
        }
      } else {
        toast.error("Failed to share location. Please try again.");
      }
    } finally {
      setIsSharingLocation(false);
    }
  };

  const tips = [
    "Always verify the rider's profile and ratings before meeting.",
    "Share your live trip with a trusted contact.",
    "Meet in well-lit, public pickup spots.",
    "Never share OTPs, banking details, or ID copies in chat.",
    "Trust your instincts — cancel if something feels off.",
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 pt-6 pb-32 lg:px-8 lg:pt-10">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to profile
        </Link>

        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                Safety & verification
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Stay safe on every ride.</p>
            </div>
          </div>
          <button
            onClick={() => setSosOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-lg hover:opacity-95"
          >
            <Siren className="size-4" /> SOS
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="size-5 text-primary" /> Safety instructions
            </h2>
            <ul className="mt-4 space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-secondary p-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <MessageCircle className="size-4 text-primary" /> SHARE VIA WHATSAPP
              </h3>
              <p className="mt-2 text-sm">
                Share your current location with your emergency contact via WhatsApp.
              </p>
              <button
                onClick={handleShareLocation}
                disabled={isSharingLocation}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50"
              >
                {isSharingLocation ? (
                  <>
                    <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MessageCircle className="size-4" />
                    Share via WhatsApp
                  </>
                )}
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Phone className="size-4 text-primary" /> EMERGENCY CONTACT
              </h3>
              {profile?.emergency_name && profile?.emergency_phone ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-secondary p-3 text-sm">
                    <span className="font-medium">{profile.emergency_name}</span>
                    <span className="text-muted-foreground">{profile.emergency_phone}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No emergency contact added yet.
                </p>
              )}
              <Link
                to="/profile"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <UserPlus className="size-4" /> {profile?.emergency_name ? "Update contact" : "Add contact"}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {sosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-destructive/40 bg-card p-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <Siren className="size-7" />
            </span>
            <h3 className="mt-3 text-xl font-bold">Send SOS alert?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll notify your emergency contacts with your live location.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSosOpen(false)}
                className="rounded-full bg-secondary py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <a
                href="tel:112"
                className="rounded-full bg-destructive py-2.5 text-sm font-bold text-destructive-foreground"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
