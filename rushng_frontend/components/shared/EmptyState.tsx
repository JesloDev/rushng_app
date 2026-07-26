'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'outline',
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50',
        className
      )}
    >
      <div className="rounded-full bg-slate-100 p-4 mb-4 text-slate-400 border border-slate-200/60 shadow-2xs transition-colors">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          onClick={onAction}
          className={cn(
            actionVariant === 'default' && 'gradient-rush text-white shadow-xs',
            actionVariant === 'outline' && 'border-slate-200 hover:bg-slate-100'
          )}
        >
          {actionLabel}
        </Button>
      )}
      
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}