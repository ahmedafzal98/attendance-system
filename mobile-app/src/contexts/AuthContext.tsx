import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Only handle navigation for initial load, not after login
    // Login function handles its own navigation
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading, segments, router]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(user);
          
          // Validate token by making a lightweight API call
          // This will trigger the interceptor to clear token if invalid
          try {
            await api.get('/attendance/today');
            // Token is valid, user is already set
          } catch (error: any) {
            // Token validation failed (401 will be handled by interceptor)
            // If it's not a 401, it's a different error, but token might still be valid
            if (error.response?.status === 401) {
              // Token is invalid, interceptor already cleared it
              setUser(null);
              setToken(null);
            }
          }
        } catch (error) {
          // If parsing fails, clear storage
          console.error('Error parsing stored user:', error);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      // Clear potentially corrupted storage
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        // Ignore errors during cleanup
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, navigateAfterLogin: boolean = true) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { user, token } = response.data;

      // Store credentials
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Update state immediately
      setUser(user);
      setToken(token);

      // Navigate only if requested (default: true for backward compatibility)
      if (navigateAfterLogin) {
        router.replace('/(tabs)');
      }

      return { success: true, user, token };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

