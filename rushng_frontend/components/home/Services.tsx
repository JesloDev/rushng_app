'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Truck,
  Wrench, 
  Zap, 
  Hammer, 
  PaintBucket, 
  Home, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
  Clock,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const servicesData = [
  {
    id: 'dispatch',
    icon: Truck,
    name: 'Dispatch & Express',
    description: 'Instant parcel delivery and motorcycle dispatch across town',
    jobs: '2,400+ deliveries',
    rating: 4.9,
    time: '5-15 min',
    color: 'from-orange-500 to-amber-600',
    popular: true,
  },
  {
    id: 'plumbing',
    icon: Wrench,
    name: 'Plumbing',
    description: 'Pipe repairs, leakage fixing, and bathroom fittings',
    jobs: '1,200+ jobs',
    rating: 4.9,
    time: '30-60 min',
    color: 'from-blue-500 to-blue-600',
    popular: true,
  },
  {
    id: 'electrical',
    icon: Zap,
    name: 'Electrical',
    description: 'Wiring, inverter setup, and appliance repairs',
    jobs: '980+ jobs',
    rating: 4.8,
    time: '30-45 min',
    color: 'from-yellow-500 to-amber-600',
    popular: false,
  },
  {
    id: 'carpentry',
    icon: Hammer,
    name: 'Carpentry',
    description: 'Custom furniture, woodwork, and door repairs',
    jobs: '850+ jobs',
    rating: 4.7,
    time: '1-2 hours',
    color: 'from-amber-600 to-orange-600',
    popular: false,
  },
  {
    id: 'painting',
    icon: PaintBucket,
    name: 'Painting',
    description: 'Interior, exterior, and wall decorative finishes',
    jobs: '720+ jobs',
    rating: 4.6,
    time: '2-4 hours',
    color: 'from-pink-500 to-rose-500',
    popular: false,
  },
  {
    id: 'cleaning',
    icon: Home,
    name: 'Home Cleaning',
    description: 'Deep residential, office, and post-construction cleaning',
    jobs: '1,500+ jobs',
    rating: 4.9,
    time: '1-3 hours',
    color: 'from-emerald-500 to-teal-600',
    popular: true,
  },
];

// Skeleton loading state
function ServicesSkeleton() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-3">
          <Skeleton className="h-7 w-32 mx-auto rounded-full" />
          <Skeleton className="h-10 w-72 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-border/50 bg-card">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-32 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function Services() {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFindProviders = async (serviceId: string, serviceName: string) => {
    setLoadingId(serviceId);
    toast.loading(`Finding ${serviceName} providers...`, { id: 'find-providers' });

    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.dismiss('find-providers');
    toast.success(`Redirecting to ${serviceName} listings`);
    
    router.push(`/jobs?category=${encodeURIComponent(serviceName.toLowerCase())}`);
    setLoadingId(null);
  };

  if (isPageLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-background">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Our Core Services
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Find the Right{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Professional
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Choose from our network of vetted dispatch couriers and skilled artisans ready for instant deployment.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {servicesData.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card 
                  className={`group relative h-full border border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-2 overflow-hidden`}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardContent className="p-6 relative space-y-4">
                    {/* Popular Badge */}
                    {service.popular && (
                      <div className="absolute top-5 right-5">
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 text-[10px] px-2.5 py-0.5 font-semibold shadow-sm">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Icon with Gradient */}
                    <div className="pt-1">
                      <div className={`inline-flex rounded-xl bg-gradient-to-br ${service.color} p-3.5 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Title & Rating */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-semibold bg-muted/50 px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-foreground">{service.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{service.jobs}</span>
                      </div>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{service.time}</span>
                      </div>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <LoadingButton
                        variant={hoveredIndex === index ? 'gradient' : 'outline'}
                        size="sm"
                        loading={loadingId === service.id}
                        loadingText="Connecting..."
                        className={`w-full justify-between h-9 text-xs font-semibold transition-all duration-300 ${
                          hoveredIndex === index && loadingId !== service.id
                            ? 'gradient-rush text-white border-transparent shadow-md'
                            : 'border-border text-foreground hover:border-primary/50'
                        }`}
                        onClick={() => handleFindProviders(service.id, service.name)}
                      >
                        <span>Find Providers</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </LoadingButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Navigation Link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 text-center space-y-2"
        >
          <p className="text-xs md:text-sm text-muted-foreground">
            Looking for specialized technical work or custom deliveries?
          </p>
          <button
            onClick={() => router.push('/jobs')}
            className="group text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
          >
            Browse all service categories 
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}