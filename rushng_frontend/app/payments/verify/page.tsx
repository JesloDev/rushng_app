'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const status = searchParams.get('status');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setVerifying(false);
      setSuccess(false);
      setMessage('No payment reference provided');
    }
  }, [reference]);

  const verifyPayment = async () => {
    setVerifying(true);
    try {
      const response = await paymentApi.verify({ reference });
      if (response.data.success) {
        setSuccess(true);
        setPaymentData(response.data.data);
        setMessage('Payment verified successfully!');
        toast.success('Payment verified!');
      } else {
        setSuccess(false);
        setMessage(response.data.message || 'Payment verification failed');
      }
    } catch (error: any) {
      setSuccess(false);
      setMessage(error.response?.data?.error || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            {success ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p className="font-mono text-sm">{reference}</p>
                  {paymentData && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-semibold">₦{paymentData.amount?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {paymentData?.booking_id && (
                    <Link href={`/jobs/${paymentData.booking_id}`}>
                      <Button className="w-full">View Job</Button>
                    </Link>
                  )}
                  <Link href="/payments">
                    <Button variant="outline" className="w-full">
                      View Payment History
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full">
                      Go Home
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-4">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.back()}
                    className="w-full gradient-rush text-white"
                  >
                    Try Again
                  </Button>
                  <Link href="/payments">
                    <Button variant="outline" className="w-full">
                      View Payment History
                    </Button>
                  </Link>
                  <Link href="/support">
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
    </div>
  );
}