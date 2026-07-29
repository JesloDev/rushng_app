'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Package, Truck, Wallet, Clock, Plus, ArrowRight, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { jobApi } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface DeliveryItem {
  id: string;
  trackingCode: string;
  pickup: string;
  dropoff: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  amount: number;
  provider?: {
    name: string;
    avatar?: string;
  };
  estimatedTime?: string;
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeDeliveries: 0,
    walletBalance: 0,
    completedOrders: 0,
    savings: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryItem[]>([]);
  const [weeklySpending, setWeeklySpending] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API
      const [statsRes, deliveriesRes, spendingRes] = await Promise.all([
        jobApi.getCustomerStats(),
        jobApi.getRecentDeliveries(),
        jobApi.getWeeklySpending(),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (deliveriesRes.data?.success) {
        setRecentDeliveries(deliveriesRes.data.data);
      }
      if (spendingRes.data?.success) {
        setWeeklySpending(spendingRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    pending: 'Pending',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 p-6 md:p-8 text-white"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
            </h2>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Service available in your area
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Quick dispatch in 5-15 min
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-white text-orange-600 hover:bg-white/90 font-semibold">
              <Link href="/jobs/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Book Delivery
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={Truck}
          color="orange"
          trend={{ value: stats.activeDeliveries > 0 ? 1 : 0, label: 'in transit now' }}
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
      </motion.div>

      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Bookings
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <Link href="/jobs/my">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium">No active deliveries</p>
                  <p className="text-xs mt-1">Book your first delivery now!</p>
                  <Button asChild variant="gradient" size="sm" className="mt-4">
                    <Link href="/jobs/new">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Book Now
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDeliveries.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="hidden sm:block">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 text-primary text-xs font-bold">
                              {item.provider?.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-primary">#{item.trackingCode}</span>
                            <Badge variant="outline" className={statusColors[item.status]}>
                              {statusLabels[item.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {item.pickup} → {item.dropoff}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="font-bold text-sm block">₦{item.amount.toLocaleString()}</span>
                      </div>
                    </motion.div>
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
      </motion.div>
    </div>
  );
}