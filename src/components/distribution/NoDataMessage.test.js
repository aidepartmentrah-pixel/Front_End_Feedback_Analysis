// src/components/distribution/NoDataMessage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoDataMessage from './NoDataMessage';

describe('NoDataMessage', () => {
  test('renders with time label', () => {
    render(<NoDataMessage timeLabel="2025" />);
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  test('shows warning icon', () => {
    const { container } = render(<NoDataMessage timeLabel="2024-Q1" />);
    
    // Check for SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  test('displays correct message', () => {
    render(<NoDataMessage timeLabel="2024-Q1" />);
    
    expect(screen.getByText(/No data found for/)).toBeInTheDocument();
    expect(screen.getByText(/2024-Q1/)).toBeInTheDocument();
  });

  test('shows suggestion text', () => {
    render(<NoDataMessage timeLabel="2025" />);
    
    expect(screen.getByText(/Try adjusting your time period or filters/i)).toBeInTheDocument();
  });
});
