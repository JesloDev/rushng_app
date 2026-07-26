'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  ArrowUpRight,
} from 'lucide-react';

// Mock data - would come from admin API
const mockStats = {
  totalUsers: 1250,
  totalProviders: 340,
  totalJobs: 2450,
  totalRevenue: 1845000,
  pendingViolations: 12,
  completionRate: 92,
  activeJobs: 45,
};

const mockRecentActivity = [
  { id: 1, action: 'New user registered', user: 'Chioma E.', time: '2 mins ago', type: 'user' },
  { id: 2, action: 'Job completed', user: 'Emeka O.', time: '15 mins ago', type: 'job' },
  { id: 3, action: 'Violation reported', user: 'Adebayo K.', time: '1 hour ago', type: 'violation' },
  { id: 4, action: 'New provider verified', user: 'Tunde S.', time: '3 hours ago', type: 'provider' },
  { id: 5, action: 'Payment released', user: 'Ngozi A.', time: '5 hours ago', type: 'payment' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and high-level management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Full Analytics
          </Button>
        </div>
      </div>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>+12% this month</span>
                </div>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{mockStats.totalJobs.toLocaleString()}</p>
                <div className="flex items-center text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>+8% this month</span>
                </div>
              </div>
              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-600 dark:bg-orange-500/20">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ₦{mockStats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>+15% this month</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Violations</p>
                <p className="text-3xl font-bold text-rose-500">{mockStats.pendingViolations}</p>
                <p className="text-xs text-rose-600 font-medium">Pending review</p>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-3 text-rose-600 dark:bg-rose-500/20">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Completion Rate</p>
              <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-3 text-orange-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Jobs</p>
              <p className="text-2xl font-bold">{mockStats.activeJobs}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Providers</p>
              <p className="text-2xl font-bold">{mockStats.totalProviders}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    activity.type === 'user' && 'bg-blue-500',
                    activity.type === 'job' && 'bg-emerald-500',
                    activity.type === 'violation' && 'bg-rose-500',
                    activity.type === 'provider' && 'bg-orange-500',
                    activity.type === 'payment' && 'bg-purple-500',
                  )} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={cn(
                    'capitalize text-xs font-normal',
                    activity.type === 'user' && 'border-blue-200 text-blue-700 bg-blue-50/50',
                    activity.type === 'job' && 'border-emerald-200 text-emerald-700 bg-emerald-50/50',
                    activity.type === 'violation' && 'border-rose-200 text-rose-700 bg-rose-50/50',
                    activity.type === 'provider' && 'border-orange-200 text-orange-700 bg-orange-50/50',
                    activity.type === 'payment' && 'border-purple-200 text-purple-700 bg-purple-50/50',
                  )}
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/users">
          <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center space-y-2">
              <div className="rounded-full bg-blue-500/10 p-3 text-blue-600 w-fit mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">Manage Users</h3>
              <p className="text-xs text-muted-foreground">View accounts, roles, and status</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/jobs">
          <Card className="hover:border-orange-200 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center space-y-2">
              <div className="rounded-full bg-orange-500/10 p-3 text-orange-600 w-fit mx-auto">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">Manage Jobs</h3>
              <p className="text-xs text-muted-foreground">Monitor tasks and dispute moderation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/violations">
          <Card className="hover:border-rose-200 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center space-y-2">
              <div className="rounded-full bg-rose-500/10 p-3 text-rose-600 w-fit mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">Violations</h3>
              <p className="text-xs text-muted-foreground">
                {mockStats.pendingViolations} pending reports require review
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}