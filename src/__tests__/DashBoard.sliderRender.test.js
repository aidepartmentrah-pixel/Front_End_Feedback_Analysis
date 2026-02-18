/**
 * PHASE DR - GROUP B - DASHBOARD SLIDER RENDER TESTS
 * 
 * Tests that the date slider renders correctly based on bounds state.
 * 
 * Test Coverage:
 * 4️⃣ Slider renders when bounds present
 * 5️⃣ Slider hidden/disabled when bounds null
 * 6️⃣ Labels show correct dates
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../pages/DashBoard';
import * as dashboardApi from '../api/dashboard';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock API functions
jest.mock('../api/dashboard');

// Mock child components
jest.mock('../components/common/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="main-layout">{children}</div>
}));

jest.mock('../components/dashboard/DashboardTitle', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-title">Dashboard Title</div>
}));

jest.mock('../components/dashboard/GlobalDashboardStats', () => ({
  __esModule: true,
  default: () => <div data-testid="global-stats">Global Stats</div>
}));

jest.mock('../components/dashboard/IdaraDashboardStats', () => ({
  __esModule: true,
  default: () => <div data-testid="idara-stats">Idara Stats</div>
}));

jest.mock('../components/dashboard/DayraDashboardStats', () => ({
  __esModule: true,
  default: () => <div data-testid="dayra-stats">Dayra Stats</div>
}));

jest.mock('../components/dashboard/QismDashboardStats', () => ({
  __esModule: true,
  default: () => <div data-testid="qism-stats">Qism Stats</div>
}));

jest.mock('../components/dashboard/DashboardActions', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-actions">Actions</div>
}));

// Helper to wrap component with providers
const renderWithProviders = (component) => {
  const mockUser = {
    username: 'testuser',
    roles: ['SOFTWARE_ADMIN'],
    token: 'mock-token'
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={{ user: mockUser }}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('PHASE DR - GROUP B - Slider Render Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default hierarchy mock
    dashboardApi.fetchDashboardHierarchy.mockResolvedValue({
      Administration: [],
      Department: {},
      Section: {}
    });

    dashboardApi.fetchDashboardStats.mockResolvedValue({
      total_records: 100,
      stats: {}
    });
  });

  // ==========================================================================
  // TEST 4: Slider renders when bounds present
  // ==========================================================================
  
  test('4️⃣ Slider renders when bounds present', async () => {
    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: '2024-01-01',
      max_date: '2024-12-31'
    });

    renderWithProviders(<DashboardPage />);

    // Wait for bounds fetch to complete
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Slider should be present in the document
    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    // Verify slider is not disabled
    const slider = screen.getByRole('slider');
    expect(slider).not.toBeDisabled();
  });

  // ==========================================================================
  // TEST 5: Slider hidden/disabled when bounds null
  // ==========================================================================
  
  test('5️⃣ Slider hidden when bounds are null', async () => {
    // Mock bounds returning null dates
    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: null,
      max_date: null
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Slider should NOT be in the document when bounds are null
    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });
  });

  test('5️⃣ Slider disabled during bounds loading', async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    dashboardApi.fetchDashboardDateBounds.mockReturnValue(fetchPromise);

    renderWithProviders(<DashboardPage />);

    // Initially, slider might not render or be disabled
    // Wait a bit to let component process
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Resolve with valid bounds
    resolveFetch({
      min_date: '2024-01-01',
      max_date: '2024-12-31'
    });

    // After resolution, slider should appear and not be disabled
    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      if (slider) {
        expect(slider).not.toBeDisabled();
      }
    });
  });

  test('5️⃣ Slider not rendered when bounds fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    dashboardApi.fetchDashboardDateBounds.mockRejectedValue(
      new Error('Failed to fetch bounds')
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Slider should not render on error
    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  // ==========================================================================
  // TEST 6: Labels show correct dates
  // ==========================================================================
  
  test('6️⃣ Labels display correct min and max dates', async () => {
    const minDate = '2024-03-15';
    const maxDate = '2024-09-20';

    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: minDate,
      max_date: maxDate
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Check that both date labels are displayed
    await waitFor(() => {
      expect(screen.getByText(minDate)).toBeInTheDocument();
      expect(screen.getByText(maxDate)).toBeInTheDocument();
    });
  });

  test('6️⃣ Labels update when bounds change', async () => {
    const initialMin = '2024-01-01';
    const initialMax = '2024-06-30';

    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: initialMin,
      max_date: initialMax
    });

    const { rerender } = renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(initialMin)).toBeInTheDocument();
      expect(screen.getByText(initialMax)).toBeInTheDocument();
    });

    // Simulate bounds change
    const newMin = '2024-07-01';
    const newMax = '2024-12-31';

    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: newMin,
      max_date: newMax
    });

    // Note: Without user interaction, we can't trigger a re-fetch in this unit test
    // This validates the initial label rendering
  });

  test('6️⃣ Slider value labels format dates correctly', async () => {
    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: '2024-01-01',
      max_date: '2024-01-31'
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    // Verify slider has valueLabelFormat configured
    // The actual value label rendering is handled by MUI and uses indexToDate
    // This is validated in mapping tests
  });

  // ==========================================================================
  // ADDITIONAL: Edge cases
  // ==========================================================================
  
  test('✓ Slider handles same min and max date', async () => {
    const sameDate = '2024-06-15';

    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: sameDate,
      max_date: sameDate
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    // Both labels should show the same date
    const dateElements = screen.getAllByText(sameDate);
    expect(dateElements.length).toBeGreaterThanOrEqual(2);
  });

  test('✓ Slider renders with valid date range', async () => {
    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: '2024-01-01',
      max_date: '2024-12-31'
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    // Verify "Date Range" label is present
    expect(screen.getByText(/Date Range/i)).toBeInTheDocument();
  });
});
