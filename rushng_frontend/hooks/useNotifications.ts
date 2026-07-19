'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const fetchNotifications = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationApi.list(params);
      if (response.data.success) {
        const data = response.data.data;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(response.data.message || 'Failed to load notifications');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationApi.markRead(id);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map((n: any) =>
            n.id === id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      toast.error(response.data.message || 'Failed to mark as read');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark as read');
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationApi.markAllRead();
      if (response.data.success) {
        setNotifications(prev =>
          prev.map((n: any) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
        return true;
      }
      toast.error(response.data.message || 'Failed to mark all as read');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark all as read');
      return false;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await notificationApi.delete(id);
      if (response.data.success) {
        setNotifications(prev => prev.filter((n: any) => n.id !== id));
        toast.success('Notification deleted');
        return true;
      }
      toast.error(response.data.message || 'Failed to delete notification');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete notification');
      return false;
    }
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.deleteAll();
      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications deleted');
        return true;
      }
      toast.error(response.data.message || 'Failed to delete all notifications');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete all notifications');
      return false;
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.unreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count || 0);
        return response.data.data.count;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount,
  };
}