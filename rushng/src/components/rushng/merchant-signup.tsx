'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Store, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MerchantSignup() {
  const { setView, user, isAuthenticated } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    category: false,
    address: false,
    phone: false,
    email: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill email from user profile
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        return value.trim().length < 2 ? 'Store name must be at least 2 characters' : '';
      case 'category':
        return !value ? 'Please select a category' : '';
      case 'address':
        return value.trim().length < 5 ? 'Please enter a valid address' : '';
      case 'phone':
        return !/^(\+234|0)[789][01]\d{8}$/.test(value) ? 'Enter a valid Nigerian phone number' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Enter a valid email address' : '';
      default:
        return '';
    }
  };

  const getFieldError = (field: string): string => {
    if (errors[field]) return errors[field];
    if (touched[field as keyof typeof touched]) {
      return validateField(field, formData[field as keyof typeof formData] as string);
    }
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    if (error) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const allTouched = {
      name: true,
      category: true,
      address: true,
      phone: true,
      email: true,
    };
    setTouched(allTouched);
    
    const newErrors: Record<string, string> = {};
    Object.keys(allTouched).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix all errors before continuing');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login first');
      setView('login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.registerMerchant(formData);
      if (response.success) {
        setSuccess(true);
        toast.success('🎉 Merchant account created successfully!', {
          description: 'Your store is now live! Start adding products.',
        });
        setTimeout(() => {
          setView('merchant-dashboard');
        }, 2500);
      } else {
        toast.error(response.message || 'Failed to create merchant account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create merchant account');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.name &&
    formData.category &&
    formData.address &&
    formData.phone &&
    /^(\+234|0)[789][01]\d{8}$/.test(formData.phone) &&
    formData.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container max-w-2xl mx-auto px-4">
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
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Store className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Open Your Store</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create your merchant account and start selling on RUSHNG
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-medium">Store created successfully!</p>
                      <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isAuthenticated && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Please login first</p>
                    <p className="text-sm text-orange-700">
                      You need to be logged in to create a merchant account.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => setView('login')}
                    >
                      Login
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mama Nkechi's Kitchen"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={getFieldError('name') ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                    disabled={loading}
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleFieldChange('category', val)}
                    disabled={loading}
                  >
                    <SelectTrigger className={getFieldError('category') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Grocery">Grocery Store</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Fashion">Fashion & Clothing</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Supermarket">Supermarket</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Books">Books & Stationery</SelectItem>
                      <SelectItem value="General">General Store</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('category') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('category')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers what your store offers..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.description?.length || 0}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="address">Store Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 45 Allen Avenue, Ikeja, Lagos"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    className={getFieldError('address') ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                    disabled={loading}
                  />
                  {getFieldError('address') && (
                    <p className="mt-1 text-sm text-red-500">{getFieldError('address')}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={getFieldError('phone') ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                      disabled={loading}
                    />
                    {getFieldError('phone') && (
                      <p className="mt-1 text-sm text-red-500">{getFieldError('phone')}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="store@email.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={getFieldError('email') ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                      disabled={loading}
                    />
                    {getFieldError('email') && (
                      <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://yourstore.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800">Free Plan</p>
                      <ul className="mt-1 space-y-1 text-sm text-orange-700">
                        <li>• Up to 5 products</li>
                        <li>• Basic store page with RUSHNG subdomain</li>
                        <li>• Standard analytics dashboard</li>
                        <li>• Upgrade anytime to unlock more features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isFormValid || !isAuthenticated}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Store...
                    </>
                  ) : (
                    'Create Store'
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-muted-foreground">
                    Already have a RUSHNG account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-orange-600 hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}