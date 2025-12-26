// src/components/neverEvents/TrendChart.js
import React from "react";
import { Card, Box, Typography, FormControl, FormLabel, Select, Option } from "@mui/joy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const TrendChart = ({ trends, loading, granularity, groupBy, onGranularityChange, onGroupByChange }) => {
  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography level="title-lg" sx={{ mb: 2 }}>
          📈 الاتجاهات (الهدف: صفر)
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          لا توجد بيانات اتجاهات متاحة
        </Typography>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = trends.map((item) => {
    if (item.breakdown) {
      // Grouped data
      return {
        period: item.period,
        ...item.breakdown,
        total: item.total,
      };
    } else {
      // Non-grouped data
      return {
        period: item.period,
        count: item.count,
      };
    }
  });

  // Get unique categories for grouped data
  const categories = trends[0]?.breakdown ? Object.keys(trends[0].breakdown) : [];

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
        <Box>
          <Typography level="title-lg" sx={{ fontWeight: 600 }}>
            📈 الاتجاهات
          </Typography>
          <Typography level="body-sm" sx={{ color: "#dc2626", fontWeight: 600 }}>
            الهدف: صفر (Zero Tolerance)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="sm" sx={{ minWidth: 150 }}>
            <FormLabel>الفترة الزمنية</FormLabel>
            <Select value={granularity} onChange={(_, value) => onGranularityChange(value)}>
              <Option value="monthly">شهري</Option>
              <Option value="quarterly">ربع سنوي</Option>
              <Option value="weekly">أسبوعي</Option>
            </Select>
          </FormControl>
          <FormControl size="sm" sx={{ minWidth: 150 }}>
            <FormLabel>تجميع حسب</FormLabel>
            <Select value={groupBy} onChange={(_, value) => onGroupByChange(value)}>
              <Option value="none">بدون تجميع</Option>
              <Option value="category">الفئة</Option>
              <Option value="department">القسم</Option>
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
          
          {/* Zero Goal Line */}
          <ReferenceLine
            y={0}
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: "الهدف: صفر",
              position: "right",
              fill: "#dc2626",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          
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
