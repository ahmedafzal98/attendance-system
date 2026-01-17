import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get API URL from environment variable
// In Expo, environment variables must be prefixed with EXPO_PUBLIC_
// For development: Set EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api in .env
// For production: Set EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api in .env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (__DEV__ 
    ? 'http://192.168.1.100:3000/api'  // Fallback for development (update with your IP)
    : 'https://attendance-api-7poe.onrender.com/api'    // Production API fallback
  );

if (!API_BASE_URL || (__DEV__ && API_BASE_URL.includes('192.168.1.100'))) {
  console.warn('⚠️  API_BASE_URL not configured properly. Please set EXPO_PUBLIC_API_URL in your .env file');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

