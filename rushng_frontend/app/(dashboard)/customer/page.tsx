'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { jobApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  DollarSign,
  Users,
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  status: string;
  estimated_price: number;
  address: string;
  created_at: string;
  provider?: {
    full_name: string;
  };
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobApi.list({ my: true });
      if (response.data.success) {
        const jobs = response.data.data.jobs || [];
        setRecentJobs(jobs.slice(0, 5));
        setStats({
          total: jobs.length,
          active: jobs.filter((j: any) => ['posted', 'assigned', 'in_progress'].includes(j.status)).length,
          completed: jobs.filter((j: any) => j.status === 'completed').length,
          pending: jobs.filter((j: any) => j.status === 'posted').length,
        });
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your jobs
          </p>
        </div>
        <Link href="/jobs/post">
          <Button className="gradient-rush text-white">
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold text-orange-500">{stats.active}</p>
              </div>
              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Jobs</p>
                <p className="text-3xl font-bold text-blue-500">{stats.pending}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/jobs/post">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 bg-orange-50">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold">Post a Job</h3>
              <p className="text-sm text-muted-foreground">Describe what you need</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Find Providers</h3>
              <p className="text-sm text-muted-foreground">Discover trusted professionals</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customer/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <ClipboardList className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">My Jobs</h3>
              <p className="text-sm text-muted-foreground">View all your jobs</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Link href="/dashboard/customer/jobs">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs yet</p>
              <Link href="/jobs/post">
                <Button variant="link" className="text-orange-500">
                  Post your first job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => {
                const status = getStatusBadge(job.status);
                return (
                  <div
                    key={job.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.address || 'Location not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Badge className={status.className}>
                          {status.label}
                        </Badge>
                      </div>
                      {job.provider && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Provider: {job.provider.full_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-orange-500">
                        ₦{job.estimated_price?.toLocaleString() || 'Negotiable'}
                      </span>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}