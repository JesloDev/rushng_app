'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PaymentData {
  id?: string;
  reference?: string;
  amount?: number;
  booking_id?: string;
  job_id?: string;
  status?: string;
}

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const verifyPayment = useCallback(async (ref: string) => {
    setVerifying(true);
    try {
      const response = await paymentApi.verify({ reference: ref });
      if (response.data?.success) {
        setSuccess(true);
        setPaymentData(response.data.data);
        setMessage('Payment verified successfully!');
        toast.success('Payment verified!');
      } else {
        setSuccess(false);
        setMessage(response.data?.message || 'Payment verification failed');
      }
    } catch (error: unknown) {
      setSuccess(false);
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      setMessage(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Payment verification failed'
      );
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setVerifying(false);
      setSuccess(false);
      setMessage('No payment reference provided in URL');
    }
  }, [reference, verifyPayment]);

  if (verifying) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we confirm your transaction with the provider...
          </p>
        </CardContent>
      </Card>
    );
  }

  const linkedJobId = paymentData?.booking_id || paymentData?.job_id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardContent className="p-8 text-center">
          {success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Payment Reference</p>
                  <p className="font-mono text-xs md:text-sm font-semibold">{reference}</p>
                </div>
                {paymentData?.amount !== undefined && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-semibold text-orange-500">
                        ₦{paymentData.amount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {linkedJobId && (
                  <Link href={`/jobs/${linkedJobId}`} className="w-full">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      View Job Details
                    </Button>
                  </Link>
                )}
                <Link href="/payments" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Payment History
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 dark:bg-red-950/40 p-4">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={() => router.back()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Try Again
                </Button>
                <Link href="/payments" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Payment History
                  </Button>
                </Link>
                <Link href="/support" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading</h2>
            </CardContent>
          </Card>
        }
      >
        <PaymentVerifyContent />
      </Suspense>
    </div>
  );
}