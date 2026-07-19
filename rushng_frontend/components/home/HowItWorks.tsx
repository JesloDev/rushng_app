'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Star, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    title: 'Find a Service',
    description: 'Browse through our wide range of services and find what you need',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: UserPlus,
    title: 'Connect with Providers',
    description: 'Get matched with verified providers in your area',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Star,
    title: 'Get Quality Service',
    description: 'Receive professional service and rate your experience',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    title: 'Stay Protected',
    description: 'All providers are verified and jobs are insured',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">RUSHNG</span> Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get quality service in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/jobs">
            <Button size="lg" className="gradient-rush text-white shadow-rush">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}