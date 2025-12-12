// src/components/login/LoginForm.js
import React, { useState } from "react";
import { Box, FormControl, FormLabel, Input, Button, Alert, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
// import axios from "axios";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post("/api/auth/login", { username, password });
      // const { token } = response.data;
      
      // Mock authentication (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Mock validation
      if (username === "admin" && password === "admin123") {
        // Save token to localStorage
        const mockToken = "mock-jwt-token-" + Date.now();
        localStorage.setItem("authToken", mockToken);
        localStorage.setItem("username", username);
        
        // Redirect to dashboard
        navigate("/");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("اسم المستخدم أو كلمة المرور غير صحيحة / Wrong username or password");
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
          fontSize: "16px",
          py: 1.5,
          mb: 2,
        }}
      >
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول (Sign In)"}
      </Button>

      <Box
        sx={{
          p: 2,
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <Typography level="body-xs" sx={{ color: "#666", textAlign: "center" }}>
          💡 <strong>Demo Credentials:</strong> username: <code>admin</code> | password: <code>admin123</code>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
