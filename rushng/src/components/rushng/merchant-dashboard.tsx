'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const statsData = [
  {
    title: 'Total Revenue',
    value: '&#8358;2,450,000',
    change: '+12.5%',
    trend: 'up' as const,
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    trend: 'up' as const,
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    title: 'Active Customers',
    value: '892',
    change: '+5.1%',
    trend: 'up' as const,
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: 'Avg Rating',
    value: '4.8',
    change: '+0.2',
    trend: 'up' as const,
    icon: <Star className="h-4 w-4" />,
  },
];

const recentOrders = [
  { id: 'RSH-001', customer: 'Adebayo K.', amount: 4500, status: 'Delivered', time: '2 hrs ago' },
  { id: 'RSH-002', customer: 'Chioma N.', amount: 2800, status: 'In Transit', time: '3 hrs ago' },
  { id: 'RSH-003', customer: 'Emeka O.', amount: 6200, status: 'Pending', time: '4 hrs ago' },
  { id: 'RSH-004', customer: 'Fatima B.', amount: 1500, status: 'Delivered', time: '5 hrs ago' },
  { id: 'RSH-005', customer: 'Ibrahim S.', amount: 3800, status: 'Delivered', time: '6 hrs ago' },
];

const topProducts = [
  { name: 'Jollof Rice Pack', orders: 342, revenue: '&#8358;513,000' },
  { name: 'Assorted Spices', orders: 287, revenue: '&#8358;287,000' },
  { name: 'Frozen Chicken', orders: 234, revenue: '&#8358;702,000' },
  { name: 'Vegetable Basket', orders: 198, revenue: '&#8358;198,000' },
  { name: 'Palm Oil (5L)', orders: 176, revenue: '&#8358;528,000' },
];

export function MerchantDashboard() {
  const { setView, merchantProfile } = useAppStore();
  const storeName = merchantProfile.name || 'My Store';

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {storeName}. Here&apos;s your store overview.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setView('merchant-builder')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              View Store Page
            </Button>
            <Button className="gap-2 gradient-rush border-0 text-white">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.random() * 0.3 }}
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
                          ? 'bg-orange-50 text-orange-700'
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
                    <p className="text-2xl font-bold" dangerouslySetInnerHTML={{ __html: stat.value }} />
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
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

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                            {order.customer
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.id} &middot; {order.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            order.status === 'Delivered'
                              ? 'default'
                              : order.status === 'In Transit'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            order.status === 'Delivered'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                              : ''
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm font-semibold">
                          &#8358;{order.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Top Products</CardTitle>
                <Button variant="outline" size="sm">
                  Manage Products
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
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
                          {product.orders} orders
                        </p>
                      </div>
                      <span
                        className="text-sm font-semibold"
                        dangerouslySetInnerHTML={{ __html: product.revenue }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, idx) => {
                      const values = [65, 72, 58, 85, 92];
                      return (
                        <div key={month} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{month} 2024</span>
                            <span className="font-medium">
                              &#8358;{(values[idx] * 27000).toLocaleString()}
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
                  <CardTitle className="text-base">Order Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Shopping', pct: 45, color: 'bg-orange-500' },
                      { label: 'Errands', pct: 20, color: 'bg-blue-500' },
                      { label: 'Dispatch', pct: 18, color: 'bg-purple-500' },
                      { label: 'Laundry', pct: 12, color: 'bg-rose-500' },
                      { label: 'Others', pct: 5, color: 'bg-gray-400' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${item.color} transition-all`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Store Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">98.5%</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Order Fulfillment Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">4.8/5</div>
                      <p className="mt-1 text-sm text-muted-foreground">Customer Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">23 min</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Avg. Delivery Time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white text-2xl font-bold">
                      {storeName.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold">{storeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {merchantProfile.category || 'General Store'}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {merchantProfile.plan === 'premium'
                          ? 'Premium Plan'
                          : merchantProfile.plan === 'basic'
                          ? 'Basic Plan'
                          : 'Free Plan'}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      {merchantProfile.email || 'Not set'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      {merchantProfile.phone || 'Not set'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Address:</span>{' '}
                      {merchantProfile.address || 'Not set'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setView('merchant-signup')}
                    className="w-full"
                  >
                    Edit Store Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Advertising Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-orange-800">Featured Listing</p>
                        <p className="text-sm text-orange-700">
                          Appear at the top of search results
                        </p>
                      </div>
                      <Badge className="bg-orange-600">Popular</Badge>
                    </div>
                    <p className="mt-2 text-xl font-bold text-orange-800">
                      &#8358;15,000<span className="text-sm font-normal">/month</span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Premium Banner</p>
                        <p className="text-sm text-muted-foreground">
                          Promotional banner on homepage
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xl font-bold">
                      &#8358;25,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send offers directly to users
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xl font-bold">
                      &#8358;10,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}