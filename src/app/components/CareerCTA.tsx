"use client";

import Link from "next/link";

export default function CareerCTA() {
  return (
    <div className="text-center py-14 md:py-16 px-6 bg-[#2F5EEA] text-white rounded-3xl shadow-lg">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-3">
          We are Expanding Our Family!
        </h2>

        <p className="text-base md:text-lg mb-7 text-white/90">
          Join the passionate LinQ team shaping smarter travel.
        </p>

        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScCsaBXeMS_FCF_LIyGpQsWoagHuDv-FWoSEa_ul5dRpem1Qw/viewform">
          <button className="bg-white text-[#2F5EEA] px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold shadow-md hover:bg-gray-50 transition">
            Apply Now
          </button>
        </Link>

        <p className="mt-5 text-xs md:text-sm text-white/80">
          Exciting roles. Real impact. ✨
        </p>
      </div>
    </div>
  );
}
