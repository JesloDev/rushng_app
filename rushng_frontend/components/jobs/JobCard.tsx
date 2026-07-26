'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Truck, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    address: string;
    pickup_address?: string;
    dropoff_address?: string;
    estimated_price: number;
    created_at: string;
    is_dispatch?: boolean;
    customer?: { full_name: string };
  };
  onStatusChange?: () => void;
}

export function JobCard({ job }: JobCardProps) {
  const isDispatch = job.is_dispatch || job.category?.toLowerCase().includes('dispatch');

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/jobs/${job.id}`} className="block">
        <Card className="group border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
          <CardContent className="p-5 md:p-6 space-y-4">
            {/* Header: Title, Category Badge, and Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {isDispatch ? (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Dispatch & Delivery
                      </span>
                    ) : (
                      job.category || 'General Service'
                    )}
                  </Badge>
                  
                  {job.customer?.full_name && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {job.customer.full_name}
                    </span>
                  )}
                </div>

                <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 pt-0.5">
                  {job.title}
                </h3>
              </div>

              <div className="shrink-0">
                <StatusBadge status={job.status} size="sm" />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            {/* Address / Dispatch Route */}
            <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-1.5">
              {isDispatch && (job.pickup_address || job.dropoff_address) ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-foreground">From:</span>
                    <span className="truncate">{job.pickup_address || job.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                    <span className="font-medium text-foreground">To:</span>
                    <span className="truncate">{job.dropoff_address || 'Destination on map'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{job.address || 'Location not specified'}</span>
                </div>
              )}
            </div>

            {/* Footer Metadata: Price and Time */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
              <div className="flex items-center gap-1 font-extrabold text-foreground text-sm md:text-base">
                <span className="text-primary font-bold">₦</span>
                <span>
                  {job.estimated_price
                    ? Number(job.estimated_price).toLocaleString('en-NG', {
                        minimumFractionDigits: 0,
                      })
                    : 'Negotiable'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {job.created_at
                    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
                    : 'Just now'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}