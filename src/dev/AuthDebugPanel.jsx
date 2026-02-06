// src/dev/AuthDebugPanel.jsx
import React, { useState } from "react";
import { Box, Card, Typography, Sheet, IconButton } from "@mui/joy";
import { useAuth } from "../context/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * DEV-ONLY: Visual debug panel for authentication state
 * Shows current auth context values for testing purposes
 * Only renders in development mode
 */
const AuthDebugPanel = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

  return (
    <Sheet
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        boxShadow: "lg",
        borderRadius: "md",
        border: "2px solid",
        borderColor: "warning.500",
      }}
    >
      <Card
        variant="soft"
        color="warning"
        sx={{
          p: 2,
          maxHeight: isCollapsed ? "auto" : 500,
          overflow: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: isCollapsed ? 0 : 2,
          }}
        >
          <Typography level="title-md" sx={{ fontWeight: "bold" }}>
            🔧 Auth Debug Panel
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setIsVisible(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!isCollapsed && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Loading State */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Loading:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                {isLoading ? "🔄 Yes" : "✓ No"}
              </Typography>
            </Box>

            {/* Authenticated */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Authenticated:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                {isAuthenticated ? "✓ Yes" : "✗ No"}
              </Typography>
            </Box>

            {/* Username */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Username:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                {user?.username || "(none)"}
              </Typography>
            </Box>

            {/* Roles */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Roles:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                {user?.roles && user.roles.length > 0
                  ? user.roles.join(", ")
                  : "(none)"}
              </Typography>
            </Box>

            {/* Scopes */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Scopes:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                {user?.scopes && user.scopes.length > 0
                  ? user.scopes.join(", ")
                  : "(none)"}
              </Typography>
            </Box>

            {/* Session-Based Auth */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Auth Method:
              </Typography>
              <Typography level="body-sm" sx={{ pl: 2 }}>
                Session Cookie (incident_manager_session)
              </Typography>
            </Box>

            {/* Backend URL */}
            <Box>
              <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                Backend Base URL:
              </Typography>
              <Typography
                level="body-sm"
                sx={{ pl: 2, wordBreak: "break-all" }}
              >
                {apiBaseUrl}
              </Typography>
            </Box>

            {/* Full User Object (for debugging) */}
            {user && (
              <Box>
                <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                  User Object:
                </Typography>
                <Box
                  sx={{
                    pl: 2,
                    mt: 0.5,
                    p: 1,
                    bgcolor: "background.level1",
                    borderRadius: "sm",
                    maxHeight: 150,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {JSON.stringify(user, null, 2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Sheet>
  );
};

export default AuthDebugPanel;
