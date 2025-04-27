"use client";

import React from 'react';
import TestimonialCard from './TestimonialCard'; // Adjust path if needed
import { cn } from '@/lib/utils';

// Placeholder testimonials (replace with actual data)
const testimonialsData = [
  {
    quote: "Documentor's AI suggestions are a game-changer for our content team. We're writing faster and better.",
    author: "Alice Chen",
    title: "Marketing Lead, TechCorp",
    avatarSrc: "/placeholder-avatars/alice.png", // Example path
  },
  {
    quote: "The real-time collaboration is incredibly smooth. It's like Google Docs but with superpowers.",
    author: "Ben Carter",
    title: "Product Manager, Innovate Solutions",
    avatarSrc: "/placeholder-avatars/ben.png",
  },
  {
    quote: "Finally, an editor that understands teamwork. Documentor keeps everyone on the same page effortlessly.",
    author: "Chloe Davis",
    title: "Founder, Creative Hub",
    avatarSrc: "/placeholder-avatars/chloe.png",
  },
  {
    quote: "The Google Docs Sync is seamless. It fits perfectly into our existing workflow.",
    author: "David Evans",
    title: "Engineering Manager, Data Systems",
    avatarSrc: "/placeholder-avatars/david.png",
  },
  {
    quote: "I love the clean interface and the helpful AI. It makes writing enjoyable again!",
    author: "Eva Rodriguez",
    title: "Freelance Writer",
    avatarSrc: "/placeholder-avatars/eva.png",
  },
  // Duplicate testimonials to create a seamless loop for the carousel
   {
    quote: "Documentor's AI suggestions are a game-changer for our content team. We're writing faster and better.",
    author: "Alice Chen",
    title: "Marketing Lead, TechCorp",
    avatarSrc: "/placeholder-avatars/alice.png", // Example path
  },
  {
    quote: "The real-time collaboration is incredibly smooth. It's like Google Docs but with superpowers.",
    author: "Ben Carter",
    title: "Product Manager, Innovate Solutions",
    avatarSrc: "/placeholder-avatars/ben.png",
  },
  {
    quote: "Finally, an editor that understands teamwork. Documentor keeps everyone on the same page effortlessly.",
    author: "Chloe Davis",
    title: "Founder, Creative Hub",
    avatarSrc: "/placeholder-avatars/chloe.png",
  },
  {
    quote: "The Google Docs Sync is seamless. It fits perfectly into our existing workflow.",
    author: "David Evans",
    title: "Engineering Manager, Data Systems",
    avatarSrc: "/placeholder-avatars/david.png",
  },
  {
    quote: "I love the clean interface and the helpful AI. It makes writing enjoyable again!",
    author: "Eva Rodriguez",
    title: "Freelance Writer",
    avatarSrc: "/placeholder-avatars/eva.png",
  },
];

const TestimonialCarousel = () => {
  return (
    <section id="testimonials" className="py-20 bg-[hsl(var(--warm-surface-light))] overflow-hidden"> {/* Soft purple */}
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-text-dark mb-4">
            Loved by teams everywhere
          </h2>
          <p className="text-text-body">
            Hear what our users say about how Documentor is transforming their writing and collaboration.
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Fade effect at edges */}
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[hsl(var(--warm-surface-light))] to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[hsl(var(--warm-surface-light))] to-transparent z-10"></div>

        {/* Scrolling Track - Group necessary for hover pause */}
        <div className="group flex space-x-6 overflow-hidden">
           {/* Apply animation to the inner div */}
          <div className="flex space-x-6 animate-carousel-slide group-hover:pause">
            {testimonialsData.map((testimonial, index) => (
              <TestimonialCard
                key={`testimonial-${index}`}
                quote={testimonial.quote}
                author={testimonial.author}
                title={testimonial.title}
                avatarSrc={testimonial.avatarSrc}
                className="w-[350px] flex-shrink-0" // Set fixed width for cards
              />
            ))}
          </div>
           {/* Duplicate the content for seamless loop - paused state needs this second identical track */}
           <div className="flex space-x-6 animate-carousel-slide group-hover:pause" aria-hidden="true">
            {testimonialsData.map((testimonial, index) => (
              <TestimonialCard
                key={`testimonial-duplicate-${index}`}
                quote={testimonial.quote}
                author={testimonial.author}
                title={testimonial.title}
                avatarSrc={testimonial.avatarSrc}
                className="w-[350px] flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Add pause utility class (can also be added directly to tailwind.config.js)
const styles = `
  .group:hover .group-hover\:pause {
    animation-play-state: paused;
  }
`;
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default TestimonialCarousel; 