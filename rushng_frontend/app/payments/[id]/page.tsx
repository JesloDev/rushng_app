'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { paymentApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Smartphone,
  CreditCard,
  Wallet,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  provider_earnings: number;
  status: string;
  provider: string;
  reference: string;
  created_at: string;
  held_at: string;
  released_at: string;
  job: {
    id: string;
    title: string;
    description: string;
  };
  customer: {
    id: string;
    full_name: string;
    email: string;
  };
  provider_user: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayment();
    }
  }, [paymentId, isAuthenticated]);

  const fetchPayment = async () => {
    try {
      const response = await paymentApi.get(paymentId);
      if (response.data.success) {
        setPayment(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReference = () => {
    if (payment) {
      navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Reference copied!');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { 
        label: 'Pending', 
        color: 'text-yellow-600 bg-yellow-50',
        icon: <Clock className="h-5 w-5" />
      },
      held: { 
        label: 'Held in Escrow', 
        color: 'text-blue-600 bg-blue-50',
        icon: <Clock className="h-5 w-5" />
      },
      released: { 
        label: 'Released', 
        color: 'text-green-600 bg-green-50',
        icon: <CheckCircle2 className="h-5 w-5" />
      },
      refunded: { 
        label: 'Refunded', 
        color: 'text-purple-600 bg-purple-50',
        icon: <ArrowUpRight className="h-5 w-5" />
      },
      failed: { 
        label: 'Failed', 
        color: 'text-red-600 bg-red-50',
        icon: <XCircle className="h-5 w-5" />
      },
      disputed: { 
        label: 'Disputed', 
        color: 'text-orange-600 bg-orange-50',
        icon: <AlertCircle className="h-5 w-5" />
      },
    };
    return configs[status] || { label: status, color: 'text-gray-600 bg-gray-50', icon: null };
  };

  const getProviderInfo = (provider: string) => {
    const providers: Record<string, { name: string; icon: React.ReactNode }> = {
      opay: { 
        name: 'OPay', 
        icon: <Smartphone className="h-6 w-6" />
      },
      paystack: { 
        name: 'Paystack', 
        icon: <CreditCard className="h-6 w-6" />
      },
      flutterwave: { 
        name: 'Flutterwave', 
        icon: <Building2 className="h-6 w-6" />
      },
    };
    return providers[provider] || { name: provider, icon: <Wallet className="h-6 w-6" /> };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-muted-foreground">Payment not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payment.status);
  const providerInfo = getProviderInfo(payment.provider);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-sm text-muted-foreground">
              Transaction reference: {payment.reference}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Receipt
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-3 ${statusConfig.color}`}>
                {statusConfig.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{statusConfig.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold text-orange-500">
                ₦{payment.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Payment Information</h3>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="flex items-center gap-2 font-medium">
                  {providerInfo.icon}
                  {providerInfo.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{payment.reference}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyReference}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">₦{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">₦{payment.platform_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider Earnings</span>
                <span className="font-medium text-green-600">
                  ₦{payment.provider_earnings.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Timeline</h3>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              {payment.held_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Held in Escrow</span>
                  <span className="font-medium">
                    {format(new Date(payment.held_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {payment.released_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released</span>
                  <span className="font-medium text-green-600">
                    {format(new Date(payment.released_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job & Customer Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Related Job</h3>
          <Separator />
          <div className="space-y-2">
            <Link href={`/jobs/${payment.job?.id}`} className="hover:text-orange-500">
              <p className="font-medium">{payment.job?.title || 'Job'}</p>
              <p className="text-sm text-muted-foreground">
                {payment.job?.description || 'No description'}
              </p>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{payment.customer?.full_name}</p>
              <p className="text-sm">{payment.customer?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{payment.provider_user?.full_name}</p>
              <p className="text-sm">{payment.provider_user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {payment.status === 'held' && (
          <Button className="gradient-rush text-white">
            Release Payment
          </Button>
        )}
        {payment.status === 'pending' && (
          <Button className="gradient-rush text-white">
            Complete Payment
          </Button>
        )}
        {payment.status === 'held' && (
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Dispute Payment
          </Button>
        )}
        <Button variant="outline">Contact Support</Button>
      </div>
    </div>
  );
}