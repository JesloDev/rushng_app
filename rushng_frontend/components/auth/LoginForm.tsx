'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function LoginForm() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      const res = await login(formData.email, formData.password, formData.remember);
      toast.success('Welcome back! 🎉');
      
      const redirectPath = res?.user?.role === 'provider' ? '/dashboard/provider' : '/dashboard';
      router.push(redirectPath);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Invalid email or password. Please try again.';
      setError(message);
      toast.error('Authentication failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            className="h-12 pl-10 transition-all focus-visible:ring-primary focus-visible:ring-2"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <Link
            href="/reset-password"
            className="text-sm text-primary hover:underline font-medium transition-colors hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
            className="h-12 pl-10 pr-12 transition-all focus-visible:ring-primary focus-visible:ring-2"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={formData.remember}
          onCheckedChange={(checked) => setFormData({ ...formData, remember: Boolean(checked) })}
          className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground select-none">
          Keep me logged in
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 gradient-rush text-white font-semibold shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline transition-colors">
          Create one now
        </Link>
      </p>
    </form>
  );
}