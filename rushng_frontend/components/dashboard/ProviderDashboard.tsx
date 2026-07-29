'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { 
  DollarSign, CheckCircle2, MapPin, Navigation, ToggleLeft, ToggleRight, 
  Clock, TrendingUp, Award, Users, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { jobApi } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AvailableJob {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  payout: number;
  customer: string;
  estimatedTime: string;
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedToday: 0,
    rating: 0,
    acceptanceRate: 0,
    totalEarnings: 0,
    totalDeliveries: 0,
  });
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, earningsRes] = await Promise.all([
        jobApi.getProviderStats(),
        jobApi.getAvailableJobs(),
        jobApi.getDailyEarnings(),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (jobsRes.data?.success) {
        setAvailableJobs(jobsRes.data.data);
      }
      if (earningsRes.data?.success) {
        setDailyEarnings(earningsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-500 ${
          isOnline 
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white' 
            : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
        }`}
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-white/30 ring-2 ring-white/20">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {stats.rating} ({stats.totalDeliveries} deliveries)
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats.totalDeliveries} deliveries
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsOnline(!isOnline)}
            className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20"
          >
            {isOnline ? (
              <>
                <ToggleRight className="h-5 w-5 text-green-300" />
                <span>Online</span>
                <Badge className="bg-green-400 text-green-900 border-0 text-[10px]">Available</Badge>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5 text-gray-300" />
                <span>Offline</span>
                <Badge className="bg-gray-400 text-gray-900 border-0 text-[10px]">Unavailable</Badge>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Today's Earnings"
          value={`₦${stats.todayEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Rating"
          value={`${stats.rating} ★`}
          icon={Star}
          color="yellow"
        />
        <StatsCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          icon={Navigation}
          color="blue"
        />
      </motion.div>

      {/* Available Jobs & Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Available Delivery Requests
                {availableJobs.length > 0 && (
                  <Badge variant="orange" className="ml-2">{availableJobs.length} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium">No nearby delivery requests</p>
                  <p className="text-xs mt-1">New orders in your area will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200">
                            {job.distance} away
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {job.estimatedTime}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{job.pickup}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="truncate">{job.dropoff}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer: {job.customer}</p>
                      </div>

                      <div className="text-right shrink-0 ml-4 space-y-2">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
                          ₦{job.payout.toLocaleString()}
                        </span>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs gradient-rush text-white hover:shadow-lg transition-all"
                          disabled={!isOnline}
                        >
                          {isOnline ? 'Accept Job' : 'Go Online'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <ChartWidget
            title="Daily Earnings"
            data={dailyEarnings}
            valuePrefix="₦"
          />
          
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{stats.acceptanceRate}%</span>
                </div>
                <Progress value={stats.acceptanceRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">On-time Delivery</span>
                  <span className="font-semibold">{Math.min(stats.acceptanceRate + 4, 100)}%</span>
                </div>
                <Progress value={Math.min(stats.acceptanceRate + 4, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-semibold">{stats.rating} ★</span>
                </div>
                <Progress value={(stats.rating / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}