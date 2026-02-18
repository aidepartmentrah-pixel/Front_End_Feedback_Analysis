/**
 * PHASE J — TASK J-2 — TEST roleGuards.js AGAINST VISIBILITY CONTRACT
 * 
 * Comprehensive test suite for role guard functions
 * Tests all guards against the central visibility map
 */

import {
  canViewInbox,
  canActOnInbox,
  canViewFollowUp,
  canActOnFollowUp,
  canViewInsight,
  canGenerateSeasonalReports,
  isSoftwareAdmin,
  canViewPersonReporting,
  canAccessDrawerNotes,
  canAccessMigration,
} from '../roleGuards';

describe('PHASE J — Role Guards Tests', () => {
  
  // ============================================================================
  // TEST USER OBJECTS
  // ============================================================================
  
  const softwareAdmin = { roles: ['SOFTWARE_ADMIN'] };
  const complaintSupervisor = { roles: ['COMPLAINT_SUPERVISOR'] };
  const worker = { roles: ['WORKER'] };
  const adminAdmin = { roles: ['ADMINISTRATION_ADMIN'] };
  const deptAdmin = { roles: ['DEPARTMENT_ADMIN'] };
  const sectionAdmin = { roles: ['SECTION_ADMIN'] };
  
  // Edge case users
  const noRoles = { roles: [] };
  const nullUser = null;
  const undefinedUser = undefined;
  const noRolesProperty = {};
  
  // ============================================================================
  // canViewInbox TESTS
  // ============================================================================
  
  describe('canViewInbox', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canViewInbox(softwareAdmin)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canViewInbox(complaintSupervisor)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canViewInbox(worker)).toBe(true);
    });
    
    test('should allow ADMINISTRATION_ADMIN', () => {
      expect(canViewInbox(adminAdmin)).toBe(true);
    });
    
    test('should allow DEPARTMENT_ADMIN', () => {
      expect(canViewInbox(deptAdmin)).toBe(true);
    });
    
    test('should allow SECTION_ADMIN', () => {
      expect(canViewInbox(sectionAdmin)).toBe(true);
    });
    
    test('should deny null user', () => {
      expect(canViewInbox(nullUser)).toBe(false);
    });
    
    test('should deny user with empty roles', () => {
      expect(canViewInbox(noRoles)).toBe(false);
    });
  });
  
  // ============================================================================
  // canActOnInbox TESTS
  // ============================================================================
  
  describe('canActOnInbox', () => {
    test('should allow WORKER', () => {
      expect(canActOnInbox(worker)).toBe(true);
    });
    
    test('should allow SECTION_ADMIN (they can see inbox)', () => {
      expect(canActOnInbox(sectionAdmin)).toBe(true);
    });
    
    test('should allow ADMINISTRATION_ADMIN', () => {
      expect(canActOnInbox(adminAdmin)).toBe(true);
    });
    
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canActOnInbox(softwareAdmin)).toBe(true);
    });
  });
  
  // ============================================================================
  // canViewFollowUp TESTS
  // ============================================================================
  
  describe('canViewFollowUp', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canViewFollowUp(softwareAdmin)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canViewFollowUp(complaintSupervisor)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canViewFollowUp(worker)).toBe(true);
    });
    
    test('should allow ADMINISTRATION_ADMIN', () => {
      expect(canViewFollowUp(adminAdmin)).toBe(true);
    });
    
    test('should allow SECTION_ADMIN', () => {
      expect(canViewFollowUp(sectionAdmin)).toBe(true);
    });
    
    test('should deny null user', () => {
      expect(canViewFollowUp(nullUser)).toBe(false);
    });
  });
  
  // ============================================================================
  // canActOnFollowUp TESTS
  // ============================================================================
  
  describe('canActOnFollowUp', () => {
    test('should allow WORKER', () => {
      expect(canActOnFollowUp(worker)).toBe(true);
    });
    
    test('should allow ADMINISTRATION_ADMIN', () => {
      expect(canActOnFollowUp(adminAdmin)).toBe(true);
    });
    
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canActOnFollowUp(softwareAdmin)).toBe(true);
    });
  });
  
  // ============================================================================
  // canViewInsight TESTS (CRITICAL — Phase J visibility contract)
  // ============================================================================
  
  describe('canViewInsight', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canViewInsight(softwareAdmin)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canViewInsight(complaintSupervisor)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canViewInsight(worker)).toBe(true);
    });
    
    test('should NOT allow ADMINISTRATION_ADMIN', () => {
      expect(canViewInsight(adminAdmin)).toBe(false);
    });
    
    test('should NOT allow DEPARTMENT_ADMIN', () => {
      expect(canViewInsight(deptAdmin)).toBe(false);
    });
    
    test('should NOT allow SECTION_ADMIN', () => {
      expect(canViewInsight(sectionAdmin)).toBe(false);
    });
  });
  
  // ============================================================================
  // canAccessDrawerNotes TESTS (CRITICAL — Phase J visibility contract)
  // ============================================================================
  
  describe('canAccessDrawerNotes', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canAccessDrawerNotes(softwareAdmin)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canAccessDrawerNotes(worker)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR (super role visibility)', () => {
      expect(canAccessDrawerNotes(complaintSupervisor)).toBe(true);
    });
    
    test('should NOT allow SECTION_ADMIN', () => {
      expect(canAccessDrawerNotes(sectionAdmin)).toBe(false);
    });
    
    test('should NOT allow ADMINISTRATION_ADMIN', () => {
      expect(canAccessDrawerNotes(adminAdmin)).toBe(false);
    });
    
    test('should NOT allow DEPARTMENT_ADMIN', () => {
      expect(canAccessDrawerNotes(deptAdmin)).toBe(false);
    });
  });
  
  // ============================================================================
  // canViewPersonReporting TESTS (History page)
  // ============================================================================
  
  describe('canViewPersonReporting', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canViewPersonReporting(softwareAdmin)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canViewPersonReporting(worker)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canViewPersonReporting(complaintSupervisor)).toBe(true);
    });
    
    test('should NOT allow ADMINISTRATION_ADMIN', () => {
      expect(canViewPersonReporting(adminAdmin)).toBe(false);
    });
    
    test('should NOT allow SECTION_ADMIN', () => {
      expect(canViewPersonReporting(sectionAdmin)).toBe(false);
    });
  });
  
  // ============================================================================
  // isSoftwareAdmin TESTS
  // ============================================================================
  
  describe('isSoftwareAdmin', () => {
    test('should return true for SOFTWARE_ADMIN', () => {
      expect(isSoftwareAdmin(softwareAdmin)).toBe(true);
    });
    
    test('should return false for WORKER', () => {
      expect(isSoftwareAdmin(worker)).toBe(false);
    });
    
    test('should return false for COMPLAINT_SUPERVISOR', () => {
      expect(isSoftwareAdmin(complaintSupervisor)).toBe(false);
    });
    
    test('should return false for null user', () => {
      expect(isSoftwareAdmin(nullUser)).toBe(false);
    });
  });
  
  // ============================================================================
  // canGenerateSeasonalReports TESTS
  // ============================================================================
  
  describe('canGenerateSeasonalReports', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canGenerateSeasonalReports(softwareAdmin)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canGenerateSeasonalReports(complaintSupervisor)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canGenerateSeasonalReports(worker)).toBe(true);
    });
    
    test('should NOT allow ADMINISTRATION_ADMIN', () => {
      expect(canGenerateSeasonalReports(adminAdmin)).toBe(false);
    });
  });
  
  // ============================================================================
  // canAccessMigration TESTS
  // ============================================================================
  
  describe('canAccessMigration', () => {
    test('should allow SOFTWARE_ADMIN', () => {
      expect(canAccessMigration(softwareAdmin)).toBe(true);
    });
    
    test('should allow WORKER', () => {
      expect(canAccessMigration(worker)).toBe(true);
    });
    
    test('should allow COMPLAINT_SUPERVISOR', () => {
      expect(canAccessMigration(complaintSupervisor)).toBe(true);
    });
    
    test('should NOT allow ADMINISTRATION_ADMIN', () => {
      expect(canAccessMigration(adminAdmin)).toBe(false);
    });
  });
  
  // ============================================================================
  // EDGE CASES
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('all guards should return false for null user', () => {
      expect(canViewInbox(nullUser)).toBe(false);
      expect(canViewFollowUp(nullUser)).toBe(false);
      expect(canViewInsight(nullUser)).toBe(false);
      expect(canAccessDrawerNotes(nullUser)).toBe(false);
      expect(isSoftwareAdmin(nullUser)).toBe(false);
    });
    
    test('all guards should return false for undefined user', () => {
      expect(canViewInbox(undefinedUser)).toBe(false);
      expect(canViewFollowUp(undefinedUser)).toBe(false);
      expect(canViewInsight(undefinedUser)).toBe(false);
      expect(canAccessDrawerNotes(undefinedUser)).toBe(false);
      expect(isSoftwareAdmin(undefinedUser)).toBe(false);
    });
    
    test('all guards should return false for user with empty roles', () => {
      expect(canViewInbox(noRoles)).toBe(false);
      expect(canViewFollowUp(noRoles)).toBe(false);
      expect(canViewInsight(noRoles)).toBe(false);
      expect(canAccessDrawerNotes(noRoles)).toBe(false);
      expect(isSoftwareAdmin(noRoles)).toBe(false);
    });
    
    test('all guards should return false for user without roles property', () => {
      expect(canViewInbox(noRolesProperty)).toBe(false);
      expect(canViewFollowUp(noRolesProperty)).toBe(false);
      expect(canViewInsight(noRolesProperty)).toBe(false);
      expect(canAccessDrawerNotes(noRolesProperty)).toBe(false);
      expect(isSoftwareAdmin(noRolesProperty)).toBe(false);
    });
  });
  
  // ============================================================================
  // COMPREHENSIVE TEST TABLE OUTPUT (from testing prompt)
  // ============================================================================
  
  describe('Comprehensive Test Table', () => {
    test('Print complete guard test matrix', () => {
      console.log('\n');
      console.log('='.repeat(90));
      console.log('PHASE J — TASK J-2 — ROLE GUARDS TEST RESULTS');
      console.log('='.repeat(90));
      console.log('\n');
      
      const testCases = [
        // canViewInsight tests
        { func: 'canViewInsight', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'canViewInsight', role: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor, expected: true },
        { func: 'canViewInsight', role: 'WORKER', user: worker, expected: true },
        { func: 'canViewInsight', role: 'ADMINISTRATION_ADMIN', user: adminAdmin, expected: false },
        
        // canViewInbox tests
        { func: 'canViewInbox', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'canViewInbox', role: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor, expected: true },
        { func: 'canViewInbox', role: 'WORKER', user: worker, expected: true },
        { func: 'canViewInbox', role: 'ADMINISTRATION_ADMIN', user: adminAdmin, expected: true },
        { func: 'canViewInbox', role: 'SECTION_ADMIN', user: sectionAdmin, expected: true },
        
        // canViewFollowUp tests
        { func: 'canViewFollowUp', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'canViewFollowUp', role: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor, expected: true },
        { func: 'canViewFollowUp', role: 'WORKER', user: worker, expected: true },
        { func: 'canViewFollowUp', role: 'ADMINISTRATION_ADMIN', user: adminAdmin, expected: true },
        { func: 'canViewFollowUp', role: 'SECTION_ADMIN', user: sectionAdmin, expected: true },
        
        // canAccessDrawerNotes tests
        { func: 'canAccessDrawerNotes', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'canAccessDrawerNotes', role: 'WORKER', user: worker, expected: true },
        { func: 'canAccessDrawerNotes', role: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor, expected: true },
        { func: 'canAccessDrawerNotes', role: 'SECTION_ADMIN', user: sectionAdmin, expected: false },
        
        // canViewPersonReporting (history) tests
        { func: 'canViewPersonReporting', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'canViewPersonReporting', role: 'WORKER', user: worker, expected: true },
        { func: 'canViewPersonReporting', role: 'ADMINISTRATION_ADMIN', user: adminAdmin, expected: false },
        
        // isSoftwareAdmin tests
        { func: 'isSoftwareAdmin', role: 'SOFTWARE_ADMIN', user: softwareAdmin, expected: true },
        { func: 'isSoftwareAdmin', role: 'WORKER', user: worker, expected: false },
        
        // canActOnInbox tests
        { func: 'canActOnInbox', role: 'WORKER', user: worker, expected: true },
        { func: 'canActOnInbox', role: 'SECTION_ADMIN', user: sectionAdmin, expected: true },
        { func: 'canActOnInbox', role: 'ADMINISTRATION_ADMIN', user: adminAdmin, expected: true },
      ];
      
      const guardFunctions = {
        canViewInsight,
        canViewInbox,
        canViewFollowUp,
        canAccessDrawerNotes,
        canViewPersonReporting,
        isSoftwareAdmin,
        canActOnInbox,
      };
      
      console.log('FUNCTION'.padEnd(30) + ' | ' + 'ROLE'.padEnd(25) + ' | ' + 'EXPECTED'.padEnd(8) + ' | ' + 'ACTUAL'.padEnd(8) + ' | STATUS');
      console.log('-'.repeat(90));
      
      let passCount = 0;
      let failCount = 0;
      
      testCases.forEach(test => {
        const guardFn = guardFunctions[test.func];
        const actual = guardFn(test.user);
        const status = actual === test.expected ? '✅ PASS' : '❌ FAIL';
        
        if (actual === test.expected) {
          passCount++;
        } else {
          failCount++;
        }
        
        console.log(
          test.func.padEnd(30) + ' | ' +
          test.role.padEnd(25) + ' | ' +
          String(test.expected).padEnd(8) + ' | ' +
          String(actual).padEnd(8) + ' | ' +
          status
        );
      });
      
      console.log('-'.repeat(90));
      console.log(`TOTAL: ${passCount}/${passCount + failCount} tests passed (${((passCount/(passCount + failCount))*100).toFixed(1)}%)`);
      console.log('='.repeat(90));
      console.log('\n');
      
      // All tests must pass
      expect(failCount).toBe(0);
    });
  });
});
