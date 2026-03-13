"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, Compass, Sparkles, History, Smartphone } from "lucide-react";
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
  { icon: Compass, label: "Features", key: "features" as const },
  { icon: Sparkles, label: "Careers", key: "career" as const },
  { icon: History, label: "Footer", key: "footer" as const },
];

export default function Navbar({ refs }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 z-50 transition-all duration-500 ${
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

        {/* CENTER — ICON PILL (desktop) */}
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
        <div className="hidden md:flex items-center gap-3">
          {/* Get the App — outline */}
          <Link href="/download">
            <button
              className="flex items-center gap-2 font-semibold px-5 py-2 rounded-full transition text-sm"
              style={{
                border: "1.5px solid #2F5EEA",
                color: "#2F5EEA",
                background: "transparent",
              }}
            >
              <Smartphone className="w-4 h-4" />
              Get the App
            </button>
          </Link>

          {/* Find a Ride — solid CTA */}
          <Link href="/#search">
            <button
              className="font-semibold px-6 py-2 rounded-full transition text-sm text-white"
              style={{ background: "#2F5EEA" }}
            >
              Find a Ride
            </button>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full border shadow-sm"
            style={{
              background: "#ffffff",
              borderColor: "#e5e7eb",
            }}
          >
            {menuOpen ? (
              <X style={{ color: "#2F5EEA" }} className="w-5 h-5" />
            ) : (
              <Menu
                className="w-5 h-5"
                style={{ color: "#2F5EEA" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-72 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        } mx-4 sm:mx-6 mb-4 bg-white border border-gray-200 shadow-lg rounded-2xl`}
      >
        <ul className="flex flex-col items-center gap-5 font-medium text-gray-700 text-base">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={item.key}
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: activeIdx === idx ? "#2F5EEA" : "#374151" }}
                onClick={() => scrollToSection(refs[item.key], idx)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </li>
            );
          })}
          <div className="flex gap-3 mt-1">
            <Link href="/download" onClick={() => setMenuOpen(false)}>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ border: "1.5px solid #2F5EEA", color: "#2F5EEA" }}
              >
                <Smartphone className="w-4 h-4" />
                Get the App
              </button>
            </Link>
            <Link href="/#search" onClick={() => setMenuOpen(false)}>
              <button
                className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "#2F5EEA" }}
              >
                Find a Ride
              </button>
            </Link>
          </div>
        </ul>
      </div>
    </nav>
  );
}
