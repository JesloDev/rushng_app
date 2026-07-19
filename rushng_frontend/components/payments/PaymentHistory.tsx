'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  Download, 
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentHistoryProps {
  payments: any[];
  onFilterChange?: (filters: any) => void;
}

export function PaymentHistory({ payments, onFilterChange }: PaymentHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    provider: '',
    dateRange: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      held: { label: 'Held', className: 'bg-blue-100 text-blue-700' },
      released: { label: 'Released', className: 'bg-green-100 text-green-700' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
      refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-700' },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by reference or job..." className="pl-10" />
        </div>
        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="held">Held</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="held">Held</TabsTrigger>
          <TabsTrigger value="released">Released</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const status = getStatusBadge(payment.status);
                const isExpanded = expandedId === payment.id;

                return (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {payment.job?.title || 'Payment'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.provider} • {format(new Date(payment.created_at), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              Ref: {payment.reference.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-orange-500">
                              ₦{payment.amount.toLocaleString()}
                            </p>
                            <Badge className={status.className}>{status.label}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/payments/${payment.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <span className="ml-2">{payment.provider}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Platform Fee:</span>
                              <span className="ml-2">₦{payment.platform_fee?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Provider Earnings:</span>
                              <span className="ml-2 font-medium text-green-600">
                                ₦{payment.provider_earnings?.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Job:</span>
                              <span className="ml-2">
                                <Link href={`/jobs/${payment.job?.id}`} className="text-orange-500 hover:underline">
                                  {payment.job?.title || 'View Job'}
                                </Link>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}