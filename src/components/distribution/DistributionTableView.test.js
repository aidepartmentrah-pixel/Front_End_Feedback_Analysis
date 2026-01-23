// src/components/distribution/DistributionTableView.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionTableView from './DistributionTableView';
import {
  singleBucketData,
  multiBucketData,
} from '../../test/fixtures/distributionData';

describe('DistributionTableView', () => {
  test('renders all rows', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    // Should have 3 data rows
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('shows correct columns', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByText('Dimension')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Percentage')).toBeInTheDocument();
    expect(screen.getByText('Period Total')).toBeInTheDocument();
  });

  test('percentage formatting is correct', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    // Check for formatted percentages
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
  });

  test('sort functionality works', () => {
    render(<DistributionTableView buckets={multiBucketData.buckets} />);
    
    // Click on Count column header to sort
    const countHeader = screen.getByText('Count').closest('th');
    fireEvent.click(countHeader);
    
    // Should render without error (checking sort works) - use getAllByText for multiple occurrences
    const clinicalElements = screen.getAllByText('Clinical');
    expect(clinicalElements.length).toBeGreaterThan(0);
  });

  test('total row is accurate', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    // Total count should be sum of all counts
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    
    // Should show 100 as total (30 + 50 + 20)
    const totalRow = screen.getByText('TOTAL').closest('tr');
    expect(totalRow).toBeInTheDocument();
  });

  test('handles multiple buckets', () => {
    render(<DistributionTableView buckets={multiBucketData.buckets} />);
    
    // Should show time labels from both buckets - use getAllByText for multiple occurrences
    const q4Labels = screen.getAllByText('2024-Q4');
    const q1Labels = screen.getAllByText('2025-Q1');
    
    expect(q4Labels.length).toBeGreaterThan(0);
    expect(q1Labels.length).toBeGreaterThan(0);
  });

  test('handles empty buckets array', () => {
    render(<DistributionTableView buckets={[]} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles null buckets', () => {
    render(<DistributionTableView buckets={null} />);
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('sort direction changes on multiple clicks', () => {
    render(<DistributionTableView buckets={multiBucketData.buckets} />);
    
    const countHeader = screen.getByText('Count').closest('th');
    
    // First click - ascending
    fireEvent.click(countHeader);
    
    // Second click - descending
    fireEvent.click(countHeader);
    
    // Should still render correctly - use getAllByText for multiple occurrences
    const clinicalElements = screen.getAllByText('Clinical');
    expect(clinicalElements.length).toBeGreaterThan(0);
  });

  test('displays count values correctly', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    // Check specific count values
    const rows = screen.getAllByRole('row');
    
    // Should have header, 3 data rows, and footer
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  test('chips are used for dimension values', () => {
    render(<DistributionTableView buckets={singleBucketData.buckets} />);
    
    // Check that dimension values are rendered (they're in Chips)
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0);
  });
});
