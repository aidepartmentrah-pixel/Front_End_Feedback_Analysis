// src/components/neverEvents/NeverEventsTrendChart.js
import React from "react";
import { Card, Typography, Box } from "@mui/joy";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const NeverEventsTrendChart = () => {
  // Mock data for last 12 months
  const data = [
    { month: "يناير", count: 0 },
    { month: "فبراير", count: 1 },
    { month: "مارس", count: 2 },
    { month: "أبريل", count: 0 },
    { month: "مايو", count: 1 },
    { month: "يونيو", count: 0 },
    { month: "يوليو", count: 0 },
    { month: "أغسطس", count: 1 },
    { month: "سبتمبر", count: 0 },
    { month: "أكتوبر", count: 0 },
    { month: "نوفمبر", count: 1 },
    { month: "ديسمبر", count: 0 },
  ];

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#666" }}>
        📊 اتجاه Never Events (Never Events Trend - Last 12 Months)
      </Typography>
      
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="month"
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "2px solid #666",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "14px", fontWeight: 600 }}
            />
            <Bar
              dataKey="count"
              fill="#666"
              radius={[8, 8, 0, 0]}
              name="عدد Never Events"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 2,
          background: "rgba(102, 102, 102, 0.05)",
          borderRadius: "8px",
        }}
      >
        <Typography level="body-xs" sx={{ color: "#666" }}>
          💡 يوضح الرسم البياني عدد Never Events المسجلة شهرياً خلال العام الماضي
        </Typography>
      </Box>
    </Card>
  );
};

export default NeverEventsTrendChart;
