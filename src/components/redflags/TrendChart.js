// src/components/redflags/TrendChart.js
import React from "react";
import { Card, Box, Typography, FormControl, FormLabel, Select, Option, Grid } from "@mui/joy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TrendChart = ({ trends, loading, granularity, onGranularityChange }) => {
  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Card>
    );
  }

  console.log("📈 TrendChart received trends:", trends);

  if (!trends || trends.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography level="title-lg" sx={{ mb: 2 }}>
          📈 الاتجاهات
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          لا توجد بيانات اتجاهات متاحة
        </Typography>
      </Card>
    );
  }

  // Prepare chart data - handle different API response structures
  let chartData = [];
  let categories = [];

  if (trends[0]?.breakdown) {
    // Grouped data - breakdown exists
    chartData = trends.map((item) => ({
      period: item.period || item.date || item.month,
      ...item.breakdown,
    }));
    categories = Object.keys(trends[0].breakdown);
  } else if (trends[0]?.total !== undefined) {
    // API returns data with category keys directly
    chartData = trends;
    // Get all keys except period, date, month, total
    const excludeKeys = ['period', 'date', 'month', 'total'];
    categories = Object.keys(trends[0]).filter(key => !excludeKeys.includes(key));
  } else {
    // Non-grouped data - simple count
    chartData = trends.map((item) => ({
      period: item.period || item.date || item.month,
      count: item.count || item.total || 0,
    }));
  }

  console.log("📊 Chart data prepared:", chartData);
  console.log("📊 Categories:", categories);

  const colors = [
    "#dc2626",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="title-lg" sx={{ fontWeight: 600 }}>
          📈 الاتجاهات
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="sm" sx={{ minWidth: 150 }}>
            <FormLabel>الفترة الزمنية</FormLabel>
            <Select value={granularity} onChange={(_, value) => onGranularityChange(value)}>
              <Option value="weekly">أسبوعي</Option>
              <Option value="monthly">شهري</Option>
              <Option value="quarterly">ربع سنوي</Option>
              <Option value="yearly">سنوي</Option>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="period"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />

          {categories.length > 0 ? (
            // Grouped data - multiple lines
            categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={category}
              />
            ))
          ) : (
            // Non-grouped data - single line
            <Line
              type="monotone"
              dataKey="count"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
              name="العدد"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TrendChart;
