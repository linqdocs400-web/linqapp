// export default function Content() {
//   return (
//     <section className="relative py-24 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50 text-gray-900 overflow-hidden">
//       {/* decorative gradient circles */}
//       <div className="pointer-events-none absolute -right-12 md:-right-24 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#00E676]/20 to-[#00C9FF]/10 blur-3xl" />

//       <div className="max-w-6xl mx-auto relative">
//         <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
//           {/* Left content column */}
//           <div className="lg:w-1/2 z-10">
//             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-600 leading-tight mb-4">
//               What is <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E676] to-[#00C9FF]">LinQ</span>?
//             </h2>

//             <p className="text-lg text-gray-600 mb-6">
//               A smarter way to commute — LinQ connects people, shares costs, and
//               builds trusted, community-first rides. From smart matching to women-only pools,
//               we make everyday travel safer, greener and more affordable.
//             </p>

//             <div className="flex flex-wrap gap-4 mb-6">
//               <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
//                 <strong className="block text-sm text-gray-800">30K+</strong>
//                 <span className="text-xs text-gray-500">followers</span>
//               </div>

//               <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
//                 <strong className="block text-sm text-gray-800">5K</strong>
//                 <span className="text-xs text-gray-500">daily users</span>
//               </div>

//               <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
//                 <strong className="block text-sm text-gray-800">4.8★</strong>
//                 <span className="text-xs text-gray-500">avg rating</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-3">
//               <div className="flex items-start gap-3">
//                 <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00E676] text-white">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                   </svg>
//                 </span>
//                 <div>
//                   <div className="text-gray-800 font-medium">Smart matching</div>
//                   <div className="text-gray-500 text-sm">Connect with riders that match your route and schedule.</div>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00C9FF] text-white">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v2" />
//                   </svg>
//                 </span>
//                 <div>
//                   <div className="text-gray-800 font-medium">Fair payments</div>
//                   <div className="text-gray-500 text-sm">Automatic cost splitting and transparent fare breakdowns.</div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-8">
//               <button className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00A86B] to-[#0077CC] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-[1.02] transition-transform">
//                 JOIN FOR FREE
//               </button>
//             </div>
//           </div>

//           {/* Right creative mosaic */}
//           {/* <div className="lg:w-1/2 relative z-0">
//             <div className="relative">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="translate-y-8">
//                   <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
//                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00A86B] text-white mb-3">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13l2-2a4 4 0 015.657 0L13 11l3-3 3 3" />
//                       </svg>
//                     </div>
//                     <h4 className="font-semibold mb-1">Smart Pooling</h4>
//                     <p className="text-gray-600 text-sm">Match with riders nearby and reduce empty seats.</p>
//                   </div>
//                 </div>

//                 <div className="-translate-y-6">
//                   <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
//                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00E676] text-white mb-3">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h3l3 8 4-16 3 12h3" />
//                       </svg>
//                     </div>
//                     <h4 className="font-semibold mb-1">Eco Impact</h4>
//                     <p className="text-gray-600 text-sm">Lower emissions and track community impact.</p>
//                   </div>
//                 </div>

//                 <div className="translate-y-6">
//                   <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
//                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0077CC] text-white mb-3">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
//                         <circle cx="12" cy="12" r="10" strokeWidth="2" />
//                       </svg>
//                     </div>
//                     <h4 className="font-semibold mb-1">Rewards</h4>
//                     <p className="text-gray-600 text-sm">Earn LinQ Points for sharing rides.</p>
//                   </div>
//                 </div>

//                 <div className="-translate-y-2">
//                   <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
//                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00C9FF] text-white mb-3">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                         <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11V7a5 5 0 0110 0v4" />
//                       </svg>
//                     </div>
//                     <h4 className="font-semibold mb-1">Trusted Community</h4>
//                     <p className="text-gray-600 text-sm">Verified profiles and in-app support keep rides secure.</p>
//                   </div>
//                 </div>
//               </div> */}

//               {/* floating badge */}
//               <div className="absolute -left-2 md:-left-6 -top-6 bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-white px-4 py-2 rounded-xl shadow-xl text-sm">
//                 Community-first mobility
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import Link from "next/link";

export default function Content() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-[#00A86B]",
      title: "Advanced Matching",
      description: "Advanced algorithms connect you with compatible riders on your route in real-time."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[#00E676]",
      title: "Carbon Footprint Tracker",
      description: "See your environmental impact with live CO₂ savings and eco-badges for milestones."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-[#0077CC]",
      title: "Gamified Rewards",
      description: "Level up with every ride! Earn LinQ coins, unlock perks, and compete on leaderboards."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "bg-[#00C9FF]",
      title: "Safety First Network",
      description: "Verified IDs, SOS alerts, live GPS tracking, and 24/7 support for secure journeys."
    }
  ];

  return (
    <section className="relative py-6 md:py-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50 text-gray-900 overflow-hidden">
      {/* decorative gradient circles */}
      <div className="pointer-events-none absolute -right-12 md:-right-24 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#00E676]/20 to-[#00C9FF]/10 blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Left content column */}
          <div className="lg:w-1/2 z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-600 leading-tight mb-4">
              What is <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E676] to-[#00C9FF]">LinQ</span>?
            </h2>

            <p className="text-lg text-gray-600 mb-6">
              A smarter way to commute — LinQ connects people, shares costs, and
              builds trusted, community-first rides. From smart matching to women-only pools,
              we make everyday travel safer, greener and more affordable.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                <strong className="block text-sm text-gray-800">30K+</strong>
                <span className="text-xs text-gray-500">followers</span>
              </div>

              <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                <strong className="block text-sm text-gray-800">5K</strong>
                <span className="text-xs text-gray-500">daily users</span>
              </div>

              <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                <strong className="block text-sm text-gray-800">4.8★</strong>
                <span className="text-xs text-gray-500">avg rating</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00E676] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <div className="text-gray-800 font-medium">Smart matching</div>
                  <div className="text-gray-500 text-sm">Connect with riders that match your route and schedule.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00C9FF] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v2" />
                  </svg>
                </span>
                <div>
                  <div className="text-gray-800 font-medium">Fair payments</div>
                  <div className="text-gray-500 text-sm">Automatic cost splitting and transparent fare breakdowns.</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
                <Link href="https://forms.gle/EK6ScmSd65bBH2X5A" passHref>
              <button className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00A86B] to-[#0077CC] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                JOIN FOR FREE
              </button></Link>
            </div>
          </div>

          {/* Right creative mosaic - Mobile Responsive */}
          <div className="lg:w-1/2 w-full relative z-0">
            <div className="relative">
              {/* Mobile: Simple 1-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`
                      ${index === 0 ? 'sm:translate-y-8' : ''}
                      ${index === 1 ? 'sm:-translate-y-6' : ''}
                      ${index === 2 ? 'sm:translate-y-6' : ''}
                      ${index === 3 ? 'sm:-translate-y-2' : ''}
                    `}
                  >
                    <div className="p-5 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${feature.color} text-white mb-3`}>
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold mb-1 text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* floating badge */}
              <div className="absolute -left-2 sm:-left-6 -top-6 bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-white px-3 sm:px-4 py-2 rounded-xl shadow-xl text-xs sm:text-sm font-medium">
                Community-first mobility
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}