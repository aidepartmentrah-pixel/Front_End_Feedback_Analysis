// src/components/personReporting/PersonReportingLayout.jsx
// Phase D — Shared person reporting layout shell

import React from "react";
import { Box, Typography } from "@mui/joy";
import theme from "../../theme";

/**
 * PersonReportingLayout - Reusable layout shell for person reporting pages
 * 
 * Provides consistent structure for Doctor and Worker history/reporting pages.
 * Accepts sections as props for flexible content rendering.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {React.ReactNode} props.searchSection - Search component
 * @param {React.ReactNode} props.profileSection - Profile card component
 * @param {React.ReactNode} props.metricsSection - Metrics/statistics component
 * @param {React.ReactNode} props.tableSection - Data table component
 * @param {React.ReactNode} props.reportSection - Report actions component
 */
const PersonReportingLayout = ({
  title,
  subtitle,
  searchSection,
  profileSection,
  metricsSection,
  tableSection,
  reportSection,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      {(title || subtitle) && (
        <Box sx={{ mb: 4 }}>
          {title && (
            <Typography
              level="h2"
              sx={{
                fontWeight: 800,
                background: theme.gradients.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography level="body-md" sx={{ color: "#666" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Search Section */}
      {searchSection && (
        <Box sx={{ mb: 3 }}>
          {searchSection}
        </Box>
      )}

      {/* Profile Section */}
      {profileSection && (
        <Box sx={{ mb: 3 }}>
          {profileSection}
        </Box>
      )}

      {/* Metrics Section */}
      {metricsSection && (
        <Box sx={{ mb: 3 }}>
          {metricsSection}
        </Box>
      )}

      {/* Table Section */}
      {tableSection && (
        <Box sx={{ mb: 3 }}>
          {tableSection}
        </Box>
      )}

      {/* Report Section */}
      {reportSection && (
        <Box sx={{ mb: 3 }}>
          {reportSection}
        </Box>
      )}
    </Box>
  );
};

export default PersonReportingLayout;
