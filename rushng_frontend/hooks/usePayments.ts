'use client';

import { useState, useCallback } from 'react';
import { paymentApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Payment } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.me();
      if (response.data.success) {
        setPayments(response.data.data.payments || []);
        return response.data.data;
      }
      setError(response.data.message || 'Failed to load payments');
      return null;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load payments');
      toast.error('Failed to load payments');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const initializePayment = async (data: any) => {
    try {
      const response = await paymentApi.initialize(data);
      if (response.data.success) {
        const result = response.data.data;
        if (result.authorization_url) {
          window.location.href = result.authorization_url;
        }
        return result;
      }
      toast.error(response.data.message || 'Payment initialization failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment initialization failed');
      return null;
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const response = await paymentApi.verify({ reference });
      if (response.data.success) {
        toast.success('Payment verified successfully!');
        return response.data.data;
      }
      toast.error(response.data.message || 'Payment verification failed');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment verification failed');
      return null;
    }
  };

  const getPayment = async (id: string) => {
    try {
      const response = await paymentApi.get(id);
      if (response.data.success) {
        return response.data.data;
      }
      toast.error(response.data.message || 'Failed to load payment');
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load payment');
      return null;
    }
  };

  const getJobPayments = async (jobId: string) => {
    try {
      const response = await paymentApi.job(jobId);
      if (response.data.success) {
        return response.data.data.payments || [];
      }
      return [];
    } catch (error: any) {
      toast.error('Failed to load job payments');
      return [];
    }
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    initializePayment,
    verifyPayment,
    getPayment,
    getJobPayments,
  };
}