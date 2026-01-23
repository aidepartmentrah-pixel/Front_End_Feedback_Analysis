// src/components/distribution/DistributionStackedBarChart.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionStackedBarChart from './DistributionStackedBarChart';
import {
  multiBucketData,
  multiplePeriodsWithMissingKeys,
} from '../../test/fixtures/distributionData';

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children, data }) => (
    <div data-testid="stacked-bar-chart" data-values={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, stackId }) => (
    <div data-testid={`bar-${dataKey}`} data-stack-id={stackId}>
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

describe('DistributionStackedBarChart', () => {
  test('renders with multiple buckets', () => {
    render(<DistributionStackedBarChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByText(/Distribution Over Time \(Stacked\)/)).toBeInTheDocument();
    expect(screen.getByText(/Comparing 2 time periods/)).toBeInTheDocument();
  });

  test('transforms data correctly', () => {
    const { container } = render(
      <DistributionStackedBarChart buckets={multiBucketData.buckets} />
    );
    
    const chart = screen.getByTestId('stacked-bar-chart');
    const dataAttr = chart.getAttribute('data-values');
    const transformedData = JSON.parse(dataAttr);
    
    expect(transformedData).toHaveLength(2);
    expect(transformedData[0]).toHaveProperty('time_label', '2024-Q4');
    expect(transformedData[0]).toHaveProperty('Clinical', 60);
    expect(transformedData[0]).toHaveProperty('Operational', 30);
    expect(transformedData[1]).toHaveProperty('time_label', '2025-Q1');
  });

  test('each dimension key has a bar', () => {
    render(<DistributionStackedBarChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByTestId('bar-Clinical')).toBeInTheDocument();
    expect(screen.getByTestId('bar-Operational')).toBeInTheDocument();
    expect(screen.getByTestId('bar-Administrative')).toBeInTheDocument();
  });

  test('x-axis shows time labels', () => {
    render(<DistributionStackedBarChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
  });

  test('handles missing dimension keys in some buckets', () => {
    render(
      <DistributionStackedBarChart
        buckets={multiplePeriodsWithMissingKeys.buckets}
      />
    );
    
    // Should still render all keys found across all buckets
    expect(screen.getByTestId('bar-Medication Error')).toBeInTheDocument();
    expect(screen.getByTestId('bar-Fall')).toBeInTheDocument();
    expect(screen.getByTestId('bar-Pressure Injury')).toBeInTheDocument();
  });

  test('handles empty buckets array', () => {
    render(<DistributionStackedBarChart buckets={[]} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles null buckets', () => {
    render(<DistributionStackedBarChart buckets={null} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('responsive container is present', () => {
    render(<DistributionStackedBarChart buckets={multiBucketData.buckets} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('bars have correct stack ID', () => {
    render(<DistributionStackedBarChart buckets={multiBucketData.buckets} />);
    
    const bar = screen.getByTestId('bar-Clinical');
    expect(bar.getAttribute('data-stack-id')).toBe('a');
  });
});
