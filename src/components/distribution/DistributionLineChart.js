// src/components/distribution/DistributionLineChart.js
import React, { memo } from 'react';
import { Box, Typography, Card, useTheme } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#8884d8', // Blue
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7c7c', // Red
  '#a28dd8', // Purple
  '#ff9f40', // Orange
  '#4bc0c0', // Teal
  '#ff6384', // Pink
];

/**
 * Line Chart for multiple time periods showing trends
 * @param {Object} props
 * @param {Array} props.buckets - Array of bucket data
 */
const DistributionLineChart = memo(({ buckets }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!buckets || buckets.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="neutral">No data to display</Typography>
      </Card>
    );
  }

  // Transform data structure (same as stacked bar chart)
  const transformedData = buckets.map((bucket) => {
    const dataPoint = { time_label: bucket.time_label };
    bucket.values.forEach((value) => {
      dataPoint[value.key] = value.count;
    });
    return dataPoint;
  });

  // Extract all unique dimension keys
  const dimensionKeys = new Set();
  buckets.forEach((bucket) => {
    bucket.values.forEach((value) => {
      dimensionKeys.add(value.key);
    });
  });
  const dimensionKeysArray = Array.from(dimensionKeys);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, boxShadow: 'md' }}>
          <Typography level="title-sm" sx={{ fontWeight: 700, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} level="body-sm" sx={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          Distribution Trends Over Time
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Tracking changes across {buckets.length} time periods
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <LineChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time_label" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dimensionKeysArray.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
});

DistributionLineChart.displayName = 'DistributionLineChart';

export default DistributionLineChart;
