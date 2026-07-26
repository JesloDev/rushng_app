'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
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
  held_at?: string;
  released_at?: string;
  job?: {
    id: string;
    title: string;
    description: string;
  };
  customer?: {
    id: string;
    full_name: string;
    email: string;
  };
  provider_user?: {
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
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayment = useCallback(async () => {
    try {
      const response = await paymentApi.get(paymentId);
      if (response.data?.success) {
        setPayment(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (isAuthenticated && paymentId) {
      fetchPayment();
    }
  }, [paymentId, isAuthenticated, fetchPayment]);

  const handleCopyReference = () => {
    if (payment?.reference) {
      navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Reference copied!');
    }
  };

  const handleReleasePayment = async () => {
    if (!payment) return;
    setActionLoading(true);
    try {
      await paymentApi.release(payment.id);
      toast.success('Payment released from escrow');
      fetchPayment();
    } catch (error) {
      toast.error('Failed to release payment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: {
        label: 'Pending',
        color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
        icon: <Clock className="h-5 w-5" />,
      },
      held: {
        label: 'Held in Escrow',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
        icon: <Clock className="h-5 w-5" />,
      },
      released: {
        label: 'Released',
        color: 'text-green-600 bg-green-50 dark:bg-green-950/30',
        icon: <CheckCircle2 className="h-5 w-5" />,
      },
      refunded: {
        label: 'Refunded',
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
        icon: <ArrowUpRight className="h-5 w-5" />,
      },
      failed: {
        label: 'Failed',
        color: 'text-red-600 bg-red-50 dark:bg-red-950/30',
        icon: <XCircle className="h-5 w-5" />,
      },
      disputed: {
        label: 'Disputed',
        color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
        icon: <AlertCircle className="h-5 w-5" />,
      },
    };
    return configs[status] || { label: status, color: 'text-gray-600 bg-gray-50', icon: null };
  };

  const getProviderInfo = (provider: string) => {
    const providers: Record<string, { name: string; icon: React.ReactNode }> = {
      opay: {
        name: 'OPay',
        icon: <Smartphone className="h-5 w-5 text-green-500" />,
      },
      paystack: {
        name: 'Paystack',
        icon: <CreditCard className="h-5 w-5 text-blue-500" />,
      },
      flutterwave: {
        name: 'Flutterwave',
        icon: <Building2 className="h-5 w-5 text-yellow-500" />,
      },
    };
    return providers[provider.toLowerCase()] || { name: provider, icon: <Wallet className="h-5 w-5" /> };
  };

  const safeFormat = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid Date';
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Payment details not found</p>
        <Button variant="link" onClick={() => router.back()} className="mt-2">
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-mono">
              Ref: {payment.reference}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 text-xs md:text-sm">
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
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{statusConfig.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                ₦{payment.amount?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-sm md:text-base">Payment Breakout</h3>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider</span>
                <span className="flex items-center gap-2 font-medium">
                  {providerInfo.icon}
                  {providerInfo.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs">{payment.reference}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyReference}
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₦{payment.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">₦{payment.platform_fee?.toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider Net</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₦{payment.provider_earnings?.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-sm md:text-base">Escrow Timeline</h3>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{safeFormat(payment.created_at)}</span>
              </div>
              {payment.held_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Held in Escrow</span>
                  <span className="font-medium">{safeFormat(payment.held_at)}</span>
                </div>
              )}
              {payment.released_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {safeFormat(payment.released_at)}
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
          <h3 className="font-semibold text-sm md:text-base">Related Engagement</h3>
          <Separator />
          {payment.job ? (
            <Link href={`/jobs/${payment.job.id}`} className="block group">
              <p className="font-medium group-hover:text-orange-500 transition-colors">
                {payment.job.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {payment.job.description}
              </p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No linked job records found</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-medium mt-0.5">{payment.customer?.full_name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{payment.customer?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logistics Provider</p>
              <p className="font-medium mt-0.5">{payment.provider_user?.full_name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{payment.provider_user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {payment.status === 'held' && (
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleReleasePayment}
            disabled={actionLoading}
          >
            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Release Payment
          </Button>
        )}
        {payment.status === 'held' && (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Dispute Payment
          </Button>
        )}
        <Button variant="outline">Contact Support</Button>
      </div>
    </div>
  );
}