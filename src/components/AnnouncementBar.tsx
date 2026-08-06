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
      className="relative flex items-center justify-center gap-x-2 sm:gap-x-6 overflow-hidden bg-primary px-3 py-1.5 sm:px-3.5 sm:py-2.5 sm:before:flex-1 hover:bg-primary/90 transition-colors group cursor-pointer w-full z-[100]"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <p className="text-xs sm:text-sm/6 text-primary-foreground font-medium flex items-center justify-center">
          <span className="inline-block animate-bounce mr-1.5 sm:mr-2">🚀</span>
          <span className="sm:hidden">Attending VetriaAI LaunchPadX 2026?</span>
          <span className="hidden sm:inline">Attending VetriaAI LaunchPadX 2026? Connect with other participants before the event!</span>
        </p>
        <span
          className="flex-none rounded-full bg-primary-foreground/10 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-sm font-semibold text-primary-foreground shadow-sm focus-visible:outline flex items-center gap-1 group-hover:bg-primary-foreground/20 transition-colors"
        >
          Join Networking Hub <ArrowRight className="size-3 sm:size-4" />
        </span>
      </div>
      <div className="flex flex-1 justify-end absolute right-2 sm:static">
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
