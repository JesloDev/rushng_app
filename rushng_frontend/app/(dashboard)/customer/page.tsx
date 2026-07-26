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
  Users,
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
  ClipboardList,
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
      posted: { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      assigned: { label: 'Assigned', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      in_progress: { label: 'In Progress', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 border-rose-200' },
    };
    return configs[status] || { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your active and past jobs
          </p>
        </div>
        <Link href="/jobs/post">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20">
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold text-orange-500">{stats.active}</p>
              </div>
              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Jobs</p>
                <p className="text-3xl font-bold text-blue-500">{stats.pending}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/jobs/post">
          <Card className="hover:border-orange-300 hover:shadow-md transition-all cursor-pointer border-orange-200/80 bg-orange-50/40">
            <CardContent className="p-6 text-center space-y-1">
              <Plus className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-base">Post a Job</h3>
              <p className="text-xs text-muted-foreground">Describe what you need done</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer border-border/50">
            <CardContent className="p-6 text-center space-y-1">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-base">Find Providers</h3>
              <p className="text-xs text-muted-foreground">Discover trusted professionals near you</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customer/jobs">
          <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer border-border/50">
            <CardContent className="p-6 text-center space-y-1">
              <ClipboardList className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-semibold text-base">My Jobs</h3>
              <p className="text-xs text-muted-foreground">Manage and track your posted tasks</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Jobs */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Jobs</CardTitle>
          <Link href="/dashboard/customer/jobs">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No jobs posted yet</p>
              <p className="text-xs text-muted-foreground/80 mb-4">
                Need help with something? Post a request to get started.
              </p>
              <Link href="/jobs/post">
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  Post your first job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const status = getStatusBadge(job.status);
                const createdAtDate = job.created_at ? new Date(job.created_at) : null;

                return (
                  <div
                    key={job.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-xl border border-border/50 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-base">{job.title}</h4>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {job.address || 'Location not specified'}
                        </span>
                        {createdAtDate && !isNaN(createdAtDate.getTime()) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                            {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                          </span>
                        )}
                      </div>

                      {job.provider && (
                        <p className="text-xs text-muted-foreground pt-0.5">
                          Assigned Provider: <span className="font-medium text-foreground">{job.provider.full_name}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
                      <span className="font-semibold text-orange-600 text-lg">
                        ₦{job.estimated_price ? job.estimated_price.toLocaleString() : 'Negotiable'}
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