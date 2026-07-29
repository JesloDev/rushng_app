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
  const { 
    user, 
    isAuthenticated, 
    setUser, 
    setAuth, 
    logout: storeLogout 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      // Check if we already have a user in the store
      if (user && isAuthenticated) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data?.success && isMounted) {
            const userData = response.data.data?.user || response.data.data;
            // Normalize role to lowercase
            if (userData && userData.role) {
              userData.role = userData.role.toLowerCase();
            }
            setUser(userData);
            setAuth(true);
            console.log('User initialized from API:', userData);
          } else if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
          }
        }
      } else {
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
  }, [user, isAuthenticated, setUser, setAuth]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (email: string, password: string, remember?: boolean): Promise<any> => {
      setLoginLoading(true);
      setError(null);

      try {
        const response = await authApi.login({ email, password });

        if (response.data?.success) {
          const resData = response.data.data || {};
          const userData = resData.user || resData;

          // Normalize role to lowercase
          if (userData && userData.role) {
            userData.role = userData.role.toLowerCase();
          }

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
          console.log('User logged in:', userData);
          toast.success(`Welcome back, ${userData.full_name || 'User'}!`);
          return { success: true, user: userData };
        } else {
          const errorMsg =
            response.data?.message || 'Login failed. Please check your credentials.';
          setError({ message: errorMsg });
          toast.error('Login failed', { description: errorMsg });
          return { success: false, error: errorMsg };
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Connection failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Connection error', { description: errorMsg });
        return { success: false, error: errorMsg };
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
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
      }
      storeLogout();
      toast.success('Logged out successfully');
      router.push('/');
    }
  }, [router, storeLogout]);

  const updateProfile = useCallback(
    async (data: Record<string, any>): Promise<boolean> => {
      try {
        const response = await authApi.updateProfile(data);
        if (response.data?.success) {
          const updatedUser = response.data.data?.user || response.data.data;
          if (updatedUser && updatedUser.role) {
            updatedUser.role = updatedUser.role.toLowerCase();
          }
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