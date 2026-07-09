'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const { login, loginLoading, error, clearError } = useAuth();
  const { setView, isAuthenticated, getDefaultDashboard } = useAppStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const defaultView = getDefaultDashboard();
      setView(defaultView);
    }
  }, [isAuthenticated, getDefaultDashboard, setView]);

  const getFieldError = (field: string) => {
    if (error?.field === field) return error.message;
    if (touched[field as keyof typeof touched]) {
      if (field === 'email' && !formData.email) return 'Email is required';
      if (field === 'password' && !formData.password) return 'Password is required';
      if (field === 'password' && formData.password && formData.password.length < 8) {
        return 'Password must be at least 8 characters';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const success = await login(formData.email, formData.password);
    if (success) {
      const defaultView = getDefaultDashboard();
      setView(defaultView);
    }
  };

  const isFormValid = formData.email && formData.password && formData.password.length >= 8;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Button
          variant="ghost"
          onClick={() => setView('home')}
          className="mb-6 hover:bg-orange-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Login to your RUSHNG account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && !error.field && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (error?.field === 'email' && clearError) clearError();
                    }}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    className={getFieldError('email') ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (error?.field === 'password' && clearError) clearError();
                      }}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className={getFieldError('password') ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('password')}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading || !isFormValid}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}