// src/components/login/LoginForm.js
import React, { useState } from "react";
import { Box, FormControl, FormLabel, Input, Button, Alert, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
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

      <Box
        sx={{
          p: 2,
          background: theme.colors.infoLight,
          borderRadius: "8px",
          border: `1px solid ${theme.colors.info}`,
          opacity: 0.8,
        }}
      >
        <Typography level="body-xs" sx={{ color: theme.colors.textSecondary, textAlign: "center" }}>
          � <strong>Secure Login:</strong> Enter your credentials to access the system
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
