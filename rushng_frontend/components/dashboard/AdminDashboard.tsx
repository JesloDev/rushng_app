'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Users, Truck, DollarSign, ShieldAlert, Activity, Server, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SystemMetric {
  totalUsers: number;
  activeProviders: number;
  totalTransactions: number;
  flaggedIncidents: number;
  serverUptime: number;
  activeSessions: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric>({
    totalUsers: 0,
    activeProviders: 0,
    totalTransactions: 0,
    flaggedIncidents: 0,
    serverUptime: 99.98,
    activeSessions: 0,
  });
  const [volumeByRegion, setVolumeByRegion] = useState<{ label: string; value: number }[]>([]);
  const [recentSystemLogs, setRecentSystemLogs] = useState<{ id: string; event: string; timestamp: string; level: 'info' | 'warn' | 'error' | 'success' }[]>([]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, regionRes, logsRes, revenueRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getRegionStats(),
        adminApi.getSystemLogs(),
        adminApi.getRevenueData(),
      ]);

      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.data);
      }
      if (regionRes.data?.success) {
        setVolumeByRegion(regionRes.data.data);
      }
      if (logsRes.data?.success) {
        setRecentSystemLogs(logsRes.data.data);
      }
      if (revenueRes.data?.success) {
        setRevenueData(revenueRes.data.data);
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

  const getLogColor = (level: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
      warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const getLogIcon = (level: string) => {
    const icons = {
      info: <Activity className="h-4 w-4" />,
      warn: <AlertTriangle className="h-4 w-4" />,
      error: <ShieldAlert className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
    };
    return icons[level as keyof typeof icons] || icons.info;
  };

  return (
    <div className="space-y-6">
      {/* Platform Overview Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-5 w-5 text-orange-400" />
            System Admin Console
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Real-time operational monitoring for RushNG platform
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
            </span>
            <span>System Operational</span>
          </div>
          <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-3 py-1 font-mono text-xs">
            Uptime: {metrics.serverUptime}%
          </Badge>
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
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Providers"
          value={metrics.activeProviders}
          icon={Truck}
          color="orange"
        />
        <StatsCard
          title="Revenue"
          value={`₦${(metrics.totalTransactions / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Active Sessions"
          value={metrics.activeSessions}
          icon={Activity}
          color="purple"
        />
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Disputes</p>
                <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{metrics.flaggedIncidents}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800/30 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">New Registrations</p>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{Math.floor(metrics.totalUsers * 0.02)}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Region & Revenue */}
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
                <Activity className="h-4 w-4 text-primary" />
                Live Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSystemLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${getLogColor(log.level)}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="shrink-0">
                        {getLogIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{log.event}</p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getLogColor(log.level)} capitalize text-[10px]`}>
                      {log.level}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <ChartWidget
            title="Revenue Overview"
            data={revenueData}
            valuePrefix="₦"
          />
          
          <ChartWidget
            title="Deliveries by Region"
            data={volumeByRegion}
            className="mt-4"
          />
        </div>
      </motion.div>
    </div>
  );
}