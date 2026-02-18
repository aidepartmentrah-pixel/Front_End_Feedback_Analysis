/**
 * PHASE J — TASK J-9 — ROLE VISIBILITY TEST HARNESS
 * 
 * Dev-only test module that validates Phase J role visibility rules
 * using the central visibility map and guard helpers.
 * 
 * NO UI RENDERING - Console output only
 * Pure JS module
 */

// ============================================================================
// IMPORTS
// ============================================================================

import {
  canRoleSeePage,
  canRoleSeeSettingsTab,
  PAGE_KEYS,
  SETTINGS_TAB_KEYS,
  ROLES,
} from './roleVisibilityMap';

import {
  canViewInsight,
  canViewInbox,
  canViewFollowUp,
  canViewPersonReporting,
  canAccessDrawerNotes,
  isSoftwareAdmin,
} from '../utils/roleGuards';

// ============================================================================
// TEST DATA DEFINITIONS
// ============================================================================

/**
 * All roles to test
 */
const ALL_ROLES = [
  ROLES.SOFTWARE_ADMIN,
  ROLES.COMPLAINT_SUPERVISOR,
  ROLES.WORKER,
  ROLES.ADMINISTRATION_ADMIN,
  ROLES.DEPARTMENT_ADMIN,
  ROLES.SECTION_ADMIN,
];

/**
 * All page keys to test
 */
const ALL_PAGE_KEYS = [
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
  PAGE_KEYS.DATA_MIGRATION,
  PAGE_KEYS.SETTINGS,
  PAGE_KEYS.CRITICAL_ISSUES,
];

/**
 * All settings tab keys to test
 */
const ALL_SETTINGS_TAB_KEYS = [
  SETTINGS_TAB_KEYS.DEPARTMENTS,
  SETTINGS_TAB_KEYS.DOCTORS,
  SETTINGS_TAB_KEYS.PATIENTS,
  SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES,
  SETTINGS_TAB_KEYS.POLICY,
  SETTINGS_TAB_KEYS.TRAINING,
  SETTINGS_TAB_KEYS.USERS,
];

// ============================================================================
// EXPECTED CONTRACT TABLES
// ============================================================================

/**
 * Expected page visibility for SUPER ROLES (SOFTWARE_ADMIN, COMPLAINT_SUPERVISOR)
 * All pages should be TRUE
 */
const SUPER_ROLE_EXPECTED_PAGES = {
  [PAGE_KEYS.DASHBOARD]: true,
  [PAGE_KEYS.INBOX]: true,
  [PAGE_KEYS.FOLLOW_UP]: true,
  [PAGE_KEYS.INSIGHT]: true,
  [PAGE_KEYS.REPORTING]: true,
  [PAGE_KEYS.INVESTIGATION]: true,
  [PAGE_KEYS.TREND_MONITORING]: true,
  [PAGE_KEYS.TABLE_VIEW]: true,
  [PAGE_KEYS.INSERT_RECORD]: true,
  [PAGE_KEYS.HISTORY]: true,
  [PAGE_KEYS.DRAWER_NOTES]: true,
  [PAGE_KEYS.DATA_MIGRATION]: true,
  [PAGE_KEYS.SETTINGS]: true,
  [PAGE_KEYS.CRITICAL_ISSUES]: true,
};

/**
 * Expected page visibility for WORKER
 * All pages TRUE except SETTINGS
 */
const WORKER_EXPECTED_PAGES = {
  [PAGE_KEYS.DASHBOARD]: true,
  [PAGE_KEYS.INBOX]: true,
  [PAGE_KEYS.FOLLOW_UP]: true,
  [PAGE_KEYS.INSIGHT]: true,
  [PAGE_KEYS.REPORTING]: true,
  [PAGE_KEYS.INVESTIGATION]: true,
  [PAGE_KEYS.TREND_MONITORING]: true,
  [PAGE_KEYS.TABLE_VIEW]: true,
  [PAGE_KEYS.INSERT_RECORD]: true,
  [PAGE_KEYS.HISTORY]: true,
  [PAGE_KEYS.DRAWER_NOTES]: true,
  [PAGE_KEYS.DATA_MIGRATION]: true,
  [PAGE_KEYS.SETTINGS]: false, // ❌ WORKER cannot access settings
  [PAGE_KEYS.CRITICAL_ISSUES]: true,
};

/**
 * Expected page visibility for THREE MONKEYS (ADMINISTRATION_ADMIN, DEPARTMENT_ADMIN, SECTION_ADMIN)
 * Only 5 basic monitoring pages are TRUE
 */
