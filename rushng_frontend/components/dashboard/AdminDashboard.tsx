'use client';

import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Users, Truck, DollarSign, ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SystemMetric {
  totalUsers: number;
  activeProviders: number;
  totalTransactions: number;
  flaggedIncidents: number;
}

interface AdminDashboardProps {
  metrics?: SystemMetric;
  volumeByRegion?: { label: string; value: number }[];
  recentSystemLogs?: { id: string; event: string; timestamp: string; level: 'info' | 'warn' | 'error' }[];
}

export function AdminDashboard({
  metrics = {
    totalUsers: 1420,
    activeProviders: 185,
    totalTransactions: 3450000,
    flaggedIncidents: 3,
  },
  volumeByRegion = [
    { label: 'Ikeja', value: 450 },
    { label: 'Lagos Island', value: 620 },
    { label: 'Lekki / Victoria Island', value: 890 },
    { label: 'Surulere', value: 310 },
    { label: 'Yaba', value: 540 },
  ],
  recentSystemLogs = [
    { id: '1', event: 'New provider document uploaded (Verification Pending)', timestamp: '2 mins ago', level: 'info' },
    { id: '2', event: 'Payment webhook delay detected on Paystack', timestamp: '14 mins ago', level: 'warn' },
    { id: '3', event: 'Dispatch dispute raised on order #RSH-8821', timestamp: '1 hour ago', level: 'error' },
  ],
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Platform Overview Banner */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Admin Console</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time operational monitoring for RushNG platform.
          </p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-mono text-xs">
          System Status: Operational
        </Badge>
      </div>

      {/* Top Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered Users"
          value={metrics.totalUsers}
          icon={Users}
          color="blue"
          trend={{ value: 8, label: 'this week' }}
        />
        <StatsCard
          title="Active Providers"
          value={metrics.activeProviders}
          icon={Truck}
          color="orange"
        />
        <StatsCard
          title="Gross Revenue"
          value={`₦${metrics.totalTransactions.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend={{ value: 15, label: 'this month' }}
        />
        <StatsCard
          title="Flagged Disputes"
          value={metrics.flaggedIncidents}
          icon={ShieldAlert}
          color="red"
        />
      </div>

      {/* Region Volume & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSystemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/40 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{log.event}</p>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <Badge
                      className={`text-[10px] capitalize ${
                        log.level === 'error'
                          ? 'bg-destructive/10 text-destructive border-destructive/30'
                          : log.level === 'warn'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      }`}
                      variant="outline"
                    >
                      {log.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <ChartWidget
            title="Deliveries by Region"
            data={volumeByRegion}
          />
        </div>
      </div>
    </div>
  );
}