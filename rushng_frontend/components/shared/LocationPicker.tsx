'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation, Loader2, MapPin, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationValue {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerProps {
  value?: LocationValue;
  onChange?: (location: LocationValue) => void;
  onAddressChange?: (address: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
}

interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({
  value,
  onChange,
  onAddressChange,
  disabled = false,
  placeholder = 'Enter pickup or delivery address',
  className,
  label = 'Location',
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [location, setLocation] = useState<LocationValue | undefined>(value);
  const [address, setAddress] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external value changes
  useEffect(() => {
    if (value) {
      setLocation(value);
      if (value.address !== undefined) {
        setAddress(value.address);
      }
    }
  }, [value]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Forward geocoding with debounce
  useEffect(() => {
    if (!address || address.length < 3 || !showDropdown) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'RushNG-App/1.0' } }
        );
        const data: GeocodeResult[] = await response.json();
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [address, showDropdown]);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'RushNG-App/1.0' } }
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device');
      return;
    }

    setLoading(true);
    setShowDropdown(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setLocation(newLocation);
        toast.success('Current location captured!');

        try {
          const resolvedAddress = await reverseGeocode(latitude, longitude);
          const fullLocation = { ...newLocation, address: resolvedAddress };
          
          setAddress(resolvedAddress);
          onAddressChange?.(resolvedAddress);
          onChange?.(fullLocation);
        } catch {
          onChange?.(newLocation);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let message = 'Failed to get current location';
        if (error.code === 1) message = 'Please grant location permission and try again';
        else if (error.code === 2) message = 'GPS signal unavailable';
        else if (error.code === 3) message = 'Location request timed out';
        toast.error(message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    onAddressChange?.(val);
    setShowDropdown(true);
  };

  const handleSelectSuggestion = (item: GeocodeResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const selectedAddress = item.display_name;

    const newLoc = { lat, lng, address: selectedAddress };
    setLocation(newLoc);
    setAddress(selectedAddress);
    setShowDropdown(false);

    onAddressChange?.(selectedAddress);
    onChange?.(newLoc);
  };

  const handleClear = () => {
    setAddress('');
    setLocation(undefined);
    setSuggestions([]);
    setShowDropdown(false);
    onAddressChange?.('');
    onChange?.({ lat: 0, lng: 0, address: '' });
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-orange-500" />
          {label}
        </Label>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={address}
            onChange={handleAddressInputChange}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled || loading}
            className="pr-9 text-sm focus-visible:ring-orange-500"
          />
          {address && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          disabled={loading || disabled}
          className="shrink-0 border-slate-200 hover:border-orange-500 hover:text-orange-600 dark:border-slate-800"
          title="Use current GPS location"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Geocoding Search Suggestions Dropdown */}
      {showDropdown && (address.length >= 3 || searching) && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          {searching ? (
            <div className="flex items-center justify-center p-3 text-xs text-slate-400 gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
              Searching addresses...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))
          ) : (
            <div className="p-2.5 text-center text-xs text-slate-400">
              No matching locations found
            </div>
          )}
        </div>
      )}

      {location && location.lat !== 0 && location.lng !== 0 && (
        <p className="text-[11px] text-slate-400 font-mono pl-0.5">
          GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}