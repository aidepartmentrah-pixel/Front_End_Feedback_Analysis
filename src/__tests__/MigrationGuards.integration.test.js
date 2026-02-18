// src/__tests__/MigrationGuards.integration.test.js
/**
 * PHASE K — MIGRATION GUARDS INTEGRATION TESTS
 * 
 * Comprehensive test suite for migration route protection and menu visibility.
 * Tests all allowed/denied role combinations and redirect behavior.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { canAccessMigration } from '../utils/roleGuards';

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Pages
const MockMigrationMainPage = () => <div data-testid="migration-main">Migration Main Page</div>;
const MockMigrationViewPage = () => <div data-testid="migration-view">Migration View Page</div>;
const MockMigrationFormPage = () => <div data-testid="migration-form">Migration Form Page</div>;
const MockUnauthorizedPage = () => <div data-testid="unauthorized-page">Unauthorized</div>;
const MockLoginPage = () => <div data-testid="login-page">Login</div>;

describe('Migration Guards - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // TEST SUITE 1: GUARD FUNCTION - ALLOWED ROLES
  // ============================================================================
  
  describe('Guard Function - Allowed Roles', () => {
    test('SOFTWARE_ADMIN: should have access', () => {
      const user = { roles: ['SOFTWARE_ADMIN'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('WORKER: should have access', () => {
      const user = { roles: ['WORKER'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('COMPLAINT_SUPERVISOR: should have access', () => {
      const user = { roles: ['COMPLAINT_SUPERVISOR'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('User with multiple roles including allowed: should have access', () => {
      const user = { roles: ['VIEWER', 'WORKER', 'GUEST'] };
      expect(canAccessMigration(user)).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 2: GUARD FUNCTION - DENIED ROLES
  // ============================================================================
  
  describe('Guard Function - Denied Roles', () => {
    test('SECTION_ADMIN: should be denied', () => {
      const user = { roles: ['SECTION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('DEPARTMENT_ADMIN: should be denied', () => {
      const user = { roles: ['DEPARTMENT_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('ADMINISTRATION_ADMIN: should be denied', () => {
      const user = { roles: ['ADMINISTRATION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('VIEWER: should be denied', () => {
      const user = { roles: ['VIEWER'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('GUEST: should be denied', () => {
      const user = { roles: ['GUEST'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('Null user: should be denied', () => {
      expect(canAccessMigration(null)).toBe(false);
    });

    test('User without roles: should be denied', () => {
      const user = { username: 'test' };
      expect(canAccessMigration(user)).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 3: ROUTE PROTECTION - SOFTWARE_ADMIN
  // ============================================================================
  
  describe('Route Protection - SOFTWARE_ADMIN', () => {
    const adminUser = {
      username: 'admin',
      display_name: 'Admin User',
      roles: ['SOFTWARE_ADMIN']
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    test('/migration: should render migration main page', () => {
      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument

    test('/migration/view/:id: should render migration view page', () => {
      render(
        <MemoryRou path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Route
              path="/migration/view/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
                  <MockMigrationViewPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-view')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument
      expect(screen.getByTestId('migration-view')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('/migration/migrate/:id: should render migration form page', () => {
      render(
        <MemoryRou path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Route
              path="/migration/migrate/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
                  <MockMigrationFormPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-form')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument
      expect(screen.getByTestId('migration-form')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TEST SUITE 4: ROUTE PROTECTION - WORKER
  // ============================================================================
  
  describe('Route Protection - WORKER', () => {
    const workerUser = {
      username: 'worker1',
      display_name: 'Worker User',
      roles: ['WORKER']
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: workerUser,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    test('/migration: WORKER can access', () => {
      render(
        <MemoryRou path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Routeter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });

    test('/migration/view/:id: WORKER can access', () => {
      render(
        <MemoryRou path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Routeter initialEntries={['/migration/view/456']}>
          <Routes>
            <Route
              path="/migration/view/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
                  <MockMigrationViewPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-view')).toBeInTheDocument();
    });

    test('/migration/migrate/:id: WORKER can access', () => {
      render(
        <MemoryRou path="/unauthorized" element={<MockUnauthorizedPage />} />
            <Route path="/login" element={<MockLoginPage />} />
            <Routeter initialEntries={['/migration/migrate/456']}>
          <Routes>
            <Route
              path="/migration/migrate/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
                  <MockMigrationFormPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-form')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TEST SUITE 5: ROUTE PROTECTION - COMPLAINT_SUPERVISOR
  // ============================================================================
  
  describe('Route Protection - COMPLAINT_SUPERVISOR', () => {
    const supervisorUser = {
      username: 'supervisor1',
      display_name: 'Supervisor User',
      roles: ['COMPLAINT_SUPERVISOR']
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: supervisorUser,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    test('/migration: COMPLAINT_SUPERVISOR can access', () => {
      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });

    test('All three routes accessible to COMPLAINT_SUPERVISOR', () => {
      // Test main page
      const { unmount } = render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      unmount();

      // Test view page
      const { unmount: unmount2 } = render(
        <MemoryRouter initialEntries={['/migration/view/789']}>
          <Routes>
            <Route
              path="/migration/view/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
                  <MockMigrationViewPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId('migration-view')).toBeInTheDocument();
      unmount2();

      // Test form page
      render(
        <MemoryRouter initialEntries={['/migration/migrate/789']}>
          <Routes>
            <Route
              path="/migration/migrate/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
                  <MockMigrationFormPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId('migration-form')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TEST SUITE 6: UNAUTHORIZED ACCESS - BLOCKED ROLES
  // ============================================================================
  
  describe('Unauthorized Access - Direct URL Blocking', () => {
    test('SECTION_ADMIN: redirected to /unauthorized', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['SECTION_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      expect(screen.queryByTestId('migration-main')).not.toBeInTheDocument();
    });

    test('DEPARTMENT_ADMIN: redirected to /unauthorized', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['DEPARTMENT_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    test('VIEWER: blocked from /migration/view/:id', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['VIEWER'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration/view/123']}>
          <Routes>
            <Route
              path="/migration/view/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
                  <MockMigrationViewPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      expect(screen.queryByTestId('migration-view')).not.toBeInTheDocument();
    });

    test('GUEST: blocked from /migration/migrate/:id', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['GUEST'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration/migrate/123']}>
          <Routes>
            <Route
              path="/migration/migrate/:legacyId"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
                  <MockMigrationFormPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      expect(screen.queryByTestId('migration-form')).not.toBeInTheDocument();
    });

    test('Unknown role: blocked from all migration routes', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['UNKNOWN_ROLE'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });
  });

  // ============================================================================
  // TEST SUITE 7: UNAUTHENTICATED ACCESS
  // ============================================================================
  
  describe('Unauthenticated Access', () => {
    test('Not logged in: redirected to /login', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(screen.queryByTestId('migration-main')).not.toBeInTheDocument();
    });

    test('Loading state: shows loading spinner', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TEST SUITE 8: ROLE CHANGE SCENARIOS
  // ============================================================================
  
  describe('Role Change Scenarios', () => {
    test('Role upgrade: VIEWER → WORKER grants access', () => {
      // Initially VIEWER (denied)
      mockUseAuth.mockReturnValue({
        user: { roles: ['VIEWER'] },
        isAuthenticated: true,
        isLoading: false,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
      mockNavigate.mockClear();

      // Role upgraded to WORKER (granted)
      mockUseAuth.mockReturnValue({
        user: { roles: ['WORKER'] },
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });

    test('Multiple roles with one allowed: grants access', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['VIEWER', 'GUEST', 'WORKER', 'SECTION_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalledWith('/unauthorized');
    });
  });

  // ============================================================================
  // TEST SUITE 9: EDGE CASES AND ERROR HANDLING
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('Empty roles array: denied access', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: [] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    test('Null roles: denied access', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: null },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    test('Case sensitivity: lowercase roles denied', () => {
      // Roles are case-sensitive
      const user = { roles: ['software_admin', 'worker', 'complaint_supervisor'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('Uppercase roles only: granted', () => {
      const user = { roles: ['SOFTWARE_ADMIN', 'WORKER', 'COMPLAINT_SUPERVISOR'] };
      expect(canAccessMigration(user)).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 10: PERFORMANCE AND STABILITY
  // ============================================================================
  
  describe('Performance and Stability', () => {
    test('No console errors during authorized access', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      mockUseAuth.mockReturnValue({
        user: { roles: ['SOFTWARE_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    test('Guard function handles many roles efficiently', () => {
      const manyRoles = Array.from({ length: 100 }, (_, i) => `ROLE_${i}`);
      manyRoles.push('WORKER'); // Add allowed role at end
      
      const user = { roles: manyRoles };
      const result = canAccessMigration(user);
      
      expect(result).toBe(true);
    });

    test('Multiple route checks do not cause re-renders', () => {
      mockUseAuth.mockReturnValue({
        user: { roles: ['SOFTWARE_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();

      // Rerender without changing props
      rerender(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MockMigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should remain rendered
      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });
  });
});
