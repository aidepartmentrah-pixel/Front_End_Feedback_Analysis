import React from "react";
import { Box, Typography, Sheet } from "@mui/joy";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import brandTheme from "../../theme/brandTheme";

const TopBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Format role for display
  const formatRole = (role) => {
    if (!role) return "";
    const roleMap = {
      "software_admin": "Software Admin",
      "section_admin": "Section Admin",
      "admin": "Admin",
      "user": "User",
      "WORKER": "Complaint Coordinator",
      "worker": "Complaint Coordinator"
    };
    return roleMap[role] || role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const userRole = user?.roles?.[0] || "";
  const displayRole = formatRole(userRole);
  
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
      case "/insight":
        return "🔍 Workflow Page";
      case "/inbox":
        return "📥 Workflow Inbox";
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
        minHeight: brandTheme.topbar.height,
        background: brandTheme.topbar.background,
        borderTop: brandTheme.topbar.topStripe,
        borderBottom: brandTheme.topbar.accentLine,
        boxShadow: brandTheme.shadows.topbar,
      }}
    >
      <Typography level="h4" sx={{ color: brandTheme.topbar.titleText, fontWeight: 700 }}>
        {getPageTitle()}
      </Typography>
      
      {/* User Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box sx={{ textAlign: "right" }}>
          <Typography level="body-sm" sx={{
            color: brandTheme.topbar.userText,
            fontWeight: 600,
            fontSize: "0.95rem"
          }}>
            {/* Phase A: defensive identity fallback chain */}
            Welcome, {user?.display_name ?? user?.username ?? "User"}
          </Typography>
          {user?.department_display_name && (
            <Typography level="body-xs" sx={{
              color: brandTheme.topbar.userTextSecondary,
              fontSize: "0.75rem",
              fontWeight: 500
            }}>
              {user.department_display_name}
              {displayRole && <span> • {displayRole}</span>}
            </Typography>
          )}
          {!user?.department_display_name && displayRole && (
            <Typography level="body-xs" sx={{
              color: brandTheme.topbar.userTextSecondary,
              fontSize: "0.75rem",
              fontWeight: 500
            }}>
              {displayRole}
            </Typography>
          )}
        </Box>
      </Box>
    </Sheet>
  );
};

export default TopBar;
