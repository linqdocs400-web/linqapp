"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  refs: {
    home: React.RefObject<HTMLDivElement | null>;
    content: React.RefObject<HTMLDivElement | null>;
    features: React.RefObject<HTMLDivElement | null>;
    footer: React.RefObject<HTMLDivElement | null>;
  };
}

const Navbar: React.FC<NavbarProps> = ({ refs }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? "max-w-[92%] left-[4%] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl rounded-[2.5rem] mt-4 translate-y-3 border border-gray-200"
          : "bg-transparent max-w-full left-0 mt-0 translate-y-0"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-10 py-3 relative">
        {/* Logo */}
        <div className="flex items-center h-10">
          <Image
            src="/logo.png"
            alt="LinQ Logo"
            width={140}
            height={32}
            className="h-8 w-auto object-contain select-none"
            priority
          />
        </div>

        {/* Desktop Menu */}
        <ul
          className={`hidden md:flex gap-14 ml-10 font-medium transition-colors ${
            scrolled ? "text-gray-700" : "text-gray-600"
          }`}
        >
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.home)}
          >
            Home
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.features)}
          >
            Features
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.content)}
          >
            About
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.footer)}
          >
            Careers
          </li>
        </ul>

        {/* Desktop Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => scrollToSection(refs.features)}
            className="bg-[#2F5EEA] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#1E3FAE] transition"
          >
            JOIN FOR FREE
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden absolute right-8">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 bg-[#5FA9FF]/20 rounded-full border border-[#2F5EEA]/30 shadow-lg transition hover:bg-[#5FA9FF]/30"
          >
            {menuOpen ? (
              <X className="text-[#2F5EEA] w-6 h-6" />
            ) : (
              <Menu className="text-[#2F5EEA] w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        } mx-8 mb-4 bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)] rounded-2xl`}
        style={{ transformOrigin: "top center" }}
      >
        <ul className="flex flex-col items-center gap-4 font-medium text-gray-700">
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.home)}
          >
            Home
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.features)}
          >
            Features
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.content)}
          >
            About
          </li>
          <li
            className="hover:text-[#2F5EEA] transition cursor-pointer"
            onClick={() => scrollToSection(refs.footer)}
          >
            Careers
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
