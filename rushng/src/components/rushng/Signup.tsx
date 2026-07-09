'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function Signup() {
  const { register, registerLoading, error, clearError } = useAuth();
  const { setView } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(3);

  useEffect(() => {
    clearError();
  }, []);

  // Countdown timer for redirect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (registrationSuccess) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setView('login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [registrationSuccess, setView]);

  const getFieldError = (field: string) => {
    if (error?.field === field) return error.message;
    if (touched[field as keyof typeof touched]) {
      if (field === 'name' && !formData.name) return 'Full name is required';
      if (field === 'email' && !formData.email) return 'Email is required';
      if (field === 'email' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return 'Please enter a valid email address';
      }
      if (field === 'phone' && !formData.phone) return 'Phone number is required';
      if (field === 'phone' && formData.phone && !/^(\+234|0)[789][01]\d{8}$/.test(formData.phone)) {
        return 'Enter a valid Nigerian phone number';
      }
      if (field === 'password' && !formData.password) return 'Password is required';
      if (field === 'password' && formData.password && formData.password.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (field === 'confirmPassword' && formData.confirmPassword !== formData.password) {
        return 'Passwords do not match';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    });

    if (success) {
      setRegistrationSuccess(true);
      toast.success('🎉 Account created successfully!', {
        description: 'Please check your email to verify your account.',
        duration: 5000,
      });
    }
  };

  const isFormValid = 
    formData.name &&
    formData.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.phone &&
    /^(\+234|0)[789][01]\d{8}$/.test(formData.phone) &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.confirmPassword === formData.password;

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent className="pt-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold">Registration Successful! 🎉</h2>
                <p className="text-muted-foreground">
                  Your account has been created successfully.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formData.role === 'merchant' 
                    ? 'You can now login and create your merchant store.'
                    : 'You can now login to start using RUSHNG.'}
                </p>
                <div className="mt-6 rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
                  <p>
                    Redirecting to login page in <strong>{redirectTimer}</strong> second{redirectTimer !== 1 ? 's' : ''}...
                  </p>
                </div>
                <Button 
                  onClick={() => setView('login')} 
                  className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  Login Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Join RUSHNG today
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (error?.field === 'name') clearError();
                    }}
                    onBlur={() => setTouched({ ...touched, name: true })}
                    className={getFieldError('name') ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (error?.field === 'email') clearError();
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (error?.field === 'phone') clearError();
                    }}
                    onBlur={() => setTouched({ ...touched, phone: true })}
                    className={getFieldError('phone') ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('phone') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('phone')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="role">Sign up as</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer (Get Services)</SelectItem>
                      <SelectItem value="merchant">Merchant (Sell Services)</SelectItem>
                      <SelectItem value="rider">Rider (Deliver Services)</SelectItem>
                    </SelectContent>
                  </Select>
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
                        if (error?.field === 'password') clearError();
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

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (error?.field === 'confirmPassword') clearError();
                      }}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      className={getFieldError('confirmPassword') ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {getFieldError('confirmPassword') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('confirmPassword')}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={registerLoading || !isFormValid}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Login
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