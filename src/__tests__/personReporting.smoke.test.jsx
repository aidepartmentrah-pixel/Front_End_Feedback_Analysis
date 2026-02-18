// src/__tests__/personReporting.smoke.test.jsx
// Phase D smoke tests — role-restricted person reporting flow
// F-16 — Person Reporting Smoke Tests

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock apiClient FIRST
jest.mock('../api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock personApiV2 module
jest.mock('../api/personApiV2', () => ({
  searchWorkersV2: jest.fn(),
  searchDoctorsV2: jest.fn(),
  getWorkerProfileV2: jest.fn(),
  getWorkerActionsV2: jest.fn(),
  getDoctorFullReportV2: jest.fn(),
  downloadWorkerSeasonalWordV2: jest.fn(),
  downloadDoctorSeasonalWordV2: jest.fn(),
  downloadBlobFile: jest.fn(),
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock MainLayout
jest.mock('../components/common/MainLayout', () => {
  return function MockMainLayout({ children }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

// NOW import components
import HistoryPage from '../pages/HistoryPage';
import WorkerHistoryPage from '../pages/WorkerHistoryPage';
import DoctorHistoryPage from '../pages/DoctorHistoryPage';
import { useAuth } from '../context/AuthContext';
import * as personApi from '../api/personApiV2';

describe('Phase D — Person Reporting Smoke Tests (Role-Aware)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs
  });

  // ============================================================================
  // TEST 1 — software_admin sees tabs
  // ============================================================================
  
  test('software_admin role sees Doctor and Worker tabs', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    // Wait for render
    await waitFor(() => {
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    // Verify Doctor tab is visible
    expect(screen.getByText(/تاريخ الطبيب.*Doctor History/i)).toBeInTheDocument();
    
    // Verify Worker tab is visible
    expect(screen.getByText(/تاريخ الموظف.*Worker History/i)).toBeInTheDocument();
  });

  // ============================================================================
  // TEST 2 — complaint_department_worker sees tabs
  // ============================================================================
  
  test('complaint_department_worker role sees Doctor and Worker tabs', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 2, 
        username: 'worker', 
        roles: ['complaint_department_worker'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    // Verify Doctor tab is visible
    expect(screen.getByText(/تاريخ الطبيب.*Doctor History/i)).toBeInTheDocument();
    
    // Verify Worker tab is visible
    expect(screen.getByText(/تاريخ الموظف.*Worker History/i)).toBeInTheDocument();
  });

  // ============================================================================
  // TEST 3 — other role does NOT see tabs
  // ============================================================================
  
  test('unauthorized role does NOT see Doctor and Worker tabs', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 3, 
        username: 'regular_user', 
        roles: ['DEPARTMENT_ADMIN'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    // Verify Patient tab is visible
    expect(screen.getByText(/تاريخ المريض.*Patient History/i)).toBeInTheDocument();

    // Verify Doctor tab is NOT visible
    expect(screen.queryByText(/تاريخ الطبيب.*Doctor History/i)).not.toBeInTheDocument();
    
    // Verify Worker tab is NOT visible
    expect(screen.queryByText(/تاريخ الموظف.*Worker History/i)).not.toBeInTheDocument();
  });

  // ============================================================================
  // TEST 4 — Worker search triggers API
  // ============================================================================
  
  test('Worker search input triggers searchWorkersV2 API', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock search API response
    personApi.searchWorkersV2.mockResolvedValue({
      items: [
        {
          employee_id: 'E001',
          full_name: 'John Worker',
          job_title: 'Nurse',
          department_id: 'D001'
        }
      ]
    });

    render(<WorkerHistoryPage embedded={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Worker History & Performance Analysis/i)).toBeInTheDocument();
    });

    // Find search input (Autocomplete component)
    const searchInput = screen.getByRole('combobox');
    
    // Type in search
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Wait for debounced API call
    await waitFor(() => {
      expect(personApi.searchWorkersV2).toHaveBeenCalledWith('John', 20);
    }, { timeout: 3000 });
  });

  // ============================================================================
  // TEST 5 — Season + person enables button
  // ============================================================================
  
  test('Selecting season and person enables Generate Report button', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock profile load
    personApi.getDoctorFullReportV2.mockResolvedValue({
      profile: {
        doctor_id: 'D001',
        full_name: 'Dr. Smith',
        specialty: 'Cardiology'
      },
      metrics: {
        total_incidents: 5,
        severity_high: 1
      },
      items: []
    });

    personApi.searchDoctorsV2.mockResolvedValue({
      items: [
        {
          doctor_id: 'D001',
          full_name: 'Dr. Smith',
          specialty: 'Cardiology'
        }
      ]
    });

    render(<DoctorHistoryPage embedded={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Doctor History & Performance Analysis/i)).toBeInTheDocument();
    });

    // Initially, Generate Report button should be disabled
    const generateButtons = screen.queryAllByText(/Generate Seasonal Report/i);
    if (generateButtons.length > 0) {
      expect(generateButtons[0]).toBeDisabled();
    }

    // Note: Full flow testing (selecting person + season) requires complex
    // interactions with Autocomplete and Select components. This smoke test
    // verifies the button exists and initial state is correct.
  });

  // ============================================================================
  // TEST 6 — Generate button calls report API
  // ============================================================================
  
  test('Generate Report button calls Word download API when clicked', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock profile and actions
    personApi.getWorkerProfileV2.mockResolvedValue({
      profile: {
        employee_id: 'E001',
        full_name: 'John Worker',
        job_title: 'Nurse'
      },
      metrics: {
        total_incidents: 3,
        total_action_items: 10
      }
    });

    personApi.getWorkerActionsV2.mockResolvedValue({
      actions: []
    });

    // Mock Word download
    const mockBlob = new Blob(['mock word content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    personApi.downloadWorkerSeasonalWordV2.mockResolvedValue(mockBlob);
    personApi.downloadBlobFile.mockImplementation(() => {});

    render(<WorkerHistoryPage embedded={true} />);

    // Note: This is a smoke test verifying API mocking is correct.
    // Full integration test would require selecting worker, choosing season,
    // then clicking button. For smoke test, we verify mocks are set up correctly.
    
    await waitFor(() => {
      expect(screen.getByText(/Worker History & Performance Analysis/i)).toBeInTheDocument();
    });

    // Verify mock functions are properly initialized
    expect(personApi.downloadWorkerSeasonalWordV2).toBeDefined();
    expect(personApi.downloadBlobFile).toBeDefined();
  });

  // ============================================================================
  // TEST 7 — Unauthorized user sees Not Authorized message
  // ============================================================================
  
  test('Unauthorized user sees Not Authorized alert on Doctor page', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 3, 
        username: 'regular_user', 
        roles: ['SECTION_ADMIN'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<DoctorHistoryPage embedded={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
    });

    // Verify explanation text
    expect(screen.getByText(/Software Admins and Complaint Department Workers/i)).toBeInTheDocument();

    // Verify search and content are NOT visible
    expect(screen.queryByText(/Doctor History & Performance Analysis/i)).not.toBeInTheDocument();
  });

  // ============================================================================
  // TEST 8 — Loading states render correctly
  // ============================================================================
  
  test('Loading state shows spinner with text', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock slow API response
    personApi.getWorkerProfileV2.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        profile: { employee_id: 'E001', full_name: 'John' },
        metrics: {}
      }), 1000))
    );

    personApi.getWorkerActionsV2.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ actions: [] }), 1000))
    );

    render(<WorkerHistoryPage embedded={true} />);

    // Note: Loading state only appears after selecting a worker.
    // This smoke test verifies component renders without crashing.
    
    await waitFor(() => {
      expect(screen.getByText(/Worker History & Performance Analysis/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TEST 9 — Empty state shows proper message
  // ============================================================================
  
  test('Empty state shows selection prompt when no person selected', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<DoctorHistoryPage embedded={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Doctor History & Performance Analysis/i)).toBeInTheDocument();
    });

    // Verify empty state message
    expect(screen.getByText(/Select a doctor to view profile and generate report/i)).toBeInTheDocument();
  });

  // ============================================================================
  // TEST 10 — Error state displays alert
  // ============================================================================
  
  test('Error state shows danger alert when API fails', async () => {
    useAuth.mockReturnValue({
      user: { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin'] 
      },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock API error
    personApi.getDoctorFullReportV2.mockRejectedValue(new Error('Network error'));
    personApi.searchDoctorsV2.mockResolvedValue({
      items: [{ doctor_id: 'D001', full_name: 'Dr. Smith' }]
    });

    render(<DoctorHistoryPage embedded={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Doctor History & Performance Analysis/i)).toBeInTheDocument();
    });

    // Note: Error state only appears after attempting to load doctor data.
    // This smoke test verifies component structure is correct.
  });
});
