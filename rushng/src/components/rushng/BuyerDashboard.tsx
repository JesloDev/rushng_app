'use client';

import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Clock,
  MapPin,
  Star,
  ShoppingBag,
  CreditCard,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Truck,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function BuyerDashboard() {
  const { user, setView } = useAppStore();
  const { logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await api.getBookings();
      if (response.success) {
        const data = response.data.bookings || [];
        setBookings(data);
        setStats({
          totalOrders: data.length,
          activeOrders: data.filter((b: any) => b.status !== 'completed' && b.status !== 'cancelled').length,
          completedOrders: data.filter((b: any) => b.status === 'completed').length,
          totalSpent: data.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
        });
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setView('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setView('booking')} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Book Now
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'from-blue-500 to-cyan-600' },
            { title: 'Active Orders', value: stats.activeOrders, icon: Clock, color: 'from-orange-500 to-amber-600' },
            { title: 'Completed', value: stats.completedOrders, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
            { title: 'Total Spent', value: `₦${stats.totalSpent.toLocaleString()}`, icon: CreditCard, color: 'from-purple-500 to-violet-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button onClick={() => setView('booking')} variant="outline" className="mt-4">
                  Make Your First Booking
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                        <Package className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.service_type?.name || 'Service'}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.pickup_address}</span>
                          <span>→</span>
                          <span>{booking.dropoff_address}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <p className="mt-1 font-semibold">₦{booking.total_price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import missing icon
import { CheckCircle2 } from 'lucide-react';