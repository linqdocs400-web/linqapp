"use client";

import { useEffect, useRef } from "react";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "I really liked the Go Together Ride platform. Great idea for daily commuters.",
      instaLink: "https://www.instagram.com/gotogetherrides/",
    },
    {
      quote:
        "Thank you so much for helping me find a perfect lead with patience.",
      instaLink: "https://www.instagram.com/gotogetherrides/",
    },
    {
      quote:
        "Such a good initiative to save time and money. Really happy using it.",
      instaLink: "https://www.instagram.com/gotogetherrides/",
    },
    {
      quote:
        "Smooth experience and reliable coordination. Highly recommended.",
      instaLink: "https://www.instagram.com/gotogetherrides/",
    },
    {
      quote: "Safe rides and great vibes. Can’t wait to ride again!",
      instaLink: "https://www.instagram.com/gotogetherrides/",
    },
  ];

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0;
    let raf: number;
    let paused = false;
    let isDragging = false;
    let startX = 0;

    /* 🔥 speed control */
    const speed = window.innerWidth < 640 ? 0.45 : 0.35;

    const animate = () => {
      if (!paused && !isDragging && rowRef.current) {
        const width = rowRef.current.scrollWidth / 2;

        x -= speed;
        if (Math.abs(x) >= width) x = 0;

        rowRef.current.style.transform = `translateX(${x}px)`;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    /* ================= DRAG ================= */

    const onStart = (clientX: number) => {
      isDragging = true;
      paused = true;
      startX = clientX;
    };

    const onMove = (clientX: number) => {
      if (!isDragging || !rowRef.current) return;

      const dx = clientX - startX;
      startX = clientX;
      x += dx;

      rowRef.current.style.transform = `translateX(${x}px)`;
    };

    const onEnd = () => {
      isDragging = false;
      paused = false;
    };

    /* Touch */
    rowRef.current?.addEventListener("touchstart", (e) =>
      onStart(e.touches[0].clientX)
    );
    rowRef.current?.addEventListener("touchmove", (e) =>
      onMove(e.touches[0].clientX)
    );
    rowRef.current?.addEventListener("touchend", onEnd);

    /* Mouse */
    rowRef.current?.addEventListener("mousedown", (e) =>
      onStart(e.clientX)
    );
    window.addEventListener("mousemove", (e) =>
      onMove(e.clientX)
    );
    window.addEventListener("mouseup", onEnd);

    /* Pause on hover */
    rowRef.current?.addEventListener("mouseenter", () => (paused = true));
    rowRef.current?.addEventListener("mouseleave", () => (paused = false));

    return () => cancelAnimationFrame(raf);
  }, []);

  const cards = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-24 bg-[#F7F9FF] overflow-hidden">
      <div className="text-center mb-10 px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          Loved by our community
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Real stories from LinQ commuters
        </p>
      </div>

      <div className="overflow-hidden">
        <div
          ref={rowRef}
          className="
            flex gap-4 md:gap-8 w-max will-change-transform px-4
            select-none cursor-grab active:cursor-grabbing
          "
        >
          {cards.map((t, i) => (
            <a
              key={i}
              href={t.instaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                min-w-[220px] sm:min-w-[260px] md:min-w-[320px]
                bg-white rounded-3xl p-6 md:p-7
                border border-gray-200
                shadow-sm hover:shadow-xl
                transition-all duration-300
              "
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">IG</span>
                </div>
              </div>

              <p className="text-gray-700 text-center text-sm md:text-base leading-relaxed max-w-[240px] mx-auto">
                “{t.quote}”
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
