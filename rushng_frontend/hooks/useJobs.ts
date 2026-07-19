'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Job } from '@/lib/api';

interface UseJobsOptions {
  initialFilters?: Record<string, any>;
  autoFetch?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const fetchJobs = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobApi.list({ ...filters, ...params });
      if (response.data.success) {
        const data = response.data.data;
        setJobs(data.jobs || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(response.data.message || 'Failed to load jobs');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchJobs();
    }
  }, [autoFetch, fetchJobs]);

  const createJob = async (data: any) => {
    try {
      const response = await jobApi.create(data);
      if (response.data.success) {
        toast.success('Job posted successfully!');
        fetchJobs();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to post job');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post job');
      return null;
    }
  };

  const updateJob = async (id: string, data: any) => {
    try {
      const response = await jobApi.update(id, data);
      if (response.data.success) {
        toast.success('Job updated successfully!');
        fetchJobs();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to update job');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update job');
      return null;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const response = await jobApi.delete(id);
      if (response.data.success) {
        toast.success('Job deleted successfully!');
        fetchJobs();
        return true;
      }
      toast.error(response.data.message || 'Failed to delete job');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete job');
      return false;
    }
  };

  const applyToJob = async (id: string, data?: any) => {
    try {
      const response = await jobApi.apply(id, data);
      if (response.data.success) {
        toast.success('Applied successfully!');
        fetchJobs();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to apply');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply');
      return null;
    }
  };

  const checkIn = async (id: string, data: any) => {
    try {
      const response = await jobApi.checkIn(id, data);
      if (response.data.success) {
        toast.success('Checked in successfully!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Check-in failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-in failed');
      return null;
    }
  };

  const checkOut = async (id: string, data: any) => {
    try {
      const response = await jobApi.checkOut(id, data);
      if (response.data.success) {
        toast.success('Checked out successfully!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Check-out failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-out failed');
      return null;
    }
  };

  const confirmJob = async (id: string, data?: any) => {
    try {
      const response = await jobApi.confirm(id, data);
      if (response.data.success) {
        toast.success('Job confirmed!');
        fetchJobs();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to confirm');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm');
      return null;
    }
  };

  const cancelJob = async (id: string, reason?: string) => {
    try {
      const response = await jobApi.cancel(id, { reason });
      if (response.data.success) {
        toast.success('Job cancelled');
        fetchJobs();
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to cancel');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
      return null;
    }
  };

  return {
    jobs,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    checkIn,
    checkOut,
    confirmJob,
    cancelJob,
  };
}