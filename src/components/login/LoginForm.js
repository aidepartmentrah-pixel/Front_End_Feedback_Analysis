// src/components/login/LoginForm.js
import React, { useState } from "react";
import { Box, FormControl, FormLabel, Input, Button, Alert, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import theme from "../../theme";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Call backend authentication endpoint (session-based auth)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookie
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 503 && data.error === "database_not_configured") {
        setErrorMessage("قاعدة البيانات غير مهيأة. يرجى تكوين النظام أولاً. (Database not configured. Please configure the system first.)");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Handle 401, 400, or other error responses
        throw new Error(data.message || "Incorrect username or password. Please try again.");
      }

      // Success: Session cookie is set automatically by browser
      if (response.ok && data.success === true) {
        // Update auth context with user data from response
        login(data.user);
        
        // Redirect to dashboard
        navigate("/");
      } else {
        throw new Error(data.message || "Incorrect username or password. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Incorrect username or password. Please check your credentials and try again.");
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <FormControl sx={{ mb: 2 }}>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
          اسم المستخدم (Username)
        </FormLabel>
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          startDecorator={<PersonIcon />}
          required
          disabled={loading}
          sx={{ fontSize: "15px" }}
        />
      </FormControl>

      <FormControl sx={{ mb: 3 }}>
        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>
          كلمة المرور (Password)
        </FormLabel>
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          startDecorator={<LockIcon />}
          required
          disabled={loading}
          sx={{ fontSize: "15px" }}
        />
      </FormControl>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        startDecorator={!loading && <LoginIcon />}
        sx={{
          background: theme.login.buttonBackground,
          color: theme.colors.textOnPrimary,
          fontWeight: 700,
          fontSize: "16px",
          py: 1.5,
          mb: 2,
          '&:hover': {
            background: theme.colors.primaryHover,
          },
        }}
      >
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول (Sign In)"}
      </Button>

      <Button
        variant="plain"
        color="neutral"
        fullWidth
        startDecorator={<SettingsIcon />}
        onClick={() => navigate("/config")}
        sx={{
          fontSize: "13px",
          color: theme.colors.textSecondary,
          fontWeight: 500,
          '&:hover': {
            color: theme.colors.primary,
            background: theme.colors.primaryLighter,
          },
        }}
      >
        إعدادات النظام (System Configuration)
      </Button>

    </Box>
  );
};

export default LoginForm;
