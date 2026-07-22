'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface FieldErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm_password?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'customer',
  });

  // Calculate password strength without array bounds issues
  useEffect(() => {
    if (formData.password) {
      const checkStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const strengthMap = [
          { label: 'Very Weak', color: 'text-red-500' },
          { label: 'Weak password', color: 'text-red-500' },
          { label: 'Fair password', color: 'text-orange-500' },
          { label: 'Good password', color: 'text-amber-500' },
          { label: 'Strong password', color: 'text-emerald-600' },
        ];

        const index = Math.min(score, strengthMap.length - 1);

        return {
          score,
          label: strengthMap[index].label,
          color: strengthMap[index].color,
        };
      };

      setPasswordStrength(checkStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, label: 'Password strength', color: 'text-gray-400' });
    }
  }, [formData.password]);

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
      errors.email = 'Please enter a valid email address (e.g., name@domain.com)';
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Enter a valid Nigerian number (e.g., 08012345678 or +2348012345678)';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
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
      toast.error('Please fix the errors in the form before proceeding.');
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
        toast.success('Account created! Redirecting to verification...');
        router.push('/verify');
      } else {
        toast.error('Registration failed. Please check your details and try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left" noValidate>
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="full_name"
            placeholder="Enter your full name (e.g., John Doe)"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            disabled={loading}
            className={`h-12 rounded-lg border bg-white pl-10 pr-4 outline-none transition-all ${
              fieldErrors.full_name
                ? 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500'
            }`}
          />
        </div>
        {fieldErrors.full_name && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.full_name}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <Label htmlFor="email" className="block text-sm font-semibold text-gray-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address (e.g., name@domain.com)"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={loading}
            className={`h-12 rounded-lg border bg-white pl-10 pr-4 outline-none transition-all ${
              fieldErrors.email
                ? 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500'
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your Nigerian number (e.g., 08012345678)"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={loading}
            className={`h-12 rounded-lg border bg-white pl-10 pr-4 outline-none transition-all ${
              fieldErrors.phone
                ? 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500'
            }`}
          />
        </div>
        {fieldErrors.phone && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.phone}
          </p>
        )}
      </div>

      {/* Role Selector Cards */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold text-gray-700">What are you looking for?</span>
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Card */}
          <button
            type="button"
            onClick={() => handleInputChange('role', 'customer')}
            disabled={loading}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
              formData.role === 'customer'
                ? 'border-orange-500 bg-orange-100/50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <User className="h-6 w-6 text-orange-600 mb-2" />
            <span className="text-sm font-semibold text-gray-900 text-center">Hire Services</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight mt-1">
              I'm a Customer looking for services
            </span>
          </button>

          {/* Provider Card */}
          <button
            type="button"
            onClick={() => handleInputChange('role', 'provider')}
            disabled={loading}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
              formData.role === 'provider'
                ? 'border-orange-500 bg-orange-100/50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="h-6 w-6 text-orange-600 mb-2" />
            <span className="text-sm font-semibold text-gray-900 text-center">Provide Services</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight mt-1">
              I'm a Provider offering services
            </span>
          </button>
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password (minimum 8 characters)"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
            className={`h-12 rounded-lg border bg-white pl-10 pr-12 outline-none transition-all ${
              fieldErrors.password
                ? 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500'
            }`}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* 4-Bar Strength Indicator Meter */}
        <div className="mt-3 flex gap-1 h-1 w-full rounded-full overflow-hidden bg-gray-200">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 transition-colors ${
                passwordStrength.score >= step
                  ? passwordStrength.score <= 1
                    ? 'bg-red-500'
                    : passwordStrength.score === 2
                    ? 'bg-orange-500'
                    : passwordStrength.score === 3
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-normal mt-1 block ${passwordStrength.color}`}>
          {passwordStrength.label || 'Password strength'}
        </span>

        {fieldErrors.password && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password to confirm"
            value={formData.confirm_password}
            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
            disabled={loading}
            className={`h-12 rounded-lg border bg-white pl-10 pr-12 outline-none transition-all ${
              fieldErrors.confirm_password
                ? 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500'
            }`}
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
            aria-pressed={showConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors focus:outline-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {fieldErrors.confirm_password && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.confirm_password}
          </p>
        )}

        {!fieldErrors.confirm_password &&
          formData.confirm_password &&
          formData.password === formData.confirm_password && (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Passwords match ✓</span>
            </div>
          )}
      </div>

      {/* CTA Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-14 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}