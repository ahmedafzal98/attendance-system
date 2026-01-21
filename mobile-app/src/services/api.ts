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
 * Get local IP address using WebRTC (for web browsers)
 * This works by creating a temporary RTCPeerConnection to discover local IPs
 */
const getLocalIPAddressWebRTC = (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
      resolve(null);
      return;
    }

    const RTCPeerConnection = window.RTCPeerConnection || 
      (window as any).webkitRTCPeerConnection || 
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve(null);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    const ips: string[] = [];
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        // Match IPv4 addresses in candidate string
        const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match) {
          const ip = match[1];
          // Filter out public IPs and localhost, keep only private IPs
          if (ip.startsWith('192.168.') || 
              ip.startsWith('10.') || 
              ip.startsWith('172.16.') || 
              ip.startsWith('172.17.') || 
              ip.startsWith('172.18.') || 
              ip.startsWith('172.19.') || 
              ip.startsWith('172.20.') || 
              ip.startsWith('172.21.') || 
              ip.startsWith('172.22.') || 
              ip.startsWith('172.23.') || 
              ip.startsWith('172.24.') || 
              ip.startsWith('172.25.') || 
              ip.startsWith('172.26.') || 
              ip.startsWith('172.27.') || 
              ip.startsWith('172.28.') || 
              ip.startsWith('172.29.') || 
              ip.startsWith('172.30.') || 
              ip.startsWith('172.31.')) {
            if (!ips.includes(ip)) {
              ips.push(ip);
            }
          }
        }
      } else {
        // No more candidates
        pc.close();
        if (ips.length > 0) {
          console.log('Detected private IP via WebRTC:', ips[0]);
          resolve(ips[0]);
        } else {
          console.warn('No private IP found via WebRTC');
          resolve(null);
        }
      }
    };

    // Create a dummy data channel to trigger candidate gathering
    pc.createDataChannel('');

    // Create an offer to start ICE candidate gathering
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(err => {
        console.error('Error creating WebRTC offer:', err);
        pc.close();
        resolve(null);
      });

    // Timeout after 3 seconds
    setTimeout(() => {
      pc.close();
      if (ips.length > 0) {
        console.log('Detected private IP via WebRTC (timeout):', ips[0]);
        resolve(ips[0]);
      } else {
        console.warn('WebRTC IP detection timed out');
        resolve(null);
      }
    }, 3000);
  });
};

/**
 * Get local IP address (private WiFi IP)
 * This is used for office WiFi validation
 * - On mobile: Uses expo-network
 * - On web: Uses WebRTC
 */
const getLocalIPAddress = async (): Promise<string | null> => {
  try {
    // Check if we're on web platform
    if (typeof window !== 'undefined' && typeof RTCPeerConnection !== 'undefined') {
      // Use WebRTC for web browsers
      return await getLocalIPAddressWebRTC();
    }

    // Use expo-network for mobile platforms
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

