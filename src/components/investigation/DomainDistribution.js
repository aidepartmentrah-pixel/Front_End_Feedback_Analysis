// src/components/investigation/DomainDistribution.js
import React from "react";
import { Box, Card, Typography, Sheet } from "@mui/joy";

const DomainNode = ({ name, icon, count, percentage, color, bgColor, showPercentage }) => {
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
    </Box>
  );
};

const DomainDistribution = ({ showPercentage = false }) => {
  const mockData = {
    clinical: { count: 650, percentage: 52 },
    management: { count: 380, percentage: 30.4 },
    relational: { count: 220, percentage: 17.6 },
  };

  const total = mockData.clinical.count + mockData.management.count + mockData.relational.count;

  const domains = [
    {
      key: "clinical",
      name: "Clinical",
      icon: "🏥",
      color: "#0ea5e9",
      bgColor: "#e0f2fe",
      data: mockData.clinical,
    },
    {
      key: "management",
      name: "Management",
      icon: "📊",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      data: mockData.management,
    },
    {
      key: "relational",
      name: "Relational",
      icon: "🤝",
      color: "#10b981",
      bgColor: "#d1fae5",
      data: mockData.relational,
    },
  ];

  return (
    <Card>
      <Box sx={{ mb: 3 }}>
        <Typography level="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {showPercentage ? "📊 Domain Distribution — Percentages" : "📊 Domain Distribution — Counts"}
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666" }}>
          {showPercentage
            ? "What proportion of incidents fall into each domain? Percentages sum to 100%. Helps distinguish size vs proportion."
            : "How many incidents occurred in each domain? Shows absolute numbers to understand volume."}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-around", gap: 3, flexWrap: "wrap", p: 2 }}>
        {domains.map((domain) => (
          <DomainNode
            key={domain.key}
            name={domain.name}
            icon={domain.icon}
            count={domain.data.count}
            percentage={domain.data.percentage}
            color={domain.color}
            bgColor={domain.bgColor}
            showPercentage={showPercentage}
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

export default DomainDistribution;
