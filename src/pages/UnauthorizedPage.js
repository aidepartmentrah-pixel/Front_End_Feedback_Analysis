// src/pages/UnauthorizedPage.js
import React from "react";
import { Box, Typography, Button, Card } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { Info } from "@mui/icons-material";

/**
 * UnauthorizedPage - Shown when user attempts to access a route without proper role permissions.
 * This provides clear feedback and navigation options.
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      data-testid="unauthorized"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          textAlign: "center",
          gap: 3,
        }}
      >
        <Box
          sx={{
            mx: "auto",
            width: 80,
            height: 80,
            bgcolor: "#f44336",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Info sx={{ fontSize: 48, color: "white" }} />
        </Box>

        <Box>
          <Typography level="h2" sx={{ mb: 1, color: "#333" }}>
            Access Denied
          </Typography>
          <Typography level="body-lg" sx={{ color: "#666" }}>
            You don't have permission to access this page.
          </Typography>
          <Typography level="body-md" sx={{ mt: 2, color: "#999" }}>
            If you believe this is an error, please contact your system administrator.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
          <Button
            variant="solid"
            color="primary"
            onClick={() => navigate("/")}
            size="lg"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => navigate(-1)}
            size="lg"
          >
            Go Back
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default UnauthorizedPage;
