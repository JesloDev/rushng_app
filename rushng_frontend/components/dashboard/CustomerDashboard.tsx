'use client';

import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Package, Truck, Wallet, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface DeliveryItem {
  id: string;
  trackingCode: string;
  pickup: string;
  dropoff: string;
  status: 'pending' | 'in_transit' | 'delivered';
  amount: number;
}

interface CustomerDashboardProps {
  stats?: {
    totalBookings: number;
    activeDeliveries: number;
    walletBalance: number;
    completedOrders: number;
  };
  recentDeliveries?: DeliveryItem[];
  weeklySpending?: { label: string; value: number }[];
}

export function CustomerDashboard({
  stats = {
    totalBookings: 24,
    activeDeliveries: 2,
    walletBalance: 18500,
    completedOrders: 22,
  },
  recentDeliveries = [],
  weeklySpending = [
    { label: 'Mon', value: 2500 },
    { label: 'Tue', value: 4000 },
    { label: 'Wed', value: 1500 },
    { label: 'Thu', value: 6000 },
    { label: 'Fri', value: 3500 },
    { label: 'Sat', value: 8000 },
    { label: 'Sun', value: 1000 },
  ],
}: CustomerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-card p-6 border border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Welcome back 👋</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track your ongoing deliveries or book a new dispatch rider instantly.
          </p>
        </div>
        <Button asChild className="gradient-rush text-white shadow-rush font-semibold gap-2 shrink-0">
          <Link href="/dashboard/bookings/new">
            <Plus className="h-4 w-4" />
            Book Delivery
          </Link>
        </Button>
      </div>

      {/* Stats Grid using StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={Truck}
          color="orange"
          trend={{ value: 1, label: 'in transit now' }}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Wallet Balance"
          value={`₦${stats.walletBalance.toLocaleString()}`}
          icon={Wallet}
          color="emerald"
        />
      </div>

      {/* Main Grid: Chart + Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <Link href="/dashboard/bookings">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p>No active deliveries right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDeliveries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/40 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-foreground">#{item.trackingCode}</span>
                        <p className="text-muted-foreground">
                          {item.pickup} → {item.dropoff}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">₦{item.amount.toLocaleString()}</span>
                        <span className="capitalize text-[10px] text-primary font-semibold">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <ChartWidget
            title="Weekly Delivery Spend"
            data={weeklySpending}
            valuePrefix="₦"
          />
        </div>
      </div>
    </div>
  );
}