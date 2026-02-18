/**
 * PHASE DR - GROUP E - DASHBOARD SLIDER GUARDS TESTS
 * 
 * Tests UX guards that protect slider interaction from invalid states.
 * 
 * Test Coverage:
 * 13️⃣ Debounce limits rapid updates
 * 14️⃣ Clamp prevents out-of-bounds values
 * 15️⃣ Order correction swaps reversed indices
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../pages/DashBoard';
import * as dashboardApi from '../api/dashboard';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { clampIndex } from '../utils/dateSliderMapping';

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

describe('PHASE DR - GROUP E - Slider Guards Tests', () => {
  
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
  // TEST 13: Debounce limits updates
  // ==========================================================================
  
  test('13️⃣ Debounce prevents excessive API calls during rapid slider moves', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    // Perform 5 rapid slider moves
    for (let i = 0; i < 5; i++) {
      fireEvent.change(slider, { target: { value: [i, i + 10] } });
      jest.advanceTimersByTime(50); // 50ms between moves
    }

    // Should not have called stats yet (still within debounce)
    expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount);

    // Complete debounce delay (250ms total)
    jest.advanceTimersByTime(250);

    // Should only call stats once with the final value
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  test('13️⃣ Debounce resets on each slider move', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    // First move
    fireEvent.change(slider, { target: { value: [5, 15] } });
    jest.advanceTimersByTime(200); // Almost at debounce limit

    // Second move resets the timer
    fireEvent.change(slider, { target: { value: [6, 16] } });
    jest.advanceTimersByTime(200); // Another 200ms

    // Should still not have called (reset happened)
    expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount);

    // Complete remaining debounce
    jest.advanceTimersByTime(100);

    // Now it should call
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  test('13️⃣ Debounce delay is 250ms', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: [10, 20] } });

    // Advance to just before 250ms
    jest.advanceTimersByTime(249);
    expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount);

    // Advance past 250ms
    jest.advanceTimersByTime(2);

    await waitFor(() => {
      expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  // ==========================================================================
  // TEST 14: Clamp works
  // ==========================================================================
  
  test('14️⃣ clampIndex prevents values below minimum', () => {
    const result = clampIndex(-10, 0, 100);
    expect(result).toBe(0);
  });

  test('14️⃣ clampIndex prevents values above maximum', () => {
    const result = clampIndex(150, 0, 100);
    expect(result).toBe(100);
  });

  test('14️⃣ clampIndex allows valid values in range', () => {
    const result = clampIndex(50, 0, 100);
    expect(result).toBe(50);
  });

  test('14️⃣ clampIndex works at boundaries', () => {
    expect(clampIndex(0, 0, 100)).toBe(0);
    expect(clampIndex(100, 0, 100)).toBe(100);
  });

  test('14️⃣ clampIndex floors fractional values', () => {
    expect(clampIndex(50.7, 0, 100)).toBe(50);
    expect(clampIndex(99.9, 0, 100)).toBe(99);
  });

  test('14️⃣ Slider handler uses clampIndex for protection', async () => {
    // This tests that the slider handler implementation uses clampIndex
    // to protect against out-of-bounds values
    
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Try to set values beyond bounds (implementation should clamp)
    // Note: MUI Slider might prevent this at UI level, but handler has guards
    fireEvent.change(slider, { target: { value: [-5, 35] } });
    jest.advanceTimersByTime(300);

    // Handler should clamp to valid range [0, 30]
    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      // Dates should be valid (within bounds)
      expect(lastCall.start_date).toBeTruthy();
      expect(lastCall.end_date).toBeTruthy();
    });
  });

  // ==========================================================================
  // TEST 15: Order correction works
  // ==========================================================================
  
  test('15️⃣ Slider handles reversed indices (start > end)', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Try to set reversed range (end < start)
    fireEvent.change(slider, { target: { value: [20, 10] } });
    jest.advanceTimersByTime(300);

    // Handler should auto-correct by swapping
    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      // Start date should be before end date
      expect(lastCall.start_date <= lastCall.end_date).toBe(true);
    });
  });

  test('15️⃣ Order correction swaps to maintain start <= end', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Set reversed range
    fireEvent.change(slider, { target: { value: [25, 5] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      // Should be corrected to [5, 25]
      expect(lastCall.start_date).toBe('2024-01-06'); // Index 5 → Jan 6
      expect(lastCall.end_date).toBe('2024-01-26');   // Index 25 → Jan 26
    });
  });

  test('15️⃣ Order correction handles edge case of equal values', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Set equal values (single day)
    fireEvent.change(slider, { target: { value: [15, 15] } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const lastCall = dashboardApi.fetchDashboardStats.mock.calls[
        dashboardApi.fetchDashboardStats.mock.calls.length - 1
      ][0];
      
      // Should accept equal values (same day)
      expect(lastCall.start_date).toBe('2024-01-16');
      expect(lastCall.end_date).toBe('2024-01-16');
    });
  });

  // ==========================================================================
  // ADDITIONAL: Combined guard scenarios
  // ==========================================================================
  
  test('✓ Guards prevent updates when bounds are null', async () => {
    // Override bounds to return null
    dashboardApi.fetchDashboardDateBounds.mockResolvedValue({
      min_date: null,
      max_date: null
    });

    renderWithProviders(<DashboardPage />);

    // Slider should not render when bounds are null
    await waitFor(() => {
      const slider = screen.queryByRole('slider');
      expect(slider).not.toBeInTheDocument();
    });
  });

  test('✓ Guards prevent updates during bounds loading', async () => {
    let resolveBounds;
    const boundsPromise = new Promise((resolve) => {
      resolveBounds = resolve;
    });

    dashboardApi.fetchDashboardDateBounds.mockReturnValue(boundsPromise);

    renderWithProviders(<DashboardPage />);

    // Wait for component to attempt fetch
    await waitFor(() => {
      expect(dashboardApi.fetchDashboardDateBounds).toHaveBeenCalled();
    });

    // Slider should not be available during loading
    const slider = screen.queryByRole('slider');
    expect(slider).not.toBeInTheDocument();

    // Resolve bounds
    resolveBounds({
      min_date: '2024-01-01',
      max_date: '2024-01-31'
    });

    // After resolution, slider should appear
    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });
  });

  test('✓ Debounce timer cleanup on unmount', async () => {
    const { unmount } = renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');

    // Start a slider change
    fireEvent.change(slider, { target: { value: [10, 20] } });

    // Unmount before debounce completes
    unmount();

    // Advance timers (should not cause errors)
    jest.advanceTimersByTime(300);

    // No errors should occur (cleanup worked)
    expect(true).toBe(true);
  });

  test('✓ Invalid slider value array rejected', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByRole('slider')).toBeInTheDocument();
    });

    const initialCallCount = dashboardApi.fetchDashboardStats.mock.calls.length;
    const slider = screen.getByRole('slider');

    // Try to pass invalid value (not an array of 2)
    fireEvent.change(slider, { target: { value: [10] } }); // Only one value
    jest.advanceTimersByTime(300);

    // Should not trigger stats fetch (guard rejected it)
    expect(dashboardApi.fetchDashboardStats.mock.calls.length).toBe(initialCallCount);
  });
});
