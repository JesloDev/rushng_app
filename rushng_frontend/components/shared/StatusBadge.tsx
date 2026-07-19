'use client';

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
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_CONFIGS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  // Job statuses
  posted: { 
    label: 'Open', 
    className: 'bg-blue-100 text-blue-700',
    icon: <Clock className="h-3 w-3" />
  },
  assigned: { 
    label: 'Assigned', 
    className: 'bg-yellow-100 text-yellow-700',
    icon: <Loader2 className="h-3 w-3" />
  },
  in_progress: { 
    label: 'In Progress', 
    className: 'bg-orange-100 text-orange-700',
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  completed: { 
    label: 'Completed', 
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  cancelled: { 
    label: 'Cancelled', 
    className: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-3 w-3" />
  },
  
  // Payment statuses
  pending: { 
    label: 'Pending', 
    className: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="h-3 w-3" />
  },
  held: { 
    label: 'Held', 
    className: 'bg-blue-100 text-blue-700',
    icon: <Shield className="h-3 w-3" />
  },
  released: { 
    label: 'Released', 
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  failed: { 
    label: 'Failed', 
    className: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-3 w-3" />
  },
  refunded: { 
    label: 'Refunded', 
    className: 'bg-purple-100 text-purple-700',
    icon: <AlertCircle className="h-3 w-3" />
  },

  // Provider statuses
  verified: { 
    label: 'Verified', 
    className: 'bg-green-100 text-green-700',
    icon: <Check className="h-3 w-3" />
  },
  unverified: { 
    label: 'Unverified', 
    className: 'bg-gray-100 text-gray-700',
    icon: <AlertCircle className="h-3 w-3" />
  },
  suspended: { 
    label: 'Suspended', 
    className: 'bg-red-100 text-red-700',
    icon: <Ban className="h-3 w-3" />
  },

  // Violation statuses
  pending_review: { 
    label: 'Pending Review', 
    className: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="h-3 w-3" />
  },
  confirmed: { 
    label: 'Confirmed', 
    className: 'bg-red-100 text-red-700',
    icon: <AlertCircle className="h-3 w-3" />
  },
  dismissed: { 
    label: 'Dismissed', 
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  appealed: { 
    label: 'Appealed', 
    className: 'bg-purple-100 text-purple-700',
    icon: <Shield className="h-3 w-3" />
  },
  resolved: { 
    label: 'Resolved', 
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
};

export function StatusBadge({ status, className, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status];
  
  if (!config) {
    return (
      <span className={cn(
        'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700',
        className
      )}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.className,
      sizeClasses[size],
      className
    )}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}