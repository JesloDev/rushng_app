'use client';

import { ProviderCard } from './ProviderCard';
import { ProviderSearch } from './ProviderSearch';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Pagination } from '@/components/shared/Pagination';
import { Users } from 'lucide-react';
import { useState } from 'react';

interface ProviderListProps {
  providers: any[];
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (results: any[]) => void;
}

export function ProviderList({
  providers,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onSearch,
}: ProviderListProps) {
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  const displayProviders = searchResults !== null ? searchResults : providers;

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    onSearch?.(results);
  };

  if (loading) {
    return <LoadingSpinner text="Loading providers..." />;
  }

  if (displayProviders.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No providers found"
        description="Try adjusting your search or check back later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProviderSearch onResults={handleSearchResults} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

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