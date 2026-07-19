'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface LocationState {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = useCallback((): Promise<LocationState> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const newLocation = { lat: latitude, lng: longitude, accuracy };
          setLocation(newLocation);
          setLoading(false);
          resolve(newLocation);
        },
        (error) => {
          let message = 'Failed to get location';
          if (error.code === 1) message = 'Please enable GPS and try again';
          else if (error.code === 2) message = 'GPS signal unavailable';
          else if (error.code === 3) message = 'GPS request timed out';
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        setError(null);
      },
      (error) => {
        let message = 'Failed to watch location';
        if (error.code === 1) message = 'Please enable GPS';
        else if (error.code === 2) message = 'GPS signal unavailable';
        else if (error.code === 3) message = 'GPS request timed out';
        setError(message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    setWatchId(id);
    return id;
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
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
  }, []);

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    startWatching,
    stopWatching,
    reverseGeocode,
    calculateDistance,
  };
}