import React from "react";
import { Card, Button, Box, Typography } from "@mui/joy";
import { Link } from "react-router-dom";

const DashboardActions = () => {
  const actions = [
    { label: "➕ Insert New Record", path: "/insert", color: "success" },
    { label: "✏️ View & Edit", path: "/table-view", color: "warning" },
    { label: "📊 View Reports", path: "/reporting", color: "info" },
    { label: "📤 Export Data", path: "/export", color: "primary" },
  ];

  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography level="h4" sx={{ mb: 2, color: "#1a1e3f", fontWeight: 700 }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            component={Link}
            to={action.path}
            size="lg"
            color={action.color}
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              p: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Card>
  );
};

export default DashboardActions;
