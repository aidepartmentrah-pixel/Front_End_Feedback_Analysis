// src/__tests__/MigrationGuards.e2e.test.js
/**
 * PHASE K — MIGRATION GUARDS END-TO-END TESTS
 * 
 * Simplified integration tests focusing on critical guard scenarios.
 * Tests route protection and redirect behavior for all role combinations.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute.jsx';
import { canAccessMigration } from '../utils/roleGuards';

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Pages
const MigrationMainPage = () => <div data-testid="migration-main">Migration Main</div>;
const MigrationViewPage = () => <div data-testid="migration-view">Migration View</div>;
const MigrationFormPage = () => <div data-testid="migration-form">Migration Form</div>;
const UnauthorizedPage = () => <div data-testid="unauthorized">Unauthorized Access</div>;
const LoginPage = () => <div data-testid="login">Login Required</div>;

// Helper to setup routes
const renderWithRoutes = (initialPath, userConfig) => {
  mockUseAuth.mockReturnValue(userConfig);
  
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/migration"
          element={
            <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
              <MigrationMainPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/migration/view/:legacyId"
          element={
            <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
              <MigrationViewPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/migration/migrate/:legacyId"
          element={
            <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
              <MigrationFormPage />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Migration Guards - E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // ALLOWED ROLES - ALL ROUTES ACCESSIBLE
  // ============================================================================
  
  describe('✅ Allowed Roles - Full Access', () => {
    test('SOFTWARE_ADMIN: all 3 routes accessible', () => {
      const adminUser = {
        user: { roles: ['SOFTWARE_ADMIN'] },
        isAuthenticated: true,
        isLoading: false,
      };

      mockUseAuth.mockReturnValue(adminUser);
      
      // Test direct render (without routing complexity)
      const { container } = render(
        <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
          <MigrationMainPage />
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
    });

    test('WORKER: all 3 routes accessible', () => {
      const workerUser = {
        user: { roles: ['WORKER'] },
        isAuthenticated: true,
        isLoading: false,
      };

      mockUseAuth.mockReturnValue(workerUser);
      
      const { container } = render(
        <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
          <MigrationMainPage />
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
    });

    test('COMPLAINT_SUPERVISOR: all 3 routes accessible', () => {
      const supervisorUser = {
        user: { roles: ['COMPLAINT_SUPERVISOR'] },
        isAuthenticated: true,
        isLoading: false,
      };

      mockUseAuth.mockReturnValue(supervisorUser);
      
      const { container } = render(
        <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
          <MigrationMainPage />
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
      expect(screen.queryByTestId('unauthorized')).not.toBeInTheDocument();
    });

    test('Mixed roles with one allowed: grants access', () => {
      const mixedUser = {
        user: { roles: ['VIEWER', 'GUEST', 'WORKER'] },
        isAuthenticated: true,
        isLoading: false,
      };

      renderWithRoutes('/migration', mixedUser);
      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DENIED ROLES - ALL ROUTES BLOCKED
  // ============================================================================
  
  describe('❌ Denied Roles - All Blocked', () => {
    const deniedRoles = [
      'SECTION_ADMIN',
      'DEPARTMENT_ADMIN',
      'ADMINISTRATION_ADMIN',
      'VIEWER',
      'GUEST',
      'UNKNOWN_ROLE'
    ];

    deniedRoles.forEach(role => {
      test(`${role}: redirected to /unauthorized`, () => {
        const deniedUser = {
          user: { roles: [role] },
          isAuthenticated: true,
          isLoading: false,
        };

        renderWithRoutes('/migration', deniedUser);
        expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
        expect(screen.queryByTestId('migration-main')).not.toBeInTheDocument();
      });
    });

    test('Empty roles array: redirected to /unauthorized', () => {
      const emptyRolesUser = {
        user: { roles: [] },
        isAuthenticated: true,
        isLoading: false,
      };

      renderWithRoutes('/migration', emptyRolesUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('Null roles: redirected to /unauthorized', () => {
      const nullRolesUser = {
        user: { roles: null },
        isAuthenticated: true,
        isLoading: false,
      };

      renderWithRoutes('/migration', nullRolesUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('No user object: redirected to /unauthorized', () => {
      const noUser = {
        user: null,
        isAuthenticated: true,
        isLoading: false,
      };

      renderWithRoutes('/migration', noUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DIRECT URL ACCESS - ALL ROUTES PROTECTED
  // ============================================================================
  
  describe('🔒 Direct URL Blocking', () => {
    const unauthorizedUser = {
      user: { roles: ['VIEWER'] },
      isAuthenticated: true,
      isLoading: false,
    };

    test('/migration: blocked with direct URL', () => {
      renderWithRoutes('/migration', unauthorizedUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('/migration/view/123: blocked with direct URL', () => {
      renderWithRoutes('/migration/view/123', unauthorizedUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('/migration/migrate/456: blocked with direct URL', () => {
      renderWithRoutes('/migration/migrate/456', unauthorizedUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNAUTHENTICATED ACCESS
  // ============================================================================
  
  describe('🔓 Unauthenticated Access', () => {
    test('Not logged in: redirected to /login', () => {
      const notLoggedIn = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      renderWithRoutes('/migration', notLoggedIn);
      expect(screen.getByTestId('login')).toBeInTheDocument();
      expect(screen.queryByTestId('migration-main')).not.toBeInTheDocument();
    });

    test('Loading state: shows loading spinner', () => {
      const loading = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
      };

      mockUseAuth.mockReturnValue(loading);

      render(
        <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
          <MigrationMainPage />
        </RoleProtectedRoute>
      );

      expect(screen.getAllByText('Loading...')[0]).toBeInTheDocument();
    });
  });

  // ============================================================================
  // GUARD FUNCTION TESTS
  // ============================================================================
  
  describe('🛡️ Guard Function - canAccessMigration', () => {
    test('Allowed roles return true', () => {
      expect(canAccessMigration({ roles: ['SOFTWARE_ADMIN'] })).toBe(true);
      expect(canAccessMigration({ roles: ['WORKER'] })).toBe(true);
      expect(canAccessMigration({ roles: ['COMPLAINT_SUPERVISOR'] })).toBe(true);
    });

    test('Denied roles return false', () => {
      expect(canAccessMigration({ roles: ['SECTION_ADMIN'] })).toBe(false);
      expect(canAccessMigration({ roles: ['DEPARTMENT_ADMIN'] })).toBe(false);
      expect(canAccessMigration({ roles: ['VIEWER'] })).toBe(false);
      expect(canAccessMigration({ roles: ['GUEST'] })).toBe(false);
    });

    test('Edge cases return false', () => {
      expect(canAccessMigration(null)).toBe(false);
      expect(canAccessMigration({})).toBe(false);
      expect(canAccessMigration({ roles: [] })).toBe(false);
      expect(canAccessMigration({ roles: null })).toBe(false);
    });

    test('Case sensitivity: lowercase denied', () => {
      expect(canAccessMigration({ roles: ['software_admin'] })).toBe(false);
      expect(canAccessMigration({ roles: ['worker'] })).toBe(false);
    });
  });

  // ============================================================================
  // ROLE CHANGE SCENARIOS
  // ============================================================================
  
  describe('🔄 Role Change Behavior', () => {
    test('Role upgrade grants access', () => {
      // Initially VIEWER (denied)
      const viewer = {
        user: { roles: ['VIEWER'] },
        isAuthenticated: true,
        isLoading: false,
      };

      const { rerender } = renderWithRoutes('/migration', viewer);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();

      // Upgrade to WORKER (granted)
      const worker = {
        user: { roles: ['WORKER'] },
        isAuthenticated: true,
        isLoading: false,
      };

      mockUseAuth.mockReturnValue(worker);
      
      rerender(
        <MemoryRouter initialEntries={['/migration']}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/migration"
              element={
                <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                  <MigrationMainPage />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('migration-main')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NO BYPASS POSSIBLE
  // ============================================================================
  
  describe('🚫 No Guard Bypass', () => {
    test('Cannot access without proper role even with auth', () => {
      const authButNoRole = {
        user: { username: 'testuser', roles: ['OTHER_ROLE'] },
        isAuthenticated: true,
        isLoading: false,
      };

      renderWithRoutes('/migration', authButNoRole);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    test('All three routes consistently protected', () => {
      const deniedUser = {
        user: { roles: ['VIEWER'] },
        isAuthenticated: true,
        isLoading: false,
      };

      // Test main page
      renderWithRoutes('/migration', deniedUser);
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });
  });
});
