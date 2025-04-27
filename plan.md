Task Overview

Create a modern, visually appealing landing page for "Documentor" - an AI-powered collaborative document editing SaaS platform. The website should have a professional, clean design with purple and orange accents, smooth animations, and a focus on demonstrating the product's value proposition. The site should be fully responsive and follow modern web development best practices.
Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- Lucide icons for iconography
- Inter font family (sans-serif)
- Radix UI primitives (through shadcn/ui)
- React Router for navigation
Color Palette

### Primary Colors:
- Primary Purple: hsl(250, 50%, 45%)
- Dark Text Purple: #1A1F2C
- Body Text Purple: #4A4A68
- Light Purple Background: #E5DEFF (warm-surface-light)
- Alt Purple Surface: #D6BCFA (warm-surface-alt)

### Gradient Colors:
- Cool Gradient Start: #6E59A5 (Dark Purple)
- Cool Gradient Middle: #8B5CF6 (Vivid Purple)
- Cool Gradient End: #F97316 (Orange accent)

### Accent:
- Orange Accent: hsl(24, 95%, 53%) / #F97316

### Utility Colors:
- White: #FFFFFF
- Border Color: hsl(250, 20%, 88%)
- Card Float: White with subtle shadow
Typography

- Font Family: Inter (sans-serif)
- Headings:
  * Hero Heading: text-4xl md:text-5xl lg:text-6xl font-bold (white)
  * Section Headings: text-3xl font-bold (text-text-dark)
  * Card Headings: text-xl font-semibold (text-text-dark)
