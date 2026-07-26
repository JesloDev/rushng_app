'use client';

import { useState, useEffect } from 'react';
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
  reviewsCount?: number;
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
  reviewsCount,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const handleClick = (index: number) => {
    if (disabled || !interactive) return;
    const newRating = index + 1;
    setCurrentRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled || !interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (disabled || !interactive) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (disabled || !interactive) return;
    setHoverRating(0);
  };

  const activeRating = interactive ? (hoverRating || currentRating) : rating;

  return (
    <div className={cn('inline-flex items-center gap-1.5 select-none', className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Rating: ${activeRating.toFixed(1)} out of ${total} stars`}
      >
        {Array.from({ length: total }).map((_, i) => {
          const starValue = i + 1;
          const isFull = activeRating >= starValue;
          const isHalf = !interactive && !isFull && activeRating > i && activeRating < starValue;

          return (
            <div
              key={i}
              className={cn(
                'relative inline-block',
                interactive && !disabled && 'cursor-pointer hover:scale-110 transition-transform',
                disabled && 'cursor-not-allowed opacity-60'
              )}
              onClick={() => handleClick(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onMouseEnter={() => handleMouseEnter(i)}
              tabIndex={interactive && !disabled ? 0 : -1}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? currentRating === starValue : undefined}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              {/* Background Empty Star */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800'
                )}
              />

              {/* Full Star Overlay */}
              {isFull && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute inset-0 fill-amber-400 text-amber-400'
                  )}
                />
              )}

              {/* Half Star Overlay */}
              {isHalf && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(activeRating - i) * 100}%` }}
                >
                  <Star className={cn(sizeClasses[size], 'fill-amber-400 text-amber-400')} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <div className={cn('flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300', textSizeClasses[size])}>
          <span>{Number(activeRating).toFixed(1)}</span>
          {reviewsCount !== undefined && (
            <span className="text-slate-400 font-normal">({reviewsCount})</span>
          )}
        </div>
      )}
    </div>
  );
}