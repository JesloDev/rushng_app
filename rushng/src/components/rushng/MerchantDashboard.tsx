'use client';

import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  Settings,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Plus,
  RefreshCw,
  Store,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function MerchantDashboard() {
  const { setView, user } = useAppStore();
  const { logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getMerchantDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleLogout = async () => {
    await logout();
    setView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-12 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-8 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₦${dashboardData?.stats?.total_revenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'Total Orders',
      value: dashboardData?.stats?.total_orders || 0,
      change: '+8.2%',
      trend: 'up' as const,
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: 'Store Views',
      value: dashboardData?.stats?.total_views || 0,
      change: '+5.1%',
      trend: 'up' as const,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      title: 'Rating',
      value: dashboardData?.merchant?.rating || 0,
      change: '+0.2',
      trend: 'up' as const,
      icon: <Star className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {dashboardData?.merchant?.name || user?.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setView('merchant-builder')}
              className="gap-2"
            >
              <Store className="h-4 w-4" />
              Manage Store
            </Button>
            <Button
              onClick={() => setView('merchant-builder')}
              className="gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-700">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Store className="mr-1 h-3 w-3" />
            Plan: {dashboardData?.merchant?.plan || 'Free'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Star className="mr-1 h-3 w-3" />
            Rating: {dashboardData?.merchant?.rating || 0} ★
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Package className="mr-1 h-3 w-3" />
            Products: {dashboardData?.stats?.total_products || 0}
          </Badge>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600`}>
                      {stat.icon}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`gap-1 text-xs ${
                        stat.trend === 'up'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </Badge>
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

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_orders?.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.recent_orders?.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                              {order.customer?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{order.customer || 'Guest'}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.id.slice(0, 8)} &middot; {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'in_progress' ? 'secondary' :
                              order.status === 'pending' ? 'outline' : 'destructive'
                            }
                            className={
                              order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''
                            }
                          >
                            {order.status}
                          </Badge>
                          <span className="text-sm font-semibold">
                            ₦{order.total_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Top Products</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('merchant-builder')}
                  className="gap-1"
                >
                  Manage Products
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardData?.top_products?.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No products sold yet</p>
                    <Button onClick={() => setView('merchant-builder')} variant="outline" className="mt-4">
                      Add Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.top_products?.map((product: any, idx: number) => (
                      <div
                        key={product.name}
                        className="flex items-center gap-4 rounded-lg border border-border/50 p-4"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.total_sold || 0} sold
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          ₦{product.price?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                      const values = [65, 72, 58, 85, 92, 78];
                      return (
                        <div key={month} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{month} 2024</span>
                            <span className="font-medium">
                              ₦{(values[idx] * 27000).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={values[idx]} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Store Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">98.5%</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Fulfillment Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500">4.8/5</div>
                      <p className="mt-1 text-sm text-muted-foreground">Customer Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white text-2xl font-bold">
                      {dashboardData?.merchant?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold">{dashboardData?.merchant?.name || 'My Store'}</p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData?.merchant?.category || 'General Store'}
                      </p>
                      <Badge className="mt-1">
                        {dashboardData?.merchant?.plan === 'premium'
                          ? 'Premium Plan'
                          : dashboardData?.merchant?.plan === 'basic'
                          ? 'Basic Plan'
                          : 'Free Plan'}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <Button
                    variant="outline"
                    onClick={() => setView('merchant-builder')}
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Store Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Store URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Share your store</p>
                    <p className="mt-2 font-mono text-sm">
                      rushng.com/store/{dashboardData?.merchant?.slug || 'my-store'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Globe className="mr-2 h-4 w-4" />
                      View Store Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}