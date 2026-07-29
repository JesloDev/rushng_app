'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { jobApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  Briefcase, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Home,
  Zap,
  ArrowRight,
  FileText,
  Info,
  Shield,
  ChevronDown,
  Wrench,
  Zap as ZapIcon,
  Hammer,
  PaintBucket,
  Layers,
  BrickWall,
  Flame,
  SprayCan,
  Shirt,
  ShoppingBag,
  Package,
  RotateCw,
  Settings,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const categories = [
  { 
    value: 'plumbing', 
    label: 'Plumbing', 
    icon: Wrench, 
    color: 'bg-blue-500', 
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    hoverBg: 'hover:bg-blue-600'
  },
  { 
    value: 'electrical', 
    label: 'Electrical', 
    icon: ZapIcon, 
    color: 'bg-yellow-500', 
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-700',
    hoverBg: 'hover:bg-yellow-600'
  },
  { 
    value: 'carpentry', 
    label: 'Carpentry', 
    icon: Hammer, 
    color: 'bg-amber-600', 
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-700',
    hoverBg: 'hover:bg-amber-700'
  },
  { 
    value: 'painting', 
    label: 'Painting', 
    icon: PaintBucket, 
    color: 'bg-pink-500', 
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-700',
    hoverBg: 'hover:bg-pink-600'
  },
  { 
    value: 'tiling', 
    label: 'Tiling', 
    icon: Layers, 
    color: 'bg-purple-500', 
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    hoverBg: 'hover:bg-purple-600'
  },
  { 
    value: 'masonry', 
    label: 'Masonry', 
    icon: BrickWall, 
    color: 'bg-gray-600', 
    bgLight: 'bg-gray-50',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-700',
    hoverBg: 'hover:bg-gray-700'
  },
  { 
    value: 'welding', 
    label: 'Welding', 
    icon: Flame, 
    color: 'bg-red-500', 
    bgLight: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    hoverBg: 'hover:bg-red-600'
  },
  { 
    value: 'cleaning', 
    label: 'Cleaning', 
    icon: SprayCan, 
    color: 'bg-emerald-500', 
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-600'
  },
  { 
    value: 'laundry', 
    label: 'Laundry', 
    icon: Shirt, 
    color: 'bg-sky-500', 
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-700',
    hoverBg: 'hover:bg-sky-600'
  },
  { 
    value: 'shopping', 
    label: 'Shopping', 
    icon: ShoppingBag, 
    color: 'bg-rose-500', 
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-700',
    hoverBg: 'hover:bg-rose-600'
  },
  { 
    value: 'errands', 
    label: 'Errands', 
    icon: Package, 
    color: 'bg-indigo-500', 
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-700',
    hoverBg: 'hover:bg-indigo-600'
  },
  { 
    value: 'repair', 
    label: 'Repair', 
    icon: RotateCw, 
    color: 'bg-slate-600', 
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-600',
    textColor: 'text-slate-700',
    hoverBg: 'hover:bg-slate-700'
  },
  { 
    value: 'maintenance', 
    label: 'Maintenance', 
    icon: Settings, 
    color: 'bg-cyan-500', 
    bgLight: 'bg-cyan-50',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-700',
    hoverBg: 'hover:bg-cyan-600'
  },
  { 
    value: 'installation', 
    label: 'Installation', 
    icon: HardDrive, 
    color: 'bg-orange-500', 
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    hoverBg: 'hover:bg-orange-600'
  },
];

const popularCategories = ['plumbing', 'electrical', 'carpentry', 'cleaning'];

