import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialCardProps {
  quote: string;
  author: string;
  title: string;
  avatarSrc?: string; // Optional avatar image source
  className?: string;
}

const TestimonialCard = ({
  quote,
  author,
  title,
  avatarSrc,
  className,
}: TestimonialCardProps) => {
  const fallback = author
    ? author
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';

  return (
    <div
      className={cn(
        'card-float p-6 space-y-4 h-full flex flex-col', // Added h-full and flex for consistent height in carousel
        className
      )}
    >
      <blockquote className="text-text-body italic border-l-2 border-primary pl-4 flex-grow">
        "{quote}"
      </blockquote>
      <div className="flex items-center space-x-3 pt-4 border-t border-border">
        <Avatar className="h-10 w-10">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={author} />}
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-text-dark">{author}</p>
          <p className="text-xs text-text-body/80">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard; 