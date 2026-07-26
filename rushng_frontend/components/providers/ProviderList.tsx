'use client';

import { useState } from 'react';
import { ProviderCard, Provider } from './ProviderCard';
import { ProviderSearch } from './ProviderSearch';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, RotateCcw } from 'lucide-react';

interface ProviderListProps {
  providers: Provider[];
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (results: Provider[]) => void;
}

export function ProviderList({
  providers = [],
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onSearch,
}: ProviderListProps) {
  const [searchResults, setSearchResults] = useState<Provider[] | null>(null);

  const displayProviders = searchResults !== null ? searchResults : providers;
  const isFiltered = searchResults !== null;

  const handleSearchResults = (results: Provider[]) => {
    setSearchResults(results);
    onSearch?.(results);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Header Section */}
      <ProviderSearch onResults={handleSearchResults} />

      {/* Results Meta Info */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-slate-600">
            {isFiltered
              ? `Showing ${displayProviders.length} search result${displayProviders.length === 1 ? '' : 's'}`
              : `Available Dispatchers & Providers (${displayProviders.length})`}
          </p>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Search
            </Button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <ProviderSkeletonGrid />
      ) : displayProviders.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
          <EmptyState
            icon={Users}
            title="No providers or dispatchers found"
            description={
              isFiltered
                ? 'No matches found for your criteria. Try adjusting your search keywords or distance radius.'
                : 'There are currently no active providers available in this area.'
            }
          />
          {isFiltered && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="gap-2 text-slate-700 border-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Search Filter
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Provider Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !isFiltered && totalPages > 1 && (
        <div className="pt-4 flex justify-center">
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

/**
 * Skeleton loader matching ProviderCard layout for zero layout shifts
 */
function ProviderSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-14 w-14 rounded-full bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 bg-slate-100" />
              <Skeleton className="h-3 w-1/2 bg-slate-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 bg-slate-100 rounded-md" />
            <Skeleton className="h-5 w-20 bg-slate-100 rounded-md" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <Skeleton className="h-4 w-20 bg-slate-100" />
            <Skeleton className="h-4 w-16 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}