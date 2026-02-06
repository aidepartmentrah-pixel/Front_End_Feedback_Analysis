// src/components/settings/DepartmentMappingToggle.js
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import theme from '../../theme';

const DepartmentMappingToggle = ({ viewMode, onToggle }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: "8px",
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
        border: `2px solid ${theme.colors.primary}33`,
      }}
    >
      <BusinessIcon sx={{ fontSize: "28px", color: theme.colors.primary }} />
      <Box sx={{ flex: 1 }}>
        <Typography level="body-md" sx={{ fontWeight: 600, color: "#333" }}>
          Department View Mode
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666" }}>
          Toggle between internal and external department listings
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant={viewMode === "internal" ? "solid" : "outlined"}
          color={viewMode === "internal" ? "primary" : "neutral"}
          startDecorator={<BusinessIcon />}
          onClick={() => onToggle("internal")}
          sx={{
            fontWeight: 700,
            ...(viewMode === "internal" && {
              background: theme.gradients.primary,
            }),
          }}
        >
          Internal
        </Button>
        <Button
          variant={viewMode === "external" ? "solid" : "outlined"}
          color={viewMode === "external" ? "warning" : "neutral"}
          startDecorator={<PublicIcon />}
          onClick={() => onToggle("external")}
          sx={{
            fontWeight: 700,
            ...(viewMode === "external" && {
              background: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)",
            }),
          }}
        >
          External
        </Button>
      </Box>
    </Box>
  );
};

export default DepartmentMappingToggle;
