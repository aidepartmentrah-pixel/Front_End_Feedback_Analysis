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
import logo from "../../assests/logo.png";
import { useAuth } from "../../context/AuthContext";
import { 
  canViewDashboard,
  canViewInbox, 
  canViewFollowUp, 
  canViewInsight,
  canViewReporting,
  canViewInvestigation,
  canViewTableView,
  canViewInsertRecord,
  canViewTrendMonitoring,
  canViewSettings,
  canViewCriticalIssues,
  canGenerateSeasonalReports,
  canAccessDrawerNotes,
  canAccessMigration,
  canViewPersonReporting 
} from "../../utils/roleGuards";
import brandTheme from "../../theme/brandTheme";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // ============================================================================
  // PHASE J — Menu configuration with proper role guards (imported from roleGuards.js)
  // ============================================================================
  
  const menuItems = [
    { name: "📊 Dashboard", path: "/", canShow: canViewDashboard },
    { name: "📥 Inbox", path: "/inbox", canShow: canViewInbox },
    { name: "📋 Follow Up", path: "/follow-up", canShow: canViewFollowUp },
    { name: "💡 Insight", path: "/insight", canShow: canViewInsight },
    { name: "📊 Reporting", path: "/reporting", canShow: canViewReporting },
    { name: "🔍 Investigation", path: "/investigation", canShow: canViewInvestigation },
    { name: "📈 Trend Monitoring", path: "/trend-monitoring", canShow: canViewTrendMonitoring },
    { name: "📋 Table View", path: "/table-view", canShow: canViewTableView },
    { name: "➕ Insert Record", path: "/insert", canShow: canViewInsertRecord },
    { name: "📋 History", path: "/history", canShow: canViewPersonReporting },
    { name: "📝 Drawer Notes", path: "/drawer-notes", canShow: canAccessDrawerNotes },
    { name: "🚩 Critical Issues", path: "/critical-issues", canShow: canViewCriticalIssues },
    { name: "🔄 Data Migration", path: "/migration", canShow: canAccessMigration },
    { name: "⚙️ Settings", path: "/settings", canShow: canViewSettings }
  ];

  // Filter menu items based on role guards
  const visibleItems = menuItems.filter(item => 
    item.canShow ? item.canShow(user) : true
  );

  return (
    <Sheet
      sx={{
        width: "280px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        background: brandTheme.sidebar.background,
        boxShadow: `${brandTheme.shadows.sidebar}, ${brandTheme.sidebar.innerShadow}`,
        overflow: "auto",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: "2px solid #2CA6A4"
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          background: brandTheme.sidebar.logoZoneOverlay,
        }}
      >
        <Box
          sx={{
            p: 2,
            background: brandTheme.sidebar.logoPanel.background,
            border: brandTheme.sidebar.logoPanel.border,
            borderRadius: brandTheme.sidebar.logoPanel.borderRadius,
            boxShadow: brandTheme.sidebar.logoPanel.shadow,
            backdropFilter: brandTheme.sidebar.logoPanel.backdropFilter,
            WebkitBackdropFilter: brandTheme.sidebar.logoPanel.backdropFilter,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
            }}
          />
        </Box>

        <Typography
          level="h3"
          sx={{
            color: brandTheme.sidebar.text,
            fontWeight: 800,
            fontSize: "24px",
          }}
        >
          Feedback System
        </Typography>

        <Typography
          level="body-xs"
          sx={{ color: brandTheme.sidebar.textSecondary, fontSize: "12px", fontWeight: 500 }}
        >
          Al Rassoul Al Azam Hospital
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: brandTheme.sidebar.divider }} />

      {/* Navigation Links */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {visibleItems.map((page) => {
          const isActive = location.pathname === page.path;
          return (
            <ListItemButton
              key={page.name}
              component={Link}
              to={page.path}
              selected={isActive}
              sx={{
                mb: 1,
                color: brandTheme.sidebar.icon,
                fontSize: "15px",
                fontWeight: 500,
                borderRadius: "10px",
                transition: "all 0.2s ease",
                "& .MuiTypography-root": {
                  color: "inherit",
                  fontSize: "15px",
                },
                "&:hover": {
                  backgroundColor: brandTheme.sidebar.hoverBackground,
                  transform: "translateX(4px)",
                },
                "&.Mui-selected": {
                  backgroundColor: brandTheme.sidebar.activeBackground,
                  color: brandTheme.sidebar.iconActive,
                  fontWeight: brandTheme.sidebar.activeFontWeight,
                  borderLeft: brandTheme.sidebar.activeBorderLeft,
                  borderRadius: brandTheme.sidebar.activeBorderRadius,
                  boxShadow: brandTheme.sidebar.activeBoxShadow,
                  "& .MuiTypography-root": {
                    color: brandTheme.sidebar.iconActive,
                  },
                },
              }}
            >
              <Typography level="body-sm" sx={{ fontSize: "15px", fontWeight: "inherit" }}>{page.name}</Typography>
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ my: 1.5, borderColor: brandTheme.sidebar.divider }} />

      {/* Footer Info */}
      <Box sx={{ 
        p: 2, 
        textAlign: "center",
        background: brandTheme.sidebar.footerZoneOverlay,
      }}>
        <Typography level="body-xs" sx={{ color: brandTheme.sidebar.icon, fontSize: "12px", fontWeight: 600 }}>
          v1.0.0
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Sidebar;
