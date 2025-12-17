// src/components/investigation/SeverityDistribution.js
import React from "react";
import { Box, Card, Typography, Sheet } from "@mui/joy";

const SeverityNode = ({ name, icon, count, percentage, color, bgColor, showPercentage, isHigh }) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        p: 3,
        bgcolor: bgColor,
        borderRadius: "lg",
        border: `3px solid ${color}`,
        minWidth: 180,
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 16px ${color}40`,
        },
      }}
    >
      <Typography level="h1" sx={{ fontSize: "3rem" }}>
        {icon}
      </Typography>
      <Typography level="title-lg" sx={{ fontWeight: 700, color: color }}>
        {name}
      </Typography>
      <Sheet
        sx={{
          px: 3,
          py: 1.5,
          borderRadius: "md",
          bgcolor: color,
          color: "white",
          fontWeight: 800,
          fontSize: "1.5rem",
          minWidth: 80,
          textAlign: "center",
        }}
      >
        {showPercentage ? `${percentage}%` : count}
      </Sheet>
      {!showPercentage && (
        <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
          {percentage}% of total
        </Typography>
      )}
      {showPercentage && (
        <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
          {count} incidents
        </Typography>
      )}
      {showPercentage && isHigh && (
        <Sheet sx={{ mt: 1, p: 1, bgcolor: "white", borderRadius: "sm", border: `2px solid ${color}` }}>
          <Typography level="body-xs" sx={{ fontWeight: 700, color: color }}>
            ⚠️ Compared to policy threshold
          </Typography>
        </Sheet>
      )}
    </Box>
  );
};

const SeverityDistribution = ({ showPercentage = false }) => {
  const mockData = {
    low: { count: 520, percentage: 41.6 },
    medium: { count: 480, percentage: 38.4 },
    high: { count: 250, percentage: 20 },
  };

  const total = mockData.low.count + mockData.medium.count + mockData.high.count;

  const severities = [
    {
      key: "high",
      name: "High Severity",
      icon: "🔴",
      color: "#dc2626",
      bgColor: "#fee2e2",
      data: mockData.high,
    },
    {
      key: "medium",
      name: "Medium Severity",
      icon: "🟠",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      data: mockData.medium,
    },
    {
      key: "low",
      name: "Low Severity",
      icon: "🟡",
      color: "#eab308",
      bgColor: "#fef9c3",
      data: mockData.low,
    },
  ];

  return (
    <Card>
      <Box sx={{ mb: 3 }}>
        <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {showPercentage ? "⚠️ Severity Distribution — Percentages" : "⚠️ Severity Distribution — Counts"}
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666" }}>
          {showPercentage
            ? "What percentage of incidents are at each severity level? Critical for comparing against policy thresholds."
            : "How many incidents occurred at each severity level? Shows absolute volume by severity."}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-around", gap: 3, flexWrap: "wrap", p: 2 }}>
        {severities.map((severity) => (
          <SeverityNode
            key={severity.key}
            name={severity.name}
            icon={severity.icon}
            count={severity.data.count}
            percentage={severity.data.percentage}
            color={severity.color}
            bgColor={severity.bgColor}
            showPercentage={showPercentage}
            isHigh={severity.key === "high"}
          />
        ))}
      </Box>

      {showPercentage && (
        <Sheet variant="soft" sx={{ mt: 3, p: 2, borderRadius: "md", textAlign: "center" }}>
          <Typography level="body-md" sx={{ fontWeight: 700 }}>
            Total: {total} incidents = 100%
          </Typography>
        </Sheet>
      )}
    </Card>
  );
};

export default SeverityDistribution;
