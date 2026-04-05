

import { Navbar } from "@/components/landing-section/Navbar";
import { Hero } from "@/components/landing-section/Hero";
import { StatsBar } from "@/components/landing-section/StatsBar";
import { Features } from "@/components/landing-section/Features";
import { HowItWorks } from "@/components/landing-section/HowItWorks";
import { AutomationSuite } from "@/components/landing-section/AutomationSuite";
import { Testimonials } from "@/components/landing-section/Testimonials";
import { Pricing } from "@/components/landing-section/Pricing";
import { FinalCTA } from "@/components/landing-section/FinalCTA";
import { Footer } from "@/components/landing-section/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <AutomationSuite />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
