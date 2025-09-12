// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  phone?: string;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  user?: User;
  data?: T;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session cookies
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    address?: string;
    phone?: string;
    password: string;
    password_confirm: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getAuthStatus(): Promise<AuthStatus> {
    return this.request('/auth/status');
  }

  // Main endpoints
  async getIndex(): Promise<any> {
    return this.request('/');
  }

  async getUserInfo(): Promise<{ user: User }> {
    return this.request('/user');
  }
}

export const api = new ApiClient();