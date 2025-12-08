"use client";
import { useRef } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Features from "./components/Features";
import CareersCTA from "./components/CareersCTA";
import Footer from "./components/Footer";
import Content from "./components/Content";
import Testimonials from "./components/Testimonials";
import Differences from "./components/Differences";
import CoreFeatures from "./components/CoreFeatures";

export default function Home() {
  // Refs for scrollable sections
  const heroRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  return (
    <main>
      <Navbar
        refs={{
          home: heroRef,
          content: contentRef,
          features: featuresRef,
          footer: footerRef,
        }}
      />

      <div ref={heroRef}>
        <Hero />
      </div>

      <div ref={contentRef}>
        <Content />
      </div>

      <Differences />
      <CoreFeatures />

      <div ref={featuresRef}>
        <Features />
      </div>

      <Testimonials />

      <CareersCTA />

      <div ref={footerRef}>
        <Footer />
      </div>
    </main>
  );
}
