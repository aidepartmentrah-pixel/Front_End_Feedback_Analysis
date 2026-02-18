import React from 'react';
import { Card, Typography, Box, LinearProgress, CircularProgress, Chip } from '@mui/joy';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c', '#1976d2'];

const CategoryBreakdownCard = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Typography level="body-md" color="danger">{error}</Typography>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>📊 الأحداث حسب الفئة</Typography>
        <Typography level="body-md" color="neutral">جاري التحميل...</Typography>
      </Card>
    );
  }

  const categories = data.breakdown || data.categories || [];

  if (categories.length === 0) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>📊 الأحداث حسب الفئة</Typography>
        <Typography level="body-md" color="neutral">لا توجد بيانات متاحة</Typography>
      </Card>
    );
  }

  const chartData = categories.map(cat => ({
    name: cat.category_name_ar || cat.category_name || cat.category,
    value: cat.count,
    percentage: cat.percentage
  }));

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography level="h4" sx={{ mb: 1, fontWeight: 600 }}>📊 الأحداث حسب الفئة</Typography>
      <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
        {data.period || 'جميع الفترات'} • الإجمالي: {data.total}
      </Typography>

      {/* Pie Chart */}
      <Box sx={{ height: 250, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Category List with Progress Bars */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {categories.map((category, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography level="body-sm" fontWeight={500}>
                {category.category_name_ar || category.category_name || category.category}
              </Typography>
              <Typography level="body-sm" fontWeight={600}>
                {category.count} ({(category.percentage || 0).toFixed(1)}%)
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={category.percentage || 0}
              sx={{
                '--LinearProgress-thickness': '8px',
                '--LinearProgress-progressColor': COLORS[index % COLORS.length],
                bgcolor: 'neutral.200'
              }}
            />
            {/* Severity Breakdown */}
            {category.severity_breakdown && (
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {category.severity_breakdown.CRITICAL > 0 && (
                  <Chip size="sm" color="danger" variant="soft">
                    حرج: {category.severity_breakdown.CRITICAL}
                  </Chip>
                )}
                {category.severity_breakdown.HIGH > 0 && (
                  <Chip size="sm" color="warning" variant="soft">
                    عالي: {category.severity_breakdown.HIGH}
                  </Chip>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default CategoryBreakdownCard;
