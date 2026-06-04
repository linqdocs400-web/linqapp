import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CreditCard, Search, ClipboardList, User } from "lucide-react";
import { useConnectionRequests } from "@/hooks/use-connection-requests";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/trips", label: "Trips", Icon: ClipboardList },
  { to: "/pricing", label: "Pricing", Icon: CreditCard },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { pendingCount } = useConnectionRequests();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md justify-center px-5 lg:hidden">
      <div className="flex w-full items-center justify-between rounded-full border border-border bg-card/90 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          const showBadge = to === "/trips" && pendingCount > 0;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`relative flex size-11 items-center justify-center rounded-full transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {showBadge && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