- Body Text:
  * Regular: text-text-body (softer purple #4A4A68)
  * Small: text-sm text-text-body
  * Extra Small: text-xs text-text-body/60 (60% opacity)
Layout & Structure

1. Navigation Bar (fixed, transparent to glassmorphic on scroll)
2. Hero Section (cool gradient background with grain texture)
3. Social Proof Strip (company logos)
4. Feature Trio Section (3 cards layout)
5. Testimonial Carousel (auto-scrolling)
6. Footer (4-column layout with logo, links, and social icons)

The layout should be responsive with proper spacing and container widths:
- Container: mx-auto px-6
- Maximum width: 1400px (2xl container)
- Proper section spacing (py-20 for most sections)
Animations & Interactions

### Defined Animations:
- fade-in: Opacity 0 to 1 over 0.5s
- slide-up: Translate up while fading in over 0.4s
- carousel-slide: Infinite horizontal scroll at 30s duration

### Interactive Elements:
- Navbar: Transparent to glassmorphic transition on scroll
- Links: Color transition on hover (text-text-body to text-primary)
- Buttons: Background opacity change on hover (bg-accent to bg-accent/90)
- Feature Cards: Shadow increase on hover (hover:shadow-lg)
- Company logos: Grayscale to color on hover with opacity increase

### Animation Timing:
- Fast transitions: 0.2s (accordions, micro-interactions)
- Medium transitions: 0.3s-0.4s (component entrances)
- Slow animations: 30s (carousel)
Component Specifications
Navbar

- Fixed position with z-50
- Transparent initially, transitions to glass effect on scroll
- Glassmorphic style: bg-white/10 backdrop-blur-lg border-b border-white/30
- Logo: Rounded box with cool gradient background containing "D"
- Navigation links: Features, Pricing, Sign In
- CTA button: "Try for free" with accent (orange) background
- Mobile: Hamburger menu for smaller screens
- Animation: Smooth transition between states
Hero Section

- Background: Cool gradient (135deg, #6E59A5 0%, #8B5CF6 50%, #F97316 100%)
- Texture: Grain pattern overlay at 10% opacity
- Decoration: Large purple blurred circular shapes for visual depth
- Layout: 2 columns on medium screens and larger
- Content:
  * H1: "Write faster, together."
  * Paragraph: "Documentor combines AI-powered suggestions with real-time collaboration to transform how teams create content."
  * CTA Button: "Start Writing Free" (orange)
- Demo Area: Glassmorphic card showing product demo
- Animations: fade-in for content, slide-up for demo card
Social Proof Strip

- Background: bg-background (light purple tint)
- Header: "Trusted by teams at" (text-text-body/60)
- Company logos: 6 placeholder logos in grayscale
- Layout: Flexible grid with proper spacing
- Interaction: Logos go from grayscale to colored on hover
- Spacing: py-10 for vertical padding
Feature Trio Section

- Background: bg-accent/10 (light orange tint)
- Header: "Write like never before"
- Subheader: Describing the product's capabilities
- 3-column grid for medium screens and above
- Feature Cards:
  1. AI-Powered Suggestions
  2. Real-time Collaboration
  3. Google Docs Sync
- Card Style: White with subtle shadow (.card-float class)
- Card Content: Image area, title, description
- Hover Effect: Increased shadow (hover:shadow-lg)
Testimonial Carousel

- Background: bg-warm-surface-light (soft purple)
- Header: "Loved by teams everywhere"
- Subheader: Brief description
- Testimonials: 5 cards with quotes, author names, and titles
- Card Style: Same .card-float class as feature cards
- Animation: Infinite horizontal scrolling (30s duration)
- Layout: Overflow hidden with flex display
- Hover behavior: Pause animation on hover
Footer

- Background: bg-warm-surface-alt (light purple)
- Decorative Elements:
  * Cool gradient strip at bottom (60% opacity)
  * Blurred circular gradient shapes
- Layout: 4-column grid on medium screens and above
  1. Logo & tagline
  2. Product links
  3. Resource links
  4. Company links
- Bottom Section: Copyright info and social icons
- Divider: Border-t between sections
- Social Icons: Twitter, GitHub, LinkedIn with hover effects
- Responsive: Stack on mobile, grid on larger screens
Utility Classes & Reusable Styles

- .glass: Glassmorphic effect for navbar when scrolled
- .card-float: Card styling with subtle shadow and border
- .bg-cool-gradient: Linear gradient for brand elements
- Container utilities: container mx-auto px-6
- Animation classes: animate-fade-in, animate-slide-up, animate-carousel
- Responsive text classes: text-sm, text-lg, text-xl with responsive variants
- Transition effects: transition-colors, transition-all duration-300
Responsive Design

- Mobile-First Approach:
  * Default styling for mobile
  * Media queries for larger screens

- Breakpoints:
  * sm: 640px and above
  * md: 768px and above
  * lg: 1024px and above
  * xl: 1280px and above
  * 2xl: 1400px max-width container

- Specific Adaptations:
  * Navbar: Hamburger menu on mobile
  * Hero: Single column on mobile, two columns on md+
  * Features: Single column on mobile, three columns on md+
  * Footer: Two columns on mobile, four columns on md+
  * Text sizes scale between breakpoints
Accessibility Considerations

- Semantic HTML throughout the site
- Proper heading hierarchy (h1, h2, h3)
- Sufficient color contrast between text and backgrounds
- Screen reader text for icons (sr-only class)
- Focus styles for keyboard navigation
- Alt text for images
- ARIA labels where appropriate
- Responsive design that works at all screen sizes
Performance Optimization

- Lazy-loaded images below the fold
- Optimized assets (webp format for images)
- Minimal JavaScript footprint
- Component-based architecture for code splitting
- Properly sized images
- Efficient CSS with Tailwind (small bundle size)
- Text instead of images where possible
Implementation Guide

1. Set up project with Vite and install dependencies
2. Configure Tailwind CSS with custom colors, animations, and utilities
3. Create base layout and shared components (Navbar, Footer)
4. Implement components section by section, mobile-first
5. Add animations and interactive elements
6. Test responsiveness across devices
7. Optimize for performance and accessibility
8. Polish visual details and consistency
Content Guidelines

- Brand Name: Documentor
- Tagline: "Write faster, together."
- Hero Description: AI-powered collaborative document editing
- Key Features:
  * AI-Powered Suggestions
  * Real-time Collaboration
  * Google Docs Sync
- Testimonials: Use the provided testimonials from the codebase
- Footer Description: "AI-powered collaborative document editing for modern teams."
- CTA Text: "Start Writing Free" and "Try for free"
Additional Notes

- The entire site should have a cohesive, premium feel
- Animations should be subtle and enhance UX, not distract
- Mobile experience should be just as polished as desktop
- Maintain visual hierarchy through consistent spacing, typography, and color use
- Special attention to micro-interactions for polished feel
- Ensure all links have proper hover states
- Custom cursor styles or subtle hover effects can enhance premium feel