'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bike,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  vehicleType: 'bicycle' | 'motorbike' | 'car' | 'van';
  vehiclePlateNumber: string;
  hourlyRate: string;
  yearsExperience: string;
  description: string;
  skills: string;
  acceptTerms: boolean;
}

interface ProviderRegistrationProps {
  onSuccess?: (data: any) => void;
}

export function ProviderRegistration({ onSuccess }: ProviderRegistrationProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    defaultValues: {
      vehicleType: 'motorbike',
      hourlyRate: '1500',
      acceptTerms: false,
    },
  });

  const watchVehicleType = watch('vehicleType');

  const handleNextStep = () => {
    if (step === 1) {
      const name = watch('fullName');
      const phone = watch('phone');
      if (!name || !phone) {
        toast.error('Please fill in your full name and phone number.');
        return;
      }
    }
    if (step === 2) {
      const city = watch('city');
      if (!city) {
        toast.error('Please specify your operational city/location.');
        return;
      }
    }
    setStep((prev) => (prev + 1) as 2 | 3);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as 1 | 2);
  };

  const onSubmitForm = async (data: RegistrationFormData) => {
    if (!data.acceptTerms) {
      toast.error('You must accept the RushNG terms of service.');
      return;
    }

    setSubmitting(true);
    try {
      // Form payload formatting
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()) : [],
        hourlyRate: parseFloat(data.hourlyRate) || 0,
        yearsExperience: parseInt(data.yearsExperience, 10) || 0,
      };

      // Mock API call simulation or call providerApi.register(payload)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success('Registration submitted successfully! Proceeding to KYC verification.');
      onSuccess?.(payload);
    } catch (error) {
      toast.error('Failed to submit registration. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 shadow-xs">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none font-medium">
            Step {step} of 3
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            {step === 1 && 'Personal Info'}
            {step === 2 && 'Vehicle & Service Specs'}
            {step === 3 && 'Document Setup'}
          </span>
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">
          Register as a Dispatch Partner
        </CardTitle>
        <CardDescription>
          Join RushNG&apos;s logistics network to receive delivery requests in your area.
        </CardDescription>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-orange-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-orange-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-orange-600' : 'bg-slate-200'}`} />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="e.g. Babatunde Adeleke"
                    className="pl-9"
                    {...register('fullName', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="08012345678"
                    {...register('phone', { required: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="babatunde@example.com"
                    {...register('email')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Short Bio / Introduction
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell clients about your reliability, experience in Lagos delivery routes, etc."
                  rows={3}
                  {...register('description')}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Logistics & Vehicle Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-semibold">
                    Primary Operational City/Area <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Ikeja, Lagos"
                    {...register('city', { required: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    defaultValue={watchVehicleType}
                    onValueChange={(val) =>
                      setValue('vehicleType', val as 'bicycle' | 'motorbike' | 'car' | 'van')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="motorbike">Motorbike / Express Courier</SelectItem>
                      <SelectItem value="car">Car / Sedan</SelectItem>
                      <SelectItem value="van">Van / Cargo Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watchVehicleType !== 'bicycle' && (
                <div className="space-y-1.5">
                  <Label htmlFor="vehiclePlateNumber" className="text-sm font-semibold">
                    Vehicle Plate / Registration Number
                  </Label>
                  <Input
                    id="vehiclePlateNumber"
                    placeholder="e.g. KJA-452XA"
                    {...register('vehiclePlateNumber')}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hourlyRate" className="text-sm font-semibold">
                    Estimated Rate (₦ / Delivery)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="1500"
                    {...register('hourlyRate')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="yearsExperience" className="text-sm font-semibold">
                    Years of Experience
                  </Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    placeholder="2"
                    {...register('yearsExperience')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skills" className="text-sm font-semibold">
                  Specialized Skills (Comma separated)
                </Label>
                <Input
                  id="skills"
                  placeholder="Fragile items, Cold chain, Express, Inter-state"
                  {...register('skills')}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Initial ID Upload & Consent */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Government ID / Driver&apos;s License (Optional)
                </Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1">
                    Upload a JPEG, PNG, or PDF of your National ID (NIN) or License
                  </p>
                  <input
                    type="file"
                    id="idUpload"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="idUpload">
                    <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none">
                      Choose File
                    </Button>
                  </label>
                  {selectedFile && (
                    <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You can finish registration now and complete full identity verification later from your Provider Verification tab.
                </span>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="acceptTerms"
                  checked={watch('acceptTerms')}
                  onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-xs text-slate-600 leading-tight cursor-pointer select-none"
                >
                  I declare that all provided details are accurate and I agree to the RushNG Dispatch Partner Terms of Service.
                </label>
              </div>
            </div>
          )}

          {/* Navigation & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button type="button" onClick={handleNextStep} className="gradient-rush text-white">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="gradient-rush text-white px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}