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
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
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

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (jobsRes.data.success) {
        setRecentJobs((jobsRes.data.data.jobs || []).slice(0, 5));
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
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
            Here's your provider performance overview
          </p>
        </div>
        <Link href="/providers/me">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            View Profile
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
                <p className="text-3xl font-bold">{stats?.total_jobs || 0}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="text-3xl font-bold text-green-500">
                  ₦{stats?.total_earnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-3xl font-bold text-orange-500">
                  {stats?.rating || 'New'}
                </p>
              </div>
              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-500">
                  {stats?.completion_rate || 0}%
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Compliance Score</span>
                <span className="font-medium">{stats?.compliance_score || 100}%</span>
              </div>
              <Progress value={stats?.compliance_score || 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Time</span>
                <span className="font-medium">~2 minutes</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Job Completion</span>
                <span className="font-medium">{stats?.completion_rate || 0}%</span>
              </div>
              <Progress value={stats?.completion_rate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.pending_jobs === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">No active jobs</p>
                <Link href="/jobs">
                  <Button variant="link" className="text-orange-500">
                    Browse available jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs
                  .filter((job: any) => ['assigned', 'in_progress'].includes(job.status))
                  .map((job: any) => (
                    <div key={job.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.address || 'Location not specified'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-orange-100 text-orange-700">
                          {job.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm font-semibold text-orange-500">
                          ₦{job.estimated_price?.toLocaleString() || 'Negotiable'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Link href="/dashboard/provider/jobs">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs yet</p>
              <Link href="/jobs">
                <Button variant="link" className="text-orange-500">
                  Find available jobs
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job: any) => (
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
                      <Badge className="bg-blue-100 text-blue-700">
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}