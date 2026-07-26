'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jobApi } from '@/lib/api';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationPicker } from '@/components/shared/LocationPicker';
import { Loader2, AlertCircle, Truck, Wrench, MapPin, Phone, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'dispatch_delivery',
  'errands',
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'tiling',
  'masonry',
  'welding',
  'cleaning',
  'laundry',
  'repair_maintenance',
  'installation',
  'other',
];

interface JobPostFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function JobPostForm({ initialData, onSuccess }: JobPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobType, setJobType] = useState<'standard' | 'dispatch'>(
    initialData?.is_dispatch || initialData?.category === 'dispatch_delivery' ? 'dispatch' : 'standard'
  );

  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Lagos',
    state: initialData?.state || 'Lagos',
    pickup_address: initialData?.pickup_address || '',
    dropoff_address: initialData?.dropoff_address || '',
    pickup_phone: initialData?.pickup_phone || '',
    recipient_phone: initialData?.recipient_phone || '',
    estimated_price: initialData?.estimated_price ? String(initialData.estimated_price) : '',
    lat: initialData?.lat || 6.5244,
    lng: initialData?.lng || 3.3792,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.category || !formData.title || !formData.description) {
      setError('Please fill in all required job details.');
      return;
    }

    if (jobType === 'dispatch') {
      if (!formData.pickup_address || !formData.dropoff_address) {
        setError('Please specify both pickup and dropoff addresses for dispatch jobs.');
        return;
      }
    } else if (!formData.address) {
      setError('Please provide a job location address.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        is_dispatch: jobType === 'dispatch',
        address: jobType === 'dispatch' ? formData.pickup_address : formData.address,
        estimated_price: formData.estimated_price ? parseFloat(formData.estimated_price) : undefined,
        lat: formData.lat || 6.5244,
        lng: formData.lng || 3.3792,
      };

      const response = initialData
        ? await jobApi.update(initialData.id, payload)
        : await jobApi.create(payload);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success(initialData ? 'Job updated successfully!' : 'Job posted successfully!');
        onSuccess?.();
        router.push('/jobs');
      } else {
        throw new Error(response.data?.message || 'Failed to submit job.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive font-medium animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Service Type Selection */}
      <Card className="border-border/60 bg-card">
        <CardContent className="pt-6 space-y-4">
          <Label className="text-sm font-semibold text-foreground">Select Job / Service Mode</Label>
          <Tabs
            value={jobType}
            onValueChange={(val) => {
              const mode = val as 'standard' | 'dispatch';
              setJobType(mode);
              if (mode === 'dispatch' && !formData.category) {
                setFormData((prev) => ({ ...prev, category: 'dispatch_delivery' }));
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/60 p-1">
              <TabsTrigger value="standard" className="gap-2 text-xs md:text-sm font-bold">
                <Wrench className="h-4 w-4" /> Artisan & Services
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="gap-2 text-xs md:text-sm font-bold">
                <Truck className="h-4 w-4" /> Dispatch & Express Delivery
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* General Job Info */}
      <Card className="border-border/60 bg-card">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-semibold">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="bg-background/50">
                  <SelectValue placeholder="Select service category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold">
                Job Title *
              </Label>
              <Input
                id="title"
                placeholder={
                  jobType === 'dispatch'
                    ? 'e.g., Deliver document package from Ikeja to VI'
                    : 'e.g., Fix leaking pipe in kitchen'
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder={
                jobType === 'dispatch'
                  ? 'Describe item size, weight, special handling instructions, or delivery context...'
                  : 'Describe the task, materials needed, and key specifications...'
              }
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background/50 leading-relaxed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_price" className="text-xs font-semibold flex items-center justify-between">
              <span>Estimated Budget / Price (₦)</span>
              <span className="text-[11px] text-muted-foreground font-normal">Optional / Negotiable</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                ₦
              </span>
              <Input
                id="estimated_price"
                type="number"
                placeholder="e.g., 5000"
                value={formData.estimated_price}
                onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                className="pl-8 bg-background/50 font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Specifications (Conditional Dispatch vs Standard) */}
      <Card className="border-border/60 bg-card">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {jobType === 'dispatch' ? 'Pickup & Dropoff Locations' : 'Job Site Location'}
          </div>

          {jobType === 'dispatch' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_address" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Pickup Address *
                  </Label>
                  <Input
                    id="pickup_address"
                    placeholder="Pickup address in Lagos"
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup_phone" className="text-xs font-semibold">
                    Pickup Contact Phone
                  </Label>
                  <Input
                    id="pickup_phone"
                    placeholder="e.g. 08012345678"
                    value={formData.pickup_phone}
                    onChange={(e) => setFormData({ ...formData, pickup_phone: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dropoff_address" className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    Dropoff Destination *
                  </Label>
                  <Input
                    id="dropoff_address"
                    placeholder="Destination address"
                    value={formData.dropoff_address}
                    onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_phone" className="text-xs font-semibold">
                    Recipient Contact Phone
                  </Label>
                  <Input
                    id="recipient_phone"
                    placeholder="e.g. 08087654321"
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold">
                  Full Street Address *
                </Label>
                <Input
                  id="address"
                  placeholder="e.g., 45 Allen Avenue, Ikeja"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ikeja"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-semibold">
                    State
                  </Label>
                  <Input
                    id="state"
                    placeholder="Lagos"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive Map Coordinates Pinning */}
          <div className="pt-2">
            <Label className="text-xs font-semibold mb-2 block text-muted-foreground">
              Pin Exact Coordinate Location (Optional)
            </Label>
            <LocationPicker
              value={formData.lat ? { lat: formData.lat, lng: formData.lng } : undefined}
              onChange={(location) =>
                setFormData({ ...formData, lat: location.lat, lng: location.lng })
              }
              onAddressChange={(address) => {
                if (jobType === 'dispatch' && !formData.pickup_address) {
                  setFormData((prev) => ({ ...prev, pickup_address: address }));
                } else if (jobType === 'standard' && !formData.address) {
                  setFormData((prev) => ({ ...prev, address }));
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full gradient-rush text-white font-bold h-11 text-base shadow-md hover:opacity-90 transition-opacity"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {initialData ? 'Updating Job Posting...' : 'Publishing Job...'}
          </>
        ) : initialData ? (
          'Update Job Posting'
        ) : (
          'Publish Job Request'
        )}
      </Button>
    </form>
  );
}