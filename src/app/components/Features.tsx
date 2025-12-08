// "use client";

// import React, { useState } from "react";

// const features = [
//   {
//     title: "Smart Pooling",
//     desc: "Instantly connect with riders near you using real-time smart matching.",
//   },
//   {
//     title: "Eco Impact",
//     desc: "Every shared ride reduces emissions and congestion — track your eco stats live.",
//   },
//   {
//     title: "Community",
//     desc: "Join a growing network of commuters who share your route, goals, and mindset.",
//   },
//   {
//     title: "Rewards",
//     desc: "Earn LinQ Points every time you share a ride — redeem them for discounts & perks.",
//   },
// ];

// export default function Features() {
//   const [hovered, setHovered] = useState<number | null>(null);
//   const [active, setActive] = useState<number | null>(null);

//   return (
//     <section className="bg-[#0F2027] text-center py-24 px-6">
//       {/* decorative accents (behind content) — white/soft */}
//       <div aria-hidden className="pointer-events-none">
//         <div className="absolute -left-24 -top-20 w-72 h-72 rounded-full bg-white/8 blur-3xl" />
//         <div className="absolute -right-24 -top-10 w-80 h-40 rounded-3xl bg-white/6 opacity-20 transform rotate-12" />
//         <div className="absolute left-6 bottom-8 w-56 h-28 opacity-30">
//           <svg width="100%" height="100%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <rect x="0" y="0" width="200" height="100" rx="14" fill="#FFFFFF" opacity="0.06" />
//             <g fill="#FFFFFF" opacity="0.06">
//               <circle cx="30" cy="30" r="3" />
//               <circle cx="50" cy="45" r="2" />
//               <circle cx="80" cy="20" r="2" />
//               <circle cx="110" cy="60" r="3" />
//               <circle cx="140" cy="35" r="2" />
//             </g>
//           </svg>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto relative">
//         <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#00E676] to-[#00C9FF] bg-clip-text text-transparent">
//           Why Ride with LinQ?
//         </h2>
//         <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
//           LinQ combines smart matching, transparent costs and a community-first approach to make commuting easier
//           and more sustainable. Here are the core benefits you get as a member.
//         </p>

//         {/* Mobile: simple grid */}
//         <div className="md:hidden grid grid-cols-1 gap-6">
//           {features.map((f, i) => (
//             <div key={i} className="p-8 bg-[#1C1C1C]/80 rounded-3xl border border-gray-700">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg md:text-xl font-semibold text-white">{f.title}</h3>
//                 <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C9FF]" />
//               </div>
//               <p className="text-gray-300 text-sm md:text-base">{f.desc}</p>
//             </div>
//           ))}
//         </div>

//         {/* Desktop: fanned cards (playing-cards-in-hand) */}
//         <div className="hidden md:block mt-8">
//           <div className="relative h-96 flex items-center justify-center">
//             {(() => {
//               const offsets = [-160, -60, 60, 160];
//               const rotations = [-12, -6, 6, 12];
//               return features.map((f, i) => {
//                 const rot = rotations[i];
//                 const baseOffset = offsets[i];
//                 const isHovered = hovered === i;
//                 const isActive = active === i;

//                 // compute horizontal offset in px (using transforms for smoother animation)
//                 let offsetValue = baseOffset;
//                 if (isActive) offsetValue = 0;
//                 else if (active !== null) {
//                   const push = i < (active ?? 0) ? -110 : 110;
//                   offsetValue = baseOffset + push;
//                 }

//                 // compute transform using translateX + translateY + rotate + scale
//                 const scale = isActive ? 1.08 : isHovered ? 1.06 : 1;
//                 const rotateDeg = isActive ? 0 : rot;
//                 const transform = `translate(${offsetValue}px, -50%) rotate(${rotateDeg}deg) scale(${scale})`;

//                 const zIndex = isActive ? 999 : 10 + i;

