"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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

export default function Navbar({ refs }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "max-w-[94%] md:max-w-[92%] left-[3%] md:left-[4%] bg-white shadow-lg rounded-[2rem] md:rounded-[2.5rem] mt-3 md:mt-4 translate-y-2 md:translate-y-3 border border-gray-200"
          : "bg-transparent max-w-full left-0 mt-0 translate-y-0"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3">

        {/* SMALL LOGO */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="LinQ Logo"
            width={60}
            height={14}
            className="h-4 md:h-5 w-auto object-contain select-none"
            priority
          />
        </div>

        {/* DESKTOP MENU — normal readable size */}
        <ul className="hidden md:flex items-center gap-10 lg:gap-14 ml-6 font-medium text-[15px] text-gray-700">
          <li
            className="hover:text-[#2F5EEA] cursor-pointer transition"
            onClick={() => scrollToSection(refs.home)}
          >
            Home
          </li>

          <li
            className="hover:text-[#2F5EEA] cursor-pointer transition"
            onClick={() => scrollToSection(refs.features)}
          >
            Features
          </li>

          <li
            className="hover:text-[#2F5EEA] cursor-pointer transition"
            onClick={() => scrollToSection(refs.career)}
          >
            Careers
          </li>
        </ul>

        {/* CTA — normal size */}
        <div className="hidden md:flex items-center">
          <Link href="/#search">
            <button className="bg-[#2F5EEA] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#1E3FAE] transition text-sm">
              Find a Ride
            </button>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 bg-white rounded-full border border-gray-200 shadow-sm"
          >
            {menuOpen ? (
              <X className="text-[#2F5EEA] w-5 h-5" />
            ) : (
              <Menu className="text-[#2F5EEA] w-5 h-5" />
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
          <li onClick={() => scrollToSection(refs.home)}>Home</li>
          <li onClick={() => scrollToSection(refs.features)}>Features</li>
          <li onClick={() => scrollToSection(refs.career)}>Careers</li>

          <Link href="/#search" onClick={() => setMenuOpen(false)}>
            <button className="bg-[#2F5EEA] text-white px-6 py-2 rounded-full text-sm">
              Find a Ride
            </button>
          </Link>
        </ul>
      </div>
    </nav>
  );
}
