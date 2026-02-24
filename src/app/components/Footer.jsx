import { FaWhatsapp, FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-[#2F5EEA] text-white">

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 flex justify-center items-end">
        <img
          src="/footer-ride.png"
          className="w-full max-w-6xl opacity-30 object-contain"
        />
      </div>

      {/* CONTENT OVER IMAGE */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">

        {/* HEADING */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Ride together. Save more.
        </h2>

        <p className="text-blue-100 mb-10">
          Telangana’s trusted ride sharing community
        </p>

        {/* BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <a
            href="#search"
            className="bg-white text-[#2F5EEA] px-7 py-3 rounded-full font-semibold shadow hover:scale-105 transition inline-block"
          >
            Find a Ride
          </a>

          <a
            href="/connect/new"
            className="bg-[#1E3FAE] px-7 py-3 rounded-full font-semibold shadow hover:scale-105 transition inline-block"
          >
            Post a Ride
          </a>
        </div>

        {/* SOCIAL ICONS */}
        <div className="flex justify-center gap-6 text-2xl mb-8">

          <a
            href="https://whatsapp.com/channel/0029VbAqx8E4SpkCdVRxhf2E"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition"
          >
            <FaWhatsapp />
          </a>

          <a
            href="https://www.linkedin.com/company/gotogetherrides/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition"
          >
            <FaLinkedin />
          </a>

          <a
            href="https://www.instagram.com/gotogetherrides/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:scale-110 transition"
          >
            <FaInstagram />
          </a>

          <a
            href="https://x.com/GoTogetherRides"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition"
          >
            <FaTwitter />
          </a>

        </div>

        {/* COPYRIGHT */}
        <p className="text-blue-100 text-sm">
          © 2025 Go Together Rides • Built for Telangana commuters
        </p>
      </div>
    </footer>
  );
}
