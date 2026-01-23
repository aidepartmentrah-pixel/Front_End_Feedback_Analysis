// src/components/distribution/DistributionPieChart.js
import React, { memo } from 'react';
import { Box, Typography, Card, useTheme } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  PieChart,
  Pie,
  Cell,
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
 * Pie Chart for single time period distribution
 * @param {Object} props
 * @param {Object} props.bucket - Single bucket data with time_label, total, values
 */
const DistributionPieChart = memo(({ bucket }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!bucket || !bucket.values || bucket.values.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="neutral">No data to display</Typography>
      </Card>
    );
  }

  // Custom label to show percentage on slices
  const renderLabel = (entry) => {
    return `${(entry.percent * 100).toFixed(1)}%`;
  };

  // Custom tooltip
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
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          Distribution: {bucket.time_label}
        </Typography>
        <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 800, my: 1 }}>
          {bucket.total}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Total Records
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <PieChart>
          <Pie
            data={bucket.values}
            dataKey="count"
            nameKey="key"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 80 : 120}
            label={renderLabel}
            labelLine={false}
          >
            {bucket.values.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
});

DistributionPieChart.displayName = 'DistributionPieChart';

export default DistributionPieChart;
