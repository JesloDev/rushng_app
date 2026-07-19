'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Shield, AlertCircle } from 'lucide-react';

interface PaymentSummaryProps {
  amount: number;
  platformFee: number;
  providerEarnings: number;
  status?: string;
  reference?: string;
  onViewReceipt?: () => void;
}

export function PaymentSummary({
  amount,
  platformFee,
  providerEarnings,
  status = 'held',
  reference,
  onViewReceipt,
}: PaymentSummaryProps) {
  const total = amount + platformFee;

  const statusConfigs: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending: { 
      label: 'Pending', 
      icon: <Clock className="h-4 w-4" />,
      className: 'text-yellow-600 bg-yellow-50',
    },
    held: { 
      label: 'Held in Escrow', 
      icon: <Shield className="h-4 w-4" />,
      className: 'text-blue-600 bg-blue-50',
    },
    released: { 
      label: 'Released', 
      icon: <CheckCircle2 className="h-4 w-4" />,
      className: 'text-green-600 bg-green-50',
    },
    failed: { 
      label: 'Failed', 
      icon: <AlertCircle className="h-4 w-4" />,
      className: 'text-red-600 bg-red-50',
    },
  };

  const statusConfig = statusConfigs[status] || statusConfigs.pending;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Payment Summary</h3>
          <Badge className={statusConfig.className}>
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job Cost</span>
            <span>₦{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee (10%)</span>
            <span>₦{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider Earnings</span>
            <span className="text-green-600">₦{providerEarnings.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-orange-500 text-xl">₦{total.toLocaleString()}</span>
        </div>

        {reference && (
          <div className="text-xs text-muted-foreground">
            Reference: <span className="font-mono">{reference}</span>
          </div>
        )}

        {onViewReceipt && (
          <Button variant="outline" className="w-full" onClick={onViewReceipt}>
            View Receipt
          </Button>
        )}
      </CardContent>
    </Card>
  );
}