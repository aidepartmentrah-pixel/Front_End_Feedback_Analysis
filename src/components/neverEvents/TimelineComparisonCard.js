import React, { useState } from 'react';
import { Card, Typography, Box, CircularProgress, Chip, Select, Option } from '@mui/joy';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const TimelineComparisonCard = ({ data, loading, error, period, onPeriodChange }) => {
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

  if (!data || !data.current || !data.previous) {
    return (
      <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
        <Typography level="h4" sx={{ mb: 2, fontWeight: 600 }}>📅 Period Comparison</Typography>
        <Typography level="body-sm" color="danger" fontWeight={600}>🎯 Target: Zero</Typography>
        <Typography level="body-md" color="neutral" sx={{ mt: 2 }}>No data available</Typography>
      </Card>
    );
  }

  const isImproving = data.change?.trend === 'improving';
  const changeValue = data.change?.absolute || 0;
  const changePercentage = data.change?.percentage || 0;

  return (
    <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid', borderColor: 'danger.500' }}>
      {/* Header with Period Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h4" sx={{ fontWeight: 600 }}>📅 Period Comparison</Typography>
        <Select
          value={period}
          onChange={(e, newValue) => onPeriodChange(newValue)}
          size="sm"
          sx={{ minWidth: 120 }}
        >
          <Option value="month">Monthly</Option>
          <Option value="quarter">Quarterly</Option>
          <Option value="year">Yearly</Option>
        </Select>
      </Box>

      {/* Goal Banner */}
      <Box sx={{ p: 2, bgcolor: 'danger.500', borderRadius: 'sm', mb: 3, textAlign: 'center' }}>
        <Typography level="h3" sx={{ color: 'white', fontWeight: 700 }}>
          🎯 Target: Zero (Zero Tolerance)
        </Typography>
      </Box>

      {/* Current vs Previous Comparison */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        {/* Current Period */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'danger.50',
            borderRadius: 'sm',
            border: '2px solid',
            borderColor: 'danger.500',
            textAlign: 'center'
          }}
        >
          <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
            {data.current.period_ar || data.current.period}
          </Typography>
          <Typography level="h2" color="danger" fontWeight={700}>
            {data.current.count}
          </Typography>
          <Typography level="body-xs" color="neutral">Events</Typography>
        </Box>

        {/* Previous Period */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'neutral.50',
            borderRadius: 'sm',
            border: '1px solid',
            borderColor: 'neutral.300',
            textAlign: 'center'
          }}
        >
          <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
            {data.previous.period_ar || data.previous.period}
          </Typography>
          <Typography level="h2" color="neutral" fontWeight={700}>
            {data.previous.count}
          </Typography>
          <Typography level="body-xs" color="neutral">Events</Typography>
        </Box>
      </Box>

      {/* Change Indicator */}
      <Box
        sx={{
          p: 3,
          bgcolor: isImproving ? 'success.50' : 'warning.50',
          borderRadius: 'sm',
          border: '2px solid',
          borderColor: isImproving ? 'success.500' : 'warning.500',
          textAlign: 'center',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
          {changeValue < 0 ? (
            <>
              <ArrowDownwardIcon color="success" />
              <TrendingDownIcon color="success" sx={{ fontSize: 32 }} />
            </>
          ) : changeValue > 0 ? (
            <>
              <ArrowUpwardIcon color="warning" />
              <TrendingUpIcon color="warning" sx={{ fontSize: 32 }} />
            </>
          ) : (
            <Typography level="body-lg">━</Typography>
          )}
        </Box>
        
        <Typography level="h3" color={isImproving ? 'success' : 'warning'} fontWeight={700}>
          {changeValue > 0 ? '+' : ''}{changeValue} ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
        </Typography>
        
        <Box sx={{ mt: 1 }}>
          <Chip
            color={isImproving ? 'success' : 'warning'}
            variant="solid"
            size="lg"
            startDecorator={isImproving ? '✓' : '⚠️'}
          >
            {isImproving ? 'Improving' : 'Declining'}
          </Chip>
        </Box>
      </Box>

      {/* Year to Date Stats */}
      {data.year_to_date && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.level1',
            borderRadius: 'sm',
            border: '1px solid',
            borderColor: 'neutral.300'
          }}
        >
          <Typography level="body-sm" fontWeight={600} color="neutral" sx={{ mb: 1 }}>
            Year-to-Date Statistics:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography level="body-xs" color="neutral">Total So Far</Typography>
              <Typography level="h4" color="danger" fontWeight={700}>
                {data.year_to_date.count}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography level="body-xs" color="neutral">Monthly Average</Typography>
              <Typography level="h4" color="neutral" fontWeight={700}>
                {data.year_to_date.average_per_month?.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Reminder */}
      <Typography level="body-xs" color="danger" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>
        ⚠️ Any count greater than zero requires immediate attention
      </Typography>
    </Card>
  );
};

export default TimelineComparisonCard;
