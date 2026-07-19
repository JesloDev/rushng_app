'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Briefcase, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white pt-20 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              Available 24/7 across Nigeria
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Find Trusted{' '}
              <span className="gradient-text">Service Providers</span>{' '}
              Near You
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Connect with verified plumbers, electricians, carpenters, and more. 
              Get quality service from trusted professionals in your area.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/jobs">
                <Button size="lg" className="gradient-rush text-white shadow-rush hover:shadow-rush-hover">
                  Find a Service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/providers/register">
                <Button size="lg" variant="outline" className="border-orange-200 hover:bg-orange-50">
                  Become a Provider
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              <div>
                <div className="text-2xl font-bold text-orange-500">10K+</div>
                <div className="text-sm text-gray-500">Active Providers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">50K+</div>
                <div className="text-sm text-gray-500">Jobs Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">4.8★</div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Find a Professional</h3>
                    <p className="text-sm text-white/80">Near your location</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Chidi E.', service: 'Plumbing', rating: 4.9, distance: '2.3km' },
                    { name: 'Amina B.', service: 'Electrical', rating: 4.8, distance: '3.1km' },
                    { name: 'Tunde O.', service: 'Carpentry', rating: 4.7, distance: '1.8km' },
                  ].map((provider, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-white/10 backdrop-blur p-3 hover:bg-white/20 transition"
                    >
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-white/70">{provider.service}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating}</span>
                        </div>
                        <p className="text-xs text-white/60">{provider.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center text-sm text-white/70">
                  Join thousands of satisfied customers
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 rounded-lg bg-white p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">100% Verified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}