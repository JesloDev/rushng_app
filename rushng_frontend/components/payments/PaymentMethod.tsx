'use client';

import { useState } from 'react';
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
} from 'lucide-react';

const PAYMENT_PROVIDERS = [
  { id: 'opay', name: 'OPay', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
  { id: 'paystack', name: 'Paystack', icon: CreditCard, color: 'bg-purple-100 text-purple-600' },
  { id: 'flutterwave', name: 'Flutterwave', icon: Building2, color: 'bg-orange-100 text-orange-600' },
];

interface PaymentMethodProps {
  selected?: string;
  onSelect?: (provider: string) => void;
  onPay?: () => void;
  amount?: number;
  loading?: boolean;
}

export function PaymentMethod({
  selected = 'opay',
  onSelect,
  onPay,
  amount = 0,
  loading = false,
}: PaymentMethodProps) {
  const [selectedProvider, setSelectedProvider] = useState(selected);

  const handleSelect = (value: string) => {
    setSelectedProvider(value);
    onSelect?.(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Select Payment Provider</h3>
      <RadioGroup value={selectedProvider} onValueChange={handleSelect} className="space-y-3">
        {PAYMENT_PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedProvider === provider.id;
          
          return (
            <div
              key={provider.id}
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition ${
                isSelected ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-300'
              }`}
              onClick={() => handleSelect(provider.id)}
            >
              <RadioGroupItem value={provider.id} id={provider.id} />
              <div className={`rounded-lg ${provider.color} p-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor={provider.id} className="font-medium cursor-pointer">
                  {provider.name}
                </Label>
                <p className="text-sm text-muted-foreground">Secure payment via {provider.name}</p>
              </div>
              {isSelected && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
            </div>
          );
        })}
      </RadioGroup>

      {amount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-orange-500">
                ₦{amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={onPay}
        disabled={loading || !selectedProvider}
        className="w-full gradient-rush text-white h-12"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₦${amount.toLocaleString()}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure. Funds are held in escrow until job completion.
      </p>
    </div>
  );
}