// src/api/apiClient.js
import axios from "axios";

/**
 * Auto-detect API base URL from current browser location.
 * This ensures the frontend always calls the backend on the same host,
 * eliminating the need to rebuild when the VM IP changes.
 */
const getApiBaseUrl = () => {
  // In browser environment, derive API URL from current hostname
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const backendPort = 8000; // Backend always runs on port 8000
    
    // For localhost development, use localhost
    // For production (any IP), use that IP
    return `http://${hostname}:${backendPort}`;
  }
  
  // Fallback for SSR, testing, or if window is not available
  return process.env.REACT_APP_API_URL || "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

// Log the detected API URL (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log(`[apiClient] Using API base URL: ${API_BASE_URL}`);
}

// Create axios instance with session cookie support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include session cookies in all requests
});

// Request interceptor - no token handling needed (using session cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Session authentication - no Authorization header needed
    // Cookie is automatically included via withCredentials: true
    
    // If sending FormData (file uploads), remove Content-Type header
    // so the browser can set the correct multipart/form-data boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Let calling code handle 401 errors (don't auto-redirect)
    // This prevents infinite loops during auth check
    return Promise.reject(error);
  }
);

export default apiClient;
