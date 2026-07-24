// src/components/personReporting/MetricsPanel.jsx
// Phase D — Generic metrics renderer panel

import React from "react";
import { Box, Card, Typography } from "@mui/joy";
import theme from "../../theme";

/**
 * MetricsPanel - Generic metrics display component
 *
 * Renders a responsive grid of equal-size, neutral KPI cards from a
 * configuration array. Color is a thin top accent + icon tint, not a
 * full tinted card background/border -- reserved for cards that carry an
 * actual severity/status meaning, not decoration.
 *
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric objects with structure:
 *   {
 *     key: string,          // Unique identifier
 *     label: string,        // Display label
 *     value: number|string, // Metric value
 *     icon: ReactNode,      // Optional icon (MUI icon component)
 *     color: string         // Optional accent color for this metric
 *   }
 */
const MetricsPanel = ({ metrics = [] }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Card
          variant="outlined"
          sx={{ p: 3, textAlign: "center", borderRadius: theme.radius.lg }}
        >
          <Typography level="body-md" sx={{ color: theme.colors.textTertiary }}>
            No metrics available
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 1.5,
        }}
      >
        {metrics.map((metric) => {
          const accent = metric.color || theme.colors.primary;

          return (
            <Card
              key={metric.key}
              variant="outlined"
              sx={{
                py: 1.25,
                px: 1.5,
                textAlign: "center",
                borderRadius: theme.radius.md,
                borderColor: theme.colors.border,
                borderTop: `3px solid ${accent}`,
                background: theme.colors.surface,
                boxShadow: "none",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {metric.icon && (
                <Box sx={{ color: accent, display: "flex", fontSize: 20, "& svg": { fontSize: 20 } }}>
                  {metric.icon}
                </Box>
              )}

              <Box sx={{ textAlign: "left" }}>
                <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.textPrimary, lineHeight: 1.2 }}>
                  {metric.value}
                </Typography>

                <Typography level="body-xs" sx={{ color: theme.colors.textSecondary, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {metric.label}
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default MetricsPanel;
