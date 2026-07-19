'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Navigation, Loader2, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationPickerProps {
  value?: { lat: number; lng: number; address?: string };
  onChange?: (location: { lat: number; lng: number; address?: string }) => void;
  onAddressChange?: (address: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function LocationPicker({
  value,
  onChange,
  onAddressChange,
  disabled = false,
  placeholder = 'Enter address or use current location',
  className,
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(value);
  const [address, setAddress] = useState(value?.address || '');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setLocation(value);
      setAddress(value.address || '');
    }
  }, [value]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setLocation(newLocation);
        onChange?.(newLocation);
        setLoading(false);
        toast.success('Location captured!');
        
        // Reverse geocode to get address
        try {
          const address = await reverseGeocode(latitude, longitude);
          setAddress(address);
          onAddressChange?.(address);
          onChange?.({ ...newLocation, address });
        } catch {
          // Silent fail for reverse geocoding
        }
      },
      (error) => {
        let message = 'Failed to get location';
        if (error.code === 1) message = 'Please enable GPS and try again';
        else if (error.code === 2) message = 'GPS signal unavailable';
        else if (error.code === 3) message = 'GPS request timed out';
        toast.error(message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'RUSHNG' } }
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    onAddressChange?.(val);
  };

  const handleClear = () => {
    setAddress('');
    setLocation(undefined);
    onAddressChange?.('');
    onChange?.({ lat: 0, lng: 0, address: '' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-orange-500" />
        Location
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={address}
            onChange={handleAddressChange}
            disabled={disabled || loading}
            className="pr-10"
          />
          {address && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          title="Use current location"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>
      {location && (
        <p className="text-xs text-muted-foreground">
          Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}