'use client';

import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Clock, Shield, Star } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Riders' },
  { value: '200K+', label: 'Happy Users' },
  { value: '1M+', label: 'Deliveries Made' },
  { value: '4.8', label: 'App Rating' },
];

export function Hero() {
  const { setView } = useAppStore();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/30" />
        <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-0 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 py-20 md:px-6 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700">
                <Clock className="h-4 w-4" /> Available 24/7 across Nigeria
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Get <span className="gradient-text">Anything</span><br />Done. <span className="gradient-text">Anywhere.</span><br /><span className="text-foreground/60">Anytime.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                RUSHNG is your all-in-one platform for shopping, errands, dispatch, laundry and more. We connect you with trusted riders and merchants across Nigeria.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => setView('booking')} className="gradient-rush border-0 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-orange-500/25">
                Book a Service <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView('merchant-signup')} className="px-8 py-6 text-lg font-semibold">
                Become a Merchant
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-orange-500" /> Insured Deliveries</div>
              <div className="flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" /> Real-time Tracking</div>
              <div className="flex items-center gap-2"><Star className="h-5 w-5 text-orange-500" /> Verified Riders</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-[2.5rem] border-2 border-gray-200 bg-white p-3 shadow-2xl shadow-orange-900/10">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-600">
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-white">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"><Package className="h-8 w-8" /></div>
                    <h3 className="mb-2 text-2xl font-bold">RUSHNG</h3>
                    <p className="text-center text-sm text-white/80">Your delivery is on the way!</p>
                    <div className="mt-8 w-full space-y-3">
                      <div className="rounded-xl bg-white/20 p-4 backdrop-blur">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30"><div className="h-3 w-3 rounded-full bg-white animate-pulse" /></div>
                          <div><p className="text-sm font-medium">Rider en route</p><p className="text-xs text-white/70">Arriving in 5 mins</p></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-xl bg-white/10 p-3 text-center backdrop-blur"><p className="text-xs text-white/70">Distance</p><p className="text-sm font-semibold">3.2 km</p></div>
                        <div className="flex-1 rounded-xl bg-white/10 p-3 text-center backdrop-blur"><p className="text-xs text-white/70">ETA</p><p className="text-sm font-semibold">12 min</p></div>
                        <div className="flex-1 rounded-xl bg-white/10 p-3 text-center backdrop-blur"><p className="text-xs text-white/70">Price</p><p className="text-sm font-semibold">&#8358;1,500</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -right-4 top-8 rounded-xl border bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100"><Star className="h-4 w-4 text-orange-600" /></div>
                  <div><p className="text-xs font-medium">4.8 Rating</p><p className="text-[10px] text-muted-foreground">200K+ reviews</p></div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute -left-4 bottom-16 rounded-xl border bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100"><Shield className="h-4 w-4 text-amber-600" /></div>
                  <div><p className="text-xs font-medium">Secure</p><p className="text-[10px] text-muted-foreground">Insured delivery</p></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl border bg-white/50 p-6 backdrop-blur">
              <span className="text-3xl font-extrabold gradient-text">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}