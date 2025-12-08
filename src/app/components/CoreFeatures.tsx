"use client";
import { useEffect, useRef, useState } from "react";

const CoreFeatures = () => {
  const features = [
    {
      title: "Smart HubSpots™",
      gradient: "from-[#00E676] to-[#00C9FF]",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: "Create and join dedicated travel hubs for your college or workplace",
      benefits: [
        "Connect with verified co-travelers from your institution",
        "View all rides to and from your hub",
        "Organize regular commute groups",
        "Track hub-specific statistics and impact"
      ],
      showcase: [
        {
          label: "Active Hubs",
          value: "50+"
        },
        {
          label: "Daily Hub Rides",
          value: "10+"
        }
      ]
    },
    {
      title: "Pro-Women Safety",
      gradient: "from-[#FF69B4] to-[#FF1493]",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: "Enhanced safety features designed specifically for women travelers",
      benefits: [
        "Women-only ride matching option",
        "Real-time location sharing with trusted contacts",
        "24/7 dedicated women safety support",
        "Verified women-only community groups"
      ],
      showcase: [
        {
          label: "Women Travelers",
          value: "7K+"
        },
        {
          label: "Safety Rating",
          value: "4.9★"
        }
      ]
    }
  ];

  return (
    <section className="py-6 md:py-12 px-4 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-semibold text-gray-500 tracking-wide uppercase">Exclusive Features</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Core Unique Features</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Experience travel innovations that put safety and convenience first.</p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel items={features} />
        </div>
      </div>
    </section>
  );
};

function Carousel({ items }: { items: any[] }) {
  const [index, setIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const timer = useRef<number | null>(null);

  // determine slidesPerView based on viewport (match Tailwind md breakpoint: 768px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSlidesPerView(mq.matches ? 2 : 1);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update as any);
      else mq.removeListener(update as any);
    };
  }, []);

  // Build pages: each page contains up to slidesPerView items
  const pages: any[] = [];
  for (let i = 0; i < items.length; i += slidesPerView) {
    pages.push(items.slice(i, i + slidesPerView));
  }
  const pagesCount = pages.length;

  // reset index when slidesPerView changes
  useEffect(() => {
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesPerView]);

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, pagesCount]);

  const start = () => {
    stop();
    timer.current = window.setTimeout(() => {
      setIndex((i) => (pagesCount ? (i + 1) % pagesCount : 0));
    }, 4200);
  };
  const stop = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <div className="overflow-hidden relative" onMouseEnter={stop} onMouseLeave={start}>
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ width: `${pagesCount * 100}%`, transform: `translateX(-${index * (100 / pagesCount)}%)` }}
      >
        {pages.map((page, pIdx) => (
          <div key={pIdx} className="flex-shrink-0 px-4 md:px-6" style={{ width: `${100 / pagesCount}%` }}>
            <div className="flex gap-4">
              {page.map((item: any, i: number) => (
                <div key={i} className="flex-1">
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-6 blur-2xl rounded-3xl -z-0`} />
                    <div className="relative bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white`}>{item.icon}</div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{item.title}</h3>
                          <p className="mt-1 text-gray-600 text-sm md:text-base">{item.description}</p>
                        </div>
                      </div>

                      <ul className="grid grid-cols-1 gap-2 mb-4">
                        {item.benefits.map((b: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg className="w-5 h-5 mt-1 text-[#00E676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-gray-700 text-sm">{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        {item.showcase.map((s: any, idx: number) => (
                          <div key={idx} className="text-center">
                            <div className={`text-lg md:text-xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>{s.value}</div>
                            <div className="text-sm text-gray-500">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* pagination / dots (pages) */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: pagesCount }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to page ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-[#0077CC]' : 'bg-gray-300'} transition-all`}
          />
        ))}
      </div>
    </div>
  );
}

export default CoreFeatures;