const LIMITED_ADMIN_EXPECTED_PAGES = {
  [PAGE_KEYS.DASHBOARD]: true,
  [PAGE_KEYS.INBOX]: true,
  [PAGE_KEYS.FOLLOW_UP]: true,
  [PAGE_KEYS.INSIGHT]: false,
  [PAGE_KEYS.REPORTING]: false,
  [PAGE_KEYS.INVESTIGATION]: false,
  [PAGE_KEYS.TREND_MONITORING]: true,
  [PAGE_KEYS.TABLE_VIEW]: false,
  [PAGE_KEYS.INSERT_RECORD]: false,
  [PAGE_KEYS.HISTORY]: false,
  [PAGE_KEYS.DRAWER_NOTES]: false,
  [PAGE_KEYS.DATA_MIGRATION]: false,
  [PAGE_KEYS.SETTINGS]: false,
  [PAGE_KEYS.CRITICAL_ISSUES]: true,
};

/**
 * Expected settings tab visibility for SUPER ROLES
 * All tabs TRUE
 */
const SUPER_ROLE_EXPECTED_SETTINGS = {
  [SETTINGS_TAB_KEYS.DEPARTMENTS]: true,
  [SETTINGS_TAB_KEYS.DOCTORS]: true,
  [SETTINGS_TAB_KEYS.PATIENTS]: true,
  [SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES]: true,
  [SETTINGS_TAB_KEYS.POLICY]: true,
  [SETTINGS_TAB_KEYS.TRAINING]: true,
  [SETTINGS_TAB_KEYS.USERS]: true,
};

/**
 * Expected settings tab visibility for WORKER
 * Only Doctors and Patients tabs TRUE
 */
const WORKER_EXPECTED_SETTINGS = {
  [SETTINGS_TAB_KEYS.DEPARTMENTS]: false,
  [SETTINGS_TAB_KEYS.DOCTORS]: true,
  [SETTINGS_TAB_KEYS.PATIENTS]: true,
  [SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES]: false,
  [SETTINGS_TAB_KEYS.POLICY]: false,
  [SETTINGS_TAB_KEYS.TRAINING]: false,
  [SETTINGS_TAB_KEYS.USERS]: false,
};

/**
 * Expected settings tab visibility for THREE MONKEYS
 * All tabs FALSE
 */
const LIMITED_ADMIN_EXPECTED_SETTINGS = {
  [SETTINGS_TAB_KEYS.DEPARTMENTS]: false,
  [SETTINGS_TAB_KEYS.DOCTORS]: false,
  [SETTINGS_TAB_KEYS.PATIENTS]: false,
  [SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES]: false,
  [SETTINGS_TAB_KEYS.POLICY]: false,
  [SETTINGS_TAB_KEYS.TRAINING]: false,
  [SETTINGS_TAB_KEYS.USERS]: false,
};

/**
 * Get expected pages for a given role
 */
const getExpectedPagesForRole = (role) => {
  if (role === ROLES.SOFTWARE_ADMIN || role === ROLES.COMPLAINT_SUPERVISOR) {
    return SUPER_ROLE_EXPECTED_PAGES;
  }
  if (role === ROLES.WORKER) {
    return WORKER_EXPECTED_PAGES;
  }
  // THREE MONKEYS
  return LIMITED_ADMIN_EXPECTED_PAGES;
};

/**
 * Get expected settings tabs for a given role
 */
const getExpectedSettingsForRole = (role) => {
  if (role === ROLES.SOFTWARE_ADMIN || role === ROLES.COMPLAINT_SUPERVISOR) {
    return SUPER_ROLE_EXPECTED_SETTINGS;
  }
  if (role === ROLES.WORKER) {
    return WORKER_EXPECTED_SETTINGS;
  }
  // THREE MONKEYS
  return LIMITED_ADMIN_EXPECTED_SETTINGS;
};

// ============================================================================
// TEST EXECUTION FUNCTIONS
// ============================================================================

/**
 * Test page visibility for all roles
 * @returns {Object} - { passed: number, failed: number, results: Array }
 */
const testPageVisibility = () => {
  console.log('\n' + '='.repeat(80));
  console.log('📄 TESTING PAGE VISIBILITY');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const role of ALL_ROLES) {
    const expectedPages = getExpectedPagesForRole(role);
    
    console.log(`\n🔹 ROLE: ${role}`);
    console.log('-'.repeat(80));
    
    for (const pageKey of ALL_PAGE_KEYS) {
      const expected = expectedPages[pageKey];
      const actual = canRoleSeePage(role, pageKey);
      const status = expected === actual ? '✅ PASS' : '❌ FAIL';
      
      if (expected === actual) {
        passed++;
      } else {
        failed++;
      }
      
      console.log(
        `${role.padEnd(25)} | ${pageKey.padEnd(20)} | Expected: ${String(expected).padEnd(5)} | Actual: ${String(actual).padEnd(5)} | ${status}`
      );
      
      results.push({
        role,
        pageKey,
        expected,
        actual,
        passed: expected === actual,
      });
    }
  }
  
  return { passed, failed, results };
};

