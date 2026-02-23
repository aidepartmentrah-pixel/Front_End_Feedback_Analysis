// src/components/neverEvents/NeverEventsStats.js
import React from "react";
import { Box, Card, Typography, Grid } from "@mui/joy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { mockNeverEvents } from "../../data/neverEventsData";

const NeverEventsStats = () => {
  // Calculate stats from actual data
  const totalEvents = mockNeverEvents.length;
  const openEvents = mockNeverEvents.filter(event => event.status === "OPEN").length;
  const closedEvents = mockNeverEvents.filter(event => event.status === "CLOSED").length;
  const finishedEvents = mockNeverEvents.filter(event => event.status === "FINISHED").length;
  const criticalEvents = mockNeverEvents.filter(event => event.severity === "CRITICAL").length;
  const investigationInProgress = mockNeverEvents.filter(event => event.investigationStatus === "IN_PROGRESS").length;
  const regulatoryReported = mockNeverEvents.filter(event => event.regulatoryReported).length;

  const stats = [
    {
      label: "Open",
      value: openEvents.toString(),
      icon: <WarningAmberIcon />,
      color: "#ff4757",
      bgColor: "rgba(255, 71, 87, 0.1)",
    },
    {
      label: "Closed",
      value: closedEvents.toString(),
      icon: <WarningAmberIcon />,
      color: "#ffa502",
      bgColor: "rgba(255, 165, 2, 0.1)",
    },
    {
      label: "Finished",
      value: finishedEvents.toString(),
      icon: <CheckCircleIcon />,
      color: "#2ed573",
      bgColor: "rgba(46, 213, 115, 0.1)",
    },
    {
      label: "Investigations In Progress",
      value: investigationInProgress.toString(),
      icon: <AssignmentIcon />,
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
    },
    {
      label: "Regulatory Reported",
      value: regulatoryReported.toString(),
      icon: <ReportProblemIcon />,
      color: "#5f27cd",
      bgColor: "rgba(95, 39, 205, 0.1)",
    },
    {
      label: "Total",
      value: totalEvents.toString(),
      icon: <WarningAmberIcon />,
      color: "#222",
      bgColor: "rgba(34, 34, 34, 0.1)",
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
            <Typography level="body-sm" sx={{ fontWeight: 700, color: "#333" }}>
              {stat.label}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default NeverEventsStats;
