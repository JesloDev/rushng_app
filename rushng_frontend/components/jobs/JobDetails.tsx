'item client';

import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Briefcase,
  Truck,
  ArrowRight,
  ShieldCheck,
  Navigation,
  FileText,
  DollarSign,
  Gavel,
  LogIn,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';

export interface JobDetailsData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'posted' | 'bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  city?: string;
  state?: string;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_phone?: string;
  recipient_phone?: string;
  estimated_price?: number;
  final_price?: number;
  service_fee?: number;
  created_at: string;
  scheduled_time?: string;
  check_in_time?: string;
  check_out_time?: string;
  completed_at?: string;
  is_dispatch?: boolean;
  customer?: {
    id?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    rating?: number;
  };
  provider?: {
    id?: string;
    full_name?: string;
    phone?: string;
    rating?: number;
    total_jobs_completed?: number;
    service_radius_km?: number;
  };
}

interface JobDetailsProps {
  job: JobDetailsData;
  isOwner?: boolean;
  canApply?: boolean;
  onApply?: () => void;
  onCancel?: () => void;
  onContact?: () => void;
}

export function JobDetails({
  job,
  isOwner = false,
  canApply = false,
  onApply,
  onCancel,
  onContact,
}: JobDetailsProps) {
  const isDispatch = job.is_dispatch || job.category?.toLowerCase().includes('dispatch');

  // Timeline events helper
  const timelineEvents = [
    { label: 'Job Posted', time: job.created_at, active: !!job.created_at },
    { label: 'Scheduled', time: job.scheduled_time, active: !!job.scheduled_time },
    { label: 'Checked In', time: job.check_in_time, active: !!job.check_in_time },
    { label: 'Checked Out', time: job.check_out_time, active: !!job.check_out_time },
    { label: 'Completed', time: job.completed_at, active: !!job.completed_at },
  ].filter((event) => event.time);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-border/60 bg-card overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">
                  {isDispatch ? (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Dispatch & Delivery
                    </span>
                  ) : (
                    job.category || 'General Service'
                  )}
                </Badge>

                <StatusBadge status={job.status} />

                {job.estimated_price && (
                  <Badge variant="secondary" className="font-bold text-xs">
                    ₦{Number(job.estimated_price).toLocaleString('en-NG')}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {job.created_at ? format(new Date(job.created_at), 'MMM d, yyyy • h:mm a') : 'Recently'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {job.address || 'Lagos, Nigeria'}
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {canApply && (
                <Button onClick={onApply} size="lg" className="gradient-rush text-white w-full sm:w-auto font-semibold">
                  Submit Bid / Apply
                </Button>
              )}

              {isOwner && (
                <Link href={`/jobs/${job.id}/bids`} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full gap-2 font-semibold">
                    <Gavel className="h-4 w-4" />
                    View Bids
                  </Button>
                </Link>
              )}

              {(job.status === 'in_progress' || job.status === 'assigned') && (
                <Link href={`/jobs/${job.id}/tracking`} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10 font-semibold">
                    <Navigation className="h-4 w-4" />
                    Live Tracking
                  </Button>
                </Link>
              )}

              {isOwner && job.status === 'posted' && (
                <Button variant="destructive" size="lg" onClick={onCancel} className="w-full sm:w-auto font-semibold">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Job
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description || 'No detailed description provided for this job.'}
              </p>
            </CardContent>
          </Card>

          {/* Location & Delivery Route Details */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {isDispatch ? 'Dispatch Route & Addresses' : 'Location Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDispatch ? (
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      PICKUP LOCATION
                    </div>
                    <p className="font-medium text-foreground">{job.pickup_address || job.address}</p>
                    {job.pickup_phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                        <Phone className="h-3 w-3" /> Pickup Contact: {job.pickup_phone}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400 text-xs">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      DELIVERY DROPOFF
                    </div>
                    <p className="font-medium text-foreground">{job.dropoff_address || 'Destination provided upon acceptance'}</p>
                    {job.recipient_phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                        <Phone className="h-3 w-3" /> Recipient Contact: {job.recipient_phone}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm">
                  <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{job.address}</p>
                    {job.city && (
                      <p className="text-xs text-muted-foreground pt-0.5">
                        {job.city}{job.state ? `, ${job.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Job Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length > 0 ? (
                <div className="space-y-4">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs md:text-sm">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className={`h-4 w-4 ${event.active ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                        <span className="font-medium text-foreground">{event.label}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        {format(new Date(event.time!), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No milestone events recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Customer, Provider, & Pricing */}
        <div className="space-y-6">
          {/* Quick Check-In / Check-Out Execution (For Assigned Provider) */}
          {(job.status === 'assigned' || job.status === 'in_progress') && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                  Provider Work Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!job.check_in_time && (
                  <Link href={`/jobs/${job.id}/check-in`} className="block">
                    <Button className="w-full gap-2 gradient-rush text-white text-xs font-bold h-9">
                      <LogIn className="h-4 w-4" /> Perform Location Check-In
                    </Button>
                  </Link>
                )}
                {job.check_in_time && !job.check_out_time && (
                  <Link href={`/jobs/${job.id}/check-out`} className="block">
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9">
                      <LogOut className="h-4 w-4" /> Complete Work Check-Out
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing Breakdown */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Escrow & Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Budget</span>
                <span className="font-medium text-foreground">
                  {job.estimated_price
                    ? `₦${Number(job.estimated_price).toLocaleString('en-NG')}`
                    : 'Negotiable'}
                </span>
              </div>

              {job.final_price && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Agreed Final Amount</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                    ₦{Number(job.final_price).toLocaleString('en-NG')}
                  </span>
                </div>
              )}

              {job.service_fee && (
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>Platform Escrow Fee</span>
                  <span>₦{Number(job.service_fee).toLocaleString('en-NG')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Profile */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Client / Posted By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-sm border border-primary/20 shrink-0">
                  {job.customer?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{job.customer?.full_name || 'Anonymous User'}</p>
                  <RatingStars rating={job.customer?.rating || 5} size="sm" showValue />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{job.customer?.phone || 'Phone verified'}</span>
                </div>
                {job.customer?.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{job.customer?.email}</span>
                  </div>
                )}
              </div>

              {onContact && (
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2 font-semibold" onClick={onContact}>
                  <MessageCircle className="h-4 w-4 text-primary" /> Direct Message Client
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Assigned Provider Profile */}
          {job.provider && (
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Assigned Service Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-sm border border-amber-500/20 shrink-0">
                    {job.provider.full_name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{job.provider.full_name}</p>
                    <RatingStars rating={job.provider.rating || 5} size="sm" showValue />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <span>{job.provider.total_jobs_completed || 0} jobs completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Active within {job.provider.service_radius_km || 15} km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}