export default function PostJobPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.5244,
    lng: 3.3792,
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    address: '',
    city: 'Lagos',
    state: 'Lagos',
    estimated_price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Get geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.category) newErrors.category = 'Please select a service category';
      if (!formData.title?.trim()) newErrors.title = 'Job title is required';
      if (!formData.description?.trim()) newErrors.description = 'Job description is required';
    }

    if (stepNumber === 2) {
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const response = await jobApi.create({
        ...formData,
        estimated_price: formData.estimated_price ? parseFloat(formData.estimated_price) : undefined,
        lat: coords.lat,
        lng: coords.lng,
      });
      
      if (response.data?.success) {
        toast.success('Job posted successfully! 🎉');
        router.push('/jobs/my');
      }
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.value === formData.category);
  const SelectedIcon = selectedCategory?.icon || Briefcase;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50/30 dark:to-orange-950/10 py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 shadow-xl overflow-hidden">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-10" />
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
              
              <CardHeader className="relative z-10 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold">
                        Post a Job
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Describe what service you need and connect with local service providers.
                    </p>
                  </div>
                  <Badge variant="gradient" className="hidden sm:flex">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Quick Post
                  </Badge>
                </div>
              </CardHeader>

              {/* Progress Steps */}
              <div className="relative z-10 px-6 pt-6 pb-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300",
                          step >= s 
                            ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {step > s ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            s
                          )}
                        </div>
                        <span className={cn(
                          "text-xs font-medium hidden sm:block transition-colors",
                          step >= s ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {s === 1 ? 'Details' : s === 2 ? 'Location' : 'Review'}
                        </span>
                      </div>
                      {s < 3 && (
                        <div className={cn(
                          "flex-1 h-0.5 mx-2 transition-all duration-300",
                          step > s ? "bg-gradient-to-r from-orange-500 to-amber-600" : "bg-muted"
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Job Details */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Category Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-orange-500" />
                        Service Category *
                      </Label>
                      
                      {/* Popular Categories Quick Select */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {popularCategories.map((cat) => {
                          const category = categories.find(c => c.value === cat);
                          const Icon = category?.icon || Briefcase;
                          const isSelected = formData.category === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: cat });
                                setErrors({ ...errors, category: '' });
                                setIsOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border-2",
                                isSelected
                                  ? category?.color + " text-white border-transparent shadow-md"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-transparent"
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              {category?.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Colored Dropdown with White Background */}
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsOpen(!isOpen)}
                          className={cn(
                            "w-full h-14 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between",
                            errors.category 
                              ? "border-destructive ring-2 ring-destructive/20" 
                              : selectedCategory 
                                ? `${selectedCategory.color} text-white border-transparent shadow-md` 
                                : "border-input hover:border-primary/50 bg-background",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            {selectedCategory ? (
                              <>
                                <SelectedIcon className="h-5 w-5" />
                                <span className="font-medium">{selectedCategory.label}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Select a category</span>
                            )}
                          </span>
                          <ChevronDown className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isOpen && "rotate-180",
                            selectedCategory ? "text-white/80" : "text-muted-foreground"
                          )} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-white shadow-2xl overflow-hidden"
                            >
                              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                                {categories.map((cat) => {
                                  const Icon = cat.icon;
                                  const isSelected = formData.category === cat.value;
                                  return (
                                    <button
                                      key={cat.value}
                                      type="button"
                                      onClick={() => {
                                        setFormData({ ...formData, category: cat.value });
                                        setErrors({ ...errors, category: '' });
                                        setIsOpen(false);
                                      }}
                                      className={cn(
                                        "w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 group",
                                        isSelected
                                          ? `${cat.color} text-white shadow-md scale-[1.02]`
                                          : `${cat.bgLight} ${cat.textColor} hover:scale-[1.01] border-2 border-transparent hover:border-gray-200`
                                      )}
                                    >
                                      <div className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isSelected 
                                          ? "bg-white/20" 
                                          : "bg-white/80"
                                      )}>
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <span className="flex-1 text-left font-medium">{cat.label}</span>
                                      {isSelected && (
                                        <CheckCircle2 className="h-5 w-5 text-white/80" />
                                      )}
                                      {!isSelected && (
                                        <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {errors.category && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Fix leaking pipe in kitchen"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          setErrors({ ...errors, title: '' });
                        }}
                        className={cn(
                          "h-12 transition-all",
                          errors.title && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.title && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the job details, requirements, and timing..."
                        rows={5}
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          setErrors({ ...errors, description: '' });
                        }}
                        className={cn(
                          "resize-none transition-all",
                          errors.description && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Provide as much detail as possible</span>
                        <span>{formData.description.length} characters</span>
                      </div>
                      {errors.description && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Estimated Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="estimated_price" className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        Estimated Budget (₦)
                      </Label>
                      <Input
                        id="estimated_price"
                        type="number"
                        placeholder="e.g., 15000"
                        value={formData.estimated_price}
                        onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Leave empty if price is open to negotiation
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-12 gradient-rush text-white font-semibold shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      Continue to Location
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location Information</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Your location helps us find the best service providers near you
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                        <Home className="h-4 w-4 text-orange-500" />
                        Address / Landmark *
                      </Label>
                      <Input
                        id="address"
                        placeholder="e.g., 45 Allen Avenue, Ikeja"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          setErrors({ ...errors, address: '' });
                        }}
                        className={cn(
                          "h-12 transition-all",
                          errors.address && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                        <Input
                          id="city"
                          placeholder="Lagos"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                        <Input
                          id="state"
                          placeholder="Lagos"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 h-12 gradient-rush text-white font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        Review & Post
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Review Your Job Post</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Please review all details before posting
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <span className="text-sm font-medium flex items-center gap-2">
                          <SelectedIcon className="h-4 w-4" />
                          {selectedCategory?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Title</span>
                        <span className="text-sm font-medium">{formData.title}</span>
                      </div>
                      <div className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Description</span>
                        <span className="text-sm font-medium max-w-[60%] text-right line-clamp-2">
                          {formData.description}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </span>
                        <span className="text-sm font-medium">{formData.address}</span>
                      </div>
                      {formData.estimated_price && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Budget
                          </span>
                          <span className="text-sm font-medium text-emerald-600">
                            ₦{parseInt(formData.estimated_price).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 gradient-rush text-white font-semibold shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Post Job
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Quick Response</p>
              <p className="text-xs text-muted-foreground">Get responses within minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Verified Providers</p>
              <p className="text-xs text-muted-foreground">All providers are vetted</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Payments</p>
              <p className="text-xs text-muted-foreground">Escrow protection guaranteed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}