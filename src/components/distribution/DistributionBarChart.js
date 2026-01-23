// src/components/distribution/DistributionBarChart.js
import React, { memo } from 'react';
import { Box, Typography, Card, useTheme } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
 * Vertical Bar Chart for single time period distribution
 * Memoized for performance optimization
 * @param {Object} props
 * @param {Object} props.bucket - Single bucket data with time_label, total, values
 */
const DistributionBarChart = memo(({ bucket }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!bucket || !bucket.values || bucket.values.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="neutral">No data to display</Typography>
      </Card>
    );
  }

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card sx={{ p: 2, boxShadow: 'md' }}>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            {data.key}
          </Typography>
          <Typography level="body-sm">
            Count: <strong>{data.count}</strong>
          </Typography>
          <Typography level="body-sm">
            Percentage: <strong>{(data.percent * 100).toFixed(1)}%</strong>
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          Distribution: {bucket.time_label}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Total records: {bucket.total}
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart
          data={bucket.values}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="count" name="Count">
            {bucket.values.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if bucket data has actually changed
  if (!prevProps.bucket && !nextProps.bucket) return true;
  if (!prevProps.bucket || !nextProps.bucket) return false;
  
  return (
    prevProps.bucket.time_label === nextProps.bucket.time_label &&
    prevProps.bucket.total === nextProps.bucket.total &&
    prevProps.bucket.values?.length === nextProps.bucket.values?.length
  );
});

DistributionBarChart.displayName = 'DistributionBarChart';

export default DistributionBarChart;
