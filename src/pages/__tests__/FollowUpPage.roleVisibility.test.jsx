// PHASE F — F-F5 — Follow Up Page Role-Aware Visibility Tests
// src/pages/__tests__/FollowUpPage.roleVisibility.test.jsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
import { useAuth } from '../../context/AuthContext';
import { getAvailableQuarters } from '../../api/seasonalReports';
import { getFollowUpItems } from '../../api/workflowApi';

describe('FollowUpPage - Role-Aware Visibility (F-F5)', () => {
  const mockSeasons = [
    { SeasonID: 1, SeasonName: 'Q1 2026' },
    { SeasonID: 2, SeasonName: 'Q2 2026' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs

    // Mock API responses
    getFollowUpItems.mockResolvedValue([]);
    getAvailableQuarters.mockResolvedValue(mockSeasons);
  });

  // ==========================================
  // TEST 1 — Visible for SOFTWARE_ADMIN
  // ==========================================
  test('shows Action Log control for SOFTWARE_ADMIN role', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SOFTWARE_ADMIN',
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should be visible
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();
  });

  // ==========================================
  // TEST 2 — Visible for WORKER
  // ==========================================
  test('shows Action Log control for WORKER role', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'WORKER',
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should be visible
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();
  });

  // ==========================================
  // TEST 3 — Hidden for SECTION_ADMIN
  // ==========================================
  test('hides Action Log control for SECTION_ADMIN role', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SECTION_ADMIN',
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should NOT be visible
    expect(screen.queryByText(/تقرير سجل الإجراءات/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 4 — Hidden for DEPARTMENT_ADMIN
  // ==========================================
  test('hides Action Log control for DEPARTMENT_ADMIN role', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'DEPARTMENT_ADMIN',
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should NOT be visible
    expect(screen.queryByText(/تقرير سجل الإجراءات/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 5 — Hidden when no roles
  // ==========================================
  test('hides Action Log control when user has no roles', async () => {
    useAuth.mockReturnValue({
      hasRole: () => false, // No roles
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should NOT be visible
    expect(screen.queryByText(/تقرير سجل الإجراءات/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 6 — Visible when user has both roles
  // ==========================================
  test('shows Action Log control when user has both SOFTWARE_ADMIN and WORKER roles', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SOFTWARE_ADMIN' || role === 'WORKER',
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Action Log control should be visible
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();
  });

  // ==========================================
  // TEST 7 — Follow-up table still visible regardless of role
  // ==========================================
  test('shows Follow-Up Actions table regardless of Action Log visibility', async () => {
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SECTION_ADMIN', // Role without Action Log access
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Main Follow-Up Actions should still be visible
    expect(screen.getByText(/Follow-Up Actions/)).toBeInTheDocument();

    // But Action Log control should NOT be visible
    expect(screen.queryByText(/تقرير سجل الإجراءات/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 8 — Generate button only visible with correct role
  // ==========================================
  test('generate button is only accessible with SOFTWARE_ADMIN or WORKER role', async () => {
    // First test: visible for SOFTWARE_ADMIN
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SOFTWARE_ADMIN',
    });

    const { unmount } = render(<FollowUpPage />);

    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Button should exist
    expect(screen.getByRole('button', { name: /توليد التقرير/i })).toBeInTheDocument();

    unmount();

    // Second test: not visible for SECTION_ADMIN
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'SECTION_ADMIN',
    });

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Button should NOT exist
    expect(screen.queryByRole('button', { name: /توليد التقرير/i })).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 9 — Season selector only visible with correct role
  // ==========================================
  test('season selector is only visible with SOFTWARE_ADMIN or WORKER role', async () => {
    // Test with allowed role
    useAuth.mockReturnValue({
      hasRole: (role) => role === 'WORKER',
    });

    const { unmount } = render(<FollowUpPage />);

    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Control block should be visible (includes season selector)
    expect(screen.getByText(/تقرير سجل الإجراءات/)).toBeInTheDocument();

    unmount();

    // Test with disallowed role
    useAuth.mockReturnValue({
      hasRole: () => false,
    });

    render(<FollowUpPage />);

    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Control block should NOT be visible
    expect(screen.queryByText(/تقرير سجل الإجراءات/)).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 10 — Page renders without auth errors
  // ==========================================
  test('page renders successfully when hasRole returns false for all roles', async () => {
    useAuth.mockReturnValue({
      hasRole: () => false,
    });

    render(<FollowUpPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(getFollowUpItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Page should render without errors
    expect(screen.getByText(/Follow-Up Actions/)).toBeInTheDocument();

    // No auth-related errors should appear
    expect(screen.queryByText(/auth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/permission/i)).not.toBeInTheDocument();
  });
});
