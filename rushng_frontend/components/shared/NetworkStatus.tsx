'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
}