'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Handle beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds
      setTimeout(() => {
        const hasBeenDismissed = localStorage.getItem('pwa-dismissed');
        if (!hasBeenDismissed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Handle app installed
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-dismissed');
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.removeItem('pwa-dismissed');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="glass shadow-lg rounded-xl p-4 border border-orange-200 dark:border-orange-800/30">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Install RUSHNG App</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Get faster access and offline support
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="flex-1"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}