'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from localStorage if available
    const storedEmail = localStorage.getItem('verification_email');
    if (storedEmail) {
      setEmail(storedEmail);
    }

    // Start timer for resend
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email || !code) {
      setError('Please enter your email and verification code');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await authApi.verify({ email, code });
      if (response.data.success) {
        setSuccess(true);
        toast.success('Account verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Invalid verification code');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      await authApi.resendVerification({ email });
      toast.success('Verification code resent!');
      setTimer(60);
      setCanResend(false);
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Account Verified! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                Your account has been successfully verified.
                Redirecting to login...
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isSubmitting}
                  className="h-11 text-center text-lg tracking-widest"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700"
                disabled={isSubmitting || code.length < 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Account'
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="text-sm text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin inline" />
                      Resending...
                    </>
                  ) : canResend ? (
                    'Resend verification code'
                  ) : (
                    `Resend in ${timer}s`
                  )}
                </button>
              </div>

              {/* Back to Home */}
              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}