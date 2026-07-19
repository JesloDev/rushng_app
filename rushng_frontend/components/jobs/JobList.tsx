'use client';

import { useState } from 'react';
import { JobCard } from './JobCard';
import { JobFilters } from './JobFilters';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Pagination } from '@/components/shared/Pagination';
import { Briefcase, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface JobListProps {
  jobs: any[];
  loading?: boolean;
  onFilterChange?: (filters: any) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  categories?: string[];
}

export function JobList({
  jobs,
  loading = false,
  onFilterChange,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  categories = [],
}: JobListProps) {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (loading) {
    return <LoadingSpinner text="Loading jobs..." />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs found"
        description="Try adjusting your filters or check back later for new opportunities."
        actionLabel="Clear Filters"
        onAction={() => {
          setFilters({});
          onFilterChange?.({});
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filter */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <JobFilters
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter */}
      <div className="hidden md:block">
        <JobFilters
          onFilterChange={handleFilterChange}
          categories={categories}
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {jobs.length} of {totalItems} jobs
      </p>

      {/* Job Cards */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange || (() => {})}
        />
      )}
    </div>
  );
}