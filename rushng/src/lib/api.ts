const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'buyer' | 'rider' | 'merchant' | 'admin';
  avatar?: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface Merchant {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  cover_image?: string;
  is_verified: boolean;
  rating: number;
  total_orders: number;
  plan: 'free' | 'basic' | 'premium';
  store_theme: string;
  store_cover_color: string;
  created_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  in_stock: boolean;
  featured: boolean;
  sales_count: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  merchant_id?: string;
  rider_id?: string;
  service_type_id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup_address: string;
  dropoff_address: string;
  total_price: number;
  service_fee: number;
  tracking_code: string;
  notes?: string;
  created_at: string;
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  clearToken() {
    this.clearTokens(); // Alias for backward compatibility
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If token expired, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          return this.request(endpoint, options);
        }
      }
      throw new Error(data.message || data.detail || 'Something went wrong');
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        this.setToken(data.data.access_token);
        if (data.data.refresh_token) {
          this.setRefreshToken(data.data.refresh_token);
        }
        return true;
      }
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // ============ AUTH ============
  
  async register(userData: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
    }
    return response;
  }

  async logout() {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' });
    } catch {}
    this.clearTokens();
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // ============ SERVICES ============
  
  async getServices() {
    return this.request<any>('/services');
  }

  async getServiceEstimate(serviceId: string, params: {
    distance_km?: number;
    duration_hours?: number;
    weight_kg?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/services/${serviceId}/estimate${query ? `?${query}` : ''}`);
  }

  // ============ BOOKINGS ============
  
  async createBooking(bookingData: {
    service_type_id: string;
    merchant_id?: string;
    pickup_address: string;
    pickup_lat?: number;
    pickup_lng?: number;
    dropoff_address: string;
    dropoff_lat?: number;
    dropoff_lng?: number;
    scheduled_time?: string;
    notes?: string;
    duration?: number;
    weight?: number;
    items?: Array<{ product_id: string; quantity: number }>;
  }) {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(params?: { status?: string; page?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/bookings${query ? `?${query}` : ''}`);
  }

  async getBooking(id: string) {
    return this.request<any>(`/bookings/${id}`);
  }

  async cancelBooking(id: string) {
    return this.request<any>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // ============ MERCHANTS ============
  
  async registerMerchant(merchantData: {
    name: string;
    description?: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  }) {
    return this.request<any>('/merchants/register', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  }

  async getMerchantDashboard() {
    return this.request<any>('/merchants/dashboard');
  }

  async getPublicStore(slug: string) {
    return this.request<any>(`/merchants/store/${slug}`);
  }

  async updateMerchantProfile(data: any) {
    return this.request<any>('/merchants/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addProduct(productData: {
    name: string;
    price: number;
    description?: string;
    category?: string;
    image_url?: string;
    in_stock?: boolean;
  }) {
    return this.request<any>('/merchants/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request<any>(`/merchants/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request<any>(`/merchants/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // ============ PAYMENTS ============
  
  async initializePayment(bookingId: string, method: string = 'card') {
    return this.request<any>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, method }),
    });
  }

  async verifyPayment(reference: string) {
    return this.request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }
}

export const api = new ApiClient();