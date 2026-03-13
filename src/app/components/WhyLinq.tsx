"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ end, start }: { end: number; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1400;
    const step = 16;
    const increment = end / (duration / step);

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, step);

    return () => clearInterval(timer);
  }, [start, end]);

  return <span>{count.toLocaleString()}</span>;
}

const cards = [
  {
    title: "Find commuters on your exact route",
    desc: "Match with commuters who travel your exact route and schedule.",
    image: "/linq1.png",
  },
  {
    title: "Split fuel cost fairly",
    desc: "Fair distance-based cost sharing with zero surge pricing.",
    image: "/linq2.png",
  },
  {
    title: "Travel with verified people",
    desc: "Profiles, trust scores, and reviews ensure safe rides.",
    image: "/linq3.png",
  },
  {
    title: "Reduce traffic & pollution",
    desc: "Share rides and make commuting eco-friendly.",
    image: "/linq4.png",
  },
];

export default function WhyLinq() {
  const [active, setActive] = useState(0);
  const [startCount, setStartCount] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartCount(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setActive((p) => (p + 1) % cards.length);
    }, 2400);
    return () => clearInterval(i);
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-20 md:py-24 px-4 bg-[#F7F9FF]">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="max-w-7xl mx-auto text-center">

        {/* HEADING */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-3 leading-tight px-2 text-black">
          Smarter Commutes.
          <span style={{ color: "#2F5EEA" }} className="block sm:inline"> {" "}Built on Community.</span>
        </h2>

        <p className="text-gray-600 max-w-xl mx-auto mb-10 md:mb-14 text-sm md:text-base px-4">
          LinQ connects commuters on the same routes to share rides,
          reduce costs and travel responsibly.
        </p>

        {/* STATS ROW */}
        <div className="flex justify-between gap-3 md:gap-8 mb-16">
          <div className="flex-1 bg-white py-6 md:py-10 rounded-2xl md:rounded-3xl shadow-sm">
            <h3 className="text-xl md:text-3xl font-bold" style={{ color: "#2F5EEA" }}>
              <CountUp end={34000} start={startCount} />+
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Commuters</p>
          </div>
          <div className="flex-1 bg-white py-6 md:py-10 rounded-2xl md:rounded-3xl shadow-sm">
            <h3 className="text-xl md:text-3xl font-bold" style={{ color: "#2F5EEA" }}>
              <CountUp end={8000} start={startCount} />+
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Daily users</p>
          </div>
          <div className="flex-1 bg-white py-6 md:py-10 rounded-2xl md:rounded-3xl shadow-sm">
            <h3 className="text-xl md:text-3xl font-bold" style={{ color: "#2F5EEA" }}>4.8★</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Rating</p>
          </div>
        </div>

        {/* FEATURE CARDS — horizontal scroll on mobile, grid on desktop */}
        <div className="md:hidden -mx-4 px-4 mb-20">
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          >
            {cards.map((card, i) => {
              const isActive = active === i;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl bg-white flex-shrink-0 snap-start transition-all duration-500 cursor-pointer"
                  style={{
                    width: "78vw",
                    minHeight: "220px",
                    border: isActive
                      ? "1.5px solid rgba(47,94,234,0.4)"
                      : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: isActive
                      ? "0 8px 40px rgba(47,94,234,0.15)"
                      : "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                  onClick={() => setActive(i)}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[4px]"
                      style={{ background: "#2F5EEA", borderRadius: "12px 0 0 12px" }}
                    />
                  )}
                  {/* Image bottom-center on mobile */}
                  <div className="flex flex-col h-full">
                    <div className="flex-1 px-5 pt-6 pb-2 text-left">
                      <h3
                        className="text-base font-semibold mb-2 leading-snug"
                        style={{ color: "#2F5EEA" }}
                      >
                        {card.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex justify-center overflow-hidden" style={{ height: "140px" }}>
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-auto object-contain object-bottom"
                        style={{ filter: "grayscale(100%) brightness(1.1) contrast(1.2)" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FEATURE CARDS — desktop grid only */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 md:gap-5 mb-20">
          {cards.map((card, i) => {
            const isActive = active === i;
            return (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl bg-white transition-all duration-500 cursor-pointer"
                style={{
                  border: isActive
                    ? "1.5px solid rgba(47,94,234,0.4)"
                    : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: isActive
                    ? "0 8px 40px rgba(47,94,234,0.15)"
                    : "0 2px 12px rgba(0,0,0,0.06)",
                  transform: isActive ? "scale(1.01)" : "scale(1)",
                }}
                onClick={() => setActive(i)}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[4px]"
                    style={{ background: "#2F5EEA", borderRadius: "12px 0 0 12px" }}
                  />
                )}
                <div className="flex items-end min-h-[155px]">
                  <div
                    className="relative flex-shrink-0"
                    style={{ width: "155px", height: "155px" }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute bottom-0 left-0 w-full h-full object-cover object-top"
                      style={{ filter: "grayscale(100%) brightness(1.1) contrast(1.2)" }}
                    />
                  </div>
                  <div className="flex-1 py-7 pr-6 pl-3 text-left self-center">
                    <h3
                      className="text-base md:text-[17px] font-semibold mb-2 leading-snug"
                      style={{ color: "#2F5EEA" }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
