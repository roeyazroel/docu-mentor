"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { user, isLoaded } = useUser();

  const ctaLink = isLoaded ? (user ? '/editor' : '/signup') : '#';

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-cool-gradient text-white overflow-hidden">
      {/* Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.4\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'/%3E%3C/svg%3E")',
        }}
      ></div>

      {/* Decorative Blurred Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[hsl(var(--cool-gradient-middle))] rounded-full blur-[150px] opacity-40 animate-fade-in animation-delay-200"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[hsl(var(--cool-gradient-end))] rounded-full blur-[120px] opacity-30 animate-fade-in animation-delay-400"></div>

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Contextual AI writing
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg">
              AI agent edits inline with full document context, providing suggestions that save you time and boost productivity.
            </p>
            <Link href={ctaLink} aria-disabled={!isLoaded}>
              <Button
                size="lg"
                className={cn(
                  "bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg",
                  !isLoaded && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isLoaded}
              >
                Start Writing Free
              </Button>
            </Link>
          </div>

          {/* Right Column: Demo Area */}
          <div className="flex justify-center items-center animate-slide-up animation-delay-200">
            <div className="w-full max-w-lg glass rounded-xl p-6 shadow-xl border border-white/20">
              {/* Placeholder for Product Demo */}
              <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center">
                <p className="text-white/50 italic">Product Demo Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper style for animation delay (optional, can be added to globals.css or done via inline style)
// You might need to configure Tailwind to support animation-delay utilities
// e.g., in tailwind.config.js -> theme.extend.animationDelay = { ... }
const styles = `
  .animation-delay-200 { animation-delay: 0.2s; }
  .animation-delay-400 { animation-delay: 0.4s; }
`;
// Inject styles (use a more robust method in production, e.g., styled-jsx or CSS modules if preferred)
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Hero; 