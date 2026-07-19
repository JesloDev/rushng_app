'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';

interface JobDetailsProps {
  job: any;
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge>{job.category}</Badge>
            <StatusBadge status={job.status} />
            {job.estimated_price && (
              <Badge variant="secondary">
                ₦{job.estimated_price.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
        {canApply && (
          <Button onClick={onApply} className="gradient-rush text-white">
            Apply Now
          </Button>
        )}
        {isOwner && job.status === 'posted' && (
          <Button variant="destructive" onClick={onCancel}>
            Cancel Job
          </Button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Location</h3>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">{job.address}</p>
                  {job.city && <p className="text-sm text-muted-foreground">{job.city}, {job.state}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}</span>
                </div>
                {job.scheduled_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span>{format(new Date(job.scheduled_time), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                {job.check_in_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked In</span>
                    <span>{format(new Date(job.check_in_time), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                {job.check_out_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked Out</span>
                    <span>{format(new Date(job.check_out_time), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                {job.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{format(new Date(job.completed_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Posted By</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {job.customer?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium">{job.customer?.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RatingStars rating={job.customer?.rating || 0} size="sm" showValue={false} />
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{job.customer?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{job.customer?.email}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={onContact}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </CardContent>
          </Card>

          {/* Provider Info (if assigned) */}
          {job.provider && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Provider</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    {job.provider.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{job.provider.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RatingStars rating={job.provider.rating || 0} size="sm" showValue={false} />
                      <span>({job.provider.rating || 0})</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{job.provider.total_jobs_completed || 0} jobs completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.provider.service_radius_km || 10} km radius</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated</span>
                  <span>₦{job.estimated_price?.toLocaleString() || 'Negotiable'}</span>
                </div>
                {job.final_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final</span>
                    <span className="font-bold text-green-600">
                      ₦{job.final_price.toLocaleString()}
                    </span>
                  </div>
                )}
                {job.service_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>₦{job.service_fee.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}