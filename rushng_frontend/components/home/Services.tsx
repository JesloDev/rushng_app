'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Home, 
  Brush,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const servicesData = [
  {
    id: 'plumbing',
    icon: Wrench,
    name: 'Plumbing',
    description: 'Pipe repairs, installations, and maintenance',
    jobs: '1,200+ jobs',
    rating: 4.9,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    popular: true,
  },
  {
    id: 'electrical',
    icon: Zap,
    name: 'Electrical',
    description: 'Wiring, installations, and repairs',
    jobs: '980+ jobs',
    rating: 4.8,
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    popular: false,
  },
  {
    id: 'carpentry',
    icon: Hammer,
    name: 'Carpentry',
    description: 'Furniture, shelving, and woodwork',
    jobs: '850+ jobs',
    rating: 4.7,
    color: 'from-amber-600 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    popular: false,
  },
  {
    id: 'painting',
    icon: PaintBucket,
    name: 'Painting',
    description: 'Interior and exterior painting',
    jobs: '720+ jobs',
    rating: 4.6,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    popular: false,
  },
  {
    id: 'cleaning',
    icon: Home,
    name: 'Cleaning',
    description: 'Home and office cleaning services',
    jobs: '1,500+ jobs',
    rating: 4.9,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    popular: true,
  },
  {
    id: 'tiling',
    icon: Brush,
    name: 'Tiling',
    description: 'Floor, wall, and bathroom tiling',
    jobs: '650+ jobs',
    rating: 4.5,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    popular: false,
  },
];

// Skeleton loading component
function ServicesSkeleton() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-8 w-32 mx-auto mb-4" />
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-14 w-14 rounded-xl mb-5" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-32 mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFindProviders = async (serviceId: string, serviceName: string) => {
    setLoading(serviceId);
    
    // Show loading toast
    toast.loading(`Finding ${serviceName} providers...`, {
      id: 'find-providers',
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dismiss loading toast
    toast.dismiss('find-providers');
    toast.success(`Found providers for ${serviceName}!`);

    // Navigate
    window.location.href = `/jobs?category=${serviceName.toLowerCase()}`;
    
    setLoading(null);
  };

  if (isPageLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-100/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-orange-50/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge 
              variant="secondary" 
              className="mb-4 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Find the Right{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                Professional
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Choose from a wide range of services and get connected with verified providers in your area
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card 
                className={`group relative h-full border-0 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                  hoveredIndex === index ? 'shadow-orange-500/20' : ''
                }`}
              >
                {/* Animated gradient border */}
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} 
                  style={{ padding: '2px' }}
                >
                  <div className="h-full w-full rounded-2xl bg-white" />
                </div>

                <CardContent className="relative p-6 transition-all duration-500 group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-orange-50/30">
                  {/* Popular Badge with animation */}
                  {service.popular && (
                    <motion.div 
                      className="absolute top-4 right-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 shadow-md">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className="mb-5">
                    <motion.div 
                      className={`inline-flex rounded-xl bg-gradient-to-br ${service.color} p-3.5 text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                      whileHover={{ rotate: [0, -5, 5, -3, 3, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <service.icon className="h-7 w-7" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-700">{service.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{service.jobs}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* CTA Button with Loading State */}
                    <div className="pt-3">
                      <LoadingButton
                        variant={hoveredIndex === index ? 'gradient' : 'ghost'}
                        size="sm"
                        loading={loading === service.id}
                        loadingText="Finding..."
                        className={`gap-2 transition-all duration-300 ${
                          hoveredIndex === index && loading !== service.id
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-md'
                            : 'hover:bg-orange-50 hover:text-orange-600'
                        }`}
                        onClick={() => handleFindProviders(service.id, service.name)}
                      >
                        <span>Find Providers</span>
                        <motion.div
                          animate={{ x: hoveredIndex === index && loading !== service.id ? 4 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </LoadingButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            Looking for something else?{' '}
          </p>
          <LoadingButton
            variant="link"
            className="mt-2 font-semibold text-orange-500 hover:text-orange-600"
            onClick={() => {
              toast.loading('Loading all services...', { id: 'browse-all' });
              setTimeout(() => {
                toast.dismiss('browse-all');
                window.location.href = '/jobs';
              }, 800);
            }}
          >
            Browse all services →
          </LoadingButton>
        </motion.div>
      </div>
    </section>
  );
}