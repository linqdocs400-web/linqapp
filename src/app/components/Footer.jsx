import { FaWhatsapp, FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="text-center py-12 bg-[#0F2027] text-gray-400 text-sm border-t border-gray-700 mt-16">
      <div className="flex justify-center gap-6 mb-4">
        <a
          href="https://whatsapp.com/channel/0029VbAqx8E4SpkCdVRxhf2E"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 text-xl"
          aria-label="WhatsApp"
        >
          <FaWhatsapp />
        </a>
        <a
          href="https://www.linkedin.com/company/gotogetherrides/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-xl"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://www.instagram.com/gotogetherrides?igsh=azg0aGp3YnAzZTYy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 text-xl"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://x.com/GoTogetherRides"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-xl"
          aria-label="Twitter / X"
        >
          <FaTwitter />
        </a>
      </div>
      <p>© 2025 Go Together Rides Pvt. Ltd. Follow us and stay connected!</p>
    </footer>
  );
}
