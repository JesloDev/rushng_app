'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';

interface GlobalLoadingOverlayProps {
  message?: string;
}

export function GlobalLoadingOverlay({ message = 'Loading...' }: GlobalLoadingOverlayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(message);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state on route/searchParam changes in Next.js
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Custom event handlers for global API requests or manual triggers
    const handleStart = (e: CustomEvent<{ text?: string }> | Event) => {
      if ('detail' in e && e.detail?.text) {
        setLoadingText(e.detail.text);
      } else {
        setLoadingText(message);
      }
      setIsLoading(true);
    };

    const handleStop = () => {
      setIsLoading(false);
    };

    window.addEventListener('rush:loading-start' as any, handleStart);
    window.addEventListener('rush:loading-stop' as any, handleStop);

    return () => {
      window.removeEventListener('rush:loading-start' as any, handleStart);
      window.removeEventListener('rush:loading-stop' as any, handleStop);
    };
  }, [message]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm transition-all duration-200 animate-in fade-in-50">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl max-w-xs w-full text-center space-y-3">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    </div>
  );
}

// Utility helper functions to trigger loading overlay anywhere in client components
export const showGlobalLoading = (text?: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rush:loading-start', { detail: { text } }));
  }
};

export const hideGlobalLoading = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('rush:loading-stop'));
  }
};