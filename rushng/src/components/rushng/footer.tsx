'use client';

import { Zap, Store, LayoutDashboard, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';

export function Footer() {
  const { setView } = useAppStore();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2"
            >
              <div className="gradient-rush rounded-lg p-1.5">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="gradient-text">RUSH</span>
                <span className="text-foreground/70">NG</span>
              </span>
            </button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nigeria&apos;s fastest all-in-one delivery and errands platform.
              Shopping, dispatch, laundry, and more — all in one app.
            </p>
            <div className="flex gap-2">
              {['Twitter', 'Instagram', 'Facebook'].map((social) => (
                <Button key={social} variant="outline" size="icon" className="h-8 w-8">
                  <span className="text-xs">{social[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Shopping', 'Errands', 'Condiments', 'Dispatch', 'Price Per Time', 'Laundry'].map(
                (svc) => (
                  <li key={svc}>
                    <button
                      onClick={() => setView('home')}
                      className="transition-colors hover:text-foreground"
                    >
                      {svc}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="mb-4 font-semibold">For Business</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => setView('merchant-signup')}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Store className="h-3.5 w-3.5" />
                  Open a Store
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('merchant-dashboard')}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Merchant Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('merchant-builder')}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Store Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('pricing')}
                  className="transition-colors hover:text-foreground"
                >
                  Advertising Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => setView('how-it-works')}
                  className="transition-colors hover:text-foreground"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView('pricing')}
                  className="transition-colors hover:text-foreground"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button className="transition-colors hover:text-foreground">
                  About Us
                </button>
              </li>
              <li>
                <button className="transition-colors hover:text-foreground">
                  Contact Support
                </button>
              </li>
              <li>
                <button className="transition-colors hover:text-foreground">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RUSHNG. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-3.5 w-3.5 text-red-500" fill="currentColor" /> in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
