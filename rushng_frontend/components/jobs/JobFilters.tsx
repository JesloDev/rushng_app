'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RotateCcw, SlidersHorizontal, X, Truck, Wrench } from 'lucide-react';

export interface FilterState {
  search: string;
  category: string;
  status: string;
  jobType: string;
  minPrice: string;
  maxPrice: string;
}

interface JobFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: string[];
  initialFilters?: Partial<FilterState>;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'all',
  status: 'all',
  jobType: 'all',
  minPrice: '',
  maxPrice: '',
};

export function JobFilters({
  onFilterChange,
  categories = [],
  initialFilters = {},
}: JobFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input to avoid spamming callbacks on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== filters.search) {
        handleFilterUpdate('search', debouncedSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [debouncedSearch]);

  const handleFilterUpdate = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        onFilterChange(updated);
        return updated;
      });
    },
    [onFilterChange]
  );

  const handleReset = () => {
    setDebouncedSearch('');
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  // Count active non-default filters
  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'category' || key === 'status' || key === 'jobType') return val !== 'all';
    return val !== '';
  }).length;

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'posted', label: 'Posted' },
    { value: 'bidding', label: 'Open for Bids' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const jobTypes = [
    { value: 'all', label: 'All Work Types' },
    { value: 'standard', label: 'Artisan / Service' },
    { value: 'dispatch', label: 'Dispatch / Delivery' },
  ];

  return (
    <div className="space-y-3 bg-card border border-border/60 p-4 rounded-xl shadow-xs">
      {/* Top Search & Primary Selects */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title, location, or keywords..."
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="pl-9 bg-background/50 text-sm"
          />
          {debouncedSearch && (
            <button
              onClick={() => {
                setDebouncedSearch('');
                handleFilterUpdate('search', '');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <Select
          value={filters.category}
          onValueChange={(val) => handleFilterUpdate('category', val)}
        >
          <SelectTrigger className="w-full md:w-48 bg-background/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={filters.status}
          onValueChange={(val) => handleFilterUpdate('status', val)}
        >
          <SelectTrigger className="w-full md:w-40 bg-background/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((st) => (
              <SelectItem key={st.value} value={st.value}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Toggle & Reset Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Button
            variant={showAdvanced ? 'secondary' : 'outline'}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex-1 md:flex-none gap-2 text-xs font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            More
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 px-1.5 py-0 text-[10px] h-4">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Reset Filters"
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filters */}
      {showAdvanced && (
        <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in-50 duration-150">
          {/* Job Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Service Type</label>
            <Select
              value={filters.jobType}
              onValueChange={(val) => handleFilterUpdate('jobType', val)}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((jt) => (
                  <SelectItem key={jt.value} value={jt.value}>
                    <span className="flex items-center gap-2">
                      {jt.value === 'dispatch' ? (
                        <Truck className="h-3.5 w-3.5 text-primary" />
                      ) : jt.value === 'standard' ? (
                        <Wrench className="h-3.5 w-3.5 text-primary" />
                      ) : null}
                      {jt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Min Budget (₦)</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={filters.minPrice}
              onChange={(e) => handleFilterUpdate('minPrice', e.target.value)}
              className="bg-background/50 text-sm"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Max Budget (₦)</label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterUpdate('maxPrice', e.target.value)}
              className="bg-background/50 text-sm"
            />
          </div>
        </div>
      )}

      {/* Active Filters Pill Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">Active:</span>

          {filters.search && (
            <Badge variant="secondary" className="text-[11px] gap-1 font-normal py-0.5">
              "{filters.search}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setDebouncedSearch('');
                  handleFilterUpdate('search', '');
                }}
              />
            </Badge>
          )}

          {filters.category !== 'all' && (
            <Badge variant="secondary" className="text-[11px] gap-1 font-normal py-0.5">
              Category: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleFilterUpdate('category', 'all')}
              />
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="secondary" className="text-[11px] gap-1 font-normal py-0.5">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleFilterUpdate('status', 'all')}
              />
            </Badge>
          )}

          {filters.jobType !== 'all' && (
            <Badge variant="secondary" className="text-[11px] gap-1 font-normal py-0.5">
              Type: {filters.jobType}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleFilterUpdate('jobType', 'all')}
              />
            </Badge>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="text-[11px] gap-1 font-normal py-0.5">
              Price: ₦{filters.minPrice || '0'} - ₦{filters.maxPrice || '∞'}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  handleFilterUpdate('minPrice', '');
                  handleFilterUpdate('maxPrice', '');
                }}
              />
            </Badge>
          )}

          <Button
            variant="link"
            size="sm"
            onClick={handleReset}
            className="text-[11px] h-auto p-0 text-muted-foreground hover:text-destructive underline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}