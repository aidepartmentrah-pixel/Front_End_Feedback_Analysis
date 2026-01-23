// src/components/distribution/NoDataMessage.js
import React from 'react';
import { Box, Typography, Card } from '@mui/joy';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Display a friendly message when no data is available
 * @param {Object} props
 * @param {string} props.timeLabel - Time period label (e.g., "2025", "2024-Q1")
 */
const NoDataMessage = ({ timeLabel }) => {
  return (
    <Card
      variant="soft"
      color="warning"
      sx={{
        p: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />
      <Typography level="h4" sx={{ fontWeight: 600 }}>
        No Data Available
      </Typography>
      <Typography level="body-md" sx={{ color: 'text.secondary' }}>
        No data found for <strong>{timeLabel}</strong>
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>
        💡 Try adjusting your time period or filters to see results
      </Typography>
    </Card>
  );
};

export default NoDataMessage;
