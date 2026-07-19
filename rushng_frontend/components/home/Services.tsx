'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Home, 
  Brush,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Wrench,
    name: 'Plumbing',
    description: 'Pipe repairs, installations, and maintenance',
    jobs: '1,200+ jobs',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    name: 'Electrical',
    description: 'Wiring, installations, and repairs',
    jobs: '980+ jobs',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    icon: Hammer,
    name: 'Carpentry',
    description: 'Furniture, shelving, and woodwork',
    jobs: '850+ jobs',
    color: 'from-amber-600 to-orange-600',
  },
  {
    icon: PaintBucket,
    name: 'Painting',
    description: 'Interior and exterior painting',
    jobs: '720+ jobs',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Home,
    name: 'Cleaning',
    description: 'Home and office cleaning services',
    jobs: '1,500+ jobs',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Brush,
    name: 'Tiling',
    description: 'Floor, wall, and bathroom tiling',
    jobs: '650+ jobs',
    color: 'from-purple-500 to-violet-500',
  },
];

export function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Our Services</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find the Right <span className="gradient-text">Professional</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from a wide range of services and get connected with verified providers in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`inline-flex rounded-lg bg-gradient-to-br ${service.color} p-3 text-white mb-4`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {service.jobs}
                    </Badge>
                    <Link href={`/jobs?category=${service.name.toLowerCase()}`}>
                      <Button variant="ghost" size="sm" className="gap-1 group-hover:text-orange-500">
                        Find Providers
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
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