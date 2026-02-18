// src/components/doctorHistory/DoctorStatisticsCards.js
import React from "react";
import { Box, Typography, Card } from "@mui/joy";

const DoctorStatisticsCards = ({ statistics }) => {
  const stats = [
    { label: "Total Incidents", value: statistics.total, icon: "📊", color: "#667eea" },
    { label: "High Severity", value: statistics.high, icon: "⚠️", color: "#ff4757" },
    { label: "Medium Severity", value: statistics.medium, icon: "📝", color: "#ffa502" },
    { label: "Low Severity", value: statistics.low, icon: "✅", color: "#2ed573" },
    { label: "Red Flags", value: statistics.redFlags, icon: "🚩", color: "#c0392b" },
    { label: "Good Feedback", value: statistics.good_feedback || 0, icon: "😊", color: "#4caf50" },
    { label: "Neutral Feedback", value: statistics.neutral_feedback || 0, icon: "😐", color: "#95a5a6" },
    { label: "Bad Feedback", value: statistics.bad_feedback || 0, icon: "😞", color: "#e74c3c" },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        Statistics Summary
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              flex: "1 1 calc(25% - 16px)",
              minWidth: "150px",
              p: 2,
              textAlign: "center",
              borderColor: stat.color,
              borderWidth: "2px",
              background: `${stat.color}10`,
            }}
          >
            <Typography level="h1" sx={{ fontSize: "32px", mb: 0.5 }}>
              {stat.icon}
            </Typography>
            <Typography level="h3" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
              {stat.value}
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666", fontWeight: 600 }}>
              {stat.label}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DoctorStatisticsCards;
