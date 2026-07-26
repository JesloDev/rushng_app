'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  AlertCircle, 
  FileText,
  RotateCcw,
  Info
} from 'lucide-react';

export interface PaymentSummaryProps {
  amount: number;
  platformFee?: number;
  providerEarnings?: number;
  status?: 'pending' | 'held' | 'released' | 'failed' | 'refunded' | string;
  reference?: string;
  role?: 'client' | 'provider' | 'admin';
  onViewReceipt?: () => void;
}

export function PaymentSummary({
  amount = 0,
  platformFee,
  providerEarnings,
  status = 'held',
  reference,
  role = 'client',
  onViewReceipt,
}: PaymentSummaryProps) {
  // Compute fees cleanly if not explicitly passed
  const calculatedPlatformFee = platformFee ?? Math.round(amount * 0.1);
  const calculatedProviderEarnings = providerEarnings ?? Math.max(0, amount - calculatedPlatformFee);
  
  // Total client bill: amount covers the dispatch delivery cost
  const total = amount;

  const statusConfigs: Record<
    string,
    { label: string; icon: React.ReactNode; className: string; description: string }
  > = {
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3.5 w-3.5" />,
      className: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Awaiting payment confirmation from the provider channel.',
    },
    held: {
      label: 'Held in Escrow',
      icon: <Shield className="h-3.5 w-3.5" />,
      className: 'text-blue-700 bg-blue-50 border-blue-200',
      description: 'Funds are securely locked in escrow until item delivery is confirmed.',
    },
    released: {
      label: 'Released',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Funds have been dispatched directly to the provider wallet.',
    },
    failed: {
      label: 'Failed',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Transaction was declined or cancelled.',
    },
    refunded: {
      label: 'Refunded',
      icon: <RotateCcw className="h-3.5 w-3.5" />,
      className: 'text-purple-700 bg-purple-50 border-purple-200',
      description: 'Funds have been credited back to the original funding source.',
    },
  };

  const currentStatusKey = status.toLowerCase();
  const statusConfig = statusConfigs[currentStatusKey] || statusConfigs.pending;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardContent className="p-6 space-y-4">
        {/* Header & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-base">Payment Summary</h3>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium text-xs rounded-full ${statusConfig.className}`}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        <Separator className="bg-slate-100" />

        {/* Breakdown Items */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Dispatch Fee</span>
            <span className="font-medium text-slate-800">
              ₦{(amount || 0).toLocaleString()}
            </span>
          </div>

          {(role === 'admin' || role === 'provider') && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Platform Commission (10%)</span>
                <span className="text-slate-500">
                  - ₦{calculatedPlatformFee.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Net Rider Payout</span>
                <span className="text-emerald-600 font-semibold">
                  ₦{calculatedProviderEarnings.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-slate-100" />

        {/* Total Cost Highlight */}
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-slate-900 text-base">Total Amount</span>
          <span className="text-2xl font-bold text-orange-600">
            ₦{(total || 0).toLocaleString()}
          </span>
        </div>

        {/* Reference & Description Note */}
        <div className="space-y-2 pt-1">
          {reference && (
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono font-medium text-slate-700">{reference}</span>
            </div>
          )}

          <div className="flex items-start gap-2 p-2.5 bg-slate-50/70 rounded-lg text-xs text-slate-600">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-tight">{statusConfig.description}</p>
          </div>
        </div>

        {/* Optional Action Button */}
        {onViewReceipt && (
          <Button
            variant="outline"
            className="w-full mt-2 gap-2 text-slate-700 border-slate-200 hover:bg-slate-50"
            onClick={onViewReceipt}
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>View Detailed Receipt</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}