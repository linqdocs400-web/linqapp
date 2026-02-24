"use client";
import { useRef } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";
import SearchListings from "./components/SearchListings";
import WhyLinq from "./components/WhyLinq";
import CareerCTA from "./components/CareerCTA";

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const whyRef = useRef<HTMLDivElement | null>(null);
  const careerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  return (
    <main>
      <Navbar
        refs={{
          home: heroRef,
          features: whyRef,
          career: careerRef,
          footer: footerRef,
        }}
      />

      {/* HERO */}
      <div ref={heroRef}>
        <Hero />
      </div>

      {/* SEARCH */}
      <section className="scroll-mt-24">
        <SearchListings />
      </section>

      {/* WHY LINQ */}
      <div ref={whyRef}>
        <WhyLinq />
      </div>

      {/* CAREER CTA */}
      <div ref={careerRef}>
        <CareerCTA />
      </div>

      <Testimonials />

      {/* FOOTER */}
      <div ref={footerRef}>
        <Footer />
      </div>
    </main>
  );
}
