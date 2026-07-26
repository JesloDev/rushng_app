'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Smartphone,
  CreditCard,
  Building2,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_PROVIDERS = [
  { id: 'opay', name: 'OPay', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
  { id: 'paystack', name: 'Paystack', icon: CreditCard, color: 'bg-purple-100 text-purple-600' },
  { id: 'flutterwave', name: 'Flutterwave', icon: Building2, color: 'bg-orange-100 text-orange-600' },
];

export default function JobPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState('opay');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchJob();
  }, [jobId, isAuthenticated]);

  const fetchJob = async () => {
    try {
      const response = await jobApi.get(jobId);
      if (response.data.success) {
        setJob(response.data.data.job);
      }
    } catch (error) {
      toast.error('Failed to load job details');
    } fontally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setSubmitting(true);
    try {
      const response = await paymentApi.initialize({
        job_id: jobId,
        provider: selectedProvider,
        payment_method: paymentMethod,
      });

      if (response.data.success) {
        const data = response.data.data;
        toast.success('Payment initialized!');

        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          router.push(`/payments/verify?reference=${data.reference}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment initialization failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-3/4 mb-6 rounded-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Job details could not be found</p>
        <Button variant="link" onClick={() => router.back()} className="mt-2 text-orange-600">
          Go Back
        </Button>
      </div>
    );
  }

  const basePrice = Number(job.final_price || job.estimated_price || 0);
  const platformFee = basePrice * 0.1;
  const providerEarnings = basePrice - platformFee;
  const totalAmount = basePrice + platformFee;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Payment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay for task: <span className="font-medium text-foreground">{job.title}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Summary */}
          <div className="rounded-xl bg-muted/40 p-4 border border-border/40 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Category</span>
              <span className="font-medium">{job.category || 'General'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Provider</span>
              <span className="font-medium">{job.provider?.full_name || 'Assigned Provider'}</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border border-border/60 rounded-xl p-4 bg-background shadow-2xs">
            <h3 className="font-semibold text-sm mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Cost</span>
                <span className="font-medium">₦{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Service Fee (10%)</span>
                <span className="font-medium">₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider Earnings</span>
                <span className="text-emerald-600 font-medium">₦{providerEarnings.toLocaleString()}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center font-bold">
                <span>Total Payable</span>
                <span className="text-orange-500 text-xl">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Provider */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Select Gateway Provider</h3>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Select gateway provider" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${provider.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{provider.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Options */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {['card', 'ussd', 'bank', 'wallet'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-sm transition-all text-left ${
                    paymentMethod === method
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-medium ring-1 ring-orange-500'
                      : 'border-border/60 hover:border-border hover:bg-muted/20'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === method ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground/40'
                    }`}
                  >
                    {paymentMethod === method && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  {method.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Secure Payment Note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-200/60 text-xs text-emerald-800">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your transaction is secured with escrow protection. Funds are safely held until you confirm job completion.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handlePayment}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white h-12 text-base font-semibold shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 mr-1" />
                  Pay ₦{totalAmount.toLocaleString()}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}