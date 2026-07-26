'use client';

import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { DollarSign, CheckCircle2, MapPin, Navigation, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface AvailableJob {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  payout: number;
}

interface ProviderDashboardProps {
  stats?: {
    todayEarnings: number;
    completedToday: number;
    rating: number;
    acceptanceRate: number;
  };
  availableJobs?: AvailableJob[];
  dailyEarnings?: { label: string; value: number }[];
}

export function ProviderDashboard({
  stats = {
    todayEarnings: 14500,
    completedToday: 6,
    rating: 4.8,
    acceptanceRate: 94,
  },
  availableJobs = [],
  dailyEarnings = [
    { label: 'Mon', value: 12000 },
    { label: 'Tue', value: 18500 },
    { label: 'Wed', value: 15000 },
    { label: 'Thu', value: 22000 },
    { label: 'Fri', value: 19500 },
    { label: 'Sat', value: 14500 },
  ],
}: ProviderDashboardProps) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="space-y-6">
      {/* Online/Offline Status Switch Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            <h2 className="text-lg font-bold">
              {isOnline ? 'You are Online & Ready' : 'You are Currently Offline'}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOnline ? 'Incoming dispatch requests will appear below.' : 'Switch online to receive pickup requests.'}
          </p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className="flex items-center gap-2 font-semibold text-xs px-4 py-2 rounded-xl border border-border bg-accent hover:bg-accent/80 transition-all"
        >
          {isOnline ? (
            <>
              <ToggleRight className="h-6 w-6 text-emerald-500" />
              Online
            </>
          ) : (
            <>
              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              Offline
            </>
          )}
        </button>
      </div>

      {/* Provider Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Earnings"
          value={`₦${stats.todayEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend={{ value: 12, label: 'vs yesterday' }}
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Driver Rating"
          value={`${stats.rating} ★`}
          icon={Navigation}
          color="yellow"
        />
        <StatsCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          icon={MapPin}
          color="blue"
        />
      </div>

      {/* Available Dispatch Requests & Weekly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Available Delivery Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                  <p className="font-semibold text-foreground">No nearby dispatch requests</p>
                  <p>New orders in your area will notify automatically.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{job.pickup}</span>
                          <span>→</span>
                          <span>{job.dropoff}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block">{job.distance} away</span>
                      </div>

                      <div className="text-right space-y-1.5">
                        <span className="text-sm font-bold block text-emerald-600">
                          ₦{job.payout.toLocaleString()}
                        </span>
                        <Button size="sm" className="h-7 text-[11px] gradient-rush text-white px-3">
                          Accept Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <ChartWidget
            title="Daily Earnings (₦)"
            data={dailyEarnings}
            valuePrefix="₦"
          />
        </div>
      </div>
    </div>
  );
}