'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  CheckCircle2,
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
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setSubmitting(true);
    try {
      const response = await paymentApi.initialize({
        job_id: jobId,
        provider: selectedProvider,
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
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const totalAmount = job.final_price || job.estimated_price || 0;
  const platformFee = totalAmount * 0.1;
  const providerEarnings = totalAmount - platformFee;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Payment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay for job: {job.title}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{job.category}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{job.provider?.full_name || 'Not assigned'}</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Cost</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span>₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider Earnings</span>
                <span className="text-green-600">₦{providerEarnings.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-500 text-xl">₦{(totalAmount + platformFee).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold mb-3">Select Payment Provider</h3>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment provider" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {provider.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Options */}
          <div className="grid grid-cols-2 gap-3">
            {['card', 'ussd', 'bank', 'wallet'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition ${
                  paymentMethod === method
                    ? 'border-orange-500 bg-orange-50'
                    : 'hover:border-gray-300'
                }`}
              >
                <div className={`h-3 w-3 rounded-full border ${
                  paymentMethod === method ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`} />
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>

          {/* Secure Payment Note */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Your payment is secure. Funds are held in escrow until job completion.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handlePayment}
              disabled={submitting}
              className="w-full gradient-rush text-white h-12"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay ₦{(totalAmount + platformFee).toLocaleString()}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}