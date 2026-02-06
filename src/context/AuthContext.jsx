// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Call backend to verify session and get user info
      // Session cookie is automatically included via withCredentials: true
      const response = await apiClient.get("/api/auth/me");
      const rawUser = response.data.user;

      // Defensive normalization: ensure identity fields always exist
      const normalizedUser = {
        ...rawUser,
        display_name: rawUser.display_name ?? rawUser.username ?? null,
        department_display_name: rawUser.department_display_name ?? null
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      // Session is invalid or expired
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    // Apply same defensive normalization on login
    const normalizedUser = {
      ...userData,
      display_name: userData.display_name ?? userData.username ?? null,
      department_display_name: userData.department_display_name ?? null
    };
    
    setUser(normalizedUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call backend to clear session cookie
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear user from context
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      navigate("/login");
    }
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
