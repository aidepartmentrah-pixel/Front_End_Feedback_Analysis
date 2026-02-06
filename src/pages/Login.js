// src/pages/Login.js
import React, { useEffect } from "react";
import { Box, Card } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SystemLogo from "../components/login/SystemLogo";
import LoginForm from "../components/login/LoginForm";
import FooterNote from "../components/login/FooterNote";
import theme from "../theme";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.login.background,
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          p: 4,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          borderRadius: "16px",
          background: theme.colors.surface,
        }}
      >
        <SystemLogo />
        <LoginForm />
        <FooterNote />
      </Card>

      {/* Background Pattern */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </Box>
  );
};

export default Login;
