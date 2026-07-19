'use client';

import { useState } from 'react';
import { violationApi } from '@/lib/api';
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
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

const VIOLATION_TYPES = [
  { value: 'no_show', label: 'No Show' },
  { value: 'poor_quality', label: 'Poor Quality Work' },
  { value: 'theft', label: 'Theft' },
  { value: 'damage', label: 'Damage' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'late_arrival', label: 'Late Arrival' },
  { value: 'incomplete_work', label: 'Incomplete Work' },
  { value: 'bad_communication', label: 'Bad Communication' },
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'other', label: 'Other' },
];

interface ReportViolationProps {
  userId: string;
  jobId?: string;
  onSuccess?: () => void;
}

export function ReportViolation({ userId, jobId, onSuccess }: ReportViolationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    evidence: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.type || !formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await violationApi.report({
        user_id: userId,
        job_id: jobId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        evidence: formData.evidence,
      });

      if (response.data.success) {
        toast.success('Violation reported! Admin will review.');
        onSuccess?.();
        setFormData({ type: '', title: '', description: '', evidence: [] });
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to report violation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-orange-600">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Report a Violation</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Violation Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select violation type" />
              </SelectTrigger>
              <SelectContent>
                {VIOLATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief title of the violation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of what happened..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <ImageUploader
              onChange={(image) => setFormData({ 
                ...formData, 
                evidence: [...formData.evidence, image] 
              })}
            />
            {formData.evidence.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {formData.evidence.length} file(s) uploaded
              </p>
            )}
          </div>

          <Button type="submit" className="w-full gradient-rush text-white" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Report Violation'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}