//                 return (
//                   <div
//                     key={i}
//                     onMouseEnter={() => setHovered(i)}
//                     onMouseLeave={() => setHovered(null)}
//                     onClick={() => setActive(active === i ? null : i)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" || e.key === " ") {
//                         e.preventDefault();
//                         setActive(active === i ? null : i);
//                       }
//                     }}
//                     role="button"
//                     tabIndex={0}
//                     aria-pressed={isActive}
//                     className="absolute top-1/2 will-change-transform cursor-pointer"
//                     style={{ zIndex, transform, transition: 'transform 620ms cubic-bezier(.18,.9,.2,1), box-shadow 420ms ease' }}
//                   >
//                     <div className={`p-8 w-80 bg-[#1C1C1C]/85 rounded-3xl border ${isActive ? 'border-transparent shadow-[0_40px_120px_rgba(0,230,118,0.14)]' : 'border-gray-700 shadow-2xl'} `} style={{ transformOrigin: "center", transition: 'box-shadow 420ms ease, transform 620ms cubic-bezier(.18,.9,.2,1)' }}>
//                       <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg md:text-xl font-semibold text-white">{f.title}</h3>
//                         <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C9FF] shadow-md" />
//                       </div>
//                       <p className="text-gray-300 text-sm md:text-base leading-relaxed">{f.desc}</p>
//                     </div>
//                   </div>
//                 );
//               });
//             })()}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import React, { useState } from "react";

const features = [
  {
    title: "Smart Pooling",
    desc: "Instantly connect with riders near you using real-time smart matching.",
  },
  {
    title: "Eco Impact",
    desc: "Every shared ride reduces emissions and congestion — track your eco stats live.",
  },
  {
    title: "Community",
    desc: "Join a growing network of commuters who share your route, goals, and mindset.",
  },
  {
    title: "Rewards",
    desc: "Earn LinQ Points every time you share a ride — redeem them for discounts & perks.",
  },
];

export default function Features() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="bg-[#0F2027] text-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* decorative accents (behind content) — white/soft */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 sm:-left-24 -top-10 sm:-top-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -right-12 sm:-right-24 -top-5 sm:-top-10 w-60 sm:w-80 h-32 sm:h-40 rounded-3xl bg-white/6 opacity-20 transform rotate-12" />
        <div className="absolute left-3 sm:left-6 bottom-4 sm:bottom-8 w-40 sm:w-56 h-20 sm:h-28 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="200" height="100" rx="14" fill="#FFFFFF" opacity="0.06" />
            <g fill="#FFFFFF" opacity="0.06">
              <circle cx="30" cy="30" r="3" />
              <circle cx="50" cy="45" r="2" />
              <circle cx="80" cy="20" r="2" />
              <circle cx="110" cy="60" r="3" />
              <circle cx="140" cy="35" r="2" />
            </g>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#00E676] to-[#00C9FF] bg-clip-text text-transparent px-4">
          Why Ride with LinQ?
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
          LinQ combines smart matching, transparent costs and a community-first approach to make commuting easier
          and more sustainable. Here are the core benefits you get as a member.
        </p>

        {/* Mobile & Tablet: simple grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="p-6 sm:p-8 bg-[#1C1C1C]/80 rounded-2xl sm:rounded-3xl border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-[#00E676]/10"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">{f.title}</h3>
                <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C9FF]" />
              </div>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base text-left leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Desktop: fanned cards (playing-cards-in-hand) */}
        <div className="hidden lg:block mt-8">
          <div className="relative h-96 flex items-center justify-center">
            {(() => {
              const offsets = [-160, -60, 60, 160];
              const rotations = [-12, -6, 6, 12];
              return features.map((f, i) => {
                const rot = rotations[i];
                const baseOffset = offsets[i];
                const isHovered = hovered === i;
                const isActive = active === i;

                // compute horizontal offset in px (using transforms for smoother animation)
                let offsetValue = baseOffset;
                if (isActive) offsetValue = 0;
                else if (active !== null) {
                  const push = i < (active ?? 0) ? -110 : 110;
                  offsetValue = baseOffset + push;
                }

                // compute transform using translateX + translateY + rotate + scale
                const scale = isActive ? 1.08 : isHovered ? 1.06 : 1;
                const rotateDeg = isActive ? 0 : rot;
                const transform = `translate(${offsetValue}px, -50%) rotate(${rotateDeg}deg) scale(${scale})`;

                const zIndex = isActive ? 999 : 10 + i;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setActive(active === i ? null : i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(active === i ? null : i);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    className="absolute top-1/2 will-change-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676]"
                    style={{ zIndex, transform, transition: 'transform 620ms cubic-bezier(.18,.9,.2,1), box-shadow 420ms ease' }}
                  >
                    <div className={`p-8 w-80 bg-[#1C1C1C]/95 rounded-3xl border ${isActive ? 'border-transparent shadow-[0_40px_120px_rgba(0,230,118,0.14)]' : 'border-gray-700 shadow-2xl'} `} style={{ transformOrigin: "center", transition: 'box-shadow 420ms ease, transform 620ms cubic-bezier(.18,.9,.2,1)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-xl font-semibold text-white">{f.title}</h3>
                        <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C9FF] shadow-md" />
                      </div>
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}