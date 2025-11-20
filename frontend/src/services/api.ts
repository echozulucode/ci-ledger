/**
 * API client configuration and authentication service
 */
import axios, { AxiosInstance } from 'axios';

// Get base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies and credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Authentication API
export const authAPI = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post<TokenResponse>(
      `${API_BASE_URL}/api/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      }
    );
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await axios.post<User>(
      `${API_BASE_URL}/api/auth/register`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  /**
   * Logout (client-side token removal)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Even if server request fails, still clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },
};

// User API
export const userAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/api/users/me', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const formData = new URLSearchParams();
    formData.append('current_password', currentPassword);
    formData.append('new_password', newPassword);

    await api.post('/api/users/me/password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
};

export default api;
