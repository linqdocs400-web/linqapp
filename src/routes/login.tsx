import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useEffect } from "react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — linQ" }] }),
  component: Login,
});

function Login() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && !profileLoading) {
      if (profile) navigate({ to: "/" });
      else navigate({ to: "/onboarding" });
    }
  }, [user, authLoading, profile, profileLoading, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-secondary"
      >
        <ChevronLeft className="size-4" />
        Back
      </button>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <Logo size="default" />
          <span className="text-xl font-bold">linQ</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to find verified ride partners going your way.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3.5 font-semibold transition hover:bg-secondary"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to the Terms & Privacy.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
