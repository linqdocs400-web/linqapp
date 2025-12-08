export default function Differences() {
  const comparisons = [
    {
      category: "Community",
      us: {
        title: "Verified Community Network",
        features: [
          "Trusted profile verification",
          "Women-only ride options",
          "Community ratings & badges",
          "Regular commuter groups"
        ],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      others: {
        title: "Basic User Network",
        features: [
          "Basic verification",
          "Limited community features",
          "Standard ratings only",
          "One-time connections"
        ]
      }
    },
    {
      category: "Pricing",
      us: {
        title: "Community Cost Sharing",
        features: [
          "Fair split based on distance",
          "Group discount benefits",
          "Reward points on every ride",
          "Transparent fare calculator"
        ],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      others: {
        title: "Fixed Commercial Pricing",
        features: [
          "Surge pricing model",
          "No group benefits",
          "Basic loyalty points",
          "Hidden charges possible"
        ]
      }
    },
    {
      category: "Experience",
      us: {
        title: "Personalized Journey",
        features: [
          "Regular commuter matching",
          "Flexible pickup/drop",
          "In-app chat & planning",
          "Custom route preferences"
        ],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )
      },
      others: {
        title: "Standard Service",
        features: [
          "Random driver matching",
          "Fixed pickup points",
          "Basic chat support",
          "Limited customization"
        ]
      }
    }
  ];

  return (
  <section className="py-6 md:py-16 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What's New{" "}
            ?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the difference of community-driven travel that puts you first.
          </p>
        </div>

        <div className="grid gap-8 md:gap-12">
          {comparisons.map((item, index) => (
            <div key={index} className="relative">
              {/* Category label */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00E676] to-[#00C9FF] text-white px-4 py-1 rounded-full text-sm font-medium z-10">
                {item.category}
              </div>

              {/* Comparison cards */}
              <div className="grid md:grid-cols-2 gap-4 pt-8">
                {/* Our Platform */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#00E676]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00E676]/10 to-[#00C9FF]/5 rounded-bl-[100px] -z-0" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-[#00E676] to-[#00C9FF] rounded-lg text-white">
                        {item.us.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.us.title}</h3>
                    </div>
                    
                    <ul className="space-y-3">
                      {item.us.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-[#00E676] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Others */}
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">{item.others.title}</h3>
                  <ul className="space-y-3">
                    {item.others.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
  <div className="mt-2 md:mt-6 text-center">
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of happy commuters who've already made the switch to smarter, community-driven travel.
          </p>
        
        </div>
      </div>
    </section>
  );
}