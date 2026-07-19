'use client';

import { useState, useEffect, useCallback } from 'react';
import { violationApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Violation } from '@/types';

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const fetchViolations = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await violationApi.my();
      if (response.data.success) {
        setViolations(response.data.data.violations || []);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } else {
        setError(response.data.message || 'Failed to load violations');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load violations');
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  }, []);

  const reportViolation = useCallback(async (data: any) => {
    try {
      const response = await violationApi.report(data);
      if (response.data.success) {
        toast.success('Violation reported successfully. Admin will review.');
        fetchViolations();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to report violation');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to report violation');
      return null;
    }
  }, [fetchViolations]);

  const appealViolation = useCallback(async (id: string, data: any) => {
    try {
      const response = await violationApi.appeal(id, data);
      if (response.data.success) {
        toast.success('Appeal submitted successfully.');
        fetchViolations();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to submit appeal');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit appeal');
      return null;
    }
  }, [fetchViolations]);

  const getViolationStats = useCallback(async () => {
    try {
      const response = await violationApi.stats();
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      toast.error('Failed to load violation stats');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return {
    violations,
    loading,
    error,
    pagination,
    fetchViolations,
    reportViolation,
    appealViolation,
    getViolationStats,
  };
}