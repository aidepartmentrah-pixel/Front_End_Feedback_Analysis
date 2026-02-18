// src/components/personReporting/MetricsPanel.jsx
// Phase D — Generic metrics renderer panel

import React from "react";
import { Box, Card, Typography } from "@mui/joy";

/**
 * MetricsPanel - Generic metrics display component
 * 
 * Renders a responsive grid of metric cards from a configuration array.
 * Entity-agnostic and reusable across different reporting contexts.
 * 
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric objects with structure:
 *   {
 *     key: string,          // Unique identifier
 *     label: string,        // Display label
 *     value: number|string, // Metric value
 *     icon: ReactNode,      // Optional icon (emoji or component)
 *     color: string         // Optional color for styling
 *   }
 */
const MetricsPanel = ({ metrics = [] }) => {
  // Handle empty or missing metrics
  if (!metrics || metrics.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Card
          variant="soft"
          sx={{
            p: 3,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          <Typography level="body-md" sx={{ color: "#999" }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 2,
        }}
      >
        {metrics.map((metric) => {
          const metricColor = metric.color || "#667eea";
          
          return (
            <Card
              key={metric.key}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: "center",
                borderColor: metricColor,
                borderWidth: "2px",
                background: `${metricColor}10`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Icon */}
              {metric.icon && (
                <Box sx={{ fontSize: "32px", mb: 0.5 }}>
                  {metric.icon}
                </Box>
              )}
              
              {/* Value */}
              <Typography
                level="h3"
                sx={{
                  fontWeight: 700,
                  color: metricColor,
                  mb: 0.5,
                }}
              >
                {metric.value}
              </Typography>
              
              {/* Label */}
              <Typography
                level="body-sm"
                sx={{
                  color: "#666",
                  fontWeight: 600,
                }}
              >
                {metric.label}
              </Typography>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default MetricsPanel;
