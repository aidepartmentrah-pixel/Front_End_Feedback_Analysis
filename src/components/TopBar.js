// src/components/TopBar.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@mui/joy";
import LogoutIcon from "@mui/icons-material/Logout";
import theme from "../theme";

const TopBar = ({ pageTitle }) => {
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

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      backgroundColor: "#164F53"
    }}>
      {/* Left: Page Title */}
      <div>
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#FFFFFF" }}>
          {pageTitle}
        </div>
      </div>

      {/* Center: Quick Actions */}
      <div>
        <button style={buttonStyle}>Add Record</button>
        <button style={buttonStyle}>Export</button>
      </div>

      {/* Right: User Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "600", color: "rgba(255,255,255,0.95)", fontSize: "0.95rem" }}>
            {/* Phase A: defensive identity fallback chain */}
            Welcome, {user?.display_name ?? user?.username ?? "User"}
          </div>
          {user?.department_display_name && (
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: "400" }}>
              {user.department_display_name}
              {displayRole && <span> • {displayRole}</span>}
            </div>
          )}
          {!user?.department_display_name && displayRole && (
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: "400" }}>
              {displayRole}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="solid"
          onClick={logout}
          startDecorator={<LogoutIcon sx={{ color: "#FFFFFF" }} />}
          sx={{ 
            ml: 1,
            backgroundColor: "#2CA6A4",
            color: "#FFFFFF",
            border: "none",
            "&:hover": {
              backgroundColor: "#218E8C"
            }
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

// Button style
const buttonStyle = {
  marginLeft: "10px",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2CA6A4",
  cursor: "pointer",
  fontWeight: "500",
  color: "#FFFFFF",
  transition: "background-color 0.2s ease"
};

// Add hover effect via CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button:hover {
      background-color: #218E8C !important;
    }
  `;
  if (!document.querySelector('style[data-topbar-buttons]')) {
    style.setAttribute('data-topbar-buttons', 'true');
    document.head.appendChild(style);
  }
}

export default TopBar;
