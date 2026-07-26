'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

export interface ViolationItem {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical' | string;
  status: 'pending_review' | 'confirmed' | 'dismissed' | 'appealed' | 'resolved' | string;
  created_at: string | Date;
  points_deducted?: number;
  evidence?: string[];
  resolution?: string;
  appeal_reason?: string;
  appeal_status?: 'pending' | 'approved' | 'rejected' | string;
}

interface ViolationCardProps {
  violation: ViolationItem;
  onAppeal?: (id: string) => void;
  className?: string;
}

export function ViolationCard({ violation, onAppeal, className }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityConfig = (severity: string) => {
    const key = severity ? severity.toLowerCase() : '';
    const configs: Record<string, { label: string; className: string }> = {
      minor: {
        label: 'Minor',
        className:
          'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      },
      major: {
        label: 'Major',
        className:
          'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      },
      critical: {
        label: 'Critical',
        className:
          'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      },
    };
    return (
      configs[key] || {
        label: severity || 'Standard',
        className:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      }
    );
  };

  const severityConfig = getSeverityConfig(violation.severity);

  // Safe date parsing logic
  const dateObj = new Date(violation.created_at);
  const formattedDate = isValid(dateObj)
    ? format(dateObj, 'MMM d, yyyy')
    : 'Recent';

  const isCritical = violation.severity === 'critical';
  const isMajor = violation.severity === 'major';

  return (
    <Card className={cn('overflow-hidden transition-all duration-200', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'mt-0.5 rounded-full p-2 shrink-0',
                isCritical
                  ? 'bg-rose-100 dark:bg-rose-950/60'
                  : isMajor
                  ? 'bg-orange-100 dark:bg-orange-950/60'
                  : 'bg-amber-100 dark:bg-amber-950/60'
              )}
            >
              <AlertCircle
                className={cn(
                  'h-4 w-4',
                  isCritical
                    ? 'text-rose-600 dark:text-rose-400'
                    : isMajor
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {violation.title}
                </h4>
                <Badge
                  variant="outline"
                  className={cn('text-[11px] font-semibold border-transparent', severityConfig.className)}
                >
                  {severityConfig.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <StatusBadge status={violation.status} size="sm" />
                <span>•</span>
                <span>{formattedDate}</span>
                {violation.points_deducted && violation.points_deducted > 0 ? (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      -{violation.points_deducted} pts
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {violation.status === 'confirmed' && violation.appeal_status !== 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold"
                onClick={() => onAppeal?.(violation.id)}
              >
                <Shield className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
                Appeal
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800 text-xs sm:text-sm">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Description</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                {violation.description || 'No detailed description provided.'}
              </p>
            </div>

            {violation.evidence && violation.evidence.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Attached Evidence</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {violation.evidence.map((fileUrl, idx) => {
                    const isImg = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i);
                    return (
                      <a
                        key={`${fileUrl}-${idx}`}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                      >
                        {isImg ? (
                          <img
                            src={fileUrl}
                            alt={`Evidence #${idx + 1}`}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-slate-400" />
                        )}
                        <span>Evidence #{idx + 1}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {violation.resolution && (
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                  Admin Resolution
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  {violation.resolution}
                </p>
              </div>
            )}

            {violation.appeal_reason && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Submitted Appeal Reason
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  {violation.appeal_reason}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}