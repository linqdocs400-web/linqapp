"use client";
import { useState, useRef, useEffect } from "react";

export default function Testimonials() {
  const [active, setActive] = useState<number | null>(null);
  const [items, setItems] = useState(() => [
    {
      quote:
        "I really liked the Go Together Ride platform - it's a great idea for connecting riders and people who need transport. The response is quick, and they help find matching leads fast. The team communicates clearly and is very supportive. It's a useful service for daily commuters like me. Keep up the good work!",
  name: "",
  role: "",
  color: "bg-[#E1306C]",
      instaLink: "https://www.instagram.com/p/DPlX7nzkaUs/?igsh=cTU2ZXRoN3ppZzQ3",
    },
    {
      quote:
        "Thank you so much for helping me out till I find a perfect lead. You guys are really spending time and finding the exact match with patience. Thank you so much",
  name: "",
  role: "",
  color: "bg-[#E1306C]",
      instaLink: "https://www.instagram.com/p/DPwCSIgiAZV/?igsh=MTExdWk1ZDdpODd5cw==",
    },
    {
      quote:
        "While using instagram I found a page Go together rides i felt very happy such an initiative to save time of each individual and money as well I wish all the good luck and thankful to the page. Thank you sir",
  name: "",
  role: "",
  color: "bg-[#E1306C]",
      instaLink: "https://www.instagram.com/p/DPtdNCJkVgz/?igsh=dnFpejc1MGFvbXR2",
    },
    {
      quote:
        "I got a wonderful partner through Go Together, and the experience has been really smooth. My partner is cooperative, reliable, and easy to coordinate with, which makes every plan stress-free and enjoyable. This platform truly makes finding the right companion much easier. It would be great if the app created and added more features to highlight shared interests and give space for partners to share quick feedback, so future matches become even stronger.",
  name: "",
  role: "",
  color: "bg-[#E1306C]",
      instaLink: "https://www.instagram.com/p/DPQWyRDEQD6/?igsh=N282bWJyOW1sNDN4",
    },
    {
      quote:
        "Had an amazing experience with Go Together Riders. Great vibes, safe rides, and lots of memories made. Can't wait to ride again! 100\n\n#Go TogetherRiders",
  name: "",
  role: "",
  color: "bg-[#E1306C]",
      instaLink: "https://www.instagram.com/p/DPN2noEkQaJ/?igsh=dnFlNzZ5YnRxejJs",
    },
  ]);

  const refs = useRef<Record<string, HTMLElement | null>>({});
  const animating = useRef(false);
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    // start automatic rotation every 3.5s
    intervalId.current = window.setInterval(() => {
      rotateOnce();
    }, 3500);
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // perform one rotation: move first item to end with FLIP animation
  const rotateOnce = () => {
    if (animating.current) return;
    const prevRects: Record<string, DOMRect> = {};
    Object.keys(refs.current).forEach((k) => {
      const el = refs.current[k];
      if (el) prevRects[k] = el.getBoundingClientRect();
    });

    // adjust active index to follow same item (shift left)
    setActive((prev) => {
      if (prev === null) return null;
      return prev === 0 ? items.length - 1 : prev - 1;
    });

    const newItems = [...items.slice(1), items[0]];
    animating.current = true;
    setItems(newItems);

    // after DOM updates, play FLIP
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Object.keys(refs.current).forEach((k) => {
          const el = refs.current[k];
          if (!el) return;
          const newRect = el.getBoundingClientRect();
          const prev = prevRects[k];
          if (!prev) return;
          const dx = prev.left - newRect.left;
          const dy = prev.top - newRect.top;
          if (dx || dy) {
            el.style.transition = "none";
            el.style.transform = `translate(${dx}px, ${dy}px)`;
            // force reflow
            el.getBoundingClientRect();
            el.style.transition = "transform 520ms cubic-bezier(.22,.9,.32,1)";
            el.style.transform = "";
          }
        });

        // cleanup after animation
        setTimeout(() => {
          Object.keys(refs.current).forEach((k) => {
            const el = refs.current[k];
            if (!el) return;
            el.style.transition = "";
            el.style.transform = "";
          });
          animating.current = false;
        }, 600);
      });
    });
  };

  return (
  <section className="bg-white py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="text-3xl text-[#7a7b7c] font-extrabold">What our community says</h3>
          <p className="text-gray-500 mt-2">Real stories from riders across LinQ. <br />Click on Instagram icon to visit the Testimonials</p>
        </div>

        <div className="relative">
          <div className="parallax-accent accent-a" aria-hidden />
          <div className="parallax-accent accent-b" aria-hidden />
          <div
            className="grid grid-cols-1 md:grid-cols-6 gap-6"
          onKeyDown={(e) => {
            // keyboard navigation: left/right to move active focus
            if (e.key === "ArrowLeft") {
              setActive((s) => (s === null ? 0 : Math.max(0, s - 1)));
            }
            if (e.key === "ArrowRight") {
              setActive((s) => (s === null ? 0 : Math.min(Testimonials.length - 1, s + 1)));
            }
          }}
          tabIndex={0}
        >
            {items.map((t, i) => {
            const isActive = active === null ? false : active === i;
            const transform = active === null ? undefined : isActive ? "scale(1.04)" : "scale(0.94)";
            const opacity = active === null ? 1 : isActive ? 1 : 0.82;
            const z = isActive ? 20 : 10;

            // tile size classes mirror original bento
            const sizeClass = i === 0 ? "md:col-span-3 row-span-2" : i === 1 ? "md:col-span-3" : i === 2 ? "md:col-span-2" : i === 3 ? "md:col-span-2" : "md:col-span-4";

            const delay = `${i * 80}ms`;
            return (
              <article
                key={i}
                data-id={t.name}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => {
                  if (animating.current) return;
                  // if clicking the front card, just toggle active
                  if (i === 0) {
                    setActive(active === i ? null : i);
                    return;
                  }
                  // perform FLIP swap: move clicked item to front
                  const id = t.name;
                  const prevRects: Record<string, DOMRect> = {};
                  Object.keys(refs.current).forEach((k) => {
                    const el = refs.current[k];
                    if (el) prevRects[k] = el.getBoundingClientRect();
                  });

                  const newItems = [t, ...items.filter((x) => x.name !== t.name)];
                  animating.current = true;
                  setItems(newItems);

                  // after DOM updates, play FLIP
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      Object.keys(refs.current).forEach((k) => {
                        const el = refs.current[k];
                        if (!el) return;
                        const newRect = el.getBoundingClientRect();
                        const prev = prevRects[k];
                        if (!prev) return;
                        const dx = prev.left - newRect.left;
                        const dy = prev.top - newRect.top;
                        if (dx || dy) {
                          el.style.transition = 'none';
                          el.style.transform = `translate(${dx}px, ${dy}px)`;
                          // force reflow
                          el.getBoundingClientRect();
                          el.style.transition = 'transform 520ms cubic-bezier(.22,.9,.32,1)';
                          el.style.transform = '';
                        }
                      });

                      // cleanup after animation
                      setTimeout(() => {
                        Object.keys(refs.current).forEach((k) => {
                          const el = refs.current[k];
                          if (!el) return;
                          el.style.transition = '';
                          el.style.transform = '';
                        });
                        animating.current = false;
                      }, 600);
                    });
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActive(active === i ? null : i);
                }}
              ref={(el) => {
  refs.current[t.name] = el;
}}

                className={`${sizeClass} p-6 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} rounded-2xl shadow-sm border card-appeal card-enter relative tilt ${isActive ? 'glow-border active' : ''} focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200`}
                style={{ transform, opacity, zIndex: z, ['--delay' as any]: delay }}
                onPointerMove={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
                  const py = (e.clientY - rect.top) / rect.height - 0.5;
                  const rx = py * 6; // rotateX
                  const ry = px * -10; // rotateY
                  const inner = (e.currentTarget as HTMLElement).querySelector('.tilt-inner') as HTMLElement | null;
                  if (inner) inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
                }}
                onPointerLeave={(e) => {
                  const inner = (e.currentTarget as HTMLElement).querySelector('.tilt-inner') as HTMLElement | null;
                  if (inner) inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
                }}
              >
                <div className="tilt-inner">
                  {/* glossy translucent overlay when active */}
                  <div className={isActive ? "glossy-overlay active" : "glossy-overlay"} />
                  {/* If item has an Instagram link, show icon (link) above the quote */}
                  {t.instaLink ? (
                    <div className="flex flex-col items-center gap-3">
                      <a href={t.instaLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md animate-insta-flip">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#E1306C]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7.25a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm0 1.5a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5zM17.75 6a1.12 1.12 0 110 2.25 1.12 1.12 0 010-2.25z" />
                        </svg>
                      </a>
                      <p className={`text-gray-800 ${i === 0 || i === 4 ? "text-lg" : ""}`}>“{t.quote}”</p>
                    </div>
                  ) : (
                    <p className={`text-gray-800 ${i === 0 || i === 4 ? "text-lg" : ""}`}>“{t.quote}”</p>
                  )}
                  {/* Remove name and role display, keep avatar for visual balance */}
                  <div className="mt-6 flex items-center gap-4">
                    
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
