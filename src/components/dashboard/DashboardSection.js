import React from "react";
import { Card, Box, Typography } from "@mui/joy";

const DashboardSection = ({ title, icon, accentColor = "#667eea", children }) => (
  <Card
    variant="outlined"
    sx={{
      mb: 1.5,
      p: 0,
      overflow: "hidden",
      border: "1px solid #e8ecf0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      borderRadius: "12px",
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 0.6,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: "1px solid #e8ecf0",
        borderLeft: `4px solid ${accentColor}`,
        background: `linear-gradient(90deg, ${accentColor}12 0%, #ffffff 60%)`,
      }}
    >
      {icon && (
        <Box sx={{ color: accentColor, display: "flex", alignItems: "center", fontSize: 17 }}>
          {icon}
        </Box>
      )}
      <Typography level="title-sm" sx={{ fontWeight: 700, color: "#2d3748", letterSpacing: "0.2px", fontSize: "13px" }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 1.5 }}>{children}</Box>
  </Card>
);

export default DashboardSection;
