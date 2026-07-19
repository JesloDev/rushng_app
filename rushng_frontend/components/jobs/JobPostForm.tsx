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
import { LocationPicker } from '@/components/shared/LocationPicker';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'plumbing', 'electrical', 'carpentry', 'painting', 'tiling',
  'masonry', 'welding', 'cleaning', 'laundry', 'shopping',
  'errands', 'repair', 'maintenance', 'installation', 'other'
];

interface JobPostFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function JobPostForm({ initialData, onSuccess }: JobPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    estimated_price: initialData?.estimated_price || '',
    lat: initialData?.lat || 0,
    lng: initialData?.lng || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.category || !formData.title || !formData.description || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        estimated_price: parseFloat(formData.estimated_price) || undefined,
        lat: formData.lat || 6.5244,
        lng: formData.lng || 3.3792,
      };

      const response = initialData
        ? await jobApi.update(initialData.id, payload)
        : await jobApi.create(payload);

      if (response.data.success) {
        toast.success(initialData ? 'Job updated!' : 'Job posted!');
        onSuccess?.();
        router.push('/jobs');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="category">Service Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Fix leaking pipe in kitchen"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the job in detail..."
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          placeholder="e.g., 45 Allen Avenue, Ikeja"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <Label htmlFor="estimated_price">Estimated Price (₦)</Label>
        <Input
          id="estimated_price"
          type="number"
          placeholder="e.g., 5000"
          value={formData.estimated_price}
          onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">Leave empty if negotiable</p>
      </div>

      <LocationPicker
        value={formData.lat ? { lat: formData.lat, lng: formData.lng } : undefined}
        onChange={(location) => setFormData({ ...formData, lat: location.lat, lng: location.lng })}
        onAddressChange={(address) => setFormData({ ...formData, address })}
      />

      <Button type="submit" className="w-full gradient-rush text-white" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? 'Updating...' : 'Posting...'}
          </>
        ) : (
          initialData ? 'Update Job' : 'Post Job'
        )}
      </Button>
    </form>
  );
}