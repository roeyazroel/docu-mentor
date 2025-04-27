import React from 'react';
import { cn } from '@/lib/utils';

// Placeholder Logos (Replace with actual SVGs or images)
const PlaceholderLogo = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'h-8 w-24 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500',
      className
    )}
  >
    Logo
  </div>
);

const SocialProof = () => {
  const logos = Array(6).fill(0); // Create 6 placeholder logos

  return (
    <section className="py-10 bg-secondary"> {/* Using Light Purple Background */}
      <div className="container mx-auto px-6 max-w-[1400px]">
        <h3 className="text-center text-sm font-medium text-text-body/60 uppercase tracking-wider mb-8">
          Trusted by teams at
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((_, index) => (
            <div
              key={index}
              className="filter grayscale hover:filter-none opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              {/* Replace PlaceholderLogo with your actual logo component/image */}
              <PlaceholderLogo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof; 