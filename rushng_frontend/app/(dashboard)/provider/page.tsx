'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { jobApi, providerApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  status: string;
  estimated_price?: number;
  address?: string;
  created_at: string;
}

interface ProviderStats {
  total_jobs?: number;
  total_earnings?: number;
  rating?: number | string;
  completion_rate?: number;
  compliance_score?: number;
  pending_jobs?: number;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        providerApi.stats(),
        jobApi.list({ my: true }),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }

      if (jobsRes.data?.success) {
        setRecentJobs((jobsRes.data.data.jobs || []).slice(0, 5));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
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
    return configs[status] || { label: status.replace('_', ' '), className: 'bg-gray-50 text-gray-700 border-gray-200' };
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

  const activeJobs = recentJobs.filter((job) => ['assigned', 'in_progress'].includes(job.status));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's your provider performance overview
          </p>
        </div>
        <Link href="/providers/me">
          <Button variant="outline" className="gap-2 shadow-sm">
            <Briefcase className="h-4 w-4" />
            View Profile
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{stats?.total_jobs || 0}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ₦{stats?.total_earnings ? stats.total_earnings.toLocaleString() : '0'}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-3xl font-bold text-amber-500">
                  {stats?.rating ? stats.rating : 'New'}
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-500">
                  {stats?.completion_rate || 0}%
                </p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Active Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Compliance Score</span>
                <span className="font-medium">{stats?.compliance_score || 100}%</span>
              </div>
              <Progress value={stats?.compliance_score || 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Response Time</span>
                <span className="font-medium">~2 minutes</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Job Completion</span>
                <span className="font-medium">{stats?.completion_rate || 0}%</span>
              </div>
              <Progress value={stats?.completion_rate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-blue-500" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-sm font-medium text-muted-foreground">No active jobs right now</p>
                <Link href="/jobs">
                  <Button variant="link" className="text-orange-600 text-xs hover:underline p-0">
                    Browse available jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((job) => {
                  const status = getStatusBadge(job.status);
                  return (
                    <div key={job.id} className="flex justify-between items-center border-b border-border/40 pb-3 last:border-none last:pb-0">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {job.address || 'Location not specified'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                        <p className="text-xs font-semibold text-orange-600">
                          ₦{job.estimated_price ? job.estimated_price.toLocaleString() : 'Negotiable'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Jobs</CardTitle>
          <Link href="/dashboard/provider/jobs">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">No jobs found</p>
              <p className="text-xs text-muted-foreground/80 mb-3">
                You haven't accepted or completed any tasks yet.
              </p>
              <Link href="/jobs">
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  Find available jobs
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