/**
 * Test settings tab visibility for all roles
 * @returns {Object} - { passed: number, failed: number, results: Array }
 */
const testSettingsTabVisibility = () => {
  console.log('\n' + '='.repeat(80));
  console.log('⚙️  TESTING SETTINGS TAB VISIBILITY');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const role of ALL_ROLES) {
    const expectedSettings = getExpectedSettingsForRole(role);
    
    console.log(`\n🔹 ROLE: ${role}`);
    console.log('-'.repeat(80));
    
    for (const tabKey of ALL_SETTINGS_TAB_KEYS) {
      const expected = expectedSettings[tabKey];
      const actual = canRoleSeeSettingsTab(role, tabKey);
      const status = expected === actual ? '✅ PASS' : '❌ FAIL';
      
      if (expected === actual) {
        passed++;
      } else {
        failed++;
      }
      
      console.log(
        `${role.padEnd(25)} | ${tabKey.padEnd(20)} | Expected: ${String(expected).padEnd(5)} | Actual: ${String(actual).padEnd(5)} | ${status}`
      );
      
      results.push({
        role,
        tabKey,
        expected,
        actual,
        passed: expected === actual,
      });
    }
  }
  
  return { passed, failed, results };
};

/**
 * Test guard helper functions
 * @returns {Object} - { passed: number, failed: number, results: Array }
 */
const testGuardHelpers = () => {
  console.log('\n' + '='.repeat(80));
  console.log('🛡️  TESTING GUARD HELPER FUNCTIONS');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  // Test helper functions with mock user objects
  const testCases = [
    // canViewInsight - should match PAGE_KEYS.INSIGHT
    {
      guardName: 'canViewInsight',
      guardFunction: canViewInsight,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'canViewInsight',
      guardFunction: canViewInsight,
      role: ROLES.WORKER,
      expected: true,
    },
    {
      guardName: 'canViewInsight',
      guardFunction: canViewInsight,
      role: ROLES.ADMINISTRATION_ADMIN,
      expected: false, // Limited admin - no insight
    },
    
    // canViewInbox - should match PAGE_KEYS.INBOX
    {
      guardName: 'canViewInbox',
      guardFunction: canViewInbox,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'canViewInbox',
      guardFunction: canViewInbox,
      role: ROLES.WORKER,
      expected: true,
    },
    {
      guardName: 'canViewInbox',
      guardFunction: canViewInbox,
      role: ROLES.SECTION_ADMIN,
      expected: true, // Limited admin - has inbox
    },
    
    // canViewFollowUp - should match PAGE_KEYS.FOLLOW_UP
    {
      guardName: 'canViewFollowUp',
      guardFunction: canViewFollowUp,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'canViewFollowUp',
      guardFunction: canViewFollowUp,
      role: ROLES.WORKER,
      expected: true,
    },
    {
      guardName: 'canViewFollowUp',
      guardFunction: canViewFollowUp,
      role: ROLES.DEPARTMENT_ADMIN,
      expected: true, // Limited admin - has follow_up
    },
    
    // canViewPersonReporting - should match PAGE_KEYS.HISTORY
    {
      guardName: 'canViewPersonReporting',
      guardFunction: canViewPersonReporting,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'canViewPersonReporting',
      guardFunction: canViewPersonReporting,
      role: ROLES.WORKER,
      expected: true,
    },
    {
      guardName: 'canViewPersonReporting',
      guardFunction: canViewPersonReporting,
      role: ROLES.ADMINISTRATION_ADMIN,
      expected: false, // Limited admin - no history
    },
    
    // canAccessDrawerNotes - should match PAGE_KEYS.DRAWER_NOTES
    {
      guardName: 'canAccessDrawerNotes',
      guardFunction: canAccessDrawerNotes,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'canAccessDrawerNotes',
      guardFunction: canAccessDrawerNotes,
      role: ROLES.WORKER,
      expected: true,
    },
    {
      guardName: 'canAccessDrawerNotes',
      guardFunction: canAccessDrawerNotes,
      role: ROLES.SECTION_ADMIN,
      expected: false, // Limited admin - no drawer notes
    },
    
    // isSoftwareAdmin - direct role check
    {
      guardName: 'isSoftwareAdmin',
      guardFunction: isSoftwareAdmin,
      role: ROLES.SOFTWARE_ADMIN,
      expected: true,
    },
    {
      guardName: 'isSoftwareAdmin',
      guardFunction: isSoftwareAdmin,
      role: ROLES.COMPLAINT_SUPERVISOR,
      expected: false,
    },
    {
      guardName: 'isSoftwareAdmin',
      guardFunction: isSoftwareAdmin,
      role: ROLES.WORKER,
      expected: false,
    },
  ];
  
  console.log('\n🔹 GUARD HELPER TESTS');
  console.log('-'.repeat(80));
  
  for (const testCase of testCases) {
    const mockUser = { roles: [testCase.role] };
    const actual = testCase.guardFunction(mockUser);
    const status = testCase.expected === actual ? '✅ PASS' : '❌ FAIL';
    
    if (testCase.expected === actual) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(
      `${testCase.guardName.padEnd(30)} | ${testCase.role.padEnd(25)} | Expected: ${String(testCase.expected).padEnd(5)} | Actual: ${String(actual).padEnd(5)} | ${status}`
    );
    
    results.push({
      guardName: testCase.guardName,
      role: testCase.role,
      expected: testCase.expected,
      actual,
      passed: testCase.expected === actual,
    });
  }
  
  return { passed, failed, results };
};

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

