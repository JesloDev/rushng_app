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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  useEffect(() => {
    clearError();
  }, []);

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

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthMap = [
      { label: 'Very Weak', color: 'text-red-500' },
      { label: 'Weak', color: 'text-orange-500' },
      { label: 'Medium', color: 'text-yellow-500' },
      { label: 'Strong', color: 'text-green-500' },
      { label: 'Very Strong', color: 'text-emerald-500' },
    ];

    return {
      score,
      label: strengthMap[score].label,
      color: strengthMap[score].color,
      width: (score / 4) * 100,
    };
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, label: '', color: '', width: 0 });
    }
  }, [formData.password]);

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
      return;
    }

    await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    });
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.width}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${
                            passwordStrength.score <= 1 ? 'bg-red-500' :
                            passwordStrength.score === 2 ? 'bg-yellow-500' :
                            passwordStrength.score === 3 ? 'bg-green-500' :
                            'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <p className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  
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
                  {formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Passwords match
                    </p>
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