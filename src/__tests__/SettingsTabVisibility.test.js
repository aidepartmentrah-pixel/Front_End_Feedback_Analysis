/**
 * PHASE J - TASK J-5 - SETTINGS TAB VISIBILITY TESTS
 * 
 * Tests settings tab visibility for all roles
 * Verifies that each role can only see the tabs they're allowed to access
 * 
 * Tab Visibility Matrix:
 * - SOFTWARE_ADMIN: All 7 tabs
 * - COMPLAINT_SUPERVISOR: All 7 tabs
 * - WORKER: Only Doctors + Patients (2 tabs)
 * - ADMINISTRATION_ADMIN: None (route blocked)
 * - DEPARTMENT_ADMIN: None (route blocked)
 * - SECTION_ADMIN: None (route blocked)
 */

import { canRoleSeeSettingsTab, SETTINGS_TAB_KEYS } from '../security/roleVisibilityMap';

describe('PHASE J - Settings Tab Visibility Tests', () => {
  
  // All available settings tabs
  const allTabs = [
    SETTINGS_TAB_KEYS.DEPARTMENTS,
    SETTINGS_TAB_KEYS.DOCTORS,
    SETTINGS_TAB_KEYS.PATIENTS,
    SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES,
    SETTINGS_TAB_KEYS.POLICY,
    SETTINGS_TAB_KEYS.TRAINING,
    SETTINGS_TAB_KEYS.USERS,
  ];
  
  // ==========================================================================
  // SOFTWARE_ADMIN - Full Access to All Tabs
  // ==========================================================================
  
  describe('SOFTWARE_ADMIN - Full Access', () => {
    const role = 'SOFTWARE_ADMIN';
    
    test('✓ Can see Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(true);
    });
    
    test('✓ Can see Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(true);
    });
    
    test('✓ Can see Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(true);
    });
    
    test('✓ Can see Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(true);
    });
    
    test('✓ Can see Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(true);
    });
    
    test('✓ Can see Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(true);
    });
    
    test('✓ Can see Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(true);
    });
    
    test('✓ Can see ALL 7 tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(7);
    });
  });
  
  // ==========================================================================
  // COMPLAINT_SUPERVISOR - Full Access to All Tabs
  // ==========================================================================
  
  describe('COMPLAINT_SUPERVISOR - Full Access', () => {
    const role = 'COMPLAINT_SUPERVISOR';
    
    test('✓ Can see Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(true);
    });
    
    test('✓ Can see Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(true);
    });
    
    test('✓ Can see Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(true);
    });
    
    test('✓ Can see Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(true);
    });
    
    test('✓ Can see Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(true);
    });
    
    test('✓ Can see Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(true);
    });
    
    test('✓ Can see Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(true);
    });
    
    test('✓ Can see ALL 7 tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(7);
    });
  });
  
  // ==========================================================================
  // WORKER - Limited Access (Doctors + Patients Only)
  // ==========================================================================
  
  describe('WORKER - Limited Access', () => {
    const role = 'WORKER';
    
    test('✗ BLOCKED from Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(false);
    });
    
    test('✓ Can see Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(true);
    });
    
    test('✓ Can see Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(true);
    });
    
    test('✗ BLOCKED from Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(false);
    });
    
    test('✗ BLOCKED from Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(false);
    });
    
    test('✗ BLOCKED from Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(false);
    });
    
    test('✗ BLOCKED from Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(false);
    });
    
    test('✓ Can see ONLY 2 tabs (Doctors + Patients)', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(2);
      expect(visibleTabs).toContain(SETTINGS_TAB_KEYS.DOCTORS);
      expect(visibleTabs).toContain(SETTINGS_TAB_KEYS.PATIENTS);
    });
  });
  
  // ==========================================================================
  // LIMITED_ADMIN_ROLES - No Settings Access (route blocked anyway)
  // ==========================================================================
  
  describe('ADMINISTRATION_ADMIN - No Settings Access', () => {
    const role = 'ADMINISTRATION_ADMIN';
    
    test('✗ BLOCKED from Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('✗ BLOCKED from Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(false);
    });
    
    test('✗ BLOCKED from Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(false);
    });
    
    test('✗ BLOCKED from Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(false);
    });
    
    test('✗ BLOCKED from Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(false);
    });
    
    test('✗ Can see NO tabs (0/7)', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(0);
    });
  });
  
  describe('DEPARTMENT_ADMIN - No Settings Access', () => {
    const role = 'DEPARTMENT_ADMIN';
    
    test('✗ BLOCKED from Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('✗ BLOCKED from Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(false);
    });
    
    test('✗ BLOCKED from Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(false);
    });
    
    test('✗ BLOCKED from Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(false);
    });
    
    test('✗ BLOCKED from Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(false);
    });
    
    test('✗ Can see NO tabs (0/7)', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(0);
    });
  });
  
  describe('SECTION_ADMIN - No Settings Access', () => {
    const role = 'SECTION_ADMIN';
    
    test('✗ BLOCKED from Departments tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DEPARTMENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Doctors tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.DOCTORS)).toBe(false);
    });
    
    test('✗ BLOCKED from Patients tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.PATIENTS)).toBe(false);
    });
    
    test('✗ BLOCKED from Variable Attributes tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES)).toBe(false);
    });
    
    test('✗ BLOCKED from Policy Configuration tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.POLICY)).toBe(false);
    });
    
    test('✗ BLOCKED from Training tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.TRAINING)).toBe(false);
    });
    
    test('✗ BLOCKED from Users tab', () => {
      expect(canRoleSeeSettingsTab(role, SETTINGS_TAB_KEYS.USERS)).toBe(false);
    });
    
    test('✗ Can see NO tabs (0/7)', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(role, tab));
      expect(visibleTabs).toHaveLength(0);
    });
  });
  
  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  
  describe('Edge Cases - Invalid Role States', () => {
    test('Null role → blocked from all tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(null, tab));
      expect(visibleTabs).toHaveLength(0);
    });
    
    test('Undefined role → blocked from all tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab(undefined, tab));
      expect(visibleTabs).toHaveLength(0);
    });
    
    test('Empty string role → blocked from all tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab('', tab));
      expect(visibleTabs).toHaveLength(0);
    });
    
    test('Unknown role → blocked from all tabs', () => {
      const visibleTabs = allTabs.filter(tab => canRoleSeeSettingsTab('UNKNOWN_ROLE', tab));
      expect(visibleTabs).toHaveLength(0);
    });
    
    test('Null tabKey → always returns false', () => {
      expect(canRoleSeeSettingsTab('SOFTWARE_ADMIN', null)).toBe(false);
    });
    
    test('Undefined tabKey → always returns false', () => {
      expect(canRoleSeeSettingsTab('SOFTWARE_ADMIN', undefined)).toBe(false);
    });
    
    test('Invalid tabKey → always returns false', () => {
      expect(canRoleSeeSettingsTab('SOFTWARE_ADMIN', 'invalid_tab')).toBe(false);
    });
  });
  
  // ==========================================================================
  // COMPREHENSIVE MATRIX TEST
  // ==========================================================================
  
  describe('Comprehensive Tab Visibility Matrix', () => {
    const testMatrix = [
      // [role, tab, expected]
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.DEPARTMENTS, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.DOCTORS, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.PATIENTS, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.POLICY, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.TRAINING, true],
      ['SOFTWARE_ADMIN', SETTINGS_TAB_KEYS.USERS, true],
      
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.DEPARTMENTS, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.DOCTORS, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.PATIENTS, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.POLICY, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.TRAINING, true],
      ['COMPLAINT_SUPERVISOR', SETTINGS_TAB_KEYS.USERS, true],
      
      ['WORKER', SETTINGS_TAB_KEYS.DEPARTMENTS, false],
      ['WORKER', SETTINGS_TAB_KEYS.DOCTORS, true],
      ['WORKER', SETTINGS_TAB_KEYS.PATIENTS, true],
      ['WORKER', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, false],
      ['WORKER', SETTINGS_TAB_KEYS.POLICY, false],
      ['WORKER', SETTINGS_TAB_KEYS.TRAINING, false],
      ['WORKER', SETTINGS_TAB_KEYS.USERS, false],
      
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.DEPARTMENTS, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.DOCTORS, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.PATIENTS, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.POLICY, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.TRAINING, false],
      ['ADMINISTRATION_ADMIN', SETTINGS_TAB_KEYS.USERS, false],
      
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.DEPARTMENTS, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.DOCTORS, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.PATIENTS, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.POLICY, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.TRAINING, false],
      ['DEPARTMENT_ADMIN', SETTINGS_TAB_KEYS.USERS, false],
      
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.DEPARTMENTS, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.DOCTORS, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.PATIENTS, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.POLICY, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.TRAINING, false],
      ['SECTION_ADMIN', SETTINGS_TAB_KEYS.USERS, false],
    ];
    
    test.each(testMatrix)(
      '%s → %s = %s',
      (role, tab, expected) => {
        const result = canRoleSeeSettingsTab(role, tab);
        expect(result).toBe(expected);
      }
    );
  });
});
