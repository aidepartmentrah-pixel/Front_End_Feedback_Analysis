// src/components/trendMonitoring/CategoryTrendChart.js
import React from "react";
import { Card, Box } from "@mui/joy";
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
import { Typography } from "@mui/joy";

const CategoryTrendChart = ({ data }) => {
  if (!data || !data.chart_data || !data.chart_labels) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No category data available
        </Typography>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = data.chart_labels.map((label, index) => {
    const point = { month: label };
    data.chart_data.forEach(series => {
      point[series.name] = series.data[index] || 0;
    });
    return point;
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: "white",
            border: "2px solid #ffa502",
            borderRadius: "8px",
            p: 1.5,
            fontSize: "12px",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1 }}>
            {payload[0]?.payload?.month}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: entry.color,
                }}
              />
              <Typography level="body-xs">
                {entry.name}: <strong>{entry.value}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="month"
              stroke="#666"
              style={{ fontSize: "11px", fontWeight: 600 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "13px", fontWeight: 600 }} />
            
            {/* Render a line for each category */}
            {data.chart_data.map((series) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={series.color}
                strokeWidth={3}
                dot={{ fill: series.color, r: 5 }}
                activeDot={{ r: 7 }}
                name={series.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default CategoryTrendChart;
