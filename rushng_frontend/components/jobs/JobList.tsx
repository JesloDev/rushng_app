'use client';

import { useState } from 'react';
import { JobCard } from './JobCard';
import { JobFilters, FilterState } from './JobFilters';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Briefcase, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface JobItem {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  address: string;
  pickup_address?: string;
  dropoff_address?: string;
  estimated_price: number;
  created_at: string;
  is_dispatch?: boolean;
  customer?: { full_name: string };
}

interface JobListProps {
  jobs: JobItem[];
  loading?: boolean;
  onFilterChange?: (filters: FilterState) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  categories?: string[];
}

export function JobList({
  jobs = [],
  loading = false,
  onFilterChange,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  categories = [],
}: JobListProps) {
  const [filterKey, setFilterKey] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleFilterChange = (newFilters: FilterState) => {
    onFilterChange?.(newFilters);
  };

  const handleResetFilters = () => {
    setFilterKey((prev) => prev + 1); // Triggers re-mount of JobFilters to reset state
    onFilterChange?.({
      search: '',
      category: 'all',
      status: 'all',
      jobType: 'all',
      minPrice: '',
      maxPrice: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Filters (Unified for Mobile & Desktop) */}
      <JobFilters
        key={filterKey}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {/* Control Bar: Results Count & Grid/List View Toggles */}
      <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground pt-1">
        <p>
          {loading ? (
            'Fetching available jobs...'
          ) : (
            <>
              Showing <span className="font-bold text-foreground">{jobs.length}</span> of{' '}
              <span className="font-bold text-foreground">{totalItems || jobs.length}</span> jobs
            </>
          )}
        </p>

        <div className="hidden sm:flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-card">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Loading Skeleton View */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 border border-border/60 bg-card rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State with persistent filter bar above */
        <EmptyState
          icon={Briefcase}
          title="No jobs matching your criteria"
          description="We couldn't find any listings matching your current filter selection. Try clearing search keywords or budget ranges."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        /* Animated Cards Grid/List */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'space-y-4'
            }
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pt-4 border-t border-border/40 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange || (() => {})}
          />
        </div>
      )}
    </div>
  );
}