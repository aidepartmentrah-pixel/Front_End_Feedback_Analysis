/**
 * PHASE J — TASK J-1 — VISIBILITY MAP TEST
 * 
 * Comprehensive test suite for role visibility map
 * Tests all roles against all pages and settings tabs
 */

import {
  ROLES,
  PAGE_KEYS,
  SETTINGS_TAB_KEYS,
  rolePageVisibilityMap,
  roleSettingsTabVisibilityMap,
  canRoleSeePage,
  canRoleSeeSettingsTab,
} from '../roleVisibilityMap';

describe('PHASE J — Role Visibility Map Tests', () => {
  
  // ============================================================================
  // PAGE VISIBILITY TESTS
  // ============================================================================
  
  describe('canRoleSeePage - SOFTWARE_ADMIN', () => {
    const role = ROLES.SOFTWARE_ADMIN;
    
    test('should see reporting', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.REPORTING)).toBe(true);
    });
    
    test('should see settings', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.SETTINGS)).toBe(true);
    });
    
    test('should see drawer_notes', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.DRAWER_NOTES)).toBe(true);
    });
    
    test('should see all pages', () => {
      Object.values(PAGE_KEYS).forEach(pageKey => {
        expect(canRoleSeePage(role, pageKey)).toBe(true);
      });
    });
  });
  
  describe('canRoleSeePage - COMPLAINT_SUPERVISOR', () => {
    const role = ROLES.COMPLAINT_SUPERVISOR;
    
    test('should see investigation', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.INVESTIGATION)).toBe(true);
    });
    
    test('should see history', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.HISTORY)).toBe(true);
    });
    
    test('should see all pages', () => {
      Object.values(PAGE_KEYS).forEach(pageKey => {
        expect(canRoleSeePage(role, pageKey)).toBe(true);
      });
    });
  });
  
  describe('canRoleSeePage - WORKER', () => {
    const role = ROLES.WORKER;
    
    test('should see reporting', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.REPORTING)).toBe(true);
    });
    
    test('should NOT see settings', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.SETTINGS)).toBe(false);
    });
    
    test('should see operational pages', () => {
      const allowedPages = [
        PAGE_KEYS.DASHBOARD,
        PAGE_KEYS.INBOX,
        PAGE_KEYS.FOLLOW_UP,
        PAGE_KEYS.INSIGHT,
        PAGE_KEYS.REPORTING,
        PAGE_KEYS.INVESTIGATION,
        PAGE_KEYS.TREND_MONITORING,
        PAGE_KEYS.TABLE_VIEW,
        PAGE_KEYS.INSERT_RECORD,
        PAGE_KEYS.HISTORY,
        PAGE_KEYS.DRAWER_NOTES,
        PAGE_KEYS.CRITICAL_ISSUES,
      ];
      
      allowedPages.forEach(pageKey => {
        expect(canRoleSeePage(role, pageKey)).toBe(true);
      });
    });
  });
  
  describe('canRoleSeePage - ADMINISTRATION_ADMIN', () => {
    const role = ROLES.ADMINISTRATION_ADMIN;
    
    test('should NOT see reporting', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.REPORTING)).toBe(false);
    });
    
    test('should NOT see table_view', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.TABLE_VIEW)).toBe(false);
    });
    
    test('should see dashboard', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.DASHBOARD)).toBe(true);
    });
    
    test('should only see basic monitoring pages', () => {
      const allowedPages = [
        PAGE_KEYS.DASHBOARD,
        PAGE_KEYS.INBOX,
        PAGE_KEYS.FOLLOW_UP,
        PAGE_KEYS.TREND_MONITORING,
        PAGE_KEYS.CRITICAL_ISSUES,
      ];
      
      const restrictedPages = [
        PAGE_KEYS.REPORTING,
        PAGE_KEYS.INVESTIGATION,
        PAGE_KEYS.INSIGHT,
        PAGE_KEYS.HISTORY,
        PAGE_KEYS.TABLE_VIEW,
        PAGE_KEYS.INSERT_RECORD,
        PAGE_KEYS.DRAWER_NOTES,
        PAGE_KEYS.SETTINGS,
      ];
      
      allowedPages.forEach(pageKey => {
        expect(canRoleSeePage(role, pageKey)).toBe(true);
      });
      
      restrictedPages.forEach(pageKey => {
        expect(canRoleSeePage(role, pageKey)).toBe(false);
      });
    });
  });
  
  describe('canRoleSeePage - SECTION_ADMIN', () => {
    const role = ROLES.SECTION_ADMIN;
    
    test('should NOT see insight', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.INSIGHT)).toBe(false);
    });
    
    test('should see inbox', () => {
      expect(canRoleSeePage(role, PAGE_KEYS.INBOX)).toBe(true);
    });
    
    test('should have same visibility as ADMINISTRATION_ADMIN', () => {
      Object.values(PAGE_KEYS).forEach(pageKey => {
        const sectionAdminAccess = canRoleSeePage(ROLES.SECTION_ADMIN, pageKey);
        const adminAccess = canRoleSeePage(ROLES.ADMINISTRATION_ADMIN, pageKey);
        expect(sectionAdminAccess).toBe(adminAccess);
      });
    });
  });
  
  // ============================================================================
  // SETTINGS TAB VISIBILITY TESTS
  // ============================================================================
  
  describe('canRoleSeeSettingsTab - SOFTWARE_ADMIN', () => {
    const role = ROLES.SOFTWARE_ADMIN;
    
    test('should see policy tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(true);
    });
    
    test('should see all settings tabs', () => {
      Object.values(SETTINGS_TAB_KEYS).forEach(tabKey => {
        expect(canRoleSeeSettingsTab(role, tabKey)).toBe(true);
      });
    });
  });
  
  describe('canRoleSeeSettingsTab - COMPLAINT_SUPERVISOR', () => {
    const role = ROLES.COMPLAINT_SUPERVISOR;
    
    test('should see users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(true);
    });
    
    test('should see all settings tabs', () => {
      Object.values(SETTINGS_TAB_KEYS).forEach(tabKey => {
        expect(canRoleSeeSettingsTab(role, tabKey)).toBe(true);
      });
    });
  });
  
  describe('canRoleSeeSettingsTab - WORKER', () => {
    const role = ROLES.WORKER;
    
    test('should see doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(true);
    });
    
    test('should see patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(true);
    });
    
    test('should NOT see policy tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(false);
    });
    
    test('should only see doctors and patients tabs', () => {
      const allowedTabs = [
        SETTINGS_TAB_KEYS.DOCTORS,
        SETTINGS_TAB_KEYS.PATIENTS,
      ];
      
      const restrictedTabs = [
        SETTINGS_TAB_KEYS.DEPARTMENTS,
        SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES,
        SETTINGS_TAB_KEYS.POLICY,
        SETTINGS_TAB_KEYS.TRAINING,
        SETTINGS_TAB_KEYS.USERS,
      ];
      
      allowedTabs.forEach(tabKey => {
        expect(canRoleSeeSettingsTab(role, tabKey)).toBe(true);
      });
      
      restrictedTabs.forEach(tabKey => {
        expect(canRoleSeeSettingsTab(role, tabKey)).toBe(false);
      });
    });
  });
  
  describe('canRoleSeeSettingsTab - DEPARTMENT_ADMIN', () => {
    const role = ROLES.DEPARTMENT_ADMIN;
    
    test('should NOT see doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('should see no settings tabs', () => {
      Object.values(SETTINGS_TAB_KEYS).forEach(tabKey => {
        expect(canRoleSeeSettingsTab(role, tabKey)).toBe(false);
      });
    });
  });
  
  // ============================================================================
  // EDGE CASES AND VALIDATION
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('should return false for null role', () => {
      expect(canRoleSeePage(null, PAGE_KEYS.DASHBOARD)).toBe(false);
      expect(canRoleSeeSettingsTab(null, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('should return false for undefined role', () => {
      expect(canRoleSeePage(undefined, PAGE_KEYS.DASHBOARD)).toBe(false);
      expect(canRoleSeeSettingsTab(undefined, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('should return false for null page/tab key', () => {
      expect(canRoleSeePage(ROLES.SOFTWARE_ADMIN, null)).toBe(false);
      expect(canRoleSeeSettingsTab(ROLES.SOFTWARE_ADMIN, null)).toBe(false);
    });
    
    test('should return false for undefined page/tab key', () => {
      expect(canRoleSeePage(ROLES.SOFTWARE_ADMIN, undefined)).toBe(false);
      expect(canRoleSeeSettingsTab(ROLES.SOFTWARE_ADMIN, undefined)).toBe(false);
    });
    
    test('should return false for unknown role', () => {
      expect(canRoleSeePage('UNKNOWN_ROLE', PAGE_KEYS.DASHBOARD)).toBe(false);
      expect(canRoleSeeSettingsTab('UNKNOWN_ROLE', SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('should return false for empty string role', () => {
      expect(canRoleSeePage('', PAGE_KEYS.DASHBOARD)).toBe(false);
      expect(canRoleSeeSettingsTab('', SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
  });
  
  // ============================================================================
  // COMPREHENSIVE TEST TABLE OUTPUT
  // ============================================================================
  
  describe('Comprehensive Test Table', () => {
    test('Print complete test matrix', () => {
      console.log('\n');
      console.log('='.repeat(80));
      console.log('PHASE J — TASK J-1 — ROLE VISIBILITY MAP TEST RESULTS');
      console.log('='.repeat(80));
      console.log('\n');
      
      // Page visibility test cases from testing prompt
      const pageTests = [
        { role: ROLES.SOFTWARE_ADMIN, key: PAGE_KEYS.REPORTING, expected: true },
        { role: ROLES.SOFTWARE_ADMIN, key: PAGE_KEYS.SETTINGS, expected: true },
        { role: ROLES.SOFTWARE_ADMIN, key: PAGE_KEYS.DRAWER_NOTES, expected: true },
        { role: ROLES.COMPLAINT_SUPERVISOR, key: PAGE_KEYS.INVESTIGATION, expected: true },
        { role: ROLES.COMPLAINT_SUPERVISOR, key: PAGE_KEYS.HISTORY, expected: true },
        { role: ROLES.WORKER, key: PAGE_KEYS.REPORTING, expected: true },
        { role: ROLES.WORKER, key: PAGE_KEYS.SETTINGS, expected: false },
        { role: ROLES.ADMINISTRATION_ADMIN, key: PAGE_KEYS.REPORTING, expected: false },
        { role: ROLES.ADMINISTRATION_ADMIN, key: PAGE_KEYS.TABLE_VIEW, expected: false },
        { role: ROLES.ADMINISTRATION_ADMIN, key: PAGE_KEYS.DASHBOARD, expected: true },
        { role: ROLES.SECTION_ADMIN, key: PAGE_KEYS.INSIGHT, expected: false },
        { role: ROLES.SECTION_ADMIN, key: PAGE_KEYS.INBOX, expected: true },
      ];
      
      const settingsTests = [
        { role: ROLES.SOFTWARE_ADMIN, key: SETTINGS_TAB_KEYS.POLICY, expected: true },
        { role: ROLES.COMPLAINT_SUPERVISOR, key: SETTINGS_TAB_KEYS.USERS, expected: true },
        { role: ROLES.WORKER, key: SETTINGS_TAB_KEYS.DOCTORS, expected: true },
        { role: ROLES.WORKER, key: SETTINGS_TAB_KEYS.PATIENTS, expected: true },
        { role: ROLES.WORKER, key: SETTINGS_TAB_KEYS.POLICY, expected: false },
        { role: ROLES.DEPARTMENT_ADMIN, key: SETTINGS_TAB_KEYS.DOCTORS, expected: false },
      ];
      
      console.log('📄 PAGE VISIBILITY TESTS');
      console.log('-'.repeat(80));
      console.log('ROLE'.padEnd(25) + ' | ' + 'PAGE KEY'.padEnd(20) + ' | ' + 'EXPECTED'.padEnd(8) + ' | ' + 'ACTUAL'.padEnd(8) + ' | STATUS');
      console.log('-'.repeat(80));
      
      let pagePassCount = 0;
      let pageFailCount = 0;
      
      pageTests.forEach(test => {
        const actual = canRoleSeePage(test.role, test.key);
        const status = actual === test.expected ? '✅ PASS' : '❌ FAIL';
        
        if (actual === test.expected) {
          pagePassCount++;
        } else {
          pageFailCount++;
        }
        
        console.log(
          test.role.padEnd(25) + ' | ' + 
          test.key.padEnd(20) + ' | ' + 
          String(test.expected).padEnd(8) + ' | ' + 
          String(actual).padEnd(8) + ' | ' + 
          status
        );
      });
      
      console.log('-'.repeat(80));
      console.log(`Page Tests: ${pagePassCount} passed, ${pageFailCount} failed\n`);
      
      console.log('⚙️  SETTINGS TAB VISIBILITY TESTS');
      console.log('-'.repeat(80));
      console.log('ROLE'.padEnd(25) + ' | ' + 'TAB KEY'.padEnd(20) + ' | ' + 'EXPECTED'.padEnd(8) + ' | ' + 'ACTUAL'.padEnd(8) + ' | STATUS');
      console.log('-'.repeat(80));
      
      let settingsPassCount = 0;
      let settingsFailCount = 0;
      
      settingsTests.forEach(test => {
        const actual = canRoleSeeSettingsTab(test.role, test.key);
        const status = actual === test.expected ? '✅ PASS' : '❌ FAIL';
        
        if (actual === test.expected) {
          settingsPassCount++;
        } else {
          settingsFailCount++;
        }
        
        console.log(
          test.role.padEnd(25) + ' | ' + 
          test.key.padEnd(20) + ' | ' + 
          String(test.expected).padEnd(8) + ' | ' + 
          String(actual).padEnd(8) + ' | ' + 
          status
        );
      });
      
      console.log('-'.repeat(80));
      console.log(`Settings Tests: ${settingsPassCount} passed, ${settingsFailCount} failed\n`);
      
      const totalPass = pagePassCount + settingsPassCount;
      const totalFail = pageFailCount + settingsFailCount;
      const totalTests = totalPass + totalFail;
      
      console.log('='.repeat(80));
      console.log(`TOTAL: ${totalPass}/${totalTests} tests passed (${((totalPass/totalTests)*100).toFixed(1)}%)`);
      console.log('='.repeat(80));
      console.log('\n');
      
      // All tests must pass
      expect(pageFailCount).toBe(0);
      expect(settingsFailCount).toBe(0);
    });
  });
});
