// src/utils/__tests__/roleGuards.phaseD.test.js
// Phase D — Unit tests for canViewPersonReporting role guard

import { canViewPersonReporting } from '../roleGuards';

describe('Phase D — canViewPersonReporting Role Guard', () => {
  
  // ============================================================================
  // ALLOWED ROLES
  // ============================================================================

  describe('Allowed Roles', () => {
    
    test('returns true for software_admin (lowercase)', () => {
      const user = { id: 1, username: 'admin', roles: ['software_admin'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true for SOFTWARE_ADMIN (uppercase)', () => {
      const user = { id: 1, username: 'admin', roles: ['SOFTWARE_ADMIN'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true for complaint_department_worker (lowercase)', () => {
      const user = { id: 2, username: 'worker', roles: ['complaint_department_worker'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true for COMPLAINT_DEPARTMENT_WORKER (uppercase)', () => {
      const user = { id: 2, username: 'worker', roles: ['COMPLAINT_DEPARTMENT_WORKER'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true when user has both allowed roles', () => {
      const user = { 
        id: 1, 
        username: 'admin', 
        roles: ['software_admin', 'complaint_department_worker'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true when user has software_admin among multiple roles', () => {
      const user = { 
        id: 1, 
        username: 'admin', 
        roles: ['DEPARTMENT_ADMIN', 'software_admin', 'WORKER'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true when user has complaint_department_worker among multiple roles', () => {
      const user = { 
        id: 2, 
        username: 'worker', 
        roles: ['WORKER', 'complaint_department_worker', 'SECTION_ADMIN'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });
  });

  // ============================================================================
  // DENIED ROLES
  // ============================================================================

  describe('Denied Roles', () => {
    
    test('returns false for DEPARTMENT_ADMIN', () => {
      const user = { id: 3, username: 'dept_admin', roles: ['DEPARTMENT_ADMIN'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for SECTION_ADMIN', () => {
      const user = { id: 4, username: 'section_admin', roles: ['SECTION_ADMIN'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for WORKER', () => {
      const user = { id: 5, username: 'worker', roles: ['WORKER'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for COMPLAINT_SUPERVISOR', () => {
      const user = { id: 6, username: 'supervisor', roles: ['COMPLAINT_SUPERVISOR'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for ADMINISTRATION_ADMIN', () => {
      const user = { id: 7, username: 'admin_admin', roles: ['ADMINISTRATION_ADMIN'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for regular user with no special roles', () => {
      const user = { id: 8, username: 'regular', roles: ['USER'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for empty roles array', () => {
      const user = { id: 9, username: 'noroles', roles: [] };
      expect(canViewPersonReporting(user)).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    
    test('returns false when user is null', () => {
      expect(canViewPersonReporting(null)).toBe(false);
    });

    test('returns false when user is undefined', () => {
      expect(canViewPersonReporting(undefined)).toBe(false);
    });

    test('returns false when user has no roles property', () => {
      const user = { id: 10, username: 'noroles' };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false when user.roles is null', () => {
      const user = { id: 11, username: 'nullroles', roles: null };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false when user.roles is undefined', () => {
      const user = { id: 12, username: 'undefroles', roles: undefined };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for user with similar but not exact role name', () => {
      const user = { id: 13, username: 'similar', roles: ['software_administrator'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('returns false for user with partial role string', () => {
      const user = { id: 14, username: 'partial', roles: ['software'] };
      expect(canViewPersonReporting(user)).toBe(false);
    });
  });

  // ============================================================================
  // CASE SENSITIVITY
  // ============================================================================

  describe('Case Sensitivity', () => {
    
    test('handles mixed case correctly (Software_Admin)', () => {
      const user = { id: 15, username: 'mixed', roles: ['Software_Admin'] };
      // Should return false because exact match is required
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('handles all lowercase software_admin', () => {
      const user = { id: 16, username: 'lower', roles: ['software_admin'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('handles all uppercase SOFTWARE_ADMIN', () => {
      const user = { id: 17, username: 'upper', roles: ['SOFTWARE_ADMIN'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('handles all lowercase complaint_department_worker', () => {
      const user = { id: 18, username: 'lower', roles: ['complaint_department_worker'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('handles all uppercase COMPLAINT_DEPARTMENT_WORKER', () => {
      const user = { id: 19, username: 'upper', roles: ['COMPLAINT_DEPARTMENT_WORKER'] };
      expect(canViewPersonReporting(user)).toBe(true);
    });
  });

  // ============================================================================
  // MULTIPLE ROLES SCENARIOS
  // ============================================================================

  describe('Multiple Roles Scenarios', () => {
    
    test('returns true when first role is allowed', () => {
      const user = { 
        id: 20, 
        username: 'multi', 
        roles: ['software_admin', 'DEPARTMENT_ADMIN', 'WORKER'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true when middle role is allowed', () => {
      const user = { 
        id: 21, 
        username: 'multi', 
        roles: ['DEPARTMENT_ADMIN', 'complaint_department_worker', 'WORKER'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns true when last role is allowed', () => {
      const user = { 
        id: 22, 
        username: 'multi', 
        roles: ['DEPARTMENT_ADMIN', 'WORKER', 'software_admin'] 
      };
      expect(canViewPersonReporting(user)).toBe(true);
    });

    test('returns false when none of multiple roles are allowed', () => {
      const user = { 
        id: 23, 
        username: 'multi', 
        roles: ['DEPARTMENT_ADMIN', 'SECTION_ADMIN', 'WORKER'] 
      };
      expect(canViewPersonReporting(user)).toBe(false);
    });
  });
});
