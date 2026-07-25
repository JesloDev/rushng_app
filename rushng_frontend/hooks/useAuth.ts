'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

interface AuthError {
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

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data?.success) {
            // Unpacks both response.data.data.user and response.data.data safely
            const userData = response.data.data?.user || response.data.data;
            setUser(userData);
            setAuth(true);
          } else {
            localStorage.clear();
            setAuth(false);
          }
        } catch (error) {
          localStorage.clear();
          setAuth(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setUser, setAuth]);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    setError(null);

    try {
      if (!email) {
        setError({ field: 'email', message: 'Email is required' });
        toast.error('Please enter your email');
        setLoginLoading(false);
        return false;
      }
      if (!password) {
        setError({ field: 'password', message: 'Password is required' });
        toast.error('Please enter your password');
        setLoginLoading(false);
        return false;
      }
      if (password.length < 8) {
        setError({ field: 'password', message: 'Password must be at least 8 characters' });
        toast.error('Password must be at least 8 characters');
        setLoginLoading(false);
        return false;
      }

      const response = await authApi.login({ email, password });

      if (response.data?.success) {
        const userData = response.data.data?.user || response.data.data;
        const tokens = {
          access_token: response.data.data.access_token,
          refresh_token: response.data.data.refresh_token,
        };
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        setUser(userData);
        setAuth(true);
        toast.success(`Welcome back, ${userData.full_name || 'User'}!`);
        setLoginLoading(false);
        return true;
      } else {
        const errorMsg = response.data?.message || 'Login failed. Please check your credentials.';
        setError({ message: errorMsg });
        toast.error('Login failed', { description: errorMsg });
        setLoginLoading(false);
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Network error. Please try again.';
      setError({ message: errorMsg });
      toast.error('Connection error', { description: errorMsg });
      setLoginLoading(false);
      return false;
    }
  };

  const register = async (userData: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => {
    setRegisterLoading(true);
    setError(null);

    try {
      if (!userData.full_name) {
        setError({ field: 'full_name', message: 'Full name is required' });
        toast.error('Please enter your full name');
        setRegisterLoading(false);
        return false;
      }
      if (!userData.email) {
        setError({ field: 'email', message: 'Email is required' });
        toast.error('Please enter your email');
        setRegisterLoading(false);
        return false;
      }
      if (!userData.phone) {
        setError({ field: 'phone', message: 'Phone number is required' });
        toast.error('Please enter your phone number');
        setRegisterLoading(false);
        return false;
      }
      if (!userData.password) {
        setError({ field: 'password', message: 'Password is required' });
        toast.error('Please create a password');
        setRegisterLoading(false);
        return false;
      }
      if (userData.password.length < 8) {
        setError({ field: 'password', message: 'Password must be at least 8 characters' });
        toast.error('Password must be at least 8 characters');
        setRegisterLoading(false);
        return false;
      }

      const response = await authApi.register(userData);

      if (response.data?.success) {
        toast.success('Welcome to RUSHNG! Please verify your email.');
        setRegisterLoading(false);
        return true;
      } else {
        const errorMsg = response.data?.message || 'Registration failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Registration failed', { description: errorMsg });
        setRegisterLoading(false);
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Network error. Please try again.';
      setError({ message: errorMsg });
      toast.error('Connection error', { description: errorMsg });
      setRegisterLoading(false);
      return false;
    }
  };

  const verify = async (email: string, code: string) => {
    try {
      const response = await authApi.verify({ email, code });
      if (response.data?.success) {
        toast.success('Account verified successfully!');
        return true;
      }
      toast.error(response.data?.message || 'Verification failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    localStorage.clear();
    storeLogout();
    setUser(null);
    setAuth(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.data?.success) {
        const userData = response.data.data?.user || response.data.data;
        setUser(userData);
        toast.success('Profile updated successfully!');
        return true;
      }
      toast.error(response.data?.message || 'Failed to update profile');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
      return false;
    }
  };

  const changePassword = async (current_password: string, new_password: string) => {
    try {
      const response = await authApi.changePassword({ current_password, new_password });
      if (response.data?.success) {
        toast.success('Password changed successfully!');
        return true;
      }
      toast.error(response.data?.message || 'Failed to change password');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
      return false;
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await authApi.deleteAccount();
      if (response.data?.success) {
        toast.success('Account deleted successfully');
        await logout();
        return true;
      }
      toast.error(response.data?.message || 'Failed to delete account');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
      return false;
    }
  };

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