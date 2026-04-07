// src/api/apiClient.js
import axios from "axios";

/**
 * API Base URL Configuration
 * 
 * Phase 4: Use same-origin /api paths through IIS reverse proxy.
 * IIS forwards /api/* to backend on localhost:8000 internally.
 * Browser only sees single HTTPS origin - no cross-origin, no mixed content.
 * 
 * This approach:
 * - Works with both HTTP and HTTPS
 * - No port 8000 exposed to browser
 * - No protocol mismatch issues
 * - Works regardless of VM IP (same-origin relative paths)
 */
const getApiBaseUrl = () => {
  // Use same-origin (empty string) - all /api/* calls go through IIS proxy
  // IIS URL Rewrite + ARR forwards these to http://localhost:8000 internally
  return "";
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration (helpful for debugging in console)
if (typeof window !== 'undefined') {
  console.log(`[apiClient] Using same-origin /api paths (reverse proxy mode)`);
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
