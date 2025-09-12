'use client';
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, User, AuthStatus } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const status: AuthStatus = await api.getAuthStatus();
      setIsAuthenticated(status.authenticated);
      setUser(status.user || null);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await api.register(userData);
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}