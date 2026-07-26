'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

export function useAuth() {
  const router = useRouter();
  const { setUser, setAuth, logout: storeLogout, user, isAuthenticated } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data?.success && isMounted) {
            const userData = response.data.data?.user || response.data.data;
            setUser(userData);
            setAuth(true);
          } else if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
            setUser(null);
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
            setUser(null);
          }
        }
      } else if (isMounted) {
        setAuth(false);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser, setAuth]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoginLoading(true);
      setError(null);

      try {
        if (!email) {
          const err = { field: 'email', message: 'Email is required' };
          setError(err);
          toast.error('Please enter your email');
          return false;
        }
        if (!password) {
          const err = { field: 'password', message: 'Password is required' };
          setError(err);
          toast.error('Please enter your password');
          return false;
        }
        if (password.length < 8) {
          const err = {
            field: 'password',
            message: 'Password must be at least 8 characters',
          };
          setError(err);
          toast.error('Password must be at least 8 characters');
          return false;
        }

        const response = await authApi.login({ email, password });

        if (response.data?.success) {
          const resData = response.data.data || {};
          const userData = resData.user || resData;

          const accessToken = resData.access_token || response.data.access_token;
          const refreshToken = resData.refresh_token || response.data.refresh_token;

          if (accessToken && typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
          }

          setUser(userData);
          setAuth(true);
          toast.success(`Welcome back, ${userData.full_name || 'User'}!`);
          return true;
        } else {
          const errorMsg =
            response.data?.message || 'Login failed. Please check your credentials.';
          setError({ message: errorMsg });
          toast.error('Login failed', { description: errorMsg });
          return false;
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Connection failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Connection error', { description: errorMsg });
        return false;
      } finally {
        setLoginLoading(false);
      }
    },
    [setUser, setAuth]
  );

  const register = useCallback(
    async (userData: {
      full_name: string;
      email: string;
      phone: string;
      password: string;
      role?: string;
    }): Promise<boolean> => {
      setRegisterLoading(true);
      setError(null);

      try {
        if (!userData.full_name?.trim()) {
          setError({ field: 'full_name', message: 'Full name is required' });
          toast.error('Please enter your full name');
          return false;
        }
        if (!userData.email?.trim()) {
          setError({ field: 'email', message: 'Email is required' });
          toast.error('Please enter your email');
          return false;
        }
        if (!userData.phone?.trim()) {
          setError({ field: 'phone', message: 'Phone number is required' });
          toast.error('Please enter your phone number');
          return false;
        }
        if (!userData.password) {
          setError({ field: 'password', message: 'Password is required' });
          toast.error('Please create a password');
          return false;
        }
        if (userData.password.length < 8) {
          setError({
            field: 'password',
            message: 'Password must be at least 8 characters',
          });
          toast.error('Password must be at least 8 characters');
          return false;
        }

        const response = await authApi.register(userData);

        if (response.data?.success) {
          toast.success('Welcome to RUSHNG! Please check your email to verify your account.');
          return true;
        } else {
          const errorMsg =
            response.data?.message || 'Registration failed. Please try again.';
          setError({ message: errorMsg });
          toast.error('Registration failed', { description: errorMsg });
          return false;
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Network error. Please try again.';
        setError({ message: errorMsg });
        toast.error('Connection error', { description: errorMsg });
        return false;
      } finally {
        setRegisterLoading(false);
      }
    },
    []
  );

  const verify = useCallback(async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await authApi.verify({ email, code });
      if (response.data?.success) {
        toast.success('Account verified successfully!');
        return true;
      }
      toast.error(response.data?.message || 'Verification failed');
      return false;
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.response?.data?.message || 'Verification failed'
      );
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Intentionally ignoring network errors during logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      storeLogout();
      setUser(null);
      setAuth(false);
      toast.success('Logged out successfully');
      router.push('/');
    }
  }, [router, setAuth, setUser, storeLogout]);

  const updateProfile = useCallback(
    async (data: Record<string, any>): Promise<boolean> => {
      try {
        const response = await authApi.updateProfile(data);
        if (response.data?.success) {
          const updatedUser = response.data.data?.user || response.data.data;
          setUser(updatedUser);
          toast.success('Profile updated successfully!');
          return true;
        }
        toast.error(response.data?.message || 'Failed to update profile');
        return false;
      } catch (err: any) {
        toast.error(
          err.response?.data?.error || err.response?.data?.message || 'Failed to update profile'
        );
        return false;
      }
    },
    [setUser]
  );

  const changePassword = useCallback(
    async (current_password: string, new_password: string): Promise<boolean> => {
      try {
        const response = await authApi.changePassword({
          current_password,
          new_password,
        });
        if (response.data?.success) {
          toast.success('Password changed successfully!');
          return true;
        }
        toast.error(response.data?.message || 'Failed to change password');
        return false;
      } catch (err: any) {
        toast.error(
          err.response?.data?.error || err.response?.data?.message || 'Failed to change password'
        );
        return false;
      }
    },
    []
  );

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.deleteAccount();
      if (response.data?.success) {
        toast.success('Account deleted successfully');
        await logout();
        return true;
      }
      toast.error(response.data?.message || 'Failed to delete account');
      return false;
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.response?.data?.message || 'Failed to delete account'
      );
      return false;
    }
  }, [logout]);

  return {
    user,
    loading,
    loginLoading,
    registerLoading,
    error,
    isAuthenticated,
    login,
    register,
    verify,
    logout,
    clearError,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}