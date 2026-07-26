'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string | null;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-medium',
    xl: 'text-lg font-medium',
  };

  const content = (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        fullScreen && 'fixed inset-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <Loader2 className={cn('animate-spin text-orange-600 dark:text-orange-500', sizeClasses[size])} />
      </div>

      {text && (
        <p className={cn('text-slate-500 dark:text-slate-400 animate-pulse leading-none', textClasses[size])}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  return content;
}