import React, { useState } from 'react';
import { Card, Typography, Box, CircularProgress, Chip, IconButton } from '@mui/joy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const CategoryBreakdownCard = ({ data, loading, error }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (index) => {
    setExpandedCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress color="danger" />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
        <Typography level="body-md" color="danger">{error}</Typography>
      </Card>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>⚠️ الأحداث التي لا ينبغي أن تحدث حسب الفئة</Typography>
        <Typography level="body-sm" color="danger" fontWeight={600}>🎯 الهدف: صفر</Typography>
        <Typography level="body-md" color="neutral" sx={{ mt: 2 }}>لا توجد بيانات متاحة</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
      <Typography level="h4" sx={{ mb: 1, fontWeight: 600 }}>⚠️ الأحداث حسب الفئة</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="body-sm" color="neutral">
          {data.period}
        </Typography>
        <Chip color="danger" variant="solid" size="lg">
          🎯 الهدف: صفر • الحالي: {data.total}
        </Chip>
      </Box>

      {/* Expandable Category List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.categories.map((category, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid',
              borderColor: 'neutral.300',
              borderRadius: 'sm',
              overflow: 'hidden',
              bgcolor: 'background.surface'
            }}
          >
            {/* Category Header */}
            <Box
              onClick={() => category.types && category.types.length > 0 && toggleCategory(index)}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: category.types && category.types.length > 0 ? 'pointer' : 'default',
                bgcolor: 'danger.50',
                '&:hover': {
                  bgcolor: category.types && category.types.length > 0 ? 'danger.100' : 'danger.50'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography level="body-md" fontWeight={600}>
                  {category.category_name_ar || category.category_name}
                </Typography>
                {category.types && category.types.length > 0 && (
                  <Chip size="sm" variant="soft" color="neutral">
                    {category.types.length} نوع
                  </Chip>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip color="danger" variant="solid">
                  {category.count} ({category.percentage.toFixed(1)}%)
                </Chip>
                {category.types && category.types.length > 0 && (
                  <IconButton size="sm" variant="plain">
                    {expandedCategories[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Event Types - Expanded */}
            {expandedCategories[index] && category.types && category.types.length > 0 && (
              <Box sx={{ p: 2, bgcolor: 'background.level1', borderTop: '1px solid', borderColor: 'neutral.200' }}>
                <Typography level="body-sm" fontWeight={600} sx={{ mb: 1.5, color: 'neutral.700' }}>
                  أنواع الأحداث:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {category.types.map((type, typeIndex) => (
                    <Box
                      key={typeIndex}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: 'background.surface',
                        borderRadius: 'sm',
                        border: '1px solid',
                        borderColor: 'neutral.200'
                      }}
                    >
                      <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'danger.500'
                          }}
                        />
                        {type.type_ar || type.type}
                      </Typography>
                      <Chip size="sm" color="danger" variant="soft">
                        {type.count}
                      </Chip>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Total Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'danger.50', borderRadius: 'sm', textAlign: 'center' }}>
        <Typography level="body-lg" fontWeight={700} color="danger">
          الإجمالي: {data.total} حدث
        </Typography>
        <Typography level="body-sm" fontWeight={600} color="danger" sx={{ mt: 0.5 }}>
          🎯 الهدف المطلوب: صفر (تحمل صفري)
        </Typography>
      </Box>
    </Card>
  );
};

export default CategoryBreakdownCard;
