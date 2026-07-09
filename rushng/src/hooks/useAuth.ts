import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

export function useAuth() {
  const { user, setUser, isAuthenticated, setAuth, logout: storeLogout } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success) {
            setUser(response.data.user);
            setAuth(true);
          } else {
            api.clearTokens();
            setAuth(false);
          }
        } catch (error) {
          api.clearTokens();
          setAuth(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const clearError = () => {
    setError(null);
  };

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

      const response = await api.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        setAuth(true);
        toast.success(`Welcome back, ${response.data.user.name}! 🎉`);
        setLoginLoading(false);
        return true;
      } else {
        const errorMsg = response.message || 'Login failed. Please check your credentials.';
        setError({ message: errorMsg });
        toast.error('Login failed', {
          description: errorMsg,
        });
        setLoginLoading(false);
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error. Please try again.';
      setError({ message: errorMsg });
      toast.error('Connection error', {
        description: errorMsg,
      });
      setLoginLoading(false);
      return false;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => {
    setRegisterLoading(true);
    setError(null);

    try {
      if (!userData.name) {
        setError({ field: 'name', message: 'Full name is required' });
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

      const response = await api.register(userData);
      
      if (response.success) {
        // Don't auto-login - just return success
        setRegisterLoading(false);
        return true;
      } else {
        const errorMsg = response.message || 'Registration failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Registration failed', {
          description: errorMsg,
        });
        setRegisterLoading(false);
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error. Please try again.';
      setError({ message: errorMsg });
      toast.error('Connection error', {
        description: errorMsg,
      });
      setRegisterLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    api.clearTokens();
    storeLogout();
    setAuth(false);
    toast.success('Logged out successfully');
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
    logout,
    clearError,
  };
}