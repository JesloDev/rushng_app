'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    address: string;
    estimated_price: number;
    created_at: string;
    customer?: { full_name: string };
  };
  onStatusChange?: () => void;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                </div>
                <StatusBadge status={job.status} size="sm" />
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.address || 'Location not specified'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  ₦{job.estimated_price?.toLocaleString() || 'Negotiable'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}