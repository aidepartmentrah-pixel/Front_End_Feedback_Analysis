// src/components/distribution/DistributionBarChart.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionBarChart from './DistributionBarChart';
import { singleBucketData, emptyBucketData, singleValueBucket } from '../../test/fixtures/distributionData';

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-values={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey }) => <div data-testid={`bar-${dataKey}`}>{dataKey}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill} />,
}));

describe('DistributionBarChart', () => {
  test('renders with valid single bucket data', () => {
    render(<DistributionBarChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByText(/Distribution: 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Total records: 100/)).toBeInTheDocument();
  });

  test('shows correct number of bars', () => {
    const { container } = render(
      <DistributionBarChart bucket={singleBucketData.buckets[0]} />
    );
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
    
    // Check data is passed correctly
    const dataAttr = chart.getAttribute('data-values');
    const data = JSON.parse(dataAttr);
    expect(data).toHaveLength(3);
  });

  test('displays correct count values', () => {
    const { container } = render(
      <DistributionBarChart bucket={singleBucketData.buckets[0]} />
    );
    
    const chart = screen.getByTestId('bar-chart');
    const dataAttr = chart.getAttribute('data-values');
    const data = JSON.parse(dataAttr);
    
    expect(data[0].count).toBe(30);
    expect(data[1].count).toBe(50);
    expect(data[2].count).toBe(20);
  });

  test('handles empty values array', () => {
    render(<DistributionBarChart bucket={emptyBucketData.buckets[0]} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles single value', () => {
    render(<DistributionBarChart bucket={singleValueBucket.buckets[0]} />);
    
    expect(screen.getByText(/Distribution: 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Total records: 50/)).toBeInTheDocument();
  });

  test('responsive container is present', () => {
    render(<DistributionBarChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('handles null bucket', () => {
    render(<DistributionBarChart bucket={null} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles undefined values', () => {
    render(<DistributionBarChart bucket={{}} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });
});
