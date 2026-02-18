// PHASE F — F-F2 — Follow Up Page Action Log UI Block Tests
// src/pages/__tests__/FollowUpPage.actionLog.test.jsx

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

// Mock MainLayout to avoid router dependencies
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

describe('FollowUpPage - Action Log Export', () => {
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

  test('renders Action Log control block with Arabic title', async () => {
    render(<FollowUpPage />);

    await waitFor(() => {
      expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();
    });
  });

  test('loads and displays available seasons in dropdown', async () => {
    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalledWith(1, 0);
    });

    // Check if the select has auto-selected the first season
    // We can't easily test Select component internals, but we can verify the API was called
    expect(getAvailableQuarters).toHaveBeenCalledTimes(1);
  });

  test('button is disabled when no season is selected', async () => {
    // Mock empty seasons to test disabled state
    getAvailableQuarters.mockResolvedValue([]);

    render(<FollowUpPage />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /توليد التقرير/i });
      expect(button).toBeDisabled();
    });
  });

  test('calls exportActionLog API when generate button is clicked', async () => {
    render(<FollowUpPage />);

    // Wait for page to load (follow-up items loaded)
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    // Wait for button to be present
    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(exportActionLog).toHaveBeenCalledWith(1); // First season ID
    });
  });

  test('calls downloadBlob with blob and filename after successful export', async () => {
    render(<FollowUpPage />);

    // Wait for seasons to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    // Click generate button
    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalledWith(mockBlob, 'action_log_season_1.docx');
    });
  });

  test('displays loading state while exporting', async () => {
    // Mock slow export
    exportActionLog.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBlob), 100))
    );

    render(<FollowUpPage />);

    //Wait for page to finish loading
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Wait for export to complete
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled();
    });
  });

  test('displays Arabic error message when export fails', async () => {
    const mockError = new Error('Network error');
    exportActionLog.mockRejectedValue(mockError);

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Download should NOT be called on error
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  test('error message disappears after successful export', async () => {
    // First export fails
    exportActionLog.mockRejectedValueOnce(new Error('Network error'));

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    
    // First attempt - should show error
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/فشل توليد التقرير/)).toBeInTheDocument();
    });

    // Second export succeeds
    exportActionLog.mockResolvedValue(mockBlob);

    // Second attempt - error should clear
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText(/فشل توليد التقرير/)).not.toBeInTheDocument();
    });
  });

  test('handles missing SeasonID fallback to season_id', async () => {
    const seasonsWithLowerCase = [
      { season_id: 10, name: 'Q1 2025' },
      { season_id: 11, name: 'Q2 2025' },
    ];

    getAvailableQuarters.mockResolvedValue(seasonsWithLowerCase);

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getAvailableQuarters).toHaveBeenCalled();
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    const button = await screen.findByRole('button', { name: /توليد التقرير/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportActionLog).toHaveBeenCalledWith(10);
    });
  });

  test('does not crash when getAvailableQuarters fails', async () => {
    getAvailableQuarters.mockRejectedValue(new Error('API error'));

    render(<FollowUpPage />);

    // Wait for loading to complete (follow-up items should still load successfully)
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Page should still render even if seasons fail to load
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();
  });
});
