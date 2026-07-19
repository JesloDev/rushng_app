'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'customer',
  });

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
          { label: 'Weak', color: 'text-orange-500' },
          { label: 'Medium', color: 'text-yellow-500' },
          { label: 'Strong', color: 'text-green-500' },
          { label: 'Very Strong', color: 'text-emerald-500' },
        ];
        return {
          score,
          label: strengthMap[score].label,
          color: strengthMap[score].color,
        };
      };
      setPasswordStrength(checkStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const success = await register({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    });

    if (success) {
      router.push('/verify');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          placeholder="John Doe"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+2348012345678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">I want to...</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
          disabled={loading}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Hire Services (Customer)</SelectItem>
            <SelectItem value="provider">Provide Services (Provider)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
            className="h-11 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.password && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  passwordStrength.score <= 1 ? 'bg-red-500' :
                  passwordStrength.score === 2 ? 'bg-yellow-500' :
                  passwordStrength.score === 3 ? 'bg-green-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
              />
            </div>
            <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Minimum 8 characters with letters and numbers</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            required
            disabled={loading}
            className="h-11 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirm_password && formData.password === formData.confirm_password && (
          <p className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Passwords match
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}