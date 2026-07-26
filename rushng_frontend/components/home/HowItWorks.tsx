'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    stepNumber: '01',
    icon: Search,
    title: 'Find a Service',
    description: 'Browse available dispatch riders and verified artisans in your vicinity.',
    color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
  },
  {
    stepNumber: '02',
    icon: UserCheck,
    title: 'Connect with Providers',
    description: 'Get matched automatically with vetted local professionals ready to deliver.',
    color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  },
  {
    stepNumber: '03',
    icon: Star,
    title: 'Get Quality Service',
    description: 'Track progress live, complete safe escrow payouts, and leave provider reviews.',
    color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  },
  {
    stepNumber: '04',
    icon: ShieldCheck,
    title: 'Stay Protected',
    description: 'Every job is covered by escrow guarantee and verified identity checks.',
    color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-card/40 relative border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-wider uppercase text-primary">
            Simple Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">RushNG</span> Works
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Get your deliveries sent or home services booked in four easy steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="group relative h-full p-6 text-center border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
                  {/* Step Counter Badge */}
                  <div className="absolute top-4 right-4 text-xs font-mono font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">
                    {step.stepNumber}
                  </div>

                  {/* Icon Wrapper */}
                  <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-base font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-14 text-center">
          <Button
            asChild
            size="lg"
            className="gradient-rush text-white font-semibold shadow-rush hover:opacity-95 h-12 px-8"
          >
            <Link href="/jobs" className="flex items-center gap-2">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}