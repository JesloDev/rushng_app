'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Star,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

const mockOrder = {
  id: 'RSH-2024-0042',
  rider: {
    name: 'Ahmed B.',
    rating: 4.9,
    trips: 1247,
    vehicle: 'Motorcycle',
    plate: 'LAG-ABC-123',
  },
  status: 'in_progress',
  statusSteps: [
    { label: 'Order Placed', time: '10:30 AM', done: true },
    { label: 'Rider Assigned', time: '10:32 AM', done: true },
    { label: 'Picking Up', time: '10:35 AM', done: true },
    { label: 'In Transit', time: '10:50 AM', done: true },
    { label: 'Delivered', time: '', done: false },
  ],
  pickup: 'Shoprite, Ikeja City Mall, Lagos',
  dropoff: '12 Adeola Hopewell St, Victoria Island',
  eta: '15 mins',
  distance: '8.2 km',
  total: 1850,
};

export function TrackOrder() {
  const { setView } = useAppStore();
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(true);

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">
            Enter your tracking ID or order number to see real-time updates
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-10 flex max-w-md gap-2">
          <Input
            placeholder="Enter tracking ID (e.g., RSH-2024-0042)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setIsTracking(true)}
            className="gradient-rush border-0 text-white"
          >
            Track
          </Button>
        </div>

        {isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl space-y-6"
          >
            {/* Map Placeholder */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="map-placeholder relative h-64 md:h-80">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-100/80 to-orange-50/80">
                  <div className="text-center">
                    <Navigation className="mx-auto mb-2 h-10 w-10 animate-pulse text-orange-600" />
                    <p className="text-sm font-medium text-orange-700">Live Map Tracking</p>
                    <p className="text-xs text-orange-600">Rider is on the way</p>
                  </div>
                </div>

                {/* Floating ETA */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="rounded-lg bg-white px-4 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="font-bold">{mockOrder.eta}</p>
                  </div>
                  <div className="rounded-lg bg-white px-4 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-bold">{mockOrder.distance}</p>
                  </div>
                  <div className="rounded-lg bg-white px-4 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold">&#8358;{mockOrder.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rider Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xl font-bold">
                    {mockOrder.rider.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{mockOrder.rider.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {mockOrder.rider.rating} <Star className="inline h-3 w-3 ml-0.5" fill="currentColor" />
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mockOrder.rider.vehicle} &middot; {mockOrder.rider.plate} &middot; {mockOrder.rider.trips} trips
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-10 w-10">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="flex gap-4 rounded-xl bg-muted/50 p-5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="h-full w-0.5 bg-orange-300" />
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-xs font-medium text-orange-600">PICKUP</p>
                  <p className="text-sm">{mockOrder.pickup}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600">DROPOFF</p>
                  <p className="text-sm">{mockOrder.dropoff}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-4 font-semibold">Order Status</h3>
                <div className="space-y-4">
                  {mockOrder.statusSteps.map((step, idx) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            step.done
                              ? 'bg-orange-500 text-white'
                              : 'border-2 border-muted-foreground/20 bg-white'
                          }`}
                        >
                          {step.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        {idx < mockOrder.statusSteps.length - 1 && (
                          <div
                            className={`h-8 w-0.5 ${
                              step.done ? 'bg-orange-500' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      <div className="-mt-1">
                        <p
                          className={`text-sm font-medium ${
                            step.done ? '' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order ID */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Order ID: {mockOrder.id}
              </p>
              <Button
                variant="link"
                className="text-xs"
                onClick={() => {
                  setIsTracking(false);
                  setView('home');
                }}
              >
                Back to Home <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
