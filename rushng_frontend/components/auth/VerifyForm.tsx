'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Mail, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to manage countdown interval safely
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem('verification_email');
    if (storedEmail) setEmail(storedEmail);

    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const verifyCode = useCallback(async (verificationEmail: string, verificationCode: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.verify({ email: verificationEmail, code: verificationCode });
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
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError('Please enter your email and the 6-digit verification code');
      return;
    }
    verifyCode(email, code);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(cleanValue);
    if (error) setError(null);

    // Auto-trigger verification as soon as 6 digits are typed
    if (cleanValue.length === 6 && email && !loading) {
      verifyCode(email, cleanValue);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide a valid email address to resend the code.');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await authApi.resendVerification({ email });
      toast.success('Verification code resent! Check your email.');
      startTimer();
    } catch (err) {
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 p-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          </div>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Account Verified! 🎉</h3>
        <p className="text-sm text-muted-foreground">Redirecting you to login page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email" className="block text-sm font-semibold">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter the email you used to sign up"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-12 pl-10 transition-all focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Verification Code Input */}
      <div className="space-y-2">
        <Label htmlFor="code" className="block text-sm font-semibold">
          Verification Code
        </Label>
        <div className="relative">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="• • • • • •"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            required
            disabled={loading}
            aria-invalid={!!error}
            className="h-12 pl-10 text-center text-xl tracking-[0.5em] font-mono font-bold transition-all focus-visible:ring-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit security code sent to your inbox.
        </p>
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        className="w-full h-12 gradient-rush text-white font-semibold text-sm shadow-rush hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        disabled={loading || code.length < 6}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying Code...
          </>
        ) : (
          'Verify Account'
        )}
      </Button>

      {/* Resend Action */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed font-semibold inline-flex items-center gap-1 transition-colors"
          >
            {resending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                Resending...
              </>
            ) : canResend ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 inline" />
                Resend code
              </>
            ) : (
              `Resend in ${timer}s`
            )}
          </button>
        </p>
      </div>
    </form>
  );
}