// src/utils/roleGuards.phaseK.test.js
/**
 * PHASE K — ROLE GUARD VERIFICATION TESTS
 * 
 * Tests verify:
 * 1. canAccessMigration function exists and works correctly
 * 2. Only authorized roles (SOFTWARE_ADMIN, WORKER, COMPLAINT_SUPERVISOR) can access migration
 * 3. Function handles edge cases (null user, missing roles, etc.)
 */

import { canAccessMigration } from './roleGuards';

describe('roleGuards - canAccessMigration', () => {
  // ============================================================================
  // AUTHORIZED ROLES TESTS
  // ============================================================================
  
  describe('Authorized Roles', () => {
    const authorizedRoles = [
      'SOFTWARE_ADMIN',
      'WORKER',
      'COMPLAINT_SUPERVISOR'
    ];

    test.each(authorizedRoles)(
      'should allow access for role: %s',
      (role) => {
        const user = { roles: [role] };
        expect(canAccessMigration(user)).toBe(true);
      }
    );

    test('should allow access if user has multiple roles including authorized one', () => {
      const user = { roles: ['VIEWER', 'WORKER', 'GUEST'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('should allow access for SOFTWARE_ADMIN with other roles', () => {
      const user = { roles: ['SOFTWARE_ADMIN', 'DEPARTMENT_ADMIN'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('should allow access for WORKER with other roles', () => {
      const user = { roles: ['WORKER', 'SECTION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('should allow access for COMPLAINT_SUPERVISOR with other roles', () => {
      const user = { roles: ['COMPLAINT_SUPERVISOR', 'VIEWER'] };
      expect(canAccessMigration(user)).toBe(true);
    });
  });

  // ============================================================================
  // UNAUTHORIZED ROLES TESTS
  // ============================================================================
  
  describe('Unauthorized Roles', () => {
    test('should deny access for VIEWER role', () => {
      const user = { roles: ['VIEWER'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for GUEST role', () => {
      const user = { roles: ['GUEST'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for SECTION_ADMIN role', () => {
      const user = { roles: ['SECTION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for DEPARTMENT_ADMIN role', () => {
      const user = { roles: ['DEPARTMENT_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for ADMINISTRATION_ADMIN role', () => {
      const user = { roles: ['ADMINISTRATION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for unknown role', () => {
      const user = { roles: ['UNKNOWN_ROLE'] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access if user has only unauthorized roles', () => {
      const user = { roles: ['VIEWER', 'GUEST', 'SECTION_ADMIN'] };
      expect(canAccessMigration(user)).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('should deny access for null user', () => {
      expect(canAccessMigration(null)).toBe(false);
    });

    test('should deny access for undefined user', () => {
      expect(canAccessMigration(undefined)).toBe(false);
    });

    test('should deny access for user without roles property', () => {
      const user = { name: 'Test User' };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for user with null roles', () => {
      const user = { roles: null };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for user with undefined roles', () => {
      const user = { roles: undefined };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for user with empty roles array', () => {
      const user = { roles: [] };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should deny access for empty object', () => {
      expect(canAccessMigration({})).toBe(false);
    });
  });

  // ============================================================================
  // CASE SENSITIVITY TESTS
  // ============================================================================
  
  describe('Case Sensitivity', () => {
    test('should be case-sensitive for role names', () => {
      const user = { roles: ['software_admin'] }; // lowercase
      expect(canAccessMigration(user)).toBe(false); // Should fail, expects SOFTWARE_ADMIN
    });

    test('should be case-sensitive for WORKER role', () => {
      const user = { roles: ['worker'] }; // lowercase
      expect(canAccessMigration(user)).toBe(false);
    });

    test('should be case-sensitive for COMPLAINT_SUPERVISOR role', () => {
      const user = { roles: ['complaint_supervisor'] }; // lowercase
      expect(canAccessMigration(user)).toBe(false);
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS
  // ============================================================================
  
  describe('Real-World Scenarios', () => {
    test('SOFTWARE_ADMIN user should access migration', () => {
      const user = {
        username: 'admin',
        display_name: 'Admin User',
        roles: ['SOFTWARE_ADMIN']
      };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('WORKER user should access migration', () => {
      const user = {
        username: 'worker1',
        display_name: 'Worker User',
        roles: ['WORKER']
      };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('COMPLAINT_SUPERVISOR user should access migration', () => {
      const user = {
        username: 'supervisor1',
        display_name: 'Supervisor User',
        roles: ['COMPLAINT_SUPERVISOR']
      };
      expect(canAccessMigration(user)).toBe(true);
    });

    test('Regular user without allowed roles should be denied', () => {
      const user = {
        username: 'user1',
        display_name: 'Regular User',
        roles: ['VIEWER']
      };
      expect(canAccessMigration(user)).toBe(false);
    });

    test('User with mixed roles should be granted access if one role is allowed', () => {
      const user = {
        username: 'mixeduser',
        display_name: 'Mixed Role User',
        roles: ['VIEWER', 'GUEST', 'WORKER', 'SECTION_ADMIN']
      };
      expect(canAccessMigration(user)).toBe(true); // Has WORKER
    });
  });
});
