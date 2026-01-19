import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import expo-network (may not be available in newer SDK versions)
// If not available, use alternative method or install: npx expo install expo-network
let Network: any = null;
try {
  // @ts-ignore - expo-network may not have types or may be deprecated
  Network = require('expo-network');
} catch (error) {
  console.warn('expo-network not available. Private IP detection may not work. Install: npx expo install expo-network');
}

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

/**
 * Get local IP address (private WiFi IP)
 * This is used for office WiFi validation
 */
const getLocalIPAddress = async (): Promise<string | null> => {
  try {
    if (!Network) {
      console.warn('expo-network not available. Private IP detection disabled.');
      return null;
    }
    
    const ipAddress = await Network.getIpAddressAsync();
    // getIpAddressAsync returns private IP if on WiFi (e.g., "192.168.18.7")
    // Returns "unknown" if not available
    if (ipAddress && ipAddress !== 'unknown') {
      console.log('Detected private IP:', ipAddress);
      return ipAddress;
    }
    console.warn('Private IP detection returned unknown or empty:', ipAddress);
    return null;
  } catch (error) {
    console.error('Error getting local IP address:', error);
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token and private IP to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get local WiFi IP address for office WiFi validation
      // This allows the server to validate the private IP even when connecting through public internet
      const localIP = await getLocalIPAddress();
      if (localIP) {
        // Try header first (may be stripped by proxy)
        config.headers['X-Client-Local-IP'] = localIP;
        config.headers['x-client-local-ip'] = localIP; // lowercase version
        console.log('✅ Setting X-Client-Local-IP header:', localIP);
        
        // Also add to request body as fallback (in case proxy strips headers)
        // This works for POST/PUT/PATCH requests
        if (config.data && typeof config.data === 'object' && !Array.isArray(config.data)) {
          config.data.clientIP = localIP;
          config.data.localIP = localIP; // alternative field name
          console.log('✅ Also added IP to request body as fallback:', localIP);
        }
      } else {
        console.warn('⚠️ No local IP detected, header not set');
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
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
      // This includes invalid token signature errors
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        console.log('Token cleared due to authentication error');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

