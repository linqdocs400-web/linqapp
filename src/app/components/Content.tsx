import Link from "next/link";

export default function Content() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-[#2F5EEA]",
      title: "Advanced Matching",
      description: "Advanced algorithms connect you with compatible riders on your route in real-time."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[#2F5EEA]",
      title: "Carbon Tracker",
      description: "Track your CO₂ savings and unlock eco achievements with every ride."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m0 0v1m0-1c-2 0-4-1.5-4-4s2-4 4-4 4 1.5 4 4-2 4-4 4z" />
        </svg>
      ),
      color: "bg-[#2F5EEA]",
      title: "Gamified Rewards",
      description: "Earn LinQ coins, unlock perks, and climb leaderboards."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
        </svg>
      ),
      color: "bg-[#2F5EEA]",
      title: "Safety Network",
      description: "Verified users, SOS alerts, live tracking & 24/7 support."
    }
  ];

  return (
    <section className="relative py-12 md:py-20 px-6 md:px-12 bg-white text-gray-900 overflow-hidden">
      <div className="pointer-events-none absolute -right-12 -top-16 w-72 h-72 rounded-full bg-[#5FA9FF]/10 blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

          {/* Left Column */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-700 mb-4">
              What is <span className="text-[#2F5EEA]">LinQ</span>?
            </h2>

            <p className="text-lg text-gray-600 mb-6">
              A smarter way to commute — LinQ connects people, shares costs, and
              builds trusted, community-first rides. Safer, greener, affordable daily travel.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <Stat title="34K+" subtitle="followers" />
              <Stat title="8K" subtitle="daily users" />
              <Stat title="4.8★" subtitle="avg rating" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Bullet title="Smart matching" desc="Route-based matching for perfect ride connections." />
              <Bullet title="Fair payments" desc="Automatic cost splitting and full transparency." />
            </div>

            <div className="mt-8">
              <Link href="https://forms.gle/EK6ScmSd65bBH2X5A">
                <button className="bg-[#2F5EEA] text-white px-7 py-3 rounded-full font-semibold shadow-lg hover:bg-[#1E3FAE] transition">
                  JOIN FOR FREE
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
              {features.map((f, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                  <div className={`w-12 h-12 rounded-full ${f.color} text-white flex items-center justify-center mb-3`}>
                    {f.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-gray-600 text-sm">{f.description}</p>
                </div>
              ))}

              <div className="absolute -left-4 -top-6 bg-[#2F5EEA] text-white px-4 py-2 rounded-xl shadow-xl text-xs sm:text-sm">
                Community-first mobility
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* Sub Components */

const Stat = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-center">
    <strong className="block text-sm text-gray-800">{title}</strong>
    <span className="text-xs text-gray-500">{subtitle}</span>
  </div>
);

const Bullet = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex items-start gap-3">
    <span className="w-9 h-9 rounded-full bg-[#2F5EEA] text-white flex items-center justify-center">✓</span>
    <div>
      <div className="text-gray-800 font-medium">{title}</div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </div>
  </div>
);
