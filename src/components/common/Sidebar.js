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
    { name: "✏️ Edit Record", path: "/edit" },
    { name: "📋 Table View", path: "/table-view" },
    { name: "📈 Reporting", path: "/reporting" },
    { name: "📤 Export", path: "/export" }
  ];

  return (
    <Sheet
      sx={{
        width: "280px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1a1e3f 0%, #2d3561 100%)",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)",
        overflow: "auto",
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          level="h3"
          sx={{
            color: "#667eea",
            fontWeight: 800,
            fontSize: "24px",
            textShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
          }}
        >
          FeedbackAI
        </Typography>
        <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.6)", mt: 1 }}>
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
              mb: 1,
              color: "rgba(255,255,255,0.8)",
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.2)",
                color: "#667eea",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(102, 126, 234, 0.3)",
                color: "#667eea",
                fontWeight: 600,
              },
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
          >
            <Typography level="body-sm">{page.name}</Typography>
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1, borderColor: "rgba(102, 126, 234, 0.3)" }} />

      {/* Footer Info */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography level="body-xs" sx={{ color: "rgba(255,255,255,0.5)" }}>
          v1.0.0
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Sidebar;
