// src/__tests__/InsightPage.smoke.test.jsx
/**
 * F-I14 — INSIGHT PAGE SMOKE TEST
 * 
 * Purpose: Basic render verification - crash detection only
 * 
 * Tests:
 * - Page renders without throwing errors
 * - KPI card labels are present in DOM
 * - Chart containers exist
 * - Table structure renders
 * 
 * Does NOT test:
 * - Chart rendering internals
 * - Exact data values
 * - Real backend calls
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightPage from '../pages/InsightPage';
import * as insightApi from '../api/insightApi';

// Mock apiClient first to avoid axios ES module issues
jest.mock('../api/apiClient');

// Mock the entire insightApi module
jest.mock('../api/insightApi');

// Mock MainLayout to avoid router dependencies
jest.mock('../components/common/MainLayout', () => {
  return function MockMainLayout({ children }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

describe('InsightPage - Smoke Test', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock getInsightKpis - returns KPI object
    insightApi.getInsightKpis.mockResolvedValue({
      open_subcases: 42,
      pending_approvals: 8,
      active_action_items: 15,
      overdue_items: 3
    });

    // Mock getInsightDistribution - returns array of {label, value}
    insightApi.getInsightDistribution.mockResolvedValue([
      { label: 'Stage A', value: 25 },
      { label: 'Stage B', value: 17 }
    ]);

    // Mock getInsightTrend - returns array of {period, count}
    insightApi.getInsightTrend.mockResolvedValue([
      { period: '2024-01', count: 10 },
      { period: '2024-02', count: 15 },
      { period: '2024-03', count: 12 }
    ]);

    // Mock getStuckCases - returns array with one row
    insightApi.getStuckCases.mockResolvedValue([
      {
        subcase_id: 'SC-12345',
        target_org_unit_id: 'ORG-001',
        stage: 'Department Review',
        days_in_stage: 14,
        assigned_level: 'Department Admin',
        status: 'Active'
      }
    ]);
  });

  // ============================================================================
  // BASIC RENDER TEST
  // ============================================================================

  test('should render without crashing', async () => {
    // Should not throw error
    expect(() => {
      render(<InsightPage />);
    }).not.toThrow();

    // Wait for async data loading to complete
    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // KPI CARDS TEST
  // ============================================================================

  test('should render KPI card labels', async () => {
    render(<InsightPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });

    // Check KPI card labels are present
    expect(screen.getByText('Open Subcases')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Active Action Items')).toBeInTheDocument();
    expect(screen.getByText('Overdue Items')).toBeInTheDocument();
  });

  test('should display KPI values from mocked data', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });

    // Verify KPI values are rendered
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // ============================================================================
  // CHART CONTAINERS TEST
  // ============================================================================

  test('should render distribution chart section', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getInsightDistribution).toHaveBeenCalled();
    });

    // Check chart title/label exists
    expect(screen.getByText(/Workflow Status Distribution/i)).toBeInTheDocument();
  });

  test('should render trend chart section', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getInsightTrend).toHaveBeenCalled();
    });

    // Check trend section exists
    expect(screen.getByText(/Subcase Trend/i)).toBeInTheDocument();
  });

  // ============================================================================
  // TABLE STRUCTURE TEST
  // ============================================================================

  test('should render stuck cases table', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getStuckCases).toHaveBeenCalled();
    });

    // Check table section header exists
    expect(screen.getByText(/Stuck \/ Escalated Cases/i)).toBeInTheDocument();
  });

  test('should render table column headers', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getStuckCases).toHaveBeenCalled();
    });

    // Check key table headers are present
    expect(screen.getByText(/Subcase ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Stage/i)).toBeInTheDocument();
    expect(screen.getByText(/Days in Stage/i)).toBeInTheDocument();
  });

  test('should render mocked table data', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getStuckCases).toHaveBeenCalled();
    });

    // Wait for stuck cases state to update and table to render
    // Table renders when stuckCases.length > 0
    await waitFor(() => {
      // Subcase ID is prefixed with # in the table
      expect(screen.getByText('#SC-12345')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Department Review')).toBeInTheDocument();
    expect(screen.getByText('ORG-001')).toBeInTheDocument();
  });

  // ============================================================================
  // API CALL VERIFICATION
  // ============================================================================

  test('should call all four API endpoints on mount', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalledTimes(1);
      expect(insightApi.getInsightDistribution).toHaveBeenCalledTimes(1);
      expect(insightApi.getInsightTrend).toHaveBeenCalledTimes(1);
      expect(insightApi.getStuckCases).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // ERROR BOUNDARY TEST
  // ============================================================================

  test('should handle API errors gracefully', async () => {
    // Mock API failures
    insightApi.getInsightKpis.mockRejectedValue(new Error('API Error'));
    insightApi.getInsightDistribution.mockRejectedValue(new Error('API Error'));
    insightApi.getInsightTrend.mockRejectedValue(new Error('API Error'));
    insightApi.getStuckCases.mockRejectedValue(new Error('API Error'));

    // Should not crash on error
    expect(() => {
      render(<InsightPage />);
    }).not.toThrow();

    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // LOADING STATE TEST
  // ============================================================================

  test('should show loading state initially', () => {
    // Mock APIs to never resolve (simulate slow network)
    insightApi.getInsightKpis.mockImplementation(() => new Promise(() => {}));
    insightApi.getInsightDistribution.mockImplementation(() => new Promise(() => {}));
    insightApi.getInsightTrend.mockImplementation(() => new Promise(() => {}));
    insightApi.getStuckCases.mockImplementation(() => new Promise(() => {}));

    render(<InsightPage />);

    // Check loading indicator exists
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // ============================================================================
  // EMPTY DATA HANDLING TEST
  // ============================================================================

  test('should handle empty data arrays', async () => {
    // Mock empty responses
    insightApi.getInsightDistribution.mockResolvedValue([]);
    insightApi.getInsightTrend.mockResolvedValue([]);
    insightApi.getStuckCases.mockResolvedValue([]);

    expect(() => {
      render(<InsightPage />);
    }).not.toThrow();

    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // FILTER UI TEST
  // ============================================================================

  test('should render filter controls', async () => {
    render(<InsightPage />);

    await waitFor(() => {
      expect(insightApi.getInsightKpis).toHaveBeenCalled();
    });

    // Check filter UI exists by checking for form labels
    expect(screen.getAllByText(/Organizational Unit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Date Range/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Status Filter/i)).toBeInTheDocument();
  });
});
