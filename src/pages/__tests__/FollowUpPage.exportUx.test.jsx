// PHASE F — F-F6 — Follow Up Page Export UX Tests
// src/pages/__tests__/FollowUpPage.exportUx.test.jsx

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
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

describe('FollowUpPage - Export UX (F-F6)', () => {
  const mockSeasons = [
    { SeasonID: 1, SeasonName: 'Q1 2026' },
    { SeasonID: 2, SeasonName: 'Q2 2026' },
  ];

  const mockBlob = new Blob(['fake docx content'], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    console.error = jest.fn();

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

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================
  // TEST 1 — Loading indicator shown
  // ==========================================
  test('shows loading indicator while exporting', async () => {
    // Mock slow export
    exportActionLog.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBlob), 500))
    );

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // Click button
    fireEvent.click(button);

    // Button should be disabled during loading (MUI Joy Button behavior)
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  // ==========================================
  // TEST 2 — Button disabled during loading
  // ==========================================
  test('disables button during loading to prevent double clicks', async () => {
    // Mock slow export
    exportActionLog.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBlob), 300))
    );

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // Initially enabled
    expect(button).not.toBeDisabled();

    // Click button
    fireEvent.click(button);

    // Should be disabled during loading
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Wait for export to complete
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // Should be enabled again
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // ==========================================
  // TEST 3 — Error alert appears on failure
  // ==========================================
  test('displays Arabic error alert when export fails', async () => {
    const mockError = new Error('Network error');
    exportActionLog.mockRejectedValue(mockError);

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Error alert should appear
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // downloadBlob should NOT be called
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  // ==========================================
  // TEST 4 — Success alert appears
  // ==========================================
  test('displays Arabic success alert after successful export', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Wait for export to complete
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // Success alert should appear
    await waitFor(() => {
      expect(screen.getByText(/تم تنزيل التقرير بنجاح/)).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST 5 — Success auto clears after 2.5s
  // ==========================================
  test('success alert auto-clears after 2.5 seconds', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Wait for export and success message
    await waitFor(() => {
      expect(screen.getByText(/تم تنزيل التقرير بنجاح/)).toBeInTheDocument();
    });

    // Fast-forward time by 2.5 seconds
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    // Success message should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/تم تنزيل التقرير بنجاح/)).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST 6 — Error clears on new attempt
  // ==========================================
  test('clears previous error when starting new export', async () => {
    // First attempt fails
    exportActionLog.mockRejectedValueOnce(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // First attempt
    fireEvent.click(button);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Second attempt succeeds
    exportActionLog.mockResolvedValue(mockBlob);
    fireEvent.click(button);

    // Error should be cleared immediately on new attempt
    await waitFor(() => {
      expect(screen.queryByText(/فشل توليد التقرير/)).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST 7 — Success clears on new attempt
  // ==========================================
  test('clears previous success when starting new export', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // First attempt
    fireEvent.click(button);

    // Success should appear
    await waitFor(() => {
      expect(screen.getByText(/تم تنزيل التقرير بنجاح/)).toBeInTheDocument();
    });

    // Second attempt
    fireEvent.click(button);

    // Success should be cleared immediately
    await waitFor(() => {
      expect(screen.queryByText(/تم تنزيل التقرير بنجاح/)).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // TEST 8 — Error and success never overlap
  // ==========================================
  test('does not show error and success alerts simultaneously', async () => {
    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Success should appear
    await waitFor(() => {
      expect(screen.getByText(/تم تنزيل التقرير بنجاح/)).toBeInTheDocument();
    });

    // Error should NOT be present
    expect(screen.queryByText(/فشل توليد التقرير/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 9 — Button re-enables after error
  // ==========================================
  test('re-enables button after export error', async () => {
    exportActionLog.mockRejectedValue(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // Click button
    fireEvent.click(button);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Button should be enabled again
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // ==========================================
  // TEST 10 — Multiple rapid clicks prevented
  // ==========================================
  test('prevents multiple rapid clicks during export', async () => {
    // Mock slow export
    exportActionLog.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBlob), 500))
    );

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /توليد التقرير/i });

    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Wait for export to complete
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });

    // exportActionLog should only be called once
    expect(exportActionLog).toHaveBeenCalledTimes(1);
  });
});
