// src/components/neverEvents/StatisticsCards.js
import React from "react";
import { Box, Card, Typography, Grid } from "@mui/joy";

const StatisticsCards = ({ statistics, loading }) => {
  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: "100%", minHeight: 120 }}>
                <Typography level="body-sm">جاري التحميل...</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!statistics) return null;

  // Map API response to expected structure (temporary fix until backend is updated)
  const totalNeverEvents = statistics.total_never_events || statistics.total || 0;
  const unfinishedCount = statistics.unfinished_count || statistics.unfinished || (statistics.under_investigation + statistics.open) || 0;
  const finishedCount = statistics.finished_count || statistics.finished || statistics.resolved || 0;
  const criticalCount = statistics.by_severity?.CRITICAL || statistics.critical_severity || 0;
  const highCount = statistics.by_severity?.HIGH || statistics.high_severity || 0;
  const currentMonthCount = statistics.current_month?.count || statistics.current_month_count || 0;

  const cards = [
    {
      label: "إجمالي الأحداث",
      value: totalNeverEvents,
      color: "#dc2626",
      icon: "⚠️",
    },
    {
      label: "غير منتهي",
      value: unfinishedCount,
      color: "#f59e0b",
      icon: "⏳",
    },
    {
      label: "منتهي",
      value: finishedCount,
      color: "#10b981",
      icon: "✓",
    },
    {
      label: "حرج",
      value: criticalCount,
      color: "#dc2626",
      icon: "🔴",
    },
    {
      label: "عالي",
      value: highCount,
      color: "#f97316",
      icon: "🟠",
    },
    {
      label: "الشهر الحالي",
      value: currentMonthCount,
      color: "#3b82f6",
      icon: "📅",
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <Grid key={index} xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                height: "100%",
                minHeight: 120,
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                borderLeft: `4px solid ${card.color}`,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography level="h4">{card.icon}</Typography>
                  <Typography
                    level="body-sm"
                    sx={{ color: "text.secondary", fontWeight: 500 }}
                  >
                    {card.label}
                  </Typography>
                </Box>
                <Typography
                  level="h2"
                  sx={{ color: card.color, fontWeight: 700 }}
                >
                  {card.value?.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
