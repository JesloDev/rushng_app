'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { jobApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  estimated_price: number;
  final_price: number;
  address: string;
  created_at: string;
  customer?: {
    full_name: string;
  };
  provider?: {
    full_name: string;
  };
}

export default function MyJobsPage() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchJobs();
  }, [isAuthenticated]);

  const fetchJobs = async () => {
    try {
      const response = await jobApi.list({ my: true });
      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredJobs = () => {
    if (activeTab === 'active') {
      return jobs.filter(j => ['posted', 'assigned', 'in_progress'].includes(j.status));
    }
    if (activeTab === 'completed') {
      return jobs.filter(j => j.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return jobs.filter(j => j.status === 'cancelled');
    }
    return jobs;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      posted: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
      assigned: { label: 'Assigned', className: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-700' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground">
            {user?.role === 'provider' ? 'Jobs you are working on' : 'Jobs you have posted'}
          </p>
        </div>
        <Link href="/jobs/post">
          <Button className="gradient-rush text-white">
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No active jobs</p>
              <Link href="/jobs/post">
                <Button variant="link" className="text-orange-500">
                  Post your first job
                </Button>
              </Link>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} getStatusBadge={getStatusBadge} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No completed jobs yet</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} getStatusBadge={getStatusBadge} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No cancelled jobs</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} getStatusBadge={getStatusBadge} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Job Card Component
function JobCard({ job, getStatusBadge }: { job: Job; getStatusBadge: (status: string) => { label: string; className: string } }) {
  const status = getStatusBadge(job.status);
  const isActive = ['posted', 'assigned', 'in_progress'].includes(job.status);

  return (
    <Link href={isActive ? `/jobs/${job.id}/track` : `/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {job.description}
                  </p>
                </div>
                <Badge className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{job.address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>₦{job.estimated_price?.toLocaleString() || 'Negotiable'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                {isActive ? 'Track' : 'View'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}