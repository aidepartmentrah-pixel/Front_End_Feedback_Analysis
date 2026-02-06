/**
 * ErrorPanel - Reusable error display component
 * 
 * Purpose:
 * - Consistent error UX across workflow pages
 * - User-friendly error messages
 * - Optional retry functionality
 * 
 * Usage:
 * <ErrorPanel 
 *   message="Failed to load data"
 *   retryAction={handleRetry}
 *   retryLabel="Try Again"
 * />
 */

import React from 'react';
import { Alert, Button, Typography, Box } from '@mui/joy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorPanel = ({ message, retryAction, retryLabel = 'Retry' }) => {
  return (
    <Alert
      color="danger"
      variant="soft"
      startDecorator={<ErrorOutlineIcon />}
      sx={{ mb: 2 }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography level="title-sm" sx={{ mb: 0.5 }}>
          Error
        </Typography>
        <Typography level="body-sm">{message}</Typography>
      </Box>
      {retryAction && (
        <Button
          size="sm"
          variant="outlined"
          color="danger"
          onClick={retryAction}
          sx={{ ml: 2 }}
        >
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
};

export default ErrorPanel;
