'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, MapPin, Package, CreditCard, Star, CheckCircle2, ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';

const steps = [
  { number: '01', title: 'Choose Your Service', description: 'Browse our six service categories — Shopping, Errands, Condiments, Dispatch, Price Per Time, or Laundry. Each service is tailored to handle specific needs.', icon: <Zap className="h-6 w-6" />, color: 'from-orange-500 to-amber-600' },
  { number: '02', title: 'Enter Pickup & Delivery Details', description: 'Provide your pickup and dropoff addresses, preferred schedule, and any special instructions. For shopping services, you can add items you need purchased.', icon: <MapPin className="h-6 w-6" />, color: 'from-blue-500 to-cyan-600' },
  { number: '03', title: 'Get Matched with a Rider', description: 'Our smart algorithm connects you with the nearest available and highest-rated rider. Track their location in real-time. Average match time is under 2 minutes.', icon: <Users className="h-6 w-6" />, color: 'from-purple-500 to-violet-600' },
  { number: '04', title: 'Track & Receive', description: 'Monitor your delivery in real-time with live tracking, ETA updates, and direct communication with your rider. Once delivered, rate your experience.', icon: <Package className="h-6 w-6" />, color: 'from-orange-500 to-amber-600' },
];

export function HowItWorks() {
  const { setView } = useAppStore();
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Button variant="secondary" className="mb-4 gap-2 px-4 py-1.5 text-sm"><TrendingUp className="h-4 w-4" /> How RUSHNG Works</Button>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Four Simple Steps to <span className="gradient-text">Getting It Done</span></h2>
            <p className="text-lg text-muted-foreground">Whether you need shopping done, a package delivered, or laundry picked up, RUSHNG makes the process seamless.</p>
          </motion.div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}>
              <Card className="group h-full border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md transition-transform group-hover:scale-110`}>{step.icon}</div>
                    <span className="text-3xl font-extrabold text-muted-foreground/20">{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <h3 className="mb-10 text-center text-2xl font-extrabold">Why Choose <span className="gradient-text">RUSHNG</span>?</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: <Shield className="h-6 w-6" />, title: 'Insured & Secure', desc: 'Every delivery is insured. Your items are protected from pickup to delivery with our comprehensive coverage.' },
              { icon: <Star className="h-6 w-6" />, title: 'Verified Riders', desc: 'All riders undergo thorough background checks and training. Only the best are allowed on the RUSHNG platform.' },
              { icon: <CreditCard className="h-6 w-6" />, title: 'Affordable Pricing', desc: 'Sellers pay for advertising, not buyers. Your delivery fees are kept to an absolute minimum.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">{item.icon}</div>
                <div><h4 className="mb-1 font-semibold">{item.title}</h4><p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-700 p-8 text-center text-white md:p-14">
            <h3 className="mb-3 text-2xl font-bold md:text-3xl">Ready to Get Started?</h3>
            <p className="mx-auto mb-8 max-w-lg text-white/80">Join over 200,000 Nigerians already using RUSHNG for their daily delivery and errand needs.</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => setView('booking')} className="bg-white text-orange-700 shadow-lg hover:bg-white/90"><Zap className="mr-2 h-5 w-5" /> Book Your First Service</Button>
              <Button size="lg" variant="outline" onClick={() => setView('merchant-signup')} className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">Open Your Store <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}