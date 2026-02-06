/**
 * Integration Tests for InsightPage
 * Verifies data loading and adapter integration
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightPage from './InsightPage';
import * as insightApi from '../api/insightApi';

// Mock apiClient first to avoid axios ES module issues
jest.mock('../api/apiClient');

// Mock the insight API
jest.mock('../api/insightApi');

// Mock MainLayout to simplify testing
jest.mock('../components/common/MainLayout', () => {
  return function MockMainLayout({ children }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

describe('InsightPage - Data Loading Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Adapter Integration', () => {
    test('should use flat array from getInsightDistribution without .data accessor', async () => {
      // Mock adapted response (flat array)
      const mockDistribution = [
        { label: 'DRAFT', value: 30 },
        { label: 'IN_REVIEW', value: 20 },
      ];

      insightApi.getInsightKpis.mockResolvedValue({
        open_subcases: 50,
        pending_approvals: 8,
        active_action_items: 15,
        overdue_items: 5,
      });

      insightApi.getInsightDistribution.mockResolvedValue(mockDistribution);
      insightApi.getInsightTrend.mockResolvedValue([]);
      insightApi.getStuckCases.mockResolvedValue([]);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Verify distribution data is displayed (not empty)
      expect(screen.getByText('Workflow Status Distribution')).toBeInTheDocument();
    });

    test('should use flat array from getInsightTrend without .data accessor', async () => {
      const mockTrend = [
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 15 },
      ];

      insightApi.getInsightKpis.mockResolvedValue({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });

      insightApi.getInsightDistribution.mockResolvedValue([]);
      insightApi.getInsightTrend.mockResolvedValue(mockTrend);
      insightApi.getStuckCases.mockResolvedValue([]);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Verify trend data section is displayed
      expect(screen.getByText('Subcase Trend (Monthly)')).toBeInTheDocument();
    });

    test('should use flat array from getStuckCases without .items accessor', async () => {
      const mockStuckCases = [
        {
          subcase_id: 1001,
          target_org_unit_id: 5,
          updated_at: '2024-01-15T10:30:00Z',
          days_in_stage: 10,
          status: 'SECTION_REVIEW',
          stage: 'SECTION_REVIEW',
          assigned_level: '—',
        },
      ];

      insightApi.getInsightKpis.mockResolvedValue({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });

      insightApi.getInsightDistribution.mockResolvedValue([]);
      insightApi.getInsightTrend.mockResolvedValue([]);
      insightApi.getStuckCases.mockResolvedValue(mockStuckCases);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Verify stuck cases table shows count
      expect(screen.getByText('Stuck / Escalated Cases (1)')).toBeInTheDocument();
      expect(screen.getByText('#1001')).toBeInTheDocument();
    });

    test('should handle all adapted responses together', async () => {
      insightApi.getInsightKpis.mockResolvedValue({
        open_subcases: 50,
        pending_approvals: 8,
        active_action_items: 15,
        overdue_items: 5,
      });

      insightApi.getInsightDistribution.mockResolvedValue([
        { label: 'DRAFT', value: 30 },
        { label: 'IN_REVIEW', value: 20 },
      ]);

      insightApi.getInsightTrend.mockResolvedValue([
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 15 },
      ]);

      insightApi.getStuckCases.mockResolvedValue([
        {
          subcase_id: 1001,
          target_org_unit_id: 5,
          status: 'SECTION_REVIEW',
          stage: 'SECTION_REVIEW',
          days_in_stage: 10,
          assigned_level: '—',
        },
      ]);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Verify all KPI cards display correct values
      expect(screen.getByText('50')).toBeInTheDocument(); // open_subcases
      expect(screen.getByText('8')).toBeInTheDocument(); // pending_approvals
      expect(screen.getByText('15')).toBeInTheDocument(); // active_action_items
      expect(screen.getAllByText('5')[0]).toBeInTheDocument(); // overdue_items (may appear in stuck table too)

      // Verify sections are present
      expect(screen.getByText('Workflow Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Subcase Trend (Monthly)')).toBeInTheDocument();
      expect(screen.getByText('Stuck / Escalated Cases (1)')).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    test('should handle empty arrays without crashing', async () => {
      insightApi.getInsightKpis.mockResolvedValue({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });

      insightApi.getInsightDistribution.mockResolvedValue([]);
      insightApi.getInsightTrend.mockResolvedValue([]);
      insightApi.getStuckCases.mockResolvedValue([]);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Verify empty states
      expect(screen.getAllByText('No data available for chart')[0]).toBeInTheDocument();
      expect(screen.getByText('✅ No stuck cases')).toBeInTheDocument();
    });

    test('should handle null responses gracefully', async () => {
      insightApi.getInsightKpis.mockResolvedValue(null);
      insightApi.getInsightDistribution.mockResolvedValue(null);
      insightApi.getInsightTrend.mockResolvedValue(null);
      insightApi.getStuckCases.mockResolvedValue(null);

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading insight data...')).not.toBeInTheDocument();
      });

      // Should not crash, fallback to empty arrays/objects
      expect(screen.getByText('Workflow Insight')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should display error when API calls fail', async () => {
      insightApi.getInsightKpis.mockRejectedValue(new Error('API Error'));
      insightApi.getInsightDistribution.mockRejectedValue(new Error('API Error'));
      insightApi.getInsightTrend.mockRejectedValue(new Error('API Error'));
      insightApi.getStuckCases.mockRejectedValue(new Error('API Error'));

      render(<InsightPage />);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });
});
