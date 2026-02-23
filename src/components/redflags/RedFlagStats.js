// src/components/redflags/RedFlagStats.js
import React from "react";
import { Box, Card, Typography, Grid } from "@mui/joy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { mockRedFlags } from "../../data/redflagsData";

const RedFlagStats = () => {
  // Calculate stats from actual data
  const totalFlags = mockRedFlags.length;
  const finishedFlags = mockRedFlags.filter(flag => flag.status === "FINISHED").length;
  const openFlags = mockRedFlags.filter(flag => flag.status === "OPEN").length;
  const closedFlags = mockRedFlags.filter(flag => flag.status === "CLOSED").length;

  const stats = [
    {
      label: "Open",
      value: openFlags.toString(),
      icon: <WarningAmberIcon />,
      color: "#ffa502",
      bgColor: "rgba(255, 165, 2, 0.1)",
    },
    {
      label: "Closed",
      value: closedFlags.toString(),
      icon: <WarningAmberIcon />,
      color: "#999",
      bgColor: "rgba(153, 153, 153, 0.1)",
    },
    {
      label: "Finished",
      value: finishedFlags.toString(),
      icon: <CheckCircleIcon />,
      color: "#2ed573",
      bgColor: "rgba(46, 213, 115, 0.1)",
    },
    {
      label: "Total",
      value: totalFlags.toString(),
      icon: <WarningAmberIcon />,
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid xs={12} sm={6} md={4} lg={2.4} key={index}>
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
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#333" }}>
              {stat.label}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RedFlagStats;
