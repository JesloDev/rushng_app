'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

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
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gradient-rush text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Full Analytics
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{mockStats.totalUsers}</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{mockStats.totalJobs}</p>
                <p className="text-xs text-green-600">+8% this month</p>
              </div>
              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ₦{mockStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+15% this month</p>
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
                <p className="text-sm text-muted-foreground">Violations</p>
                <p className="text-3xl font-bold text-red-500">{mockStats.pendingViolations}</p>
                <p className="text-xs text-red-600">Pending review</p>
              </div>
              <div className="rounded-lg bg-red-100 p-3 text-red-600">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{mockStats.activeJobs}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Providers</p>
              <p className="text-2xl font-bold">{mockStats.totalProviders}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    activity.type === 'user' && 'bg-blue-500',
                    activity.type === 'job' && 'bg-green-500',
                    activity.type === 'violation' && 'bg-red-500',
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
                <Badge variant="outline">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage all users</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold">Manage Jobs</h3>
              <p className="text-sm text-muted-foreground">View and moderate jobs</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/violations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold">Violations</h3>
              <p className="text-sm text-muted-foreground">
                {mockStats.pendingViolations} pending reviews
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}