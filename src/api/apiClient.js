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
