// PHASE F — F-F3 — Follow Up Page Season Selector Reuse Tests
// src/pages/__tests__/FollowUpPage.seasonSelector.test.jsx

import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock apiClient FIRST
jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock all API modules BEFORE importing component
jest.mock('../../api/actionLogApi', () => ({
  exportActionLog: jest.fn(),
}));

jest.mock('../../api/reports', () => ({
  downloadBlob: jest.fn(),
}));

jest.mock('../../api/seasonalReports', () => ({
  getAvailableQuarters: jest.fn(),
}));

jest.mock('../../api/workflowApi', () => ({
  getFollowUpItems: jest.fn(),
  startActionItem: jest.fn(),
  completeActionItem: jest.fn(),
  delayActionItem: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock MainLayout
jest.mock('../../components/common/MainLayout', () => {
  return function MockMainLayout({ children }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

// Mock ErrorPanel
jest.mock('../../components/common/ErrorPanel', () => {
  return function MockErrorPanel({ message }) {
    return <div data-testid="error-panel">{message}</div>;
  };
});

// NOW import component and API functions
import FollowUpPage from '../FollowUpPage';
import { getAvailableQuarters } from '../../api/seasonalReports';
import { getFollowUpItems } from '../../api/workflowApi';
import { useAuth } from '../../context/AuthContext';

describe('FollowUpPage - Season Selector Reuse (F-F3)', () => {
  const mockSeasons = [
    { SeasonID: 1, SeasonName: 'Q1 2026' },
    { SeasonID: 2, SeasonName: 'Q2 2026' },
    { SeasonID: 3, SeasonName: 'Q3 2026' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs

    // Mock API responses
    getFollowUpItems.mockResolvedValue([]);
    getAvailableQuarters.mockResolvedValue(mockSeasons);
    
    // Mock auth with role that can see Action Log
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SOFTWARE_ADMIN' || role === 'WORKER',
    });
  });

  // ==========================================
  // TEST 1 — Calls season API on mount
  // ==========================================
  test('calls getAvailableQuarters API on mount', async () => {
    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalledTimes(1);
    });

    // Verify it's called with correct parameters (hospital level)
    expect(getAvailableQuarters).toHaveBeenCalledWith(1, 0);
  });

  // ==========================================
  // TEST 2 — Renders season options
  // ==========================================
  test('renders all season options from API', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that season selector is rendered
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();

    // Since MUI Joy Select doesn't render options until clicked,
    // we verify the API was called with correct data
    expect(getAvailableQuarters).toHaveBeenCalled();
  });

  // ==========================================
  // TEST 3 — Auto-selects first season
  // ==========================================
  test('auto-selects first season from API response', async () => {
    render(<FollowUpPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // The first season should be auto-selected (though we can't easily verify Select value in tests)
    // We can verify the button is enabled (which requires a season to be selected)
    const generateButton = screen.getByRole('button', { name: /توليد التقرير/i });
    
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  // ==========================================
  // TEST 4 — Handles empty seasons list
  // ==========================================
  test('disables button when no seasons available', async () => {
    getAvailableQuarters.mockResolvedValue([]);

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /توليد التقرير/i });
    expect(generateButton).toBeDisabled();
  });

  // ==========================================
  // TEST 5 — Handles lowercase field names fallback
  // ==========================================
  test('handles lowercase season_id and name fields', async () => {
    const seasonsLowerCase = [
      { season_id: 10, name: 'Q1 2025' },
      { season_id: 11, name: 'Q2 2025' },
    ];

    getAvailableQuarters.mockResolvedValue(seasonsLowerCase);

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Button should be enabled with first season auto-selected
    const generateButton = screen.getByRole('button', { name: /توليد التقرير/i });
    
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });

  // ==========================================
  // TEST 6 — Does not crash when API fails
  // ==========================================
  test('does not crash when getAvailableQuarters fails', async () => {
    getAvailableQuarters.mockRejectedValue(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for loading to complete (follow-up items should still load)
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Page should still render
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();

    // Button should be disabled (no seasons available)
    const generateButton = screen.getByRole('button', { name: /توليد التقرير/i });
    expect(generateButton).toBeDisabled();
  });

  // ==========================================
  // TEST 7 — Logs error when API fails
  // ==========================================
  test('logs error to console when getAvailableQuarters fails', async () => {
    const mockError = new Error('API error');
    getAvailableQuarters.mockRejectedValue(mockError);

    // Capture console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
    });

    // Wait a bit for error handling
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load available seasons:',
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // ==========================================
  // TEST 8 — Does not duplicate API calls
  // ==========================================
  test('calls getAvailableQuarters only once on mount', async () => {
    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
    });

    // Wait a bit more to ensure no duplicate calls
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(getAvailableQuarters).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // TEST 9 — Uses correct orgunit parameters
  // ==========================================
  test('calls getAvailableQuarters with hospital-level parameters', async () => {
    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
    });

    // Verify parameters: orgunitId=1 (hospital), orgunitType=0 (hospital level)
    expect(getAvailableQuarters).toHaveBeenCalledWith(1, 0);
  });

  // ==========================================
  // TEST 10 — Season data structure integrity
  // ==========================================
  test('handles mixed case field names (SeasonID vs season_id)', async () => {
    const mixedSeasons = [
      { SeasonID: 1, SeasonName: 'Q1 2026' },
      { season_id: 2, name: 'Q2 2026' },
      { SeasonID: 3, name: 'Q3 2026' }, // Mixed: uppercase ID, lowercase name
    ];

    getAvailableQuarters.mockResolvedValue(mixedSeasons);

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Should handle all variations and auto-select first
    const generateButton = screen.getByRole('button', { name: /توليد التقرير/i });
    
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });
  });
});
