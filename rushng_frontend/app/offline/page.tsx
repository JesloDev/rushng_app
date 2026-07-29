'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30">
          <WifiOff className="h-12 w-12 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold">You're Offline</h1>
        <p className="text-muted-foreground">
          It looks like you've lost your internet connection. 
          Don't worry, you'll be able to continue once you're back online.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}