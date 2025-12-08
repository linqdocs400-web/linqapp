
// // "use client";
// // import { useState, useEffect } from "react";
// // import { Menu, X } from "lucide-react";
// // import Link from "next/link";

// // export default function Navbar() {
// //   const [scrolled, setScrolled] = useState(false);
// //   const [menuOpen, setMenuOpen] = useState(false);

// //   useEffect(() => {
// //     const handleScroll = () => setScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   return (
// //     <nav
// //       className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
// //         scrolled
// //           ? "max-w-[92%] left-[4%] bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-[2.5rem] mt-4 translate-y-3 border border-[#00E676]/20"
// //           : "bg-transparent max-w-full left-0 mt-0 translate-y-0"
// //       }`}
// //     >
// //       <div className="flex justify-between items-center max-w-7xl mx-auto px-8 py-5 relative ">
// //         {/* Logo */}
// //         <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00E676] to-[#00C9FF] bg-clip-text text-transparent select-none">
// //           LinQ
// //         </h1>

// //         {/* Desktop Menu */}
// //         <ul className="hidden md:flex gap-8 text-[#7a7b7c] font-medium">
// //           <li className="hover:text-[#00E676] transition cursor-pointer">Home</li>
// //           <li className="hover:text-[#00C9FF] transition cursor-pointer">Features</li>
// //           <li className="hover:text-[#00E676] transition cursor-pointer">About</li>
// //           <li className="hover:text-[#00C9FF] transition cursor-pointer">Contact</li>
// //         </ul>

// //         {/* Desktop Button */}
// //        <Link href="https://forms.gle/EK6ScmSd65bBH2X5A" passHref>
// //   <button className="hidden md:block bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-black font-semibold px-5 py-2 rounded-full hover:shadow-[0_0_20px_#00E676] transition">
// //     JOIN FOR FREE
// //   </button>
// // </Link>
// //         {/* Mobile Hamburger */}
// //         <div className="md:hidden absolute left-1/2 -translate-x-1/2">
// //           <button
// //             onClick={() => setMenuOpen(!menuOpen)}
// //             className="p-2 bg-gradient-to-r from-[#00E676]/20 to-[#00C9FF]/20 rounded-full border border-[#00E676]/30 shadow-lg transition hover:scale-105"
// //           >
// //             {menuOpen ? <X className="text-[#00E676] w-6 h-6" /> : <Menu className="text-[#00E676] w-6 h-6" />}
// //           </button>
// //         </div>
// //       </div>

// //       {/* Mobile Dropdown */}
// //       <div
// //         className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden
// //           ${menuOpen ? "max-h-64 opacity-100 py-4" : "max-h-0 opacity-0 py-0"}
// //           mx-6 mb-4
// //           ${
// //             scrolled
// //               ? "bg-transparent border-none shadow-none rounded-none"
// //               : "bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 border border-[#00E676]/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] rounded-2xl"
// //           }`}
// //         style={{ transformOrigin: "top center" }}
// //       >
// //         <ul className="flex flex-col items-center gap-4 text-[#d0d0d0] font-medium">
// //           <a className="hover:text-[#00E676] transition cursor-pointer">Home</a>
// //           <a className="hover:text-[#00C9FF] transition cursor-pointer">Features</a>
// //           <a className="hover:text-[#00E676] transition cursor-pointer">About</a>
// //           <a className="hover:text-[#00C9FF] transition cursor-pointer">Contact</a>
// //         </ul>
// //       </div>
// //     </nav>
// //   );
// // }
// "use client";
// import { useState, useEffect } from "react";
// import { Menu, X } from "lucide-react";

// interface NavbarProps {
//   refs: {
//     home: React.RefObject<HTMLDivElement>;
//     content: React.RefObject<HTMLDivElement>;
//     features: React.RefObject<HTMLDivElement>;
//     footer: React.RefObject<HTMLDivElement>;
//   };
// }

// export default function Navbar({ refs }: NavbarProps) {
//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
//     ref.current?.scrollIntoView({ behavior: "smooth" });
//     setMenuOpen(false); // close mobile menu
//   };

//   return (
//     <nav
//       className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
//         scrolled
//           ? "max-w-[92%] left-[4%] bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-[2.5rem] mt-4 translate-y-3 border border-[#00E676]/20"
//           : "bg-transparent max-w-full left-0 mt-0 translate-y-0"
//       }`}
//     >
//       <div className="flex justify-between items-center max-w-7xl mx-auto px-8 py-5 relative ">
//         {/* Logo */}
//         <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00E676] to-[#00C9FF] bg-clip-text text-transparent select-none">
//           LinQ
//         </h1>

//         {/* Desktop Menu */}
//         <ul className="hidden md:flex gap-8 text-[#7a7b7c] font-medium">
//           <li
//             className="hover:text-[#00E676] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.home)}
//           >
//             Home
//           </li>
//           <li
//             className="hover:text-[#00C9FF] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.features)}
//           >
//             Features
//           </li>
//           <li
//             className="hover:text-[#00E676] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.content)}
//           >
//             About
//           </li>
//           <li
//             className="hover:text-[#00C9FF] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.footer)}
//           >
//             Contact
//           </li>
//         </ul>

