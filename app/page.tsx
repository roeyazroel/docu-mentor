// Import the new landing page components
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import SocialProof from "@/components/landing/SocialProof";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SocialProof />
        <Features />
        <TestimonialCarousel />
        {/* Add other sections here if needed */}
      </main>
      <Footer />
    </div>
  );
}
