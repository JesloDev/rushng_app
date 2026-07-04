'use client';

import { useEffect, useState } from 'react';
import { useAppStore, type ServiceType } from '@/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ShoppingCart, Footprints, Leaf, Package, Clock, WashingMachine } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const serviceIcons: Record<string, React.ReactNode> = {
  shopping: <ShoppingCart className="h-7 w-7" />,
  errands: <Footprints className="h-7 w-7" />,
  condiments: <Leaf className="h-7 w-7" />,
  dispatch: <Package className="h-7 w-7" />,
  price_per_time: <Clock className="h-7 w-7" />,
  laundry: <WashingMachine className="h-7 w-7" />,
};

const serviceColors: Record<string, { color: string; bgGradient: string; badge: string; basePrice: string }> = {
  shopping: { color: 'text-orange-600', bgGradient: 'from-orange-500 to-amber-600', badge: 'Most Popular', basePrice: 'From ₦500' },
  errands: { color: 'text-blue-600', bgGradient: 'from-blue-500 to-cyan-600', badge: 'Flexible', basePrice: 'From ₦800' },
  condiments: { color: 'text-orange-600', bgGradient: 'from-orange-500 to-amber-600', badge: 'Fresh Daily', basePrice: 'From ₦400' },
  dispatch: { color: 'text-purple-600', bgGradient: 'from-purple-500 to-violet-600', badge: 'Business', basePrice: 'From ₦600' },
  price_per_time: { color: 'text-teal-600', bgGradient: 'from-teal-500 to-cyan-600', badge: 'Hourly', basePrice: 'From ₦2,000/hr' },
  laundry: { color: 'text-rose-600', bgGradient: 'from-rose-500 to-pink-600', badge: 'Premium', basePrice: 'From ₦1,000' },
};

const serviceDescriptions: Record<string, string> = {
  shopping: 'Get anything from any store delivered to your doorstep. From groceries to electronics, our riders pick up and deliver with care.',
  errands: 'Need something done? Send a RUSH rider to run errands for you — pick up documents, pay bills, queue for services, and more.',
  condiments: 'Fresh ingredients, spices, and condiments from local markets delivered fast. Tomatoes, onions, peppers, palm oil, and all your cooking needs.',
  dispatch: 'Send packages, documents, or parcels anywhere across the city. Fast, reliable, and insured delivery for businesses and individuals.',
  price_per_time: 'Hire a rider by the hour for multiple stops, waiting time, or all-day tasks. Perfect for event runs, market shopping, or moving items.',
  laundry: 'Wash, fold, and iron — we handle it all. Pick up your dirty laundry and return it fresh, clean, and neatly packed.',
};

export function Services() {
  const { setService, setView } = useAppStore();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.getServices();
        if (response.success && response.data?.services) {
          setServices(response.data.services);
        } else {
          // Fallback to static data if API fails
          setServices(
            Object.keys(serviceColors).map((key) => ({
              slug: key,
              name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
              description: serviceDescriptions[key],
              base_price: parseInt(serviceColors[key].basePrice.replace(/[^0-9]/g, '')) || 0,
              ...serviceColors[key],
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        // Fallback to static data
        setServices(
          Object.keys(serviceColors).map((key) => ({
            slug: key,
            name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
            description: serviceDescriptions[key],
            base_price: parseInt(serviceColors[key].basePrice.replace(/[^0-9]/g, '')) || 0,
            ...serviceColors[key],
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 bg-white shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-14 w-14 rounded-2xl mb-5" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex items-center justify-between border-t pt-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">Our Services</Badge>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything You Need, <span className="gradient-text">One App</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From daily shopping to business dispatch, RUSHNG has you covered with six powerful services designed for Nigerians, by Nigerians.
          </p>
        </div>
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const slug = service.slug || service.type;
            const icon = serviceIcons[slug] || <Package className="h-7 w-7" />;
            const colors = serviceColors[slug] || serviceColors.shopping;
            const description = service.description || serviceDescriptions[slug] || '';
            const priceDisplay = service.base_price 
              ? `From ₦${service.base_price.toLocaleString()}`
              : colors?.basePrice || 'From ₦500';

            return (
              <motion.div
                key={slug}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <Card
                  className="group cursor-pointer border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => {
                    setService(slug as ServiceType);
                    setView('booking');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors?.bgGradient || 'from-orange-500 to-amber-600'} text-white shadow-md`}>
                        {icon}
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">{colors?.badge || 'Service'}</Badge>
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{service.name || slug.charAt(0).toUpperCase() + slug.slice(1)}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {description}
                    </p>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <span className={`text-sm font-semibold ${colors?.color || 'text-orange-600'}`}>
                        {priceDisplay}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}