'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('verification_email');
    if (storedEmail) setEmail(storedEmail);

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
    setLoading(true);

    if (!email || !code) {
      setError('Please enter your email and the 6-digit verification code');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.verify({ email, code });
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Account verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Invalid verification code. Please check and try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await authApi.resendVerification({ email });
      toast.success('Verification code resent! Check your email.');
      setTimer(60);
      setCanResend(false);
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
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Account Verified! 🎉</h3>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter the email you used to sign up"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-12 pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-sm font-medium">Verification Code</Label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="code"
            type="text"
            placeholder="Enter the 6-digit code from your email"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={loading}
            className="h-12 pl-10 text-center text-lg tracking-widest font-mono border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
        <p className="text-xs text-muted-foreground">Check your inbox for the 6-digit verification code</p>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
        disabled={loading || code.length < 6}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Account'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {resending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin inline" />
                Resending...
              </>
            ) : canResend ? (
              'Resend code'
            ) : (
              `Resend in ${timer}s`
            )}
          </button>
        </p>
      </div>
    </form>
  );
}