/**
 * PHASE DR - GROUP D - DASHBOARD SLIDER BINDING TESTS
 * 
 * Tests that slider interaction correctly updates dateRange state
 * and triggers dashboard stats refetch.
 * 
 * Test Coverage:
 * 10️⃣ Slider move updates dateRange
 * 11️⃣ Start and end indices mapped correctly to dates
 * 12️⃣ Dashboard stats refetch triggered on dateRange change
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

describe('PHASE DR - GROUP D - Slider Binding Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
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

    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: '2024-01-01',
      max_date: '2024-01-31' // 31 days (index 0-30)
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================================================
  // TEST 10: Slider move updates dateRange
  // ==========================================================================
  
  test('10️⃣ Slider move updates dateRange state', async () => {
    renderWithProviders(<DashboardPage />);

    // Wait for slider to render
    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Track stats fetch calls before slider move
    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;

    // Simulate slider change (move to days 5-25)
    fireEvent.change(slider, { target: { value: [5, 25] } });

    // Fast-forward past debounce delay (250ms)
    jest.advanceTimersByTime(300);

    // Stats should be refetched with new date range
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    // Verify the stats call includes date parameters
    const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
      dashboardApi.fetchDashboardStats.mock.calls.length - 1
    ][0];

    expect(lastCall).toHaveProperty('start_date');
    expect(lastCall).toHaveProperty('end_date');
    expect(lastCall.start_date).toBeTruthy();
    expect(lastCall.end_date).toBeTruthy();
  });

  // ==========================================================================
  // TEST 11: Start/end indices mapped correctly
  // ==========================================================================
  
  test('11️⃣ Start index maps to correct date', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Move slider to index 10 (Jan 11, 2024)
    fireEvent.change(slider, { target: { value: [10, 20] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      expect(lastCall.start_date).toBe('2024-01-11');
    });
  });

  test('11️⃣ End index maps to correct date', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Move slider to end at index 20 (Jan 21, 2024)
    fireEvent.change(slider, { target: { value: [10, 20] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      expect(lastCall.end_date).toBe('2024-01-21');
    });
  });

  test('11️⃣ Full range maps correctly (0 to max)', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Move slider to full range
    fireEvent.change(slider, { target: { value: [0, 30] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      expect(lastCall.start_date).toBe('2024-01-01');
      expect(lastCall.end_date).toBe('2024-01-31');
    });
  });

  // ==========================================================================
  // TEST 12: Dashboard stats refetch triggered
  // ==========================================================================
  
  test('12️⃣ Dashboard stats refetch triggered after slider change', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    // Count initial stats fetches (hierarchy load + initial state)
    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;

    const slider = screen.getByRole('slider');

    // Change slider
    fireEvent.change(slider, { target: { value: [5, 15] } });
    jest.advanceTimersByTime(300);

    // Verify stats was called again
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  test('12️⃣ Stats refetch includes updated scope parameters', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Change slider
    fireEvent.change(slider, { target: { value: [8, 22] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      // Should include current scope (hospital by default)
      expect(lastCall.scope).toBe('hospital');
      
      // Should include chart modes
      expect(lastCall).toHaveProperty('classification_mode');
      expect(lastCall).toHaveProperty('stage_mode');
      expect(lastCall).toHaveProperty('department_mode');
    });
  });

  test('12️⃣ Multiple slider moves trigger multiple refetches', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    // First move
    fireEvent.change(slider, { target: { value: [5, 15] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 1);
    });

    // Second move
    fireEvent.change(slider, { target: { value: [10, 20] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 2);
    });
  });

  // ==========================================================================
  // ADDITIONAL: Edge cases
  // ==========================================================================
  
  test('✓ Slider updates work with single-day range', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Select single day (same start and end)
    fireEvent.change(slider, { target: { value: [15, 15] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      expect(lastCall.start_date).toBe('2024-01-16');
      expect(lastCall.end_date).toBe('2024-01-16');
    });
  });

  test('✓ Rapid slider moves debounced correctly', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    // Simulate rapid moves (within debounce window)
    fireEvent.change(slider, { target: { value: [5, 15] } });
    jest.advanceTimersByTime(50);
    
    fireEvent.change(slider, { target: { value: [6, 16] } });
    jest.advanceTimersByTime(50);
    
    fireEvent.change(slider, { target: { value: [7, 17] } });
    jest.advanceTimersByTime(50);

    // Still within debounce window - should not have fired yet
    expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount);

    // Complete debounce delay
    jest.advanceTimersByTime(200);

    // Should only call stats once (last value)
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 1);
    });
  });
});
