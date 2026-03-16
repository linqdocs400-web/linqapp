"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Sparkles, Briefcase, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  refs: {
    home: React.RefObject<HTMLDivElement | null>;
    features: React.RefObject<HTMLDivElement | null>;
    career: React.RefObject<HTMLDivElement | null>;
    footer: React.RefObject<HTMLDivElement | null>;
  };
}

// FIX #1: removed misplaced `as const` from individual keys;
//          applied `as const` to the whole array instead.
const navItems = [
  { icon: Home,       label: "Home",     key: "home"     },
  { icon: Sparkles,   label: "Features", key: "features" },
  { icon: Briefcase,  label: "Careers",  key: "career"   },
  { icon: Smartphone, label: "Contact",  key: "footer"   },
] as const;

type NavKey = (typeof navItems)[number]["key"];

export default function Navbar({ refs }: NavbarProps) {
  const [scrolled,  setScrolled]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // ── Scroll listener (unchanged) ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // FIX #4: Keep activeIdx in sync with scroll using IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    navItems.forEach((item, idx) => {
      const el = refs[item.key as NavKey]?.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(idx);
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [refs]);

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    idx: number
  ) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveIdx(idx);
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <nav
        className={`fixed top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "left-[3%] md:left-[4%] w-[94%] md:w-[92%] bg-white/95 backdrop-blur-md shadow-xl rounded-[2rem] mt-3 md:mt-4"
            : "left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100/80 mt-0"
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-3">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="LinQ Logo"
              width={180}
              height={50}
              className="h-10 w-auto"
              priority
            />
            <span
              className="text-sm font-semibold hidden sm:block"
              style={{ color: "#1a1a1a" }}
            >
              GoTogetherRides Pvt Limited
            </span>
          </div>

          {/* CENTER icon pill — desktop only */}
          <div className="hidden md:flex items-center">
            <div
              className="flex items-center gap-1 px-2 py-2 rounded-full"
              style={{
                background: "rgba(47,94,234,0.06)",
                border: "1px solid rgba(47,94,234,0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeIdx === idx;
                return (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(refs[item.key], idx)}
                    title={item.label}
                    // FIX #3: overflow-visible so the tooltip isn't clipped
                    className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 group overflow-visible"
                    style={{ background: isActive ? "#2F5EEA" : "transparent" }}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors duration-200"
                      style={{ color: isActive ? "#fff" : "#6b7280" }}
                    />
                    {/* Tooltip rendered via a portal-like z-index boost */}
                    <span
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
                      style={{ background: "#2F5EEA", color: "#fff" }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT CTAs — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div
              className="flex items-center gap-2 font-semibold px-5 py-2 rounded-full text-sm cursor-default select-none"
              style={{
                border: "1.5px solid #2F5EEA",
                color: "#2F5EEA",
                background: "rgba(47,94,234,0.04)",
              }}
            >
              <Smartphone className="w-4 h-4" />
              App Coming Soon!
            </div>
            {/* FIX #2: removed nested <button> inside <Link>; use <Link> styled as button */}
            <Link
              href="/#search"
              className="font-semibold px-6 py-2 rounded-full text-sm text-white transition-opacity hover:opacity-90 inline-block"
              style={{ background: "#2F5EEA" }}
            >
              Find a Ride
            </Link>
          </div>

          {/* Mobile top-right CTA */}
          {/* FIX #2 (mobile): same fix — <Link> directly styled, no nested <button> */}
          <div className="md:hidden">
            <Link
              href="/#search"
              className="font-semibold px-5 py-2.5 rounded-full text-sm text-white inline-block"
              style={{ background: "#2F5EEA" }}
            >
              Find a Ride
            </Link>
          </div>

        </div>
      </nav>

      {/* ── MOBILE BOTTOM PILL NAV ────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center md:hidden">
        <div
          className="flex items-center rounded-full"
          style={{
            // FIX #5: explicit white background; add border so it reads on
            //          any page background without the grey tint issue
            background:  "#ffffff",
            border:      "1px solid rgba(47,94,234,0.12)",
            padding:     "8px",
            gap:         "4px",
            boxShadow:   "0 4px 24px rgba(47,94,234,0.14), 0 1px 6px rgba(0,0,0,0.07)",
          }}
        >
          {navItems.map((item, idx) => {
            const Icon     = item.icon;
            const isActive = activeIdx === idx;
            return (
              <button
                key={item.key}
                onClick={() => scrollToSection(refs[item.key as NavKey], idx)}
                aria-label={item.label}
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width:      44,
                  height:     44,
                  // FIX #1 (visual): inactive = light blue tint, not transparent,
                  //   so icons are always clearly visible on any background
                  background: isActive ? "#2F5EEA" : "rgba(47,94,234,0.06)",
                  flexShrink: 0,
                }}
              >
                <Icon
                  style={{
                    width:       24,          // FIX #2 (visual): 24 not 28 — better proportion
                    height:      24,
                    // FIX #1 (color): inactive icons are now grey (#6b7280) to match desktop
                    color:       isActive ? "#ffffff" : "#6b7280",
                    strokeWidth: 2,
                    opacity:     1,
                    transition:  "color 0.25s ease",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
