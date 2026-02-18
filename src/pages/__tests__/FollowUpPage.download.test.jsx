// PHASE F — F-F4 — Follow Up Page Download Handler Wiring Tests
// src/pages/__tests__/FollowUpPage.download.test.jsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

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
import { exportActionLog } from '../../api/actionLogApi';
import { downloadBlob } from '../../api/reports';
import { getAvailableQuarters } from '../../api/seasonalReports';
import { getFollowUpItems } from '../../api/workflowApi';
import { useAuth } from '../../context/AuthContext';

describe('FollowUpPage - Download Handler Wiring (F-F4)', () => {
  const mockSeasons = [
    { SeasonID: 1, SeasonName: 'Q1 2026' },
    { SeasonID: 2, SeasonName: 'Q2 2026' },
    { SeasonID: 3, SeasonName: 'Q3 2026' },
  ];

  const mockBlob = new Blob(['fake docx content'], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs

    // Mock API responses
    getFollowUpItems.mockResolvedValue([]);
    getAvailableQuarters.mockResolvedValue(mockSeasons);
    exportActionLog.mockResolvedValue(mockBlob);
    downloadBlob.mockImplementation(() => {});
    
    // Mock auth with role that can see Action Log
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SOFTWARE_ADMIN' || role === 'WORKER',
    });
  });

  // ==========================================
  // TEST 1 — Calls export API with season ID
  // ==========================================
  test('calls exportActionLog API with selected season ID', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    // Wait for button to be enabled
    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    // Click button
    fireEvent.click(button);

    // Verify exportActionLog called with correct season ID
    await waitFor(() => {
      expect(exportActionLog).toHaveBeenCalledTimes(1);
      expect(exportActionLog).toHaveBeenCalledWith(1); // First season ID
    });
  });

  // ==========================================
  // TEST 2 — Calls downloadBlob helper
  // ==========================================
  test('calls downloadBlob with blob and filename', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    // Click generate button
    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Verify downloadBlob called with blob and filename
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalledTimes(1);
      expect(downloadBlob).toHaveBeenCalledWith(
        mockBlob,
        'action_log_season_1.docx'
      );
    });
  });

  // ==========================================
  // TEST 3 — Filename format is correct
  // ==========================================
  test('generates correct filename format with season ID', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // Verify filename structure
    const callArgs = downloadBlob.mock.calls[0];
    const filename = callArgs[1];

    expect(filename).toContain('action_log_season_');
    expect(filename).toContain('.docx');
    expect(filename).toMatch(/^action_log_season_\d+\.docx$/);
  });

  // ==========================================
  // TEST 4 — Button disabled during loading
  // ==========================================
  test('disables button during export loading', async () => {
    // Mock slow export
    exportActionLog.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBlob), 200))
    );

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    
    // Button should be enabled initially
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    // Click button
    fireEvent.click(button);

    // Button should be disabled immediately during loading
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Wait for export to complete
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // Button should be enabled again after completion
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // ==========================================
  // TEST 5 — Error message shown on failure
  // ==========================================
  test('displays Arabic error message when export fails', async () => {
    const mockError = new Error('Network error');
    exportActionLog.mockRejectedValue(mockError);

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // downloadBlob should NOT be called when export fails
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  // ==========================================
  // TEST 6 — Uses downloadBlob helper (not manual URL creation)
  // ==========================================
  test('uses downloadBlob helper instead of manual URL creation', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // Verify downloadBlob is called (this confirms we're using the helper, not manual URL creation)
    expect(downloadBlob).toHaveBeenCalledTimes(1);
    expect(downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('action_log_season_')
    );
  });

  // ==========================================
  // TEST 7 — Clears error on successful retry
  // ==========================================
  test('clears previous error on successful export', async () => {
    // First attempt fails
    exportActionLog.mockRejectedValueOnce(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    
    // First attempt
    fireEvent.click(button);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Second attempt succeeds
    exportActionLog.mockResolvedValue(mockBlob);
    fireEvent.click(button);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/فشل توليد التقرير/)).not.toBeInTheDocument();
    });

    // Download should succeed
    expect(downloadBlob).toHaveBeenCalled();
  });

  // ==========================================
  // TEST 8 — Logs error to console
  // ==========================================
  test('logs error to console when export fails', async () => {
    const mockError = new Error('API error');
    exportActionLog.mockRejectedValue(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Should log error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Action log export failed:',
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // ==========================================
  // TEST 9 — Works with different season IDs
  // ==========================================
  test('generates correct filename for different season IDs', async () => {
    const seasonsWithDifferentIds = [
      { SeasonID: 42, SeasonName: 'Q3 2025' },
    ];

    getAvailableQuarters.mockResolvedValue(seasonsWithDifferentIds);

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Verify correct season ID used in export and filename
    await waitFor(() => {
      expect(exportActionLog).toHaveBeenCalledWith(42);
      expect(downloadBlob).toHaveBeenCalledWith(
        mockBlob,
        'action_log_season_42.docx'
      );
    });
  });

  // ==========================================
  // TEST 10 — Button re-enables after error
  // ==========================================
  test('re-enables button after export error', async () => {
    exportActionLog.mockRejectedValue(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    
    // Click button
    fireEvent.click(button);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Button should be enabled again (not stuck in loading state)
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
