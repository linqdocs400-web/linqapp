"use client";

import { useState, useEffect } from "react";
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

const navItems = [
  { icon: Home, label: "Home", key: "home" as const },
  { icon: Sparkles, label: "Features", key: "features" as const },
  { icon: Briefcase, label: "Careers", key: "career" as const },
  { icon: Smartphone, label: "Contact", key: "footer" as const },
];

export default function Navbar({ refs }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    idx: number
  ) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveIdx(idx);
  };

  return (
    <>
      {/* ─────────────────────────────────────────
          TOP NAVBAR
          Desktop : logo + centered icon pill + right CTAs
          Mobile  : logo (left) + "Find a Ride" button (right)
                    — clean, minimal like Puri Escapes header
      ───────────────────────────────────────── */}
      <nav
        className={`fixed top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "left-[3%] md:left-[4%] w-[94%] md:w-[92%] bg-white/95 backdrop-blur-md shadow-xl rounded-[2rem] mt-3 md:mt-4"
            : "left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 mt-0"
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
            {/* Company name: hidden on mobile for the clean Puri Escapes look */}
            <span
              className="text-sm font-semibold hidden sm:block"
              style={{ color: "#1a1a1a" }}
            >
              GoTogetherRides Pvt Limited
            </span>
          </div>

          {/* CENTER — icon pill (desktop only) */}
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
                    className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 group"
                    style={{ background: isActive ? "#2F5EEA" : "transparent" }}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors duration-200"
                      style={{ color: isActive ? "#ffffff" : "#6b7280" }}
                    />
                    <span
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
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
            <Link href="/#search">
              <button
                className="font-semibold px-6 py-2 rounded-full transition text-sm text-white"
                style={{ background: "#2F5EEA" }}
              >
                Find a Ride
              </button>
            </Link>
          </div>

          {/* RIGHT CTA — mobile only (Puri Escapes "Get in Touch" equivalent) */}
          <div className="md:hidden">
            <Link href="/#search">
              <button
                className="font-semibold px-5 py-2.5 rounded-full text-sm text-white"
                style={{ background: "#2F5EEA" }}
              >
                Find a Ride
              </button>
            </Link>
          </div>

        </div>
      </nav>

      {/* ─────────────────────────────────────────
          MOBILE BOTTOM PILL NAV  (Puri Escapes / Image 3 style)
          • Soft blue-tinted pill background
          • Active tab = solid blue filled circle with white icon
          • Inactive tabs = grey icon, no background
          • Only visible on mobile (md:hidden)
      ───────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center md:hidden">
        <div
          className="flex items-center gap-0.5 px-2.5 py-2 rounded-full"
          style={{
            background: "rgba(235, 239, 255, 0.97)",
            border: "1px solid rgba(47,94,234,0.1)",
            boxShadow:
              "0 8px 30px rgba(47,94,234,0.15), 0 2px 8px rgba(0,0,0,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIdx === idx;
            return (
              <button
                key={item.key}
                onClick={() => scrollToSection(refs[item.key], idx)}
                aria-label={item.label}
                className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
                style={{
                  background: isActive ? "#2F5EEA" : "transparent",
                }}
              >
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: 20,
                    height: 20,
                    color: isActive ? "#ffffff" : "#9ca3af",
                    strokeWidth: isActive ? 2.2 : 1.7,
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
