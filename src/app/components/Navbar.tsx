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
{/* ================= DESKTOP NAVBAR ================= */}

```
  <nav
    className={`hidden md:block fixed top-0 z-50 transition-all duration-500 ${
      scrolled
        ? "left-[3%] md:left-[4%] w-[94%] md:w-[92%] bg-white/95 backdrop-blur-md shadow-xl rounded-[2rem] mt-3 md:mt-4"
        : "left-0 w-full bg-transparent mt-0"
    }`}
  >
    <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3">

      {/* LOGO */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="LinQ Logo"
          width={180}
          height={50}
          className="h-11 w-auto"
          priority
        />
        <span
          className="text-sm font-semibold hidden sm:block"
          style={{ color: "#1a1a1a" }}
        >
          GoTogetherRides Pvt Limited
        </span>
      </div>

      {/* CENTER — ICON PILL */}
      <div className="flex items-center">
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
                style={{
                  background: isActive ? "#2F5EEA" : "transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 transition-colors duration-200"
                  style={{
                    color: isActive ? "#ffffff" : "#6b7280",
                  }}
                />

                {/* Tooltip */}
                <span
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                  style={{
                    background: "#2F5EEA",
                    color: "#fff",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT CTAS */}
      <div className="flex items-center gap-3">
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
    </div>
  </nav>

  {/* ================= MOBILE BOTTOM NAVBAR ================= */}

  <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center md:hidden">
    <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_18px_45px_rgba(0,0,0,0.25)] rounded-full px-3 py-1.5">

      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIdx === idx;

        return (
          <button
            key={item.key}
            onClick={() => scrollToSection(refs[item.key], idx)}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300"
            style={{
              background: isActive ? "#2F5EEA" : "transparent",
            }}
          >
            <Icon
              className="w-5 h-5 transition-colors"
              style={{
                color: isActive ? "#ffffff" : "#6b7280",
              }}
            />

            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2 py-1 rounded-md bg-[#2F5EEA] text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}

    </div>
  </div>
</>

);
}
