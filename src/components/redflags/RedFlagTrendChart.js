// src/components/redflags/RedFlagTrendChart.js
import React from "react";
import { Card, Typography, Box } from "@mui/joy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RedFlagTrendChart = () => {
  // Mock data for last 12 months
  const data = [
    { month: "يناير", count: 12 },
    { month: "فبراير", count: 8 },
    { month: "مارس", count: 15 },
    { month: "أبريل", count: 6 },
    { month: "مايو", count: 11 },
    { month: "يونيو", count: 9 },
    { month: "يوليو", count: 13 },
    { month: "أغسطس", count: 7 },
    { month: "سبتمبر", count: 10 },
    { month: "أكتوبر", count: 14 },
    { month: "نوفمبر", count: 8 },
    { month: "ديسمبر", count: 4 },
  ];

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#ff4757" }}>
        📈 اتجاه العلامات الحمراء (Red Flags Trend - Last 12 Months)
      </Typography>
      
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                border: "2px solid #ff4757",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "14px", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#ff4757"
              strokeWidth={3}
              dot={{ fill: "#ff4757", r: 5 }}
              activeDot={{ r: 8 }}
              name="عدد العلامات الحمراء"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 2,
          background: "rgba(255, 71, 87, 0.05)",
          borderRadius: "8px",
        }}
      >
        <Typography level="body-xs" sx={{ color: "#666" }}>
          💡 يوضح الرسم البياني عدد العلامات الحمراء المسجلة شهرياً خلال العام الماضي
        </Typography>
      </Box>
    </Card>
  );
};

export default RedFlagTrendChart;
