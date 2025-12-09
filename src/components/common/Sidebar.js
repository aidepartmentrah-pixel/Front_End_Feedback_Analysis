import React from "react";
import {
  Box,
  List,
  ListItemButton,
  Typography,
  Sheet,
  Divider,
} from "@mui/joy";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  
  const pages = [
    { name: "📊 Dashboard", path: "/" },
    { name: "➕ Insert Record", path: "/insert" },
    { name: "📋 Table View", path: "/table-view" },
    { name: "👤 Patient History", path: "/patient-history" },
    { name: "📈 Reporting", path: "/reporting" },
    { name: "📤 Export", path: "/export" },
    { name: "⚙️ Settings", path: "/settings" }
  ];

  return (
    <Sheet
      sx={{
        width: "280px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        background: "linear-gradient(180deg, #1a1e3f 0%, #2d3561 100%)",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)",
        overflow: "auto",
        position: "fixed",
        left: 0,
        top: 0,
        color: "#ffffff",
        "& *": {
          color: "inherit !important",
        },
        "& .MuiListItemButton-root": {
          color: "#ffffff !important",
        },
        "& .MuiTypography-root": {
          color: "#ffffff !important",
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          level="h3"
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "28px",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          FeedbackAI
        </Typography>
        <Typography level="body-xs" sx={{ color: "#e0e7ff", mt: 1, fontSize: "12px" }}>
          Hospital Feedback System
        </Typography>
      </Box>

      <Divider sx={{ my: 1, borderColor: "rgba(102, 126, 234, 0.3)" }} />

      {/* Navigation Links */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {pages.map((page) => (
          <ListItemButton
            key={page.name}
            component={Link}
            to={page.path}
            selected={location.pathname === page.path}
            sx={{
              mb: 1.5,
              color: "#ffffff !important",
              fontSize: "15px",
              fontWeight: 500,
              "& .MuiTypography-root": {
                color: "#ffffff !important",
                fontSize: "15px !important",
              },
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.25)",
                color: "#ffffff !important",
                "& .MuiTypography-root": {
                  color: "#ffffff !important",
                },
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(102, 126, 234, 0.35)",
                color: "#ffffff !important",
                fontWeight: 700,
                "& .MuiTypography-root": {
                  color: "#ffffff !important",
                },
              },
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
          >
            <Typography level="body-sm" sx={{ fontSize: "15px", fontWeight: "inherit", color: "#ffffff !important" }}>{page.name}</Typography>
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1, borderColor: "rgba(102, 126, 234, 0.3)" }} />

      {/* Footer Info */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography level="body-xs" sx={{ color: "#ffffff", fontSize: "12px", fontWeight: 600 }}>
          v1.0.0
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Sidebar;
