import React from 'react';
import FeatureCard from './FeatureCard'; // Adjust path if needed

const featuresData = [
  {
    title: "AI-Powered Suggestions",
    description: "Get intelligent suggestions for grammar, style, and clarity as you write.",
    // icon/image placeholder
  },
  {
    title: "Real-time Collaboration",
    description: "Work together seamlessly with teammates on the same document, at the same time.",
    // icon/image placeholder
  },
  {
    title: "Google Docs Sync",
    description: "Easily import from and export to Google Docs, keeping your workflows connected.",
    // icon/image placeholder
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-accent/10"> {/* Light orange tint */}
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-text-dark mb-4">
            Write like never before
          </h2>
          <p className="text-text-body">
            Explore how Documentor leverages AI and collaboration to elevate your writing process, making it faster and more effective.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              // Pass icon/image props here later
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 