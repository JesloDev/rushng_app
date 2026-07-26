'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Briefcase, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  const sampleProviders = [
    { name: 'Chidi E.', service: 'Plumbing & Dispatch', rating: 4.9, distance: '2.3km' },
    { name: 'Amina B.', service: 'Electrical Maintenance', rating: 4.8, distance: '3.1km' },
    { name: 'Tunde O.', service: 'Carpentry & Logistics', rating: 4.7, distance: '1.8km' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-16 md:pt-24 pb-24 md:pb-32">
      {/* Background Glow Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-left"
          >
            {/* Live Availability Badge */}
           {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Available 24/7 Across Nigeria
            </div>*/}

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Find Trusted{' '}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Service Providers
              </span>{' '}
              & Logistics Near You
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Connect with verified dispatch riders, plumbers, electricians, and technicians. 
              Get quality, reliable service delivered straight to your doorstep.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                asChild 
                size="lg" 
                className="gradient-rush text-white font-semibold shadow-rush hover:opacity-95 h-12 px-6"
              >
                <Link href="/jobs" className="flex items-center gap-2">
                  Find a Service
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="h-12 px-6 border-border hover:bg-accent font-medium"
              >
                <Link href="/providers/register">
                  Become a Provider
                </Link>
              </Button>
            </div>

            {/* Social Proof / Key Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/60">
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight text-primary">10K+</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Verified Providers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight text-primary">50K+</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Jobs Delivered</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight text-primary">4.8★</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Average Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <div className="gradient-rush p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shrink-0">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Nearby Professionals</h3>
                    <p className="text-xs text-white/80">Active now in your area</p>
                  </div>
                </div>

                {/* Provider List Stack */}
                <div className="space-y-3">
                  {sampleProviders.map((provider, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm leading-tight">{provider.name}</p>
                        <p className="text-xs text-white/80">{provider.service}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                          <span>{provider.rating}</span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5">{provider.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-center text-xs font-medium text-white/80">
                  Trusted by thousands of customers daily
                </p>
              </div>
            </div>

            {/* Animated Floating Status Badge */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-2 md:-right-4 rounded-xl bg-card border border-border p-3 shadow-xl backdrop-blur-md hidden sm:block"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-foreground leading-none">100% Verified</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">NIN & Identity Checked</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}