//         {/* Desktop Button */}
//         <button
//           onClick={() => scrollToSection(refs.features)}
//           className="hidden md:block bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-black font-semibold px-5 py-2 rounded-full hover:shadow-[0_0_20px_#00E676] transition"
//         >
//           JOIN FOR FREE
//         </button>

//         {/* Mobile Hamburger */}
//         <div className="md:hidden absolute left-1/2 -translate-x-1/2">
//           <button
//             onClick={() => setMenuOpen(!menuOpen)}
//             className="p-2 bg-gradient-to-r from-[#00E676]/20 to-[#00C9FF]/20 rounded-full border border-[#00E676]/30 shadow-lg transition hover:scale-105"
//           >
//             {menuOpen ? <X className="text-[#00E676] w-6 h-6" /> : <Menu className="text-[#00E676] w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Dropdown */}
//       <div
//         className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden
//           ${menuOpen ? "max-h-64 opacity-100 py-4" : "max-h-0 opacity-0 py-0"}
//           mx-6 mb-4
//           ${
//             scrolled
//               ? "bg-transparent border-none shadow-none rounded-none"
//               : "bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 border border-[#00E676]/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] rounded-2xl"
//           }`}
//         style={{ transformOrigin: "top center" }}
//       >
//         <ul className="flex flex-col items-center gap-4 text-[#d0d0d0] font-medium">
//           <li
//             className="hover:text-[#00E676] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.home)}
//           >
//             Home
//           </li>
//           <li
//             className="hover:text-[#00C9FF] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.features)}
//           >
//             Features
//           </li>
//           <li
//             className="hover:text-[#00E676] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.content)}
//           >
//             About
//           </li>
//           <li
//             className="hover:text-[#00C9FF] transition cursor-pointer"
//             onClick={() => scrollToSection(refs.footer)}
//           >
//             Contact
//           </li>
//         </ul>
//       </div>
//     </nav>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
          ? "max-w-[92%] left-[4%] bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-[2.5rem] mt-4 translate-y-3 border border-[#00E676]/20"
          : "bg-transparent max-w-full left-0 mt-0 translate-y-0"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-10 py-5 relative">
        {/* Logo */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00E676] to-[#00C9FF] bg-clip-text text-transparent select-none">
          LinQ
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-14 ml-10 text-[#7a7b7c] font-medium">
          <li
            className="hover:text-[#00E676] transition cursor-pointer"
            onClick={() => scrollToSection(refs.home)}
          >
            Home
          </li>
          <li
            className="hover:text-[#00C9FF] transition cursor-pointer"
            onClick={() => scrollToSection(refs.features)}
          >
            Features
          </li>
          <li
            className="hover:text-[#00E676] transition cursor-pointer"
            onClick={() => scrollToSection(refs.content)}
          >
            About
          </li>
          <li
            className="hover:text-[#00C9FF] transition cursor-pointer"
            onClick={() => scrollToSection(refs.footer)}
          >
            Careers
          </li>
        </ul>

        {/* Desktop Button */}
        <button
          onClick={() => scrollToSection(refs.features)}
          className="hidden md:block bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-black font-semibold px-6 py-2 rounded-full hover:shadow-[0_0_20px_#00E676] transition"
        >
          JOIN FOR FREE
        </button>

        {/* Mobile Hamburger */}
        <div className="md:hidden absolute right-8">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 bg-gradient-to-r from-[#00E676]/20 to-[#00C9FF]/20 rounded-full border border-[#00E676]/30 shadow-lg transition hover:scale-105"
          >
            {menuOpen ? (
              <X className="text-[#00E676] w-6 h-6" />
            ) : (
              <Menu className="text-[#00E676] w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        } mx-8 mb-4 ${
          scrolled
            ? "bg-transparent border-none shadow-none rounded-none"
            : "bg-gradient-to-r from-[#0f2027]/95 via-[#203a43]/95 to-[#2c5364]/95 border border-[#00E676]/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] rounded-2xl"
        }`}
        style={{ transformOrigin: "top center" }}
      >
        <ul className="flex flex-col items-center gap-4 text-[#d0d0d0] font-medium">
          <li
            className="hover:text-[#00E676] transition cursor-pointer"
            onClick={() => scrollToSection(refs.home)}
          >
            Home
          </li>
          <li
            className="hover:text-[#00C9FF] transition cursor-pointer"
            onClick={() => scrollToSection(refs.features)}
          >
            Features
          </li>
          <li
            className="hover:text-[#00E676] transition cursor-pointer"
            onClick={() => scrollToSection(refs.content)}
          >
            About
          </li>
          <li
            className="hover:text-[#00C9FF] transition cursor-pointer"
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

