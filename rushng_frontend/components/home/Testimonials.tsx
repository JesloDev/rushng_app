'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Chioma E.',
    role: 'Customer',
    location: 'Ikeja, Lagos',
    content: 'Needed an urgent motorcycle dispatch to send signed contracts across town during peak traffic. The driver arrived in 10 minutes and delivered seamlessly.',
    rating: 5,
    initials: 'CE',
    verified: true,
    tag: 'Dispatch & Express',
  },
  {
    name: 'Emeka O.',
    role: 'Customer',
    location: 'Lekki Phase 1',
    content: 'My office inverter blew a fuse on a Sunday. Found a certified electrician via RushNG who diagnosed and fixed it within two hours. Super reliable service!',
    rating: 5,
    initials: 'EO',
    verified: true,
    tag: 'Electrical Repair',
  },
  {
    name: 'Tunde A.',
    role: 'Verified Service Provider',
    location: 'Yaba, Lagos',
    content: 'As a skilled carpenter, finding steady jobs used to be tough. RushNG keeps my schedule full with verified clients and guarantees instant payout on completion.',
    rating: 5,
    initials: 'TA',
    verified: true,
    tag: 'Artisan Partner',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-muted/30">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-0 h-80 w-80 -translate-y-1/2 rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-80 w-80 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 rounded-full mb-3"
            >
              Community Feedback
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Trusted by <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">Thousands</span> Daily
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed pt-1">
              Real reviews from individuals and business owners relying on RushNG for instant courier dispatch and expert home repairs.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.4 }}
            >
              <Card className="h-full border border-border/60 bg-card hover:border-orange-500/40 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between">
                <CardContent className="p-6 md:p-7 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Top Row: Service Category & Quote Mark */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] font-medium bg-muted text-muted-foreground">
                        {testimonial.tag}
                      </Badge>
                      <Quote className="h-5 w-5 text-orange-500/30 rotate-180" />
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* User Profile Footer */}
                  <div className="pt-4 border-t border-border/40 flex items-center gap-3 mt-4">
                    <Avatar className="h-10 w-10 border border-orange-500/20">
                      <AvatarFallback className="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-foreground truncate">
                          {testimonial.name}
                        </p>
                        {testimonial.verified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" title="Verified User" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{testimonial.role}</span>
                        <span className="text-border">•</span>
                        <span className="inline-flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          {testimonial.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}