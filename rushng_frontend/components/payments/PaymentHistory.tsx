'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Download, 
  Eye,
  ChevronDown,
  ChevronUp,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { format, isValid } from 'date-fns';

export interface PaymentJob {
  id: string;
  title: string;
}

export interface PaymentItem {
  id: string;
  reference: string;
  amount: number;
  platform_fee?: number;
  provider_earnings?: number;
  status: 'pending' | 'held' | 'released' | 'failed' | 'refunded' | string;
  provider: string;
  created_at: string;
  job?: PaymentJob;
}

interface PaymentHistoryProps {
  payments: PaymentItem[];
  onFilterChange?: (filters: { status: string; search: string }) => void;
}

export function PaymentHistory({ payments = [], onFilterChange }: PaymentHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Handle local state & notify parent listener if provided
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setActiveTab(status);
    onFilterChange?.({ status, search: searchQuery });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFilterChange?.({ status: statusFilter, search: query });
  };

  // Filter pipeline
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      // 1. Status Check
      const matchesStatus =
        activeTab === 'all' || item.status.toLowerCase() === activeTab.toLowerCase();

      // 2. Search Query Check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.reference?.toLowerCase().includes(query) ||
        item.provider?.toLowerCase().includes(query) ||
        item.job?.title?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [payments, activeTab, searchQuery]);

  // Export to CSV helper
  const handleExportCSV = () => {
    if (!filteredPayments.length) return;

    const headers = ['Reference', 'Job', 'Provider', 'Amount (NGN)', 'Status', 'Date'];
    const rows = filteredPayments.map((p) => [
      p.reference,
      `"${p.job?.title || 'N/A'}"`,
      `"${p.provider || 'N/A'}"`,
      p.amount,
      p.status,
      format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RUSHNG_Payments_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      held: { label: 'Escrow Held', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      released: { label: 'Released', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      failed: { label: 'Failed', className: 'bg-rose-100 text-rose-800 border-rose-200' },
      refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    };
    return configs[status?.toLowerCase()] || { label: status, className: 'bg-slate-100 text-slate-700' };
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isValid(d) ? format(d, 'MMM d, yyyy') : 'N/A';
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Control Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search reference, provider, or job..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-40 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="held">Held (Escrow)</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="gap-2 bg-white text-slate-700 hover:bg-slate-50 shrink-0"
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleStatusChange} className="w-full">
        <TabsList className="grid grid-cols-5 w-full md:w-auto md:inline-flex bg-slate-100 p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="held">Held</TabsTrigger>
          <TabsTrigger value="released">Released</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transaction List Render */}
      {filteredPayments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-slate-800">No payment transactions found</p>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try tweaking your search or filter criteria.'
                : 'Transactions will appear here once dispatch requests or payments are initiated.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const statusConfig = getStatusBadge(payment.status);
            const isExpanded = expandedId === payment.id;

            return (
              <Card key={payment.id} className="transition-all hover:border-slate-300">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Details */}
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 shrink-0 mt-0.5">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 leading-none">
                          {payment.job?.title || 'Service Payment'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Provider: <span className="font-medium text-slate-700">{payment.provider || 'N/A'}</span>
                          <span className="mx-1.5">•</span>
                          {formatDate(payment.created_at)}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          Ref: {payment.reference ? payment.reference : payment.id}
                        </p>
                      </div>
                    </div>

                    {/* Right Amount & Badges */}
                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="font-bold text-slate-900 text-base">
                          ₦{payment.amount?.toLocaleString() || '0'}
                        </p>
                        <Badge variant="outline" className={`text-xs mt-0.5 ${statusConfig.className}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" asChild>
                          <Link href={`/payments/${payment.id}`} aria-label="View payment details">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
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

                  {/* Accordion Detail Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg p-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Assigned Provider:</span>
                          <span className="ml-2 font-medium text-slate-800">{payment.provider || 'Unassigned'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Platform Commission:</span>
                          <span className="ml-2 font-medium text-slate-800">
                            ₦{payment.platform_fee ? payment.platform_fee.toLocaleString() : '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Net Provider Earnings:</span>
                          <span className="ml-2 font-semibold text-emerald-600">
                            ₦{payment.provider_earnings ? payment.provider_earnings.toLocaleString() : '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Associated Job:</span>
                          <span className="ml-2">
                            {payment.job?.id ? (
                              <Link href={`/jobs/${payment.job.id}`} className="text-orange-600 hover:underline font-medium">
                                {payment.job.title || 'View Job details'}
                              </Link>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
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
    </div>
  );
}