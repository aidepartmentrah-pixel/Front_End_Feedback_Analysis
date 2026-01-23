// src/components/distribution/DistributionPieChart.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionPieChart from './DistributionPieChart';
import { singleBucketData, emptyBucketData, singleValueBucket } from '../../test/fixtures/distributionData';

// Mock Recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, dataKey, nameKey }) => (
    <div
      data-testid="pie"
      data-length={data?.length}
      data-key={dataKey}
      data-name-key={nameKey}
    >
      {data?.map((item, index) => (
        <div key={index} data-testid={`slice-${item[nameKey]}`} />
      ))}
    </div>
  ),
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('DistributionPieChart', () => {
  test('renders with valid single bucket data', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByText(/Distribution: 2025/)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Total Records')).toBeInTheDocument();
  });

  test('shows all slices', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByTestId('slice-High')).toBeInTheDocument();
    expect(screen.getByTestId('slice-Medium')).toBeInTheDocument();
    expect(screen.getByTestId('slice-Low')).toBeInTheDocument();
  });

  test('legend displays correct keys', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('total is calculated correctly', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    const total = screen.getByText('100');
    expect(total).toBeInTheDocument();
  });

  test('handles single value', () => {
    render(<DistributionPieChart bucket={singleValueBucket.buckets[0]} />);
    
    expect(screen.getByTestId('slice-No Harm')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('handles empty values array', () => {
    render(<DistributionPieChart bucket={emptyBucketData.buckets[0]} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('responsive container is present', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('handles null bucket', () => {
    render(<DistributionPieChart bucket={null} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('pie component receives correct data', () => {
    render(<DistributionPieChart bucket={singleBucketData.buckets[0]} />);
    
    const pie = screen.getByTestId('pie');
    expect(pie.getAttribute('data-length')).toBe('3');
    expect(pie.getAttribute('data-key')).toBe('count');
    expect(pie.getAttribute('data-name-key')).toBe('key');
  });
});
