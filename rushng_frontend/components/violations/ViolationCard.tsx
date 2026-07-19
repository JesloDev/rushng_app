'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';

interface ViolationCardProps {
  violation: any;
  onAppeal?: (id: string) => void;
}

export function ViolationCard({ violation, onAppeal }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      minor: { label: 'Minor', className: 'bg-yellow-100 text-yellow-700' },
      major: { label: 'Major', className: 'bg-orange-100 text-orange-700' },
      critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
    };
    return configs[severity] || { label: severity, className: 'bg-gray-100 text-gray-700' };
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: React.ReactNode }> = {
      pending_review: { label: 'Pending Review', icon: <Clock className="h-4 w-4" /> },
      confirmed: { label: 'Confirmed', icon: <AlertCircle className="h-4 w-4" /> },
      dismissed: { label: 'Dismissed', icon: <CheckCircle2 className="h-4 w-4" /> },
      appealed: { label: 'Appealed', icon: <Shield className="h-4 w-4" /> },
      resolved: { label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" /> },
    };
    return configs[status] || { label: status, icon: null };
  };

  const severity = getSeverityConfig(violation.severity);
  const status = getStatusConfig(violation.status);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-1 rounded-full p-1.5 ${
              violation.severity === 'critical' ? 'bg-red-100' :
              violation.severity === 'major' ? 'bg-orange-100' : 'bg-yellow-100'
            }`}>
              <AlertCircle className={`h-4 w-4 ${
                violation.severity === 'critical' ? 'text-red-600' :
                violation.severity === 'major' ? 'text-orange-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{violation.title}</p>
                <Badge className={severity.className}>{severity.label}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
                <span>•</span>
                <span>{format(new Date(violation.created_at), 'MMM d, yyyy')}</span>
                {violation.points_deducted > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500">-{violation.points_deducted} points</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {violation.status === 'confirmed' && violation.appeal_status !== 'pending' && (
              <Button size="sm" variant="outline" onClick={() => onAppeal?.(violation.id)}>
                Appeal
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-sm text-gray-600">{violation.description}</p>
            {violation.evidence && violation.evidence.length > 0 && (
              <div>
                <p className="text-sm font-medium">Evidence</p>
                <p className="text-sm text-muted-foreground">
                  {violation.evidence.length} file(s) attached
                </p>
              </div>
            )}
            {violation.resolution && (
              <div>
                <p className="text-sm font-medium">Resolution</p>
                <p className="text-sm text-gray-600">{violation.resolution}</p>
              </div>
            )}
            {violation.appeal_reason && (
              <div>
                <p className="text-sm font-medium">Appeal Reason</p>
                <p className="text-sm text-gray-600">{violation.appeal_reason}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}