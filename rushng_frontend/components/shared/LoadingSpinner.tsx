'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullScreen && 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm',
      className
    )}>
      <Loader2 className={cn('animate-spin text-orange-500', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}