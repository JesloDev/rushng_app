'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Chioma E.',
    role: 'Customer',
    content: 'Found a great plumber through RUSHNG. The service was fast and professional. Highly recommend!',
    rating: 5,
    initials: 'CE',
  },
  {
    name: 'Emeka O.',
    role: 'Customer',
    content: 'The electrician arrived on time and fixed all my wiring issues. Very reliable platform.',
    rating: 5,
    initials: 'EO',
  },
  {
    name: 'Fatima B.',
    role: 'Customer',
    content: 'I needed a carpenter urgently and found one within minutes. The work quality was excellent.',
    rating: 5,
    initials: 'FB',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Customers</span> Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real reviews from real people who found trusted providers on RUSHNG
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
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