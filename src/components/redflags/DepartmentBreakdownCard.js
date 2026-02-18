import React from 'react';
import { Card, Typography, Box, LinearProgress, CircularProgress, Chip } from '@mui/joy';

const DepartmentBreakdownCard = ({ data, loading, error }) => {
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

  // Check if data exists first
  if (!data) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>🏥 الرايات الحمراء حسب الإدارة</Typography>
        <Typography level="body-md" color="neutral">جاري التحميل...</Typography>
      </Card>
    );
  }

  // Map API response (uses 'breakdown' not 'departments')
  const departments = data.breakdown || data.departments || [];
  
  if (departments.length === 0) {
    return (
      <Card sx={{ p: 3, height: '100%' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>🏥 الرايات الحمراء حسب الإدارة</Typography>
        <Typography level="body-md" color="neutral">لا توجد بيانات متاحة</Typography>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'UNDER_REVIEW': return 'warning';
      case 'FINISHED': return 'success';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN': return 'مفتوح';
      case 'UNDER_REVIEW': return 'قيد المراجعة';
      case 'FINISHED': return 'منتهي';
      default: return status;
    }
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography level="h4" sx={{ mb: 1, fontWeight: 600 }}>🏥 الرايات الحمراء حسب الإدارة</Typography>
      <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
        {data.period || 'جميع الفترات'} • الإجمالي: {data.total}
      </Typography>

      {/* Department List with Horizontal Bars */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {departments.map((dept, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography level="body-md" fontWeight={600}>
                {dept.department}
              </Typography>
              <Typography level="body-md" fontWeight={600} color="primary">
                {dept.count} ({dept.percentage.toFixed(1)}%)
              </Typography>
            </Box>
            
            {/* Progress Bar */}
            <LinearProgress
              determinate
              value={dept.percentage}
              sx={{
                '--LinearProgress-thickness': '12px',
                '--LinearProgress-progressColor': index === 0 ? 'danger.500' : index === 1 ? 'warning.500' : 'primary.500',
                bgcolor: 'neutral.200',
                mb: 1
              }}
            />
            
            {/* Status Breakdown */}
            {dept.status_breakdown && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(dept.status_breakdown).map(([status, count]) => (
                  count > 0 && (
                    <Chip key={status} size="sm" color={getStatusColor(status)} variant="soft">
                      {getStatusLabel(status)}: {count}
                    </Chip>
                  )
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {departments.length >= 10 && (
        <Typography level="body-xs" color="neutral" sx={{ mt: 2, textAlign: 'center' }}>
          عرض أعلى {departments.length} إدارات
        </Typography>
      )}
    </Card>
  );
};

export default DepartmentBreakdownCard;
