import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  // Add imageSrc or Icon component prop later
  className?: string;
}

const FeatureCard = ({ title, description, className }: FeatureCardProps) => {
  return (
    <div
      className={cn(
        'card-float p-6 text-center flex flex-col items-center space-y-4 hover:shadow-lg',
        className
      )}
    >
      {/* Placeholder for Image/Icon */}
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-500 text-sm">Image</span>
      </div>

      <h3 className="text-xl font-semibold text-text-dark">{title}</h3>
      <p className="text-sm text-text-body">{description}</p>
    </div>
  );
};

export default FeatureCard; 