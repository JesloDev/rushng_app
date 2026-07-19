'use client';

import { useState, useEffect, useCallback } from 'react';
import { providerApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Provider } from '@/types';

interface UseProvidersOptions {
  initialFilters?: Record<string, any>;
  autoFetch?: boolean;
}

export function useProviders(options: UseProvidersOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const fetchProviders = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await providerApi.search({ ...filters, ...params });
      if (response.data.success) {
        const data = response.data.data;
        setProviders(data.providers || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(response.data.message || 'Failed to load providers');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load providers');
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchProviders();
    }
  }, [autoFetch, fetchProviders]);

  const registerProvider = async (data: any) => {
    try {
      const response = await providerApi.register(data);
      if (response.data.success) {
        toast.success('Provider registration successful!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Registration failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return null;
    }
  };

  const updateProvider = async (data: any) => {
    try {
      const response = await providerApi.update(data);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to update profile');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
      return null;
    }
  };

  const verifyProvider = async (data: any) => {
    try {
      const response = await providerApi.verify(data);
      if (response.data.success) {
        toast.success('Verification submitted! Awaiting review.');
        return response.data.data;
      }
      toast.error(response.data.message || 'Verification failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
      return null;
    }
  };

  const updateAvailability = async (data: any) => {
    try {
      const response = await providerApi.availability(data);
      if (response.data.success) {
        toast.success('Availability updated!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to update availability');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update availability');
      return null;
    }
  };

  const getProviderStats = async () => {
    try {
      const response = await providerApi.stats();
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      toast.error('Failed to load stats');
      return null;
    }
  };

  return {
    providers,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchProviders,
    registerProvider,
    updateProvider,
    verifyProvider,
    updateAvailability,
    getProviderStats,
  };
}