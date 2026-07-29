'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  ArrowRight,
  Mail,
  Phone,
  Lock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FieldErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm_password?: string;
}

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: 'Password strength', color: 'text-muted-foreground' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strengthMap = [
    { label: 'Very Weak', color: 'text-red-500' },
    { label: 'Weak password', color: 'text-red-400' },
    { label: 'Fair password', color: 'text-orange-500' },
    { label: 'Good password', color: 'text-amber-500' },
    { label: 'Strong password', color: 'text-emerald-500' },
  ];

  return {
    score,
    label: strengthMap[score].label,
    color: strengthMap[score].color,
  };
};

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'customer',
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Please enter your full name';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Enter a valid Nigerian number (e.g., 08012345678)';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Must contain uppercase, lowercase, and a number';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors in the form');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const success = await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (success) {
        toast.success('Account created! 🎉');
        router.push('/verify');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-sm font-semibold">
          Full Name
        </Label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="full_name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            onFocus={() => setFocusedField('full_name')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            aria-invalid={!!fieldErrors.full_name}
            className={`h-12 pl-10 transition-all focus-visible:ring-primary focus-visible:ring-2 ${
              fieldErrors.full_name ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
        </div>
        {fieldErrors.full_name && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.full_name}
          </motion.p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email Address
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="email"
            type="email"
            placeholder="name@domain.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            aria-invalid={!!fieldErrors.email}
            className={`h-12 pl-10 transition-all focus-visible:ring-primary focus-visible:ring-2 ${
              fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
        </div>
        {fieldErrors.email && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.email}
          </motion.p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold">
          Phone Number
        </Label>
        <div className="relative group">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="phone"
            type="tel"
            placeholder="08012345678"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            aria-invalid={!!fieldErrors.phone}
            className={`h-12 pl-10 transition-all focus-visible:ring-primary focus-visible:ring-2 ${
              fieldErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
        </div>
        {fieldErrors.phone && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.phone}
          </motion.p>
        )}
      </div>

      {/* Role Selector Cards */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">I want to:</span>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            role="radio"
            aria-checked={formData.role === 'customer'}
            onClick={() => handleInputChange('role', 'customer')}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
              formData.role === 'customer'
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            }`}
          >
            <div className={`p-2 rounded-lg ${formData.role === 'customer' ? 'bg-primary/20' : 'bg-muted'}`}>
              <User className={`h-6 w-6 ${formData.role === 'customer' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-sm font-semibold mt-2">Hire Services</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              I'm a Customer
            </span>
          </motion.button>

          <motion.button
            type="button"
            role="radio"
            aria-checked={formData.role === 'provider'}
            onClick={() => handleInputChange('role', 'provider')}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
              formData.role === 'provider'
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            }`}
          >
            <div className={`p-2 rounded-lg ${formData.role === 'provider' ? 'bg-primary/20' : 'bg-muted'}`}>
              <Briefcase className={`h-6 w-6 ${formData.role === 'provider' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-sm font-semibold mt-2">Provide Services</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              I'm a Provider
            </span>
          </motion.button>
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            aria-invalid={!!fieldErrors.password}
            className={`h-12 pl-10 pr-12 transition-all focus-visible:ring-primary focus-visible:ring-2 ${
              fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5"
          >
            <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-muted">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 transition-all duration-300 ${
                    passwordStrength.score >= step
                      ? passwordStrength.score <= 1
                        ? 'bg-red-500'
                        : passwordStrength.score === 2
                        ? 'bg-orange-500'
                        : passwordStrength.score === 3
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${passwordStrength.color}`}>
              {passwordStrength.label}
            </span>
          </motion.div>
        )}

        {fieldErrors.password && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.password}
          </motion.p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirm_password" className="text-sm font-semibold">
          Confirm Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={formData.confirm_password}
            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
            onFocus={() => setFocusedField('confirm_password')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            aria-invalid={!!fieldErrors.confirm_password}
            className={`h-12 pl-10 pr-12 transition-all focus-visible:ring-primary focus-visible:ring-2 ${
              fieldErrors.confirm_password ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {fieldErrors.confirm_password && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs font-medium text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.confirm_password}
          </motion.p>
        )}

        {!fieldErrors.confirm_password &&
          formData.confirm_password &&
          formData.password === formData.confirm_password &&
          formData.password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Passwords match ✓</span>
            </motion.div>
          )}
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2"
      >
        <Button
          type="submit"
          className="w-full h-12 gradient-rush text-white font-semibold shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}