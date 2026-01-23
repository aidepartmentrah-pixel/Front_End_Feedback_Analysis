// src/components/common/DistributionErrorBoundary.js
import React from 'react';
import { Box, Typography, Button, Card } from '@mui/joy';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Error Boundary for Distribution Analysis charts
 * Catches React errors in child components and displays a fallback UI
 */
class DistributionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Distribution chart error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card
          variant="soft"
          color="danger"
          sx={{
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, color: 'danger.main' }} />
          
          <Typography level="h4" sx={{ fontWeight: 600 }}>
            Chart Rendering Error
          </Typography>
          
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Something went wrong while rendering the chart. Please try again.
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.surface',
                borderRadius: 'sm',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                textAlign: 'left',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1 }}>
                Error Details:
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </Box>
          )}

          <Button
            onClick={this.handleReset}
            color="danger"
            variant="solid"
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default DistributionErrorBoundary;
