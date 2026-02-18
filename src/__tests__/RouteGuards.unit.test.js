/**
 * PHASE J - TASK J-4 - ROUTE GUARD UNIT TESTS
 * 
 * Tests all role guard functions directly
 * Verifies that each role can only access pages they're allowed to see
 * 
 * Test Matrix:
 * - SOFTWARE_ADMIN: All pages
 * - COMPLAINT_SUPERVISOR: All pages
 * - WORKER: All pages except Settings
 * - ADMINISTRATION_ADMIN: Blocked from all roleProtected pages
 * - DEPARTMENT_ADMIN: Blocked from all role-protected pages  
 * - SECTION_ADMIN: Blocked from all role-protected pages
 */

import {
  canViewInsight,
  canViewPersonReporting,
  canAccessDrawerNotes,
  canViewReporting,
  canViewInvestigation,
  canViewTableView,
  canViewInsertRecord,
  canViewSettings
} from '../utils/roleGuards';

// ============================================================================
// TEST SUITES BY ROLE
// ============================================================================

describe('PHASE J - Route Guard Function Tests', () => {
  
  // Helper to create user objects
  const createUser = (roles) => ({
    username: 'testuser',
    roles: roles,
    token: 'mock-token'
  });
  
  // ==========================================================================
  // SOFTWARE_ADMIN - Full Access
  // ==========================================================================
  
  describe('SOFTWARE_ADMIN - Full Access', () => {
    const user = createUser(['SOFTWARE_ADMIN']);
    
    test('✓ Can access /insight', () => {
      expect(canViewInsight(user)).toBe(true);
    });
    
    test('✓ Can access /history', () => {
      expect(canViewPersonReporting(user)).toBe(true);
    });
    
    test('✓ Can access /drawer-notes', () => {
      expect(canAccessDrawerNotes(user)).toBe(true);
    });
    
    test('✓ Can access /reporting', () => {
      expect(canViewReporting(user)).toBe(true);
    });
    
    test('✓ Can access /investigation', () => {
      expect(canViewInvestigation(user)).toBe(true);
    });
    
    test('✓ Can access /table-view', () => {
      expect(canViewTableView(user)).toBe(true);
    });
    
    test('✓ Can access /insert', () => {
      expect(canViewInsertRecord(user)).toBe(true);
    });
    
    test('✓ Can access /settings', () => {
      expect(canViewSettings(user)).toBe(true);
    });
  });
  
  // ==========================================================================
  // COMPLAINT_SUPERVISOR - Full Access
  // ==========================================================================
  
  describe('COMPLAINT_SUPERVISOR - Full Access', () => {
    const user = createUser(['COMPLAINT_SUPERVISOR']);
    
    test('✓ Can access /insight', () => {
      expect(canViewInsight(user)).toBe(true);
    });
    
    test('✓ Can access /history', () => {
      expect(canViewPersonReporting(user)).toBe(true);
    });
    
    test('✓ Can access /drawer-notes', () => {
      expect(canAccessDrawerNotes(user)).toBe(true);
    });
    
    test('✓ Can access /reporting', () => {
      expect(canViewReporting(user)).toBe(true);
    });
    
    test('✓ Can access /investigation', () => {
      expect(canViewInvestigation(user)).toBe(true);
    });
    
    test('✓ Can access /table-view', () => {
      expect(canViewTableView(user)).toBe(true);
    });
    
    test('✓ Can access /insert', () => {
      expect(canViewInsertRecord(user)).toBe(true);
    });
    
    test('✓ Can access /settings', () => {
      expect(canViewSettings(user)).toBe(true);
    });
  });
  
  // ==========================================================================
  // WORKER - All Pages Except Settings
  // ==========================================================================
  
  describe('WORKER - All Pages Except Settings', () => {
    const user = createUser(['WORKER']);
    
    test('✓ Can access /insight', () => {
      expect(canViewInsight(user)).toBe(true);
    });
    
    test('✓ Can access /history', () => {
      expect(canViewPersonReporting(user)).toBe(true);
    });
    
    test('✓ Can access /drawer-notes', () => {
      expect(canAccessDrawerNotes(user)).toBe(true);
    });
    
    test('✓ Can access /reporting', () => {
      expect(canViewReporting(user)).toBe(true);
    });
    
    test('✓ Can access /investigation', () => {
      expect(canViewInvestigation(user)).toBe(true);
    });
    
    test('✓ Can access /table-view', () => {
      expect(canViewTableView(user)).toBe(true);
    });
    
    test('✓ Can access /insert', () => {
      expect(canViewInsertRecord(user)).toBe(true);
    });
    
    test('✗ BLOCKED from /settings', () => {
      expect(canViewSettings(user)).toBe(false);
    });
  });
  
  // ==========================================================================
  // LIMITED_ADMIN_ROLES - Restricted Access
  // ==========================================================================
  
  describe('ADMINISTRATION_ADMIN - Limited Access', () => {
    const user = createUser(['ADMINISTRATION_ADMIN']);
    
    test('✗ BLOCKED from /insight', () => {
      expect(canViewInsight(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /history', () => {
      expect(canViewPersonReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /drawer-notes', () => {
      expect(canAccessDrawerNotes(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /reporting', () => {
      expect(canViewReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /investigation', () => {
      expect(canViewInvestigation(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /table-view', () => {
      expect(canViewTableView(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /insert', () => {
      expect(canViewInsertRecord(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /settings', () => {
      expect(canViewSettings(user)).toBe(false);
    });
  });
  
  describe('DEPARTMENT_ADMIN - Limited Access', () => {
    const user = createUser(['DEPARTMENT_ADMIN']);
    
    test('✗ BLOCKED from /insight', () => {
      expect(canViewInsight(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /history', () => {
      expect(canViewPersonReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /reporting', () => {
      expect(canViewReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /investigation', () => {
      expect(canViewInvestigation(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /table-view', () => {
      expect(canViewTableView(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /insert', () => {
      expect(canViewInsertRecord(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /settings', () => {
      expect(canViewSettings(user)).toBe(false);
    });
  });
  
  describe('SECTION_ADMIN - Limited Access', () => {
    const user = createUser(['SECTION_ADMIN']);
    
    test('✗ BLOCKED from /insight', () => {
      expect(canViewInsight(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /history', () => {
      expect(canViewPersonReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /reporting', () => {
      expect(canViewReporting(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /investigation', () => {
      expect(canViewInvestigation(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /table-view', () => {
      expect(canViewTableView(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /insert', () => {
      expect(canViewInsertRecord(user)).toBe(false);
    });
    
    test('✗ BLOCKED from /settings', () => {
      expect(canViewSettings(user)).toBe(false);
    });
  });
  
  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  
  describe('Edge Cases - Invalid User States', () => {
    test('No roles → blocked from all protected routes', () => {
      const user = createUser([]);
      
      expect(canViewInsight(user)).toBe(false);
      expect(canViewPersonReporting(user)).toBe(false);
      expect(canAccessDrawerNotes(user)).toBe(false);
      expect(canViewReporting(user)).toBe(false);
      expect(canViewInvestigation(user)).toBe(false);
      expect(canViewTableView(user)).toBe(false);
      expect(canViewInsertRecord(user)).toBe(false);
      expect(canViewSettings(user)).toBe(false);
    });
    
    test('Null user → blocked from all protected routes', () => {
      const user = null;
      
      expect(canViewInsight(user)).toBe(false);
      expect(canViewPersonReporting(user)).toBe(false);
      expect(canAccessDrawerNotes(user)).toBe(false);
      expect(canViewReporting(user)).toBe(false);
      expect(canViewInvestigation(user)).toBe(false);
      expect(canViewTableView(user)).toBe(false);
      expect(canViewInsertRecord(user)).toBe(false);
      expect(canViewSettings(user)).toBe(false);
    });
    
    test('Undefined user → blocked from all protected routes', () => {
      const user = undefined;
      
      expect(canViewInsight(user)).toBe(false);
      expect(canViewPersonReporting(user)).toBe(false);
      expect(canAccessDrawerNotes(user)).toBe(false);
      expect(canViewReporting(user)).toBe(false);
      expect(canViewInvestigation(user)).toBe(false);
      expect(canViewTableView(user)).toBe(false);
      expect(canViewInsertRecord(user)).toBe(false);
      expect(canViewSettings(user)).toBe(false);
    });
  });
});
