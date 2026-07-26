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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Loader2, AlertCircle, Shield, X, FileImage } from 'lucide-react';
import { toast } from 'sonner';

const VIOLATION_TYPES = [
  { value: 'no_show', label: 'No Show' },
  { value: 'poor_quality', label: 'Poor Quality Work' },
  { value: 'theft', label: 'Theft' },
  { value: 'damage', label: 'Damage / Broken Items' },
  { value: 'harassment', label: 'Harassment or Misbehavior' },
  { value: 'fraud', label: 'Fraud or Payment Bypassing' },
  { value: 'late_arrival', label: 'Significant Late Arrival' },
  { value: 'incomplete_work', label: 'Incomplete Work' },
  { value: 'bad_communication', label: 'Unresponsive / Poor Communication' },
  { value: 'cancellation', label: 'Unjustified Cancellation' },
  { value: 'other', label: 'Other Issue' },
];

interface ReportViolationProps {
  userId: string;
  jobId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReportViolation({
  userId,
  jobId,
  onSuccess,
  className,
}: ReportViolationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    evidence: [] as string[],
  });

  const handleAddEvidence = (imageUrl: string) => {
    if (!imageUrl) return;
    setFormData((prev) => ({
      ...prev,
      evidence: [...prev.evidence, imageUrl],
    }));
  };

  const handleRemoveEvidence = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.type || !formData.title || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await violationApi.report({
        user_id: userId,
        job_id: jobId,
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        evidence: formData.evidence,
      });

      if (response.data?.success || response.status === 200 || response.status === 201) {
        toast.success('Violation report submitted. Our admin team will investigate.');
        onSuccess?.();
        setFormData({ type: '', title: '', description: '', evidence: [] });
      }
    } catch (err: any) {
      const apiMessage = err.response?.data?.error || err.response?.data?.message;
      setError(apiMessage || 'Failed to submit violation report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-orange-600 dark:text-orange-500">
          <Shield className="h-5 w-5 shrink-0" />
          <span>Report a Violation</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="violation-type" className="text-xs font-semibold">
              Violation Type <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData({ ...formData, type: val })}
            >
              <SelectTrigger id="violation-type" className="w-full text-sm">
                <SelectValue placeholder="Select type of violation" />
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

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Subject / Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Package opened prior to delivery"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Detailed Description <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide specific details about what occurred, dates, and times..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="text-sm resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Supporting Evidence (Optional)</Label>
            
            <ImageUploader
              onChange={(uploadedUrl) => {
                if (uploadedUrl) handleAddEvidence(uploadedUrl);
              }}
            />

            {formData.evidence.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-xs font-medium text-slate-500">
                  Uploaded File(s) ({formData.evidence.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.evidence.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FileImage className="h-3.5 w-3.5 text-slate-400" />
                      <span className="max-w-[120px] truncate">
                        Evidence #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(index)}
                        className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Remove evidence"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-rush text-white shadow-2xs hover:opacity-95"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}