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

  const cards = [
    {
      label: "إجمالي الأحداث",
      value: statistics.total_never_events,
      color: "#dc2626",
      icon: "⚠️",
      subtitle: "الهدف: صفر",
    },
    {
      label: "غير منتهي",
      value: statistics.unfinished_count,
      color: "#f59e0b",
      icon: "⏳",
    },
    {
      label: "منتهي",
      value: statistics.finished_count,
      color: "#10b981",
      icon: "✓",
    },
    {
      label: "حرج",
      value: statistics.by_severity?.HIGH || statistics.by_severity?.CRITICAL || 0,
      color: "#dc2626",
      icon: "🔴",
    },
    {
      label: "الشهر الحالي",
      value: statistics.current_month?.count || 0,
      color: "#3b82f6",
      icon: "📅",
    },
    {
      label: "الشهر السابق",
      value: statistics.previous_month?.count || 0,
      color: "#8b5cf6",
      icon: "📆",
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
                {card.subtitle && (
                  <Typography
                    level="body-xs"
                    sx={{ color: card.color, fontWeight: 600, mt: -0.5 }}
                  >
                    {card.subtitle}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Category Breakdown */}
      {statistics.by_category && Object.keys(statistics.by_category).length > 0 && (
        <Card sx={{ mt: 2, background: "#fef3c7" }}>
          <Typography level="title-md" sx={{ mb: 1, fontWeight: 600 }}>
            📊 التوزيع حسب الفئة
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(statistics.by_category).map(([category, count]) => (
              <Grid key={category} xs={12} sm={6} md={3}>
                <Box>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    {category}
                  </Typography>
                  <Typography level="h4" sx={{ color: "#d97706" }}>
                    {count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default StatisticsCards;
