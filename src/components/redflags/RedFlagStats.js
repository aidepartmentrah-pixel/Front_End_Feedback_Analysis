// src/components/redflags/RedFlagStats.js
import React from "react";
import { Box, Card, Typography, Grid } from "@mui/joy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const RedFlagStats = () => {
  const stats = [
    {
      label: "آخر 30 يوم",
      labelEn: "Last 30 Days",
      value: "8",
      icon: <WarningAmberIcon />,
      color: "#ff4757",
      bgColor: "rgba(255, 71, 87, 0.1)",
    },
    {
      label: "آخر 6 أشهر",
      labelEn: "Last 6 Months",
      value: "42",
      icon: <TrendingUpIcon />,
      color: "#ffa502",
      bgColor: "rgba(255, 165, 2, 0.1)",
    },
    {
      label: "آخر 12 شهر",
      labelEn: "Last 12 Months",
      value: "87",
      icon: <TrendingUpIcon />,
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
    },
    {
      label: "نسبة المفتوحة",
      labelEn: "% Still Open",
      value: "34%",
      icon: <CheckCircleIcon />,
      color: "#ffa502",
      bgColor: "rgba(255, 165, 2, 0.1)",
    },
    {
      label: "متوسط وقت الحل",
      labelEn: "Avg Resolution Time",
      value: "18 يوم",
      icon: <AccessTimeIcon />,
      color: "#2ed573",
      bgColor: "rgba(46, 213, 115, 0.1)",
    },
    {
      label: "الإجمالي التاريخي",
      labelEn: "Total Ever",
      value: "156",
      icon: <WarningAmberIcon />,
      color: "#ff4757",
      bgColor: "rgba(255, 71, 87, 0.1)",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            sx={{
              p: 2.5,
              background: stat.bgColor,
              border: `2px solid ${stat.color}30`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 8px 16px ${stat.color}20`,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  background: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {stat.icon}
              </Box>
              <Typography level="h4" sx={{ fontWeight: 900, color: stat.color }}>
                {stat.value}
              </Typography>
            </Box>
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#333", mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography level="body-xs" sx={{ color: "#666" }}>
              {stat.labelEn}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RedFlagStats;
