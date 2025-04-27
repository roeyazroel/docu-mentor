import React from 'react';

// Import the new landing page components
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import TestimonialCarousel from '@/components/landing/TestimonialCarousel';
import Footer from '@/components/landing/Footer';

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
