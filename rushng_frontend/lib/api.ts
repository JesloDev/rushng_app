import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============================================================
// INTERCEPTORS
// ============================================================

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = response.data.data;
          localStorage.setItem('access_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Don't show error toast for 401 (handled above)
    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    }

    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  // Core auth
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verify: (data: any) => api.post('/auth/verify', data),
  logout: () => api.post('/auth/logout'),
  refresh: (data: any) => api.post('/auth/refresh', data),
  me: () => api.get('/auth/me'),
  
  // Password & verification
  resendVerification: (data: { email: string }) => 
    api.post('/auth/resend-verification', data),
  forgotPassword: (data: { email: string }) => 
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; new_password: string }) => 
    api.post('/auth/reset-password', data),
  changePassword: (data: { current_password: string; new_password: string }) => 
    api.post('/auth/change-password', data),
  
  // Profile
  updateProfile: (data: any) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/me'),
};

// ============================================================
// JOBS API
// ============================================================

export const jobApi = {
  // CRUD
  create: (data: any) => api.post('/jobs', data),
  list: (params?: any) => api.get('/jobs', { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  
  // User jobs
  my: () => api.get('/jobs/my'),
  
  // Applications
  apply: (id: string, data?: any) => api.post(`/jobs/${id}/apply`, data),
  assign: (id: string, data: any) => api.post(`/jobs/${id}/assign`, data),
  
  // Check-in/out
  checkIn: (id: string, data: any) => api.post(`/jobs/${id}/check-in`, data),
  checkOut: (id: string, data: any) => api.post(`/jobs/${id}/check-out`, data),
  
  // Status management
  confirm: (id: string, data?: any) => api.post(`/jobs/${id}/confirm`, data),
  cancel: (id: string, data?: any) => api.put(`/jobs/${id}/cancel`, data),
  
  // Tracking
  track: (id: string) => api.get(`/jobs/${id}/track`),
  
  // Estimates
  estimate: (data: any) => api.post('/jobs/estimate', data),
};

// ============================================================
// PROVIDERS API
// ============================================================

export const providerApi = {
  // Registration & profile
  register: (data: any) => api.post('/providers/register', data),
  me: () => api.get('/providers/me'),
  update: (data: any) => api.put('/providers/me', data),
  
  // Verification
  verify: (data: any) => api.post('/providers/verify', data),
  getVerificationStatus: () => api.get('/providers/verify/status'),
  
  // Search & discovery
  search: (params?: any) => api.get('/providers/search', { params }),
  get: (id: string) => api.get(`/providers/${id}`),
  
  // Stats & analytics
  stats: () => api.get('/providers/me/stats'),
  availability: (data: any) => api.put('/providers/me/availability', data),
  
  // Portfolio
  addPortfolio: (data: any) => api.post('/providers/portfolio', data),
  removePortfolio: (id: string) => api.delete(`/providers/portfolio/${id}`),
};

// ============================================================
// PAYMENTS API
// ============================================================

export const paymentApi = {
  // Payment flow
  initialize: (data: any) => api.post('/payments/initialize', data),
  verify: (data: any) => api.post('/payments/verify', data),
  
  // Payment details
  get: (id: string) => api.get(`/payments/${id}`),
  job: (jobId: string) => api.get(`/payments/job/${jobId}`),
  me: () => api.get('/payments/me'),
  
  // Webhooks
  webhook: (provider: string, data: any) => 
    api.post(`/payments/webhook/${provider}`, data),
  
  // Methods
  getMethods: () => api.get('/payments/methods'),
};

// ============================================================
// VIOLATIONS API
// ============================================================

export const violationApi = {
  // Reporting
  report: (data: any) => api.post('/violations', data),
  
  // Listing
  list: (params?: any) => api.get('/violations', { params }),
  my: () => api.get('/violations/my'),
  get: (id: string) => api.get(`/violations/${id}`),
  
  // Appeals
  appeal: (id: string, data: any) => api.post(`/violations/${id}/appeal`, data),
  
  // Stats
  stats: () => api.get('/violations/stats'),
};

// ============================================================
// RATINGS API
// ============================================================

export const ratingApi = {
  // Create
  create: (data: any) => api.post('/ratings', data),
  
  // Get ratings
  user: (userId: string) => api.get(`/ratings/user/${userId}`),
  me: () => api.get('/ratings/me'),
  job: (jobId: string) => api.get(`/ratings/job/${jobId}`),
  
  // Stats
  stats: (userId: string) => api.get(`/ratings/stats/${userId}`),
};

// ============================================================
// NOTIFICATIONS API
// ============================================================

export const notificationApi = {
  // List
  list: (params?: any) => api.get('/notifications', { params }),
  
  // Read status
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  
  // Delete
  delete: (id: string) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
  
  // Count
  unreadCount: () => api.get('/notifications/unread-count'),
};

// ============================================================
// ADMIN API
// ============================================================

export const adminApi = {
  // Dashboard
  stats: () => api.get('/admin/stats'),
  
  // Users
  users: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  banUser: (id: string) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id: string) => api.put(`/admin/users/${id}/unban`),
  verifyProvider: (id: string) => api.put(`/admin/users/${id}/verify-provider`),
  
  // Jobs
  jobs: (params?: any) => api.get('/admin/jobs', { params }),
  getJob: (id: string) => api.get(`/admin/jobs/${id}`),
  deleteJob: (id: string) => api.delete(`/admin/jobs/${id}`),
  
  // Violations
  violations: (params?: any) => api.get('/admin/violations', { params }),
  reviewViolation: (id: string, data: any) => 
    api.put(`/admin/violations/${id}/review`, data),
  
  // Payments
  payments: (params?: any) => api.get('/admin/payments', { params }),
  refundPayment: (id: string) => api.post(`/admin/payments/${id}/refund`),
};

// ============================================================
// EXPORTS
// ============================================================

export default api;

// ============================================================
// TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'customer' | 'provider' | 'admin' | 'support';
  is_verified: boolean;
  is_active: boolean;
  profile_picture?: string;
  address?: string;
  city?: string;
  state?: string;
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  provider_id?: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  address: string;
  city?: string;
  state?: string;
  status: 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  estimated_price?: number;
  final_price?: number;
  check_in_time?: string;
  check_out_time?: string;
  check_in_photo?: string;
  check_out_photo?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  platform_fee: number;
  provider_earnings: number;
  provider: 'opay' | 'paystack' | 'flutterwave';
  reference: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed' | 'disputed';
  created_at: string;
}

export interface Violation {
  id: string;
  user_id: string;
  job_id?: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  title: string;
  description: string;
  status: 'pending_review' | 'confirmed' | 'dismissed' | 'appealed' | 'resolved';
  points_deducted: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'payment' | 'rating' | 'violation' | 'system' | 'user';
  is_read: boolean;
  created_at: string;
}

export interface Rating {
  id: string;
  job_id: string;
  rater_id: string;
  target_id: string;
  rating: number;
  comment?: string;
  categories: Record<string, number>;
  created_at: string;
}