import React from "react";
import { Box, Typography, Sheet, Button } from "@mui/joy";
import { useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import brandTheme from "../../theme/brandTheme";

const TopBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Format role for display
  const formatRole = (role) => {
    if (!role) return "";
    const roleMap = {
      "software_admin": "Software Admin",
      "section_admin": "Section Admin",
      "admin": "Admin",
      "user": "User"
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
      
      {/* User Info & Logout */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box sx={{ 
          textAlign: "right",
          pr: 2,
          borderRight: `2px solid ${brandTheme.topbar.borderBottom}`
        }}>
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
        <Button
          size="md"
          variant="solid"
          startDecorator={<LogoutIcon />}
          onClick={logout}
          sx={{
            bgcolor: brandTheme.button.primary.background,
            color: brandTheme.button.primary.text,
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: "8px",
            boxShadow: brandTheme.shadows.button,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: brandTheme.button.primary.hover,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Sheet>
  );
};

export default TopBar;
