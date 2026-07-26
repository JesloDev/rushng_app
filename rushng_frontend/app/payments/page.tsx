'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { paymentApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle, // Fixed missing import
  Download,
  Eye,
  Plus,
  Building2,
  Smartphone,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  provider_earnings: number;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed' | 'disputed' | string;
  provider: string;
  reference: string;
  created_at: string;
  job?: {
    id: string;
    title: string;
  };
}

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    released: 0,
    pending: 0,
    total_amount: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const fetchPayments = async () => {
    try {
      const response = await paymentApi.me();
      if (response.data.success) {
        const data: Payment[] = response.data.data.payments || [];
        setPayments(data);
        setStats({
          total: data.length,
          released: data.filter((p) => p.status === 'released').length,
          pending: data.filter((p) => p.status === 'held' || p.status === 'pending').length,
          total_amount: data.reduce((sum, p) => sum + p.amount, 0),
        });
      }
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    if (activeTab === 'all') return payments;
    if (activeTab === 'held') return payments.filter((p) => p.status === 'held' || p.status === 'pending');
    return payments.filter((p) => p.status === activeTab);
  }, [payments, activeTab]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { 
        label: 'Pending', 
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="h-3 w-3" />
      },
      held: { 
        label: 'Held in Escrow', 
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Clock className="h-3 w-3" />
      },
      released: { 
        label: 'Released', 
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      refunded: { 
        label: 'Refunded', 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <ArrowUpRight className="h-3 w-3" />
      },
      failed: { 
        label: 'Failed', 
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="h-3 w-3" />
      },
      disputed: { 
        label: 'Disputed', 
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: <AlertCircle className="h-3 w-3" />
      },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: null };
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'opay':
        return <Smartphone className="h-5 w-5" />;
      case 'paystack':
        return <CreditCard className="h-5 w-5" />;
      case 'flutterwave':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      opay: 'OPay',
      paystack: 'Paystack',
      flutterwave: 'Flutterwave',
    };
    return names[provider.toLowerCase()] || provider;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gradient-rush text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 p-3 text-blue-600 dark:text-blue-400">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-green-500">
                  ₦{stats.total_amount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-3 text-green-600 dark:text-green-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="text-3xl font-bold text-green-500">{stats.released}</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-3 text-green-600 dark:text-green-400">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending / Held</p>
                <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
              </div>
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-3 text-orange-600 dark:text-orange-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:border-orange-300 transition">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-2 text-orange-600 dark:text-orange-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">OPay</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
              <Badge className="ml-auto bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 hover:border-orange-300 transition opacity-50">
              <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2 text-gray-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Paystack</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Connect
              </Button>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 hover:border-orange-300 transition opacity-50">
              <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2 text-gray-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Flutterwave</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="released">Released</TabsTrigger>
              <TabsTrigger value="held">Held</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => {
                    const status = getStatusBadge(payment.status);
                    return (
                      <Link href={`/payments/${payment.id}`} key={payment.id} className="block">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 rounded-lg border p-4 hover:shadow-md transition">
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                              {getProviderIcon(payment.provider)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {payment.job?.title || 'Payment'}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>{getProviderName(payment.provider)}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-xs">
                                  Ref: {payment.reference ? `${payment.reference.slice(0, 12)}...` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-left md:text-right">
                              <p className="font-semibold text-orange-500">
                                ₦{payment.amount.toLocaleString()}
                              </p>
                              <Badge className={`gap-1 ${status.className}`}>
                                {status.icon}
                                {status.label}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}