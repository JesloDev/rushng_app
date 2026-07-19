'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  total?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  disabled?: boolean;
}

export function RatingStars({
  rating,
  total = 5,
  size = 'md',
  showValue = true,
  interactive = false,
  onRatingChange,
  className,
  disabled = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };

  const handleClick = (index: number) => {
    if (disabled || !interactive) return;
    const newRating = index + 1;
    setCurrentRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleMouseEnter = (index: number) => {
    if (disabled || !interactive) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (disabled || !interactive) return;
    setHoverRating(0);
  };

  const displayRating = interactive ? (hoverRating || currentRating) : rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className="flex"
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(total)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.round(displayRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200',
              interactive && !disabled && 'cursor-pointer hover:scale-110 transition-transform',
              disabled && 'cursor-default'
            )}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}