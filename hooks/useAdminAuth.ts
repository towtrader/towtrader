import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminLoginData {
  email: string;
  password: string;
}

export function useAdminAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get admin profile query
  const {
    data: admin,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/admin/profile'],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch admin profile
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      setLocation('/admin/dashboard');
    },
    onError: (error: any) => {
      console.error('Admin login failed:', error);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      setLocation('/admin/login');
    }
  });

  const login = (credentials: AdminLoginData) => {
    loginMutation.mutate(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!admin && !error;

  return {
    admin,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error
  };
}