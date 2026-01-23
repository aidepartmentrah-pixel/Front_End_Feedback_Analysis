// src/components/distribution/DistributionLineChart.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionLineChart from './DistributionLineChart';
import {
  multiBucketData,
  multiplePeriodsWithMissingKeys,
} from '../../test/fixtures/distributionData';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-values={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, type, stroke }) => (
    <div
      data-testid={`line-${dataKey}`}
      data-type={type}
      data-stroke={stroke}
    >
      {dataKey}
    </div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('DistributionLineChart', () => {
  test('renders with multiple buckets', () => {
    render(<DistributionLineChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByText(/Distribution Trends Over Time/)).toBeInTheDocument();
    expect(screen.getByText(/Tracking changes across 2 time periods/)).toBeInTheDocument();
  });

  test('each dimension key has a line', () => {
    render(<DistributionLineChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByTestId('line-Clinical')).toBeInTheDocument();
    expect(screen.getByTestId('line-Operational')).toBeInTheDocument();
    expect(screen.getByTestId('line-Administrative')).toBeInTheDocument();
  });

  test('lines connect data points', () => {
    render(<DistributionLineChart buckets={multiBucketData.buckets} />);
    
    const line = screen.getByTestId('line-Clinical');
    expect(line.getAttribute('data-type')).toBe('monotone');
  });

  test('handles buckets with different dimension keys', () => {
    render(
      <DistributionLineChart buckets={multiplePeriodsWithMissingKeys.buckets} />
    );
    
    // Should render all keys found across all buckets
    expect(screen.getByTestId('line-Medication Error')).toBeInTheDocument();
    expect(screen.getByTestId('line-Fall')).toBeInTheDocument();
    expect(screen.getByTestId('line-Pressure Injury')).toBeInTheDocument();
  });

  test('transforms data correctly', () => {
    const { container } = render(
      <DistributionLineChart buckets={multiBucketData.buckets} />
    );
    
    const chart = screen.getByTestId('line-chart');
    const dataAttr = chart.getAttribute('data-values');
    const transformedData = JSON.parse(dataAttr);
    
    expect(transformedData).toHaveLength(2);
    expect(transformedData[0]).toHaveProperty('time_label', '2024-Q4');
    expect(transformedData[0]).toHaveProperty('Clinical', 60);
  });

  test('handles empty buckets array', () => {
    render(<DistributionLineChart buckets={[]} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles null buckets', () => {
    render(<DistributionLineChart buckets={null} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('responsive container is present', () => {
    render(<DistributionLineChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('lines have different colors', () => {
    render(<DistributionLineChart buckets={multiBucketData.buckets} />);
    
    const line1 = screen.getByTestId('line-Clinical');
    const line2 = screen.getByTestId('line-Operational');
    
    // Colors should be different
    expect(line1.getAttribute('data-stroke')).not.toBe(
      line2.getAttribute('data-stroke')
    );
  });
});
