'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Star, Zap, Store, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const servicePricing = [
  {
    service: 'Shopping',
    basePrice: 500,
    perKm: 100,
    features: [
      'Pick up from any store or market',
      'Multiple items per trip',
      'Real-time tracking',
      'Photo confirmation of items',
      'Return/exchange support',
    ],
  },
  {
    service: 'Errands',
    basePrice: 800,
    perKm: 120,
    features: [
      'Queue on your behalf',
      'Document pickup & delivery',
      'Bill payments',
      'Multiple stops allowed',
      'Custom errand requests',
    ],
  },
  {
    service: 'Condiments Shopping',
    basePrice: 400,
    perKm: 80,
    features: [
      'Market/fresh produce sourcing',
      'Best price negotiation',
      'Quality inspection',
      'Multiple market stops',
      'Perishable handling',
    ],
  },
  {
    service: 'Dispatch',
    basePrice: 600,
    perKm: 150,
    features: [
      'Same-day delivery',
      'Package insurance up to &#8358;50,000',
      'Weight tracking',
      'Proof of delivery',
      'Inter-city available',
    ],
  },
  {
    service: 'Price Per Time',
    basePrice: 2000,
    perHour: true,
    features: [
      'Minimum 1 hour booking',
      'Multiple stops included',
      'Waiting time covered',
      'Extend on-the-go',
      'Best for events & market runs',
    ],
  },
  {
    service: 'Laundry',
    basePrice: 1000,
    perKg: 300,
    features: [
      'Wash & fold service',
      'Wash & iron available',
      'Dry cleaning option',
      'Pickup & delivery',
      '48-hour turnaround',
    ],
  },
];

const sellerPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'Forever',
    features: [
      'Basic store page',
      'Up to 5 products',
      'RUSHNG subdomain',
      'Standard analytics',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Basic',
    price: 5000,
    period: 'per month',
    features: [
      'Custom store page',
      'Up to 50 products',
      'Custom domain support',
      'Advanced analytics',
      'Priority support',
      'Featured in search',
    ],
    cta: 'Start Basic',
    popular: true,
  },
  {
    name: 'Premium',
    price: 15000,
    period: 'per month',
    features: [
      'Everything in Basic',
      'Unlimited products',
      'Homepage banner ads',
      'Push notifications',
      'Dedicated account manager',
      'Top placement in results',
      'Promotional campaigns',
    ],
    cta: 'Go Premium',
    popular: false,
  },
];

export function PricingSection() {
  const { setView } = useAppStore();

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              Transparent Pricing
            </Badge>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simple,{' '}
              <span className="gradient-text">Fair Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No hidden charges. Buyers pay almost nothing — sellers invest in advertising
              to reach more customers. That&apos;s the RUSHNG way.
            </p>
          </motion.div>
        </div>

        {/* Buyer Pricing */}
        <div className="mb-16">
          <h3 className="mb-6 text-center text-xl font-bold">
            Service Pricing <span className="text-sm font-normal text-muted-foreground">(For Buyers)</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicePricing.map((svc, idx) => (
              <motion.div
                key={svc.service}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="mb-1 font-bold">{svc.service}</h4>
                    <p className="mb-4 text-2xl font-extrabold gradient-text">
                      &#8358;{svc.basePrice.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">
                        {svc.perHour
                          ? '/hour'
                          : ` base + &#8358;${svc.perKm}/km`}
                      </span>
                    </p>
                    <Separator className="mb-4" />
                    <ul className="space-y-2.5">
                      {svc.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          <span dangerouslySetInnerHTML={{ __html: feat }} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Seller/Merchant Pricing */}
        <div>
          <h3 className="mb-2 text-center text-xl font-bold">
            Merchant Plans <span className="text-sm font-normal text-muted-foreground">(For Sellers)</span>
          </h3>
          <p className="mx-auto mb-8 max-w-lg text-center text-muted-foreground">
            Grow your business on RUSHNG. Sellers pay for advertising and premium features
            to reach more customers and boost sales.
          </p>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {sellerPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <Card
                  className={`relative h-full border-0 shadow-sm transition-all hover:-translate-y-1 ${
                    plan.popular
                      ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/10'
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-rush border-0 text-white px-4 py-1">
                        <Star className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h4 className="mb-1 text-lg font-bold">{plan.name}</h4>
                    <p className="mb-4 text-3xl font-extrabold">
                      {plan.price === 0 ? (
                        'Free'
                      ) : (
                        <>
                          &#8358;{plan.price.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{plan.period.includes('month') ? 'mo' : ''}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mb-4 text-xs text-muted-foreground">{plan.period}</p>
                    <Separator className="mb-4" />
                    <ul className="mb-6 space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'gradient-rush border-0 text-white'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => setView('merchant-signup')}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="border-0 bg-orange-50 shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center md:flex-row md:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-800">
                  Our Pricing Philosophy: Sellers Pay, Buyers Save
                </p>
                <p className="text-sm text-orange-700">
                  We keep buyer fees minimal (almost invisible) by monetizing through merchant
                  advertising plans and premium features. This way, more people use RUSHNG, which
                  benefits sellers with more customers.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
