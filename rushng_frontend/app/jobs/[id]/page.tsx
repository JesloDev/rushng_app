'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Calendar, User, Phone, 
  Mail, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  city?: string;
  state?: string;
  status: string;
  estimated_price?: number;
  final_price?: number;
  created_at: string;
  customer: {
    id: string;
    full_name: string;
    phone?: string;
    email: string;
  };
  provider?: {
    id: string;
    full_name: string;
    phone?: string;
    rating?: number;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const jobId = params.id as string;

  const fetchJob = useCallback(async () => {
    try {
      const response = await jobApi.get(jobId);
      if (response.data?.success) {
        setJob(response.data.data.job);
      }
    } catch (error) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setApplying(true);
    try {
      const response = await jobApi.apply(jobId, {});
      if (response.data?.success) {
        toast.success('Applied successfully!');
        fetchJob();
      }
    } catch (error) {
      toast.error('Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const isOwner = user?.id === job.customer?.id;
  const canApply = !isOwner && job.status === 'posted' && user?.role === 'provider';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Jobs
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge>{job.category}</Badge>
                <Badge variant="outline">{job.status?.replace('_', ' ').toUpperCase()}</Badge>
                {job.estimated_price && (
                  <Badge variant="secondary">₦{job.estimated_price.toLocaleString()}</Badge>
                )}
              </div>
            </div>
            {canApply && (
              <Button 
                onClick={handleApply} 
                disabled={applying}
                className="gradient-rush text-white"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{job.address}{job.city ? `, ${job.city}` : ''}{job.state ? `, ${job.state}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Posted by</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  {job.customer?.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-medium">{job.customer?.full_name}</p>
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {job.customer?.phone || 'Not provided'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {job.customer?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Info (if assigned) */}
            {job.provider && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Assigned Provider</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold">
                    {job.provider.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-medium">{job.provider.full_name}</p>
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span>Rating: {job.provider.rating || 'New'}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {job.provider.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions for owner */}
            {isOwner && job.status === 'posted' && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1">Edit Job</Button>
                <Button variant="destructive" className="flex-1">Cancel Job</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}