/**
 * Run all Phase J visibility tests
 * Console output only - no UI rendering
 * 
 * SUCCESS CRITERIA: Total FAIL rows = 0
 * 
 * @returns {Object} - { totalPassed: number, totalFailed: number, allResults: Object }
 */
export const runPhaseJVisibilityTests = () => {
  console.log('\n' + '█'.repeat(80));
  console.log('🚀 PHASE J — TASK J-9 — ROLE VISIBILITY CERTIFICATION TEST');
  console.log('█'.repeat(80));
  console.log(`\nTesting ${ALL_ROLES.length} roles × ${ALL_PAGE_KEYS.length} pages = ${ALL_ROLES.length * ALL_PAGE_KEYS.length} page visibility tests`);
  console.log(`Testing ${ALL_ROLES.length} roles × ${ALL_SETTINGS_TAB_KEYS.length} settings tabs = ${ALL_ROLES.length * ALL_SETTINGS_TAB_KEYS.length} settings tab tests`);
  console.log(`Testing guard helper functions...`);
  
  // Run all test suites
  const pageResults = testPageVisibility();
  const settingsResults = testSettingsTabVisibility();
  const guardResults = testGuardHelpers();
  
  // Calculate totals
  const totalPassed = pageResults.passed + settingsResults.passed + guardResults.passed;
  const totalFailed = pageResults.failed + settingsResults.failed + guardResults.failed;
  const totalTests = totalPassed + totalFailed;
  
  // Print summary
  console.log('\n' + '█'.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('█'.repeat(80));
  console.log(`\n✅ PASSED: ${totalPassed}/${totalTests}`);
  console.log(`❌ FAILED: ${totalFailed}/${totalTests}`);
  console.log(`\n📄 Page Visibility Tests: ${pageResults.passed} passed, ${pageResults.failed} failed`);
  console.log(`⚙️  Settings Tab Tests: ${settingsResults.passed} passed, ${settingsResults.failed} failed`);
  console.log(`🛡️  Guard Helper Tests: ${guardResults.passed} passed, ${guardResults.failed} failed`);
  
  if (totalFailed === 0) {
    console.log('\n' + '🎉'.repeat(40));
    console.log('✅ ALL TESTS PASSED - PHASE J-9 COMPLETE!');
    console.log('🎉'.repeat(40) + '\n');
  } else {
    console.log('\n' + '❌'.repeat(40));
    console.log(`⚠️  ${totalFailed} TESTS FAILED - REVIEW AND FIX`);
    console.log('❌'.repeat(40) + '\n');
    
    // Print failed tests
    console.log('\n🔴 FAILED TESTS:');
    console.log('-'.repeat(80));
    
    // Failed page tests
    const failedPageTests = pageResults.results.filter(r => !r.passed);
    if (failedPageTests.length > 0) {
      console.log('\n📄 Failed Page Visibility Tests:');
      failedPageTests.forEach(r => {
        console.log(`  ❌ ${r.role} → ${r.pageKey}: Expected ${r.expected}, got ${r.actual}`);
      });
    }
    
    // Failed settings tests
    const failedSettingsTests = settingsResults.results.filter(r => !r.passed);
    if (failedSettingsTests.length > 0) {
      console.log('\n⚙️  Failed Settings Tab Tests:');
      failedSettingsTests.forEach(r => {
        console.log(`  ❌ ${r.role} → ${r.tabKey}: Expected ${r.expected}, got ${r.actual}`);
      });
    }
    
    // Failed guard tests
    const failedGuardTests = guardResults.results.filter(r => !r.passed);
    if (failedGuardTests.length > 0) {
      console.log('\n🛡️  Failed Guard Helper Tests:');
      failedGuardTests.forEach(r => {
        console.log(`  ❌ ${r.guardName}(${r.role}): Expected ${r.expected}, got ${r.actual}`);
      });
    }
  }
  
  return {
    totalPassed,
    totalFailed,
    totalTests,
    allResults: {
      pageResults,
      settingsResults,
      guardResults,
    },
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export default runPhaseJVisibilityTests;
