'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, Star, ShieldCheck, ArrowRight, Sparkles, Clock, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    stepNumber: '01',
    icon: Search,
    title: 'Find a Service',
    description: 'Browse available dispatch riders and verified artisans in your vicinity.',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    stepNumber: '02',
    icon: UserCheck,
    title: 'Connect with Providers',
    description: 'Get matched automatically with vetted local professionals ready to deliver.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    stepNumber: '03',
    icon: Star,
    title: 'Get Quality Service',
    description: 'Track progress live, complete safe escrow payouts, and leave provider reviews.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    stepNumber: '04',
    icon: ShieldCheck,
    title: 'Stay Protected',
    description: 'Every job is covered by escrow guarantee and verified identity checks.',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Simple Workflow
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            How{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              RushNG
            </span>
            {' '}Works
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Get your deliveries sent or home services booked in four easy steps.
          </p>
        </motion.div>

        {/* Steps Grid with Connector Line */}
        <div className="relative">
          {/* Animated Connector Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-purple-500 opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-purple-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Step Number - Desktop */}
                  <div className="hidden lg:flex absolute -top-4 -right-4 text-7xl font-black text-muted-foreground/5 select-none">
                    {step.stepNumber}
                  </div>

                  <Card className="group relative h-full p-6 text-center border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Step Counter Badge */}
                    <div className="absolute top-4 right-4 text-xs font-mono font-bold text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                      {step.stepNumber}
                    </div>

                    {/* Icon Wrapper with Gradient */}
                    <div className={`relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <Icon className={`h-7 w-7 ${step.iconColor} relative z-10`} />
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-base font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step Indicator Dot */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      <div className={`h-1 w-4 rounded-full bg-gradient-to-r ${step.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Get started in under 2 minutes</span>
          </div>
          <Button
            asChild
            size="lg"
            className="gradient-rush text-white font-semibold shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-12 px-8"
          >
            <Link href="/jobs" className="flex items-center gap-2">
              Get Started Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}