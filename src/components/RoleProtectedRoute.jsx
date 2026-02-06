// src/components/RoleProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/joy";
import { logRouteAccessCheck } from "../dev/testRouteAccess";

/**
 * Role-aware route wrapper that enforces role-based access at the UX level.
 * This is NOT security enforcement - backend must validate all requests independently.
 * 
 * @param {Function} canAccess - Guard function from roleGuards.js that takes user and returns boolean
 * @param {React.ReactNode} children - Protected page component
 * @param {string} routeName - Optional route name for dev logging
 */
const RoleProtectedRoute = ({ canAccess, children, routeName = "Unknown Route" }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Step 1: Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ color: "#666" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Step 2: Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Step 3: Check role-based access using guard function
  if (!canAccess(user)) {
    // DEV-ONLY: Log access denial for debugging
    if (process.env.NODE_ENV === "development") {
      console.warn(`🚫 Access denied to route: ${routeName}`);
      console.log("User roles:", user?.roles);
      console.log("User object:", user);
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // DEV-ONLY: Log successful access
  if (process.env.NODE_ENV === "development") {
    console.log(`✓ Access granted to route: ${routeName}`);
  }

  // Step 4: Render protected content
  return children;
};

export default RoleProtectedRoute;
