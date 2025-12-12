// src/components/login/SystemLogo.js
import React from "react";
import { Box, Typography } from "@mui/joy";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

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
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 40, color: "white" }} />
      </Box>
      <Typography
        level="h3"
        sx={{
          fontWeight: 900,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
