'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { providerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Upload,
  User,
  Briefcase,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Skills & Experience', icon: Briefcase },
  { id: 3, title: 'Verification', icon: Shield },
  { id: 4, title: 'Complete', icon: CheckCircle2 },
];

const SKILLS_LIST = [
  'plumbing', 'electrical', 'carpentry', 'painting', 'tiling',
  'masonry', 'welding', 'cleaning', 'laundry', 'shopping',
  'errands', 'repair', 'maintenance', 'installation', 'gardening',
  'pest control', 'roofing', 'fencing', 'plastering',
];

export default function ProviderRegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    description: '',

    // Step 2: Skills & Experience
    skills: [] as string[],
    years_experience: 0,
    hourly_rate: 0,
    service_radius_km: 10,
    portfolio_urls: [] as string[],
    new_portfolio_url: '',

    // Step 3: Verification
    nin: '',
    bvn: '',
    documents: [] as File[],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/providers/register');
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user, router]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.full_name) errors.full_name = 'Full name is required';
      if (!formData.phone) errors.phone = 'Phone number is required';
      if (!formData.email) errors.email = 'Email is required';
      if (!formData.address) errors.address = 'Address is required';
    }

    if (step === 2) {
      if (formData.skills.length === 0) errors.skills = 'Select at least one skill';
      if (formData.years_experience < 0) errors.years_experience = 'Invalid experience';
      if (formData.hourly_rate <= 0) errors.hourly_rate = 'Hourly rate is required';
    }

    if (step === 3) {
      if (!formData.nin || formData.nin.length !== 11) errors.nin = 'Valid 11-digit NIN is required';
      if (!formData.bvn || formData.bvn.length !== 11) errors.bvn = 'Valid 11-digit BVN is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please fix all errors before continuing');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addPortfolioUrl = () => {
    if (formData.new_portfolio_url) {
      setFormData(prev => ({
        ...prev,
        portfolio_urls: [...prev.portfolio_urls, prev.new_portfolio_url],
        new_portfolio_url: '',
      }));
    }
  };

  const removePortfolioUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio_urls: prev.portfolio_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Pass form payload (and documents if API accepts FormData or direct payload)
      const payload = {
        skills: formData.skills,
        years_experience: formData.years_experience,
        hourly_rate: formData.hourly_rate,
        service_radius_km: formData.service_radius_km,
        nin: formData.nin,
        bvn: formData.bvn,
        portfolio_urls: formData.portfolio_urls,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        documents: formData.documents,
      };

      const response = await providerApi.register(payload);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        setCompleted(true);
        toast.success('Provider registration successful!');
        setTimeout(() => {
          router.push('/providers/me');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <p className="text-muted-foreground text-sm">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={validationErrors.full_name ? 'border-red-500' : ''}
            />
            {validationErrors.full_name && (
              <p className="text-sm text-red-500">{validationErrors.full_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={validationErrors.phone ? 'border-red-500' : ''}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500">{validationErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            placeholder="e.g., 45 Allen Avenue, Ikeja"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={validationErrors.address ? 'border-red-500' : ''}
          />
          {validationErrors.address && (
            <p className="text-sm text-red-500">{validationErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Lagos"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Lagos"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About You</Label>
          <Textarea
            id="description"
            placeholder="Tell customers about yourself, your experience, and what makes you special..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Skills & Experience</h2>
        <p className="text-muted-foreground text-sm">What services do you offer?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Your Skills *</Label>
          <div className="flex flex-wrap gap-2">
            {SKILLS_LIST.map((skill) => (
              <Badge
                key={skill}
                variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                className={`cursor-pointer text-sm ${
                  formData.skills.includes(skill)
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'hover:bg-orange-50'
                }`}
                onClick={() => toggleSkill(skill)}
              >
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </Badge>
            ))}
          </div>
          {validationErrors.skills && (
            <p className="text-sm text-red-500">{validationErrors.skills}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of Experience *</Label>
            <Input
              id="years_experience"
              type="number"
              min="0"
              max="50"
              value={formData.years_experience}
              onChange={(e) =>
                setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })
              }
              className={validationErrors.years_experience ? 'border-red-500' : ''}
            />
            {validationErrors.years_experience && (
              <p className="text-sm text-red-500">{validationErrors.years_experience}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (₦) *</Label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })
              }
              className={validationErrors.hourly_rate ? 'border-red-500' : ''}
            />
            {validationErrors.hourly_rate && (
              <p className="text-sm text-red-500">{validationErrors.hourly_rate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_radius_km">Service Radius (km)</Label>
          <Input
            id="service_radius_km"
            type="number"
            min="1"
            max="100"
            value={formData.service_radius_km}
            onChange={(e) =>
              setFormData({ ...formData, service_radius_km: parseInt(e.target.value) || 10 })
            }
          />
          <p className="text-xs text-muted-foreground">
            How far are you willing to travel for jobs? (1-100km)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Portfolio URLs</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/portfolio"
              value={formData.new_portfolio_url}
              onChange={(e) => setFormData({ ...formData, new_portfolio_url: e.target.value })}
            />
            <Button type="button" variant="outline" onClick={addPortfolioUrl}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.portfolio_urls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.portfolio_urls.map((url, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {url.replace(/^https?:\/\//, '').slice(0, 30)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removePortfolioUrl(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Verification</h2>
        <p className="text-muted-foreground text-sm">
          Verify your identity to build trust with customers
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800">Why Verify?</h4>
              <p className="text-sm text-orange-700">
                Verified providers get 3x more job requests and higher customer trust.
                Your NIN and BVN are encrypted and securely stored.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nin">NIN (11 digits) *</Label>
            <Input
              id="nin"
              placeholder="12345678901"
              maxLength={11}
              value={formData.nin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, nin: val });
              }}
              className={validationErrors.nin ? 'border-red-500' : ''}
            />
            {validationErrors.nin && (
              <p className="text-sm text-red-500">{validationErrors.nin}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bvn">BVN (11 digits) *</Label>
            <Input
              id="bvn"
              placeholder="12345678901"
              maxLength={11}
              value={formData.bvn}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, bvn: val });
              }}
              className={validationErrors.bvn ? 'border-red-500' : ''}
            />
            {validationErrors.bvn && (
              <p className="text-sm text-red-500">{validationErrors.bvn}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Verification Documents</Label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PDF, JPG, PNG (max 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files) {
                    setFormData((prev) => ({
                      ...prev,
                      documents: [...prev.documents, ...Array.from(e.target.files || [])],
                    }));
                  }
                }}
              />
            </label>
          </div>
          {formData.documents.length > 0 && (
            <div className="space-y-1">
              {formData.documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        documents: prev.documents.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold">Ready to Submit!</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Review your information below and submit to become a verified provider.
      </p>

      <div className="text-left max-w-lg mx-auto space-y-3">
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Name</span>
          <span>{formData.full_name}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Skills</span>
          <span className="text-right">
            {formData.skills.slice(0, 3).join(', ')}
            {formData.skills.length > 3 && ` +${formData.skills.length - 3} more`}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Experience</span>
          <span>{formData.years_experience} years</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Hourly Rate</span>
          <span>₦{formData.hourly_rate.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Service Radius</span>
          <span>{formData.service_radius_km} km</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="font-medium">Verification</span>
          <span>
            {formData.nin && formData.bvn ? '✅ Ready' : '⚠️ Incomplete'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Become a Provider</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete the registration to start offering services
          </p>
        </CardHeader>
        <CardContent>
          {completed ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Registration Complete! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                Your provider account is being reviewed. You'll be able to accept jobs soon.
              </p>
              <Button onClick={() => router.push('/providers/me')}>
                View Your Profile
              </Button>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {STEPS.map((step) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${
                        currentStep >= step.id ? 'text-orange-500' : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          currentStep >= step.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
                <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">{renderStep()}</div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || submitting}
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={submitting}
                  className="gradient-rush text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : currentStep === STEPS.length ? (
                    'Submit'
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}