'use client';

import { useState, useEffect, useCallback } from 'react';
import { providerApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Loader2, Bike, Car, Truck, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderSearchProps {
  onResults: (providers: any[]) => void;
  onClear?: () => void;
}

export function ProviderSearch({ onResults, onClear }: ProviderSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filter states
  const [vehicleType, setVehicleType] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const executeSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      
      // If search input is cleared, reset to original parent list
      if (!trimmed && vehicleType === 'all' && minRating === 0 && !onlyAvailable) {
        onResults(null as any);
        onClear?.();
        return;
      }

      setLoading(true);
      try {
        const response = await providerApi.search({
          q: trimmed,
          vehicle_type: vehicleType !== 'all' ? vehicleType : undefined,
          min_rating: minRating > 0 ? minRating : undefined,
          is_available: onlyAvailable ? true : undefined,
        });

        const providersList =
          response?.data?.data?.providers ||
          response?.data?.providers ||
          (Array.isArray(response?.data) ? response.data : []);

        onResults(providersList);
      } catch (error) {
        toast.error('Failed to search providers');
      } finally {
        setLoading(false);
      }
    },
    [vehicleType, minRating, onlyAvailable, onResults, onClear]
  );

  // Debounced typing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        executeSearch(searchTerm);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, vehicleType, minRating, onlyAvailable, executeSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setVehicleType('all');
    setMinRating(0);
    setOnlyAvailable(false);
    onResults(null as any);
    onClear?.();
  };

  const activeFilterCount =
    (vehicleType !== 'all' ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onlyAvailable ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search Bar Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search dispatchers by name, skill, or location (e.g. Ikeja, Bike)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
            className="pl-9 pr-9 h-11 border-slate-200 focus-visible:ring-orange-500 bg-white shadow-xs text-sm"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="h-11 px-3.5 border-slate-200 text-slate-700 hover:bg-slate-50 relative"
        >
          <Filter className="h-4 w-4 mr-1.5 text-slate-500" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-orange-600 text-white text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <Button
          onClick={() => executeSearch(searchTerm)}
          disabled={loading}
          className="gradient-rush text-white h-11 px-5 shadow-xs font-medium"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </Button>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Filter Options
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-orange-600 hover:underline font-medium"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vehicle Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-medium">Vehicle / Mode</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'bicycle', label: 'Bicycle', icon: Bike },
                  { id: 'bike', label: 'Motorbike', icon: Bike },
                  { id: 'car', label: 'Car/Van', icon: Car },
                ].map((item) => (
                  <Badge
                    key={item.id}
                    variant={vehicleType === item.id ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs py-1 px-2.5 rounded-md transition-all ${
                      vehicleType === item.id
                        ? 'bg-orange-600 hover:bg-orange-700 text-white border-transparent'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    onClick={() => setVehicleType(item.id)}
                  >
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-medium">Minimum Rating</label>
              <div className="flex gap-1">
                {[0, 3, 4, 4.5].map((stars) => (
                  <Badge
                    key={stars}
                    variant={minRating === stars ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs py-1 px-2 rounded-md transition-all ${
                      minRating === stars
                        ? 'bg-orange-600 hover:bg-orange-700 text-white border-transparent'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    onClick={() => setMinRating(stars)}
                  >
                    {stars === 0 ? 'Any' : `${stars}+ ★`}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-medium">Availability</label>
              <div>
                <Button
                  type="button"
                  variant={onlyAvailable ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`h-7 text-xs ${
                    onlyAvailable
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {onlyAvailable ? '✓ Showing Available Only' : 'Show Available Only'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}