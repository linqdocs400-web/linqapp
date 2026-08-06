import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const STORAGE_KEY = "dismissed_launchpadx_banner";

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible || pathname === "/launchpadx-2026") return null;

  return (
    <Link 
      to="/launchpadx-2026"
      className="relative flex items-center justify-center gap-x-6 overflow-hidden bg-primary px-6 py-2.5 sm:px-3.5 sm:before:flex-1 hover:bg-primary/90 transition-colors group cursor-pointer w-full z-[100]"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm/6 text-primary-foreground font-medium">
          <span className="inline-block animate-bounce mr-2">🚀</span>
          Attending VetriaAI LaunchPadX 2026? Connect with other participants before the event!
        </p>
        <span
          className="flex-none rounded-full bg-primary-foreground/10 px-3.5 py-1 text-sm font-semibold text-primary-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 flex items-center gap-1 group-hover:bg-primary-foreground/20 transition-colors"
        >
          Join Networking Hub <ArrowRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          onClick={handleDismiss}
          className="-m-3 p-3 focus-visible:outline-offset-[-4px] text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
    </Link>
  );
}
