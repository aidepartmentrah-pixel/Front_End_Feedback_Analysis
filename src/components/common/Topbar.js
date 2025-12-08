import React from "react";
import { Box, Typography, Sheet } from "@mui/joy";
import { useLocation } from "react-router-dom";

const TopBar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/table-view":
        return "📋 Records Table";
      case "/insert":
        return "➕ Insert Record";
      case "/edit":
        return "✏️ Edit Record";
      case "/reporting":
        return "📈 Reporting";
      case "/export":
        return "📤 Export";
      default:
        return "📊 Dashboard";
    }
  };

  return (
    <Sheet
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
      }}
    >
      <Typography level="h4" sx={{ color: "white", fontWeight: 700 }}>
        {getPageTitle()}
      </Typography>
      <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.8)" }}>
        Welcome, Admin
      </Typography>
    </Sheet>
  );
};

export default TopBar;
