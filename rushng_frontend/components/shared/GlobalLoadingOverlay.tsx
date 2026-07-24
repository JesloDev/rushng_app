'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function(...args) {
      setIsLoading(true);
      originalPush.apply(this, args);
      setTimeout(() => setIsLoading(false), 500);
    };

    window.history.replaceState = function(...args) {
      setIsLoading(true);
      originalReplace.apply(this, args);
      setTimeout(() => setIsLoading(false), 500);
    };

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}