'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Wallet,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface PaymentProviderOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  disabled?: boolean;
}

interface PaymentMethodProps {
  selected?: string;
  onSelect?: (provider: string) => void;
  onPay?: () => void;
  amount?: number;
  walletBalance?: number;
  loading?: boolean;
  allowWallet?: boolean;
}

export function PaymentMethod({
  selected = 'opay',
  onSelect,
  onPay,
  amount = 0,
  walletBalance,
  loading = false,
  allowWallet = false,
}: PaymentMethodProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(selected);

  // Keep internal state in sync with external controlled props
  useEffect(() => {
    if (selected) {
      setSelectedProvider(selected);
    }
  }, [selected]);

  const handleSelect = (value: string) => {
    setSelectedProvider(value);
    onSelect?.(value);
  };

  const isWalletInsufficient =
    allowWallet && walletBalance !== undefined && walletBalance < amount;

  const paymentProviders: PaymentProviderOption[] = [
    ...(allowWallet
      ? [
          {
            id: 'wallet',
            name: 'RushNG Escrow Wallet',
            description:
              walletBalance !== undefined
                ? `Balance: ₦${walletBalance.toLocaleString()}`
                : 'Instant payment from internal balance',
            icon: Wallet,
            color: 'bg-emerald-100 text-emerald-700',
            badge: isWalletInsufficient ? 'Insufficient Funds' : 'Fastest',
            disabled: isWalletInsufficient,
          },
        ]
      : []),
    {
      id: 'opay',
      name: 'OPay',
      description: 'Instant mobile transfer or OPay balance',
      icon: Smartphone,
      color: 'bg-emerald-50 text-emerald-600',
      badge: 'Popular',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Debit Cards, Bank Transfer, or USSD',
      icon: CreditCard,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Cards, Bank Accounts, or Mobile Money',
      icon: Building2,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Select Payment Provider</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose your preferred channel to fund escrow for this dispatch service.
        </p>
      </div>

      <RadioGroup
        value={selectedProvider}
        onValueChange={handleSelect}
        className="space-y-2.5"
      >
        {paymentProviders.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedProvider === provider.id;
          const isDisabled = provider.disabled || loading;

          return (
            <div
              key={provider.id}
              tabIndex={isDisabled ? -1 : 0}
              role="button"
              aria-disabled={isDisabled}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !isDisabled) {
                  e.preventDefault();
                  handleSelect(provider.id);
                }
              }}
              onClick={() => {
                if (!isDisabled) handleSelect(provider.id);
              }}
              className={`relative flex items-center gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                  : isSelected
                  ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <RadioGroupItem
                value={provider.id}
                id={provider.id}
                disabled={isDisabled}
                onClick={(e) => e.stopPropagation()}
                className="text-orange-500 border-slate-300 focus-visible:ring-orange-500"
              />

              <div className={`rounded-lg ${provider.color} p-2.5 shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={provider.id}
                    className="font-semibold text-slate-900 cursor-pointer text-sm"
                  >
                    {provider.name}
                  </Label>
                  {provider.badge && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 font-medium ${
                        provider.id === 'wallet' && isWalletInsufficient
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {provider.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {provider.description}
                </p>
              </div>

              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>

      {/* Payment Summary */}
      {amount > 0 && (
        <Card className="bg-slate-50/70 border-slate-200 shadow-none">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Escrow Service Charge</span>
              <span className="font-semibold text-slate-900">
                ₦{amount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="font-medium text-slate-900">Total Due Now</span>
              <span className="text-2xl font-bold text-orange-600">
                ₦{amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Pay Button */}
      <Button
        onClick={onPay}
        disabled={loading || !selectedProvider}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 rounded-xl transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Securing Payment...</span>
          </span>
        ) : (
          `Pay ₦${amount.toLocaleString()}`
        )}
      </Button>

      {/* Escrow Guarantee Notice */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Funds remain protected in Escrow until delivery is confirmed.</span>
      </div>
    </div>
  );
}