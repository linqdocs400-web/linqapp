import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 md:px-2 bg-white pt-8 md:pt-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,233,255,0.06),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,230,118,0.06),transparent_40%)] pointer-events-none"></div>

      <div className="z-10 text-center flex flex-col items-center">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold max-w-xl sm:max-w-3xl leading-tight text-gray-900 text-center mx-auto">
          Connect. Commute.
          <br />
          <span className="text-[#2F5EEA]">
            Telangana&apos;s First Open Travel Platform.
          </span>
        </h2>

        {/* Paragraph */}
        <p className="mt-3 sm:mt-6 text-gray-600 max-w-md sm:max-w-2xl mx-auto text-base sm:text-lg">
          We&apos;re already a thriving community — over{" "}
          <span className="text-[#2F5EEA] font-semibold">35K+ followers</span> and{" "}
          <span className="text-[#2F5EEA] font-semibold">8K+ daily active users</span>
          {" "}— united by one goal: smarter, cleaner, affordable commuting.
        </p>

        {/* Primary CTAs */}
        <div className="mt-5 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Link href="https://forms.gle/EK6ScmSd65bBH2X5A" passHref>
            <button className="bg-[#2F5EEA] text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-[#1E3FAE] transition">
              JOIN FOR FREE
            </button>
          </Link>

          {/* Sankranti villages form */}
          <Link href="https://forms.gle/FGmHDfHM8sW3bPVW8">
            <button
              className="
                relative overflow-hidden
                bg-gradient-to-r from-[#FFB703] via-[#FFD166] to-[#FF9F1C]
                text-[#4A2C00] font-bold
                px-8 sm:px-10 py-3 sm:py-4
                rounded-full
                shadow-[0_0_25px_rgba(255,183,3,0.45)]
                hover:shadow-[0_0_35px_rgba(255,183,3,0.7)]
                transition-all duration-300
                hover:scale-[1.04] text-sm sm:text-base
              "
            >
              🪁🌾Sankranti Travel Form<span className="ml-1">🚙🏍️</span>
              <span className="pointer-events-none absolute inset-0 bg-white/20 animate-shine" />
            </button>
          </Link>
        </div>

        {/* Small note */}
        <p className="mt-2 sm:mt-4 text-sm sm:text-md text-gray-500 max-w-xs sm:max-w-full mx-auto px-2">
          Register for early access and get 3 months of free cost-sharing connections.
        </p>

        {/* winners removed per request */}
      </div>
    </section>
  );
}
