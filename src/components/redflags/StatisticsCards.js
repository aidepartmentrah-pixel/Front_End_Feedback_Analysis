// src/components/redflags/StatisticsCards.js
import React from "react";
import { Box, Card, Typography, Grid, Chip } from "@mui/joy";

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
      label: "إجمالي الأعلام الحمراء",
      value: statistics.total_red_flags,
      color: "#dc2626",
      icon: "🚩",
    },
    {
      label: "غير منتهي",
      value: statistics.unfinished,
      color: "#f59e0b",
      icon: "⏳",
    },
    {
      label: "منتهي",
      value: statistics.finished,
      color: "#10b981",
      icon: "✓",
    },
    {
      label: "حرج",
      value: statistics.by_severity?.CRITICAL || 0,
      color: "#dc2626",
      icon: "🔴",
    },
    {
      label: "عالي",
      value: statistics.by_severity?.HIGH || 0,
      color: "#f97316",
      icon: "🟠",
    },
    {
      label: "الشهر الحالي",
      value: statistics.current_month?.count || 0,
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

      {/* Never Event Overlap Card */}
      {statistics.never_event_overlap && (
        <Card sx={{ mt: 2, background: "#fef3c7" }}>
          <Typography level="title-md" sx={{ mb: 1, fontWeight: 600 }}>
            📊 التقاطع مع الأحداث التي لا يجب أن تحدث
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={3}>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                إجمالي الأحداث التي لا يجب أن تحدث
              </Typography>
              <Typography level="h4" sx={{ color: "#d97706" }}>
                {statistics.never_event_overlap.total_never_events}
              </Typography>
            </Grid>
            <Grid xs={12} sm={3}>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                أعلام حمراء + أحداث لا يجب أن تحدث
              </Typography>
              <Typography level="h4" sx={{ color: "#dc2626" }}>
                {statistics.never_event_overlap.red_flags_also_never_events}
              </Typography>
            </Grid>
            <Grid xs={12} sm={3}>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                أحداث لا يجب أن تحدث فقط
              </Typography>
              <Typography level="h4" sx={{ color: "#059669" }}>
                {statistics.never_event_overlap.never_events_only}
              </Typography>
            </Grid>
            <Grid xs={12} sm={3}>
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                أعلام حمراء فقط
              </Typography>
              <Typography level="h4" sx={{ color: "#3b82f6" }}>
                {statistics.never_event_overlap.red_flags_only}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default StatisticsCards;
