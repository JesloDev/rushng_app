'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Check,
  Ban,
  Truck,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  className: string;
  icon: (iconSize: string) => React.ReactNode;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Job & Order Statuses
  posted: {
    label: 'Open',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
    icon: (s) => <Clock className={s} />,
  },
  assigned: {
    label: 'Assigned',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    icon: (s) => <Loader2 className={s} />,
  },
  in_progress: {
    label: 'In Progress',
    className:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900',
    icon: (s) => <Loader2 className={cn(s, 'animate-spin')} />,
  },
  picked_up: {
    label: 'Picked Up',
    className:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900',
    icon: (s) => <PackageCheck className={s} />,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900',
    icon: (s) => <Truck className={s} />,
  },
  completed: {
    label: 'Completed',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    icon: (s) => <CheckCircle2 className={s} />,
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    icon: (s) => <XCircle className={s} />,
  },
  delayed: {
    label: 'Delayed',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    icon: (s) => <AlertTriangle className={s} />,
  },

  // Payment Statuses
  pending: {
    label: 'Pending',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    icon: (s) => <Clock className={s} />,
  },
  held: {
    label: 'Held',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
    icon: (s) => <Shield className={s} />,
  },
  released: {
    label: 'Released',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    icon: (s) => <CheckCircle2 className={s} />,
  },
  failed: {
    label: 'Failed',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    icon: (s) => <XCircle className={s} />,
  },
  refunded: {
    label: 'Refunded',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900',
    icon: (s) => <AlertCircle className={s} />,
  },

  // Account & Provider Verification
  verified: {
    label: 'Verified',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    icon: (s) => <Check className={s} />,
  },
  unverified: {
    label: 'Unverified',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: (s) => <AlertCircle className={s} />,
  },
  suspended: {
    label: 'Suspended',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    icon: (s) => <Ban className={s} />,
  },

  // Violation / Incident Tracking
  pending_review: {
    label: 'Pending Review',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    icon: (s) => <Clock className={s} />,
  },
  confirmed: {
    label: 'Confirmed',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    icon: (s) => <AlertCircle className={s} />,
  },
  dismissed: {
    label: 'Dismissed',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    icon: (s) => <CheckCircle2 className={s} />,
  },
  appealed: {
    label: 'Appealed',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900',
    icon: (s) => <Shield className={s} />,
  },
  resolved: {
    label: 'Resolved',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    icon: (s) => <CheckCircle2 className={s} />,
  },
};

export function StatusBadge({
  status,
  className,
  size = 'md',
  showIcon = true,
}: StatusBadgeProps) {
  const normalizedKey = status ? status.toLowerCase().trim() : '';
  const config = STATUS_CONFIGS[normalizedKey];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  if (!config) {
    const formattedFallback = status
      ? status.replace(/_/g, ' ').toUpperCase()
      : 'UNKNOWN';

    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300',
          sizeClasses[size],
          className
        )}
      >
        {formattedFallback}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shrink-0 transition-colors',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && config.icon(iconSizeClasses[size])}
      <span>{config.label}</span>
    </span>
  );
}