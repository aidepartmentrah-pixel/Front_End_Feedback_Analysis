// src/components/login/SystemLogo.js
import React from "react";
import { Box, Typography } from "@mui/joy";
import logo3 from "../../assests/logo3.png";

const SystemLogo = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 4,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <img 
          src={logo3} 
          alt="System Logo" 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "contain" 
          }} 
        />
      </Box>
      <Typography
        level="h3"
        sx={{
          fontWeight: 900,
          background: "linear-gradient(135deg, #2BBCC4 0%, #64A70B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 0.5,
        }}
      >
        FeedbackAI
      </Typography>
      <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
        Hospital Feedback Management System
      </Typography>
      <Typography level="body-xs" sx={{ color: "#999", mt: 0.5 }}>
        نظام إدارة ملاحظات المستشفى
      </Typography>
    </Box>
  );
};

export default SystemLogo;
