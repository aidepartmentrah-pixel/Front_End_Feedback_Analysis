// src/api/apiClient.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
