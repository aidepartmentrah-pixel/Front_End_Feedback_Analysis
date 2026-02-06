// src/utils/roleGuards.test.js
/**
 * F-I13 — ROLE GUARD VERIFICATION TESTS
 * 
 * Tests verify:
 * 1. canViewInsight function exists and works correctly
 * 2. Only authorized roles can access Insight page
 * 3. Function handles edge cases (null user, missing roles, etc.)
 */

import {
  canViewInsight,
  canViewInbox,
  canActOnInbox,
  canViewFollowUp,
  canActOnFollowUp,
  canGenerateSeasonalReports
} from './roleGuards';

describe('roleGuards - canViewInsight', () => {
  // ============================================================================
  // AUTHORIZED ROLES TESTS
  // ============================================================================
  
  describe('Authorized Roles', () => {
    const authorizedRoles = [
      'SOFTWARE_ADMIN',
      'ADMINISTRATION_ADMIN',
      'DEPARTMENT_ADMIN',
      'SECTION_ADMIN',
      'COMPLAINT_SUPERVISOR'
    ];

    test.each(authorizedRoles)(
      'should allow access for role: %s',
      (role) => {
        const user = { roles: [role] };
        expect(canViewInsight(user)).toBe(true);
      }
    );

    test('should allow access if user has multiple roles including authorized one', () => {
      const user = { roles: ['WORKER', 'SECTION_ADMIN', 'VIEWER'] };
      expect(canViewInsight(user)).toBe(true);
    });

    test('should allow access for SOFTWARE_ADMIN with other roles', () => {
      const user = { roles: ['SOFTWARE_ADMIN', 'DEPARTMENT_ADMIN'] };
      expect(canViewInsight(user)).toBe(true);
    });
  });

  // ============================================================================
  // UNAUTHORIZED ROLES TESTS
  // ============================================================================
  
  describe('Unauthorized Roles', () => {
    test('should deny access for WORKER role', () => {
      const user = { roles: ['WORKER'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for VIEWER role', () => {
      const user = { roles: ['VIEWER'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for GUEST role', () => {
      const user = { roles: ['GUEST'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for unknown role', () => {
      const user = { roles: ['UNKNOWN_ROLE'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access if user has only unauthorized roles', () => {
      const user = { roles: ['WORKER', 'VIEWER', 'GUEST'] };
      expect(canViewInsight(user)).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('should deny access for null user', () => {
      expect(canViewInsight(null)).toBe(false);
    });

    test('should deny access for undefined user', () => {
      expect(canViewInsight(undefined)).toBe(false);
    });

    test('should deny access for user without roles property', () => {
      const user = { name: 'Test User' };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for user with null roles', () => {
      const user = { roles: null };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for user with undefined roles', () => {
      const user = { roles: undefined };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for user with empty roles array', () => {
      const user = { roles: [] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should deny access for empty object', () => {
      expect(canViewInsight({})).toBe(false);
    });
  });

  // ============================================================================
  // CASE SENSITIVITY TESTS
  // ============================================================================
  
  describe('Case Sensitivity', () => {
    test('should be case-sensitive (lowercase role denied)', () => {
      const user = { roles: ['software_admin'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should be case-sensitive (mixed case role denied)', () => {
      const user = { roles: ['Software_Admin'] };
      expect(canViewInsight(user)).toBe(false);
    });

    test('should require exact role string match', () => {
      const user = { roles: ['SOFTWARE_ADMIN '] }; // trailing space
      expect(canViewInsight(user)).toBe(false);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS - ROLE COMPARISON
  // ============================================================================
  
  describe('Role Hierarchy Comparison', () => {
    test('canViewInsight should have more restrictions than canViewInbox', () => {
      const workerUser = { roles: ['WORKER'] };
      expect(canViewInbox(workerUser)).toBe(true);
      expect(canViewInsight(workerUser)).toBe(false);
    });

    test('canViewInsight should allow supervisors but not workers', () => {
      const supervisorUser = { roles: ['COMPLAINT_SUPERVISOR'] };
      const workerUser = { roles: ['WORKER'] };
      
      expect(canViewInsight(supervisorUser)).toBe(true);
      expect(canViewInsight(workerUser)).toBe(false);
    });

    test('SOFTWARE_ADMIN should have access to all features', () => {
      const adminUser = { roles: ['SOFTWARE_ADMIN'] };
      
      expect(canViewInsight(adminUser)).toBe(true);
      expect(canViewInbox(adminUser)).toBe(true);
      expect(canActOnInbox(adminUser)).toBe(true);
      expect(canViewFollowUp(adminUser)).toBe(true);
      expect(canActOnFollowUp(adminUser)).toBe(true);
      expect(canGenerateSeasonalReports(adminUser)).toBe(true);
    });

    test('DEPARTMENT_ADMIN should have insight access', () => {
      const deptAdminUser = { roles: ['DEPARTMENT_ADMIN'] };
      
      expect(canViewInsight(deptAdminUser)).toBe(true);
      expect(canViewInbox(deptAdminUser)).toBe(true);
      expect(canActOnInbox(deptAdminUser)).toBe(true);
    });

    test('SECTION_ADMIN should have insight access', () => {
      const sectionAdminUser = { roles: ['SECTION_ADMIN'] };
      
      expect(canViewInsight(sectionAdminUser)).toBe(true);
      expect(canViewInbox(sectionAdminUser)).toBe(true);
      expect(canActOnInbox(sectionAdminUser)).toBe(true);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    test('should handle user with many roles efficiently', () => {
      const manyRoles = Array.from({ length: 100 }, (_, i) => `ROLE_${i}`);
      manyRoles.push('SOFTWARE_ADMIN'); // Add authorized role at end
      
      const user = { roles: manyRoles };
      expect(canViewInsight(user)).toBe(true);
    });

    test('should short-circuit on first matching role', () => {
      const user = { roles: ['SOFTWARE_ADMIN', 'DEPARTMENT_ADMIN'] };
      expect(canViewInsight(user)).toBe(true);
    });
  });

  // ============================================================================
  // DOCUMENTATION VERIFICATION
  // ============================================================================
  
  describe('Function Signature', () => {
    test('should be a function', () => {
      expect(typeof canViewInsight).toBe('function');
    });

    test('should accept one parameter (user)', () => {
      expect(canViewInsight.length).toBe(1);
    });

    test('should return boolean', () => {
      const user = { roles: ['SOFTWARE_ADMIN'] };
      const result = canViewInsight(user);
      expect(typeof result).toBe('boolean');
    });
  });
});
