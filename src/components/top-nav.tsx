import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, ClipboardList, CreditCard, User, Sun, Moon, Briefcase, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/lib/theme";
import { Logo } from "@/components/logo";
import { useCouponStore } from "@/lib/coupon-provider";

const links = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Hotspots", Icon: Search },
  { to: "/trips", label: "Trips", Icon: ClipboardList },
  { to: "/pricing", label: "Pricing", Icon: CreditCard },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { profile } = useProfile();
  const signedIn = !!user && !!profile;
  const { theme, toggle } = useTheme();
  const isDark = theme === "sapphire-dark";
  const { openPopup } = useCouponStore();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b border-border/60 bg-background/80 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="default" />
          <span className="text-lg font-bold tracking-tight">linQ</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <l.Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
          <a
            href="https://tally.so/r/5BedVQ"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Briefcase className="size-4" />
            Career
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition hover:bg-secondary"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={() => openPopup()}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-medium hover:bg-secondary transition"
          >
            <Gift className="size-4 text-primary" />
            <span className="hidden sm:inline">Redeem Coupon</span>
          </button>
          {signedIn ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-2 py-1.5 pr-4 text-sm font-medium hover:bg-secondary"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-primary/30 text-primary-foreground">
                <User className="size-4" />
              </span>
              <span className="max-w-[8rem] truncate">{profile?.name ?? "Profile"}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
