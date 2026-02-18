/**
 * PHASE J - TASK J-7 - RESTRICTED ROLE PAGE HIDING TESTS
 * 
 * Verify that ADMINISTRATION_ADMIN, DEPARTMENT_ADMIN, and SECTION_ADMIN roles
 * (the "3 monkeys") cannot see or access restricted pages.
 * 
 * ALLOWED PAGES:
 * - dashboard, inbox, follow_up, trend_monitoring, critical_issues
 * 
 * RESTRICTED PAGES (MUST BE BLOCKED):
 * - reporting, investigation, history, insight, table_view, insert_record, drawer_notes, settings
 */

import { 
  canViewDashboard,
  canViewInbox,
  canViewFollowUp,
  canViewTrendMonitoring,
  canViewCriticalIssues,
  canViewReporting,
  canViewInvestigation,
  canViewPersonReporting,
  canViewInsight,
  canViewTableView,
  canViewInsertRecord,
  canAccessDrawerNotes,
  canViewSettings,
  canAccessMigration
} from '../utils/roleGuards';

// ============================================================================
// TEST FIXTURES - The "3 monkeys" roles
// ============================================================================

const restrictedRoles = [
  'ADMINISTRATION_ADMIN',
  'DEPARTMENT_ADMIN', 
  'SECTION_ADMIN'
];

const createUserWithRole = (role) => ({
  username: `test_${role.toLowerCase()}`,
  roles: [role],
  user_id: 999
});

// ============================================================================
// TEST 1 - ALLOWED PAGES VISIBILITY
// ============================================================================

describe('PHASE J-7 - Restricted Roles Can Access ALLOWED Pages', () => {
  describe.each(restrictedRoles)('%s role', (role) => {
    const user = createUserWithRole(role);

    test('CAN view Dashboard', () => {
      expect(canViewDashboard(user)).toBe(true);
    });

    test('CAN view Inbox', () => {
      expect(canViewInbox(user)).toBe(true);
    });

    test('CAN view Follow-Up', () => {
      expect(canViewFollowUp(user)).toBe(true);
    });

    test('CAN view Trend Monitoring', () => {
      expect(canViewTrendMonitoring(user)).toBe(true);
    });

    test('CAN view Critical Issues', () => {
      expect(canViewCriticalIssues(user)).toBe(true);
    });
  });
});

// ============================================================================
// TEST 2 - RESTRICTED PAGES BLOCKED
// ============================================================================

describe('PHASE J-7 - Restricted Roles CANNOT Access RESTRICTED Pages', () => {
  describe.each(restrictedRoles)('%s role', (role) => {
    const user = createUserWithRole(role);

    test('CANNOT view Reporting', () => {
      expect(canViewReporting(user)).toBe(false);
    });

    test('CANNOT view Investigation', () => {
      expect(canViewInvestigation(user)).toBe(false);
    });

    test('CANNOT view History (Person Reporting)', () => {
      expect(canViewPersonReporting(user)).toBe(false);
    });

    test('CANNOT view Insight', () => {
      expect(canViewInsight(user)).toBe(false);
    });

    test('CANNOT view Table View', () => {
      expect(canViewTableView(user)).toBe(false);
    });

    test('CANNOT view Insert Record', () => {
      expect(canViewInsertRecord(user)).toBe(false);
    });

    test('CANNOT access Drawer Notes', () => {
      expect(canAccessDrawerNotes(user)).toBe(false);
    });

    test('CANNOT view Settings', () => {
      expect(canViewSettings(user)).toBe(false);
    });

    test('CANNOT access Data Migration', () => {
      expect(canAccessMigration(user)).toBe(false);
    });
  });
});

// ============================================================================
// TEST 3 - COMPREHENSIVE ACCESS MATRIX
// ============================================================================

describe('PHASE J-7 - Comprehensive Access Matrix', () => {
  const allPages = [
    { name: 'Dashboard', guard: canViewDashboard, allowed: true },
    { name: 'Inbox', guard: canViewInbox, allowed: true },
    { name: 'Follow-Up', guard: canViewFollowUp, allowed: true },
    { name: 'Trend Monitoring', guard: canViewTrendMonitoring, allowed: true },
    { name: 'Critical Issues', guard: canViewCriticalIssues, allowed: true },
    { name: 'Reporting', guard: canViewReporting, allowed: false },
    { name: 'Investigation', guard: canViewInvestigation, allowed: false },
    { name: 'History', guard: canViewPersonReporting, allowed: false },
    { name: 'Insight', guard: canViewInsight, allowed: false },
    { name: 'Table View', guard: canViewTableView, allowed: false },
    { name: 'Insert Record', guard: canViewInsertRecord, allowed: false },
    { name: 'Drawer Notes', guard: canAccessDrawerNotes, allowed: false },
    { name: 'Settings', guard: canViewSettings, allowed: false },
    { name: 'Data Migration', guard: canAccessMigration, allowed: false }
  ];

  test.each(restrictedRoles)('%s - all pages match expected access', (role) => {
    const user = createUserWithRole(role);
    
    allPages.forEach(page => {
      const hasAccess = page.guard(user);
      expect(hasAccess).toBe(page.allowed);
      
      // Log for audit trail
      if (hasAccess !== page.allowed) {
        console.error(`❌ ${role} → ${page.name}: expected ${page.allowed}, got ${hasAccess}`);
      }
    });
  });
});

// ============================================================================
// TEST 4 - EDGE CASES
// ============================================================================

describe('PHASE J-7 - Edge Cases for Restricted Roles', () => {
  test('Null user blocked from all restricted pages', () => {
    expect(canViewReporting(null)).toBe(false);
    expect(canViewInvestigation(null)).toBe(false);
    expect(canViewPersonReporting(null)).toBe(false);
    expect(canViewInsight(null)).toBe(false);
    expect(canViewTableView(null)).toBe(false);
    expect(canViewInsertRecord(null)).toBe(false);
    expect(canAccessDrawerNotes(null)).toBe(false);
    expect(canViewSettings(null)).toBe(false);
  });

  test('Undefined user blocked from all restricted pages', () => {
    expect(canViewReporting(undefined)).toBe(false);
    expect(canViewInvestigation(undefined)).toBe(false);
    expect(canViewPersonReporting(undefined)).toBe(false);
    expect(canViewInsight(undefined)).toBe(false);
    expect(canViewTableView(undefined)).toBe(false);
    expect(canViewInsertRecord(undefined)).toBe(false);
    expect(canAccessDrawerNotes(undefined)).toBe(false);
    expect(canViewSettings(undefined)).toBe(false);
  });

  test('User with empty roles array blocked from all restricted pages', () => {
    const user = { roles: [] };
    expect(canViewReporting(user)).toBe(false);
    expect(canViewInvestigation(user)).toBe(false);
    expect(canViewPersonReporting(user)).toBe(false);
    expect(canViewInsight(user)).toBe(false);
    expect(canViewTableView(user)).toBe(false);
    expect(canViewInsertRecord(user)).toBe(false);
    expect(canAccessDrawerNotes(user)).toBe(false);
    expect(canViewSettings(user)).toBe(false);
  });

  test('User with multiple roles (restricted role first) respects first role', () => {
    const user = { roles: ['ADMINISTRATION_ADMIN', 'SOFTWARE_ADMIN'] };
    // Should use first role (ADMINISTRATION_ADMIN) per Phase J convention
    expect(canViewReporting(user)).toBe(false);
    expect(canViewSettings(user)).toBe(false);
  });
});

// ============================================================================
// TEST 5 - SIDEBAR VISIBILITY SIMULATION
// ============================================================================

describe('PHASE J-7 - Sidebar Menu Visibility', () => {
  const menuItems = [
    { name: '📊 Dashboard', path: '/', guard: canViewDashboard, shouldShow: true },
    { name: '📥 Inbox', path: '/inbox', guard: canViewInbox, shouldShow: true },
    { name: '📋 Follow Up', path: '/follow-up', guard: canViewFollowUp, shouldShow: true },
    { name: '💡 Insight', path: '/insight', guard: canViewInsight, shouldShow: false },
    { name: '📊 Reporting', path: '/reporting', guard: canViewReporting, shouldShow: false },
    { name: '🔍 Investigation', path: '/investigation', guard: canViewInvestigation, shouldShow: false },
    { name: '📈 Trend Monitoring', path: '/trend-monitoring', guard: canViewTrendMonitoring, shouldShow: true },
    { name: '📋 Table View', path: '/table-view', guard: canViewTableView, shouldShow: false },
    { name: '➕ Insert Record', path: '/insert', guard: canViewInsertRecord, shouldShow: false },
    { name: '📋 History', path: '/history', guard: canViewPersonReporting, shouldShow: false },
    { name: '📝 Drawer Notes', path: '/drawer-notes', guard: canAccessDrawerNotes, shouldShow: false },
    { name: '🚩 Critical Issues', path: '/critical-issues', guard: canViewCriticalIssues, shouldShow: true },
    { name: '🔄 Data Migration', path: '/migration', guard: canAccessMigration, shouldShow: false },
    { name: '⚙️ Settings', path: '/settings', guard: canViewSettings, shouldShow: false }
  ];

  test.each(restrictedRoles)('%s - sees correct sidebar menu items', (role) => {
    const user = createUserWithRole(role);
    
    const visibleItems = menuItems.filter(item => item.guard(user));
    const expectedItems = menuItems.filter(item => item.shouldShow);
    
    expect(visibleItems.length).toBe(expectedItems.length);
    
    // Verify each menu item visibility matches expected
    menuItems.forEach(item => {
      const isVisible = item.guard(user);
      expect(isVisible).toBe(item.shouldShow);
    });
  });

  test.each(restrictedRoles)('%s - MUST SEE exactly 5 menu items', (role) => {
    const user = createUserWithRole(role);
    const visibleCount = menuItems.filter(item => item.guard(user)).length;
    expect(visibleCount).toBe(5); // dashboard, inbox, follow-up, trend-monitoring, critical-issues
  });
});

// ============================================================================
// TEST 6 - SUPER ROLES STILL HAVE FULL ACCESS
// ============================================================================

describe('PHASE J-7 - Super Roles Unaffected', () => {
  const superRoles = ['SOFTWARE_ADMIN', 'COMPLAINT_SUPERVISOR'];
  
  test.each(superRoles)('%s - can access ALL pages', (role) => {
    const user = createUserWithRole(role);
    
    // All restricted pages should be accessible to super roles
    expect(canViewReporting(user)).toBe(true);
    expect(canViewInvestigation(user)).toBe(true);
    expect(canViewPersonReporting(user)).toBe(true);
    expect(canViewInsight(user)).toBe(true);
    expect(canViewTableView(user)).toBe(true);
    expect(canViewInsertRecord(user)).toBe(true);
    expect(canAccessDrawerNotes(user)).toBe(true);
    expect(canViewSettings(user)).toBe(true);
    expect(canAccessMigration(user)).toBe(true);
    
    // And allowed pages too
    expect(canViewDashboard(user)).toBe(true);
    expect(canViewInbox(user)).toBe(true);
    expect(canViewFollowUp(user)).toBe(true);
    expect(canViewTrendMonitoring(user)).toBe(true);
    expect(canViewCriticalIssues(user)).toBe(true);
  });
});

// ============================================================================
// TEST 7 - WORKER ROLE ACCESS
// ============================================================================

describe('PHASE J-7 - Worker Role Access', () => {
  const user = createUserWithRole('WORKER');
  
  test('WORKER can access operational pages', () => {
    expect(canViewReporting(user)).toBe(true);
    expect(canViewInvestigation(user)).toBe(true);
    expect(canViewPersonReporting(user)).toBe(true);
    expect(canViewInsight(user)).toBe(true);
    expect(canViewTableView(user)).toBe(true);
    expect(canViewInsertRecord(user)).toBe(true);
    expect(canAccessDrawerNotes(user)).toBe(true);
    expect(canAccessMigration(user)).toBe(true);
  });

  test('WORKER CANNOT access Settings', () => {
    expect(canViewSettings(user)).toBe(false);
  });
});

// ============================================================================
// TEST 8 - PHASE J CONTRACT VERIFICATION
// ============================================================================

describe('PHASE J-7 - Contract Verification', () => {
  test('Contract: ADMINISTRATION_ADMIN has exactly 5 allowed pages', () => {
    const user = createUserWithRole('ADMINISTRATION_ADMIN');
    const guardFunctions = [
      canViewDashboard, canViewInbox, canViewFollowUp, canViewTrendMonitoring,
      canViewCriticalIssues, canViewReporting, canViewInvestigation,
      canViewPersonReporting, canViewInsight, canViewTableView, canViewInsertRecord,
      canAccessDrawerNotes, canViewSettings, canAccessMigration
    ];
    
    const accessiblePages = guardFunctions.filter(guard => guard(user));
    expect(accessiblePages.length).toBe(5);
  });

  test('Contract: DEPARTMENT_ADMIN has exactly 5 allowed pages', () => {
    const user = createUserWithRole('DEPARTMENT_ADMIN');
    const guardFunctions = [
      canViewDashboard, canViewInbox, canViewFollowUp, canViewTrendMonitoring,
      canViewCriticalIssues, canViewReporting, canViewInvestigation,
      canViewPersonReporting, canViewInsight, canViewTableView, canViewInsertRecord,
      canAccessDrawerNotes, canViewSettings, canAccessMigration
    ];
    
    const accessiblePages = guardFunctions.filter(guard => guard(user));
    expect(accessiblePages.length).toBe(5);
  });

  test('Contract: SECTION_ADMIN has exactly 5 allowed pages', () => {
    const user = createUserWithRole('SECTION_ADMIN');
    const guardFunctions = [
      canViewDashboard, canViewInbox, canViewFollowUp, canViewTrendMonitoring,
      canViewCriticalIssues, canViewReporting, canViewInvestigation,
      canViewPersonReporting, canViewInsight, canViewTableView, canViewInsertRecord,
      canAccessDrawerNotes, canViewSettings, canAccessMigration
    ];
    
    const accessiblePages = guardFunctions.filter(guard => guard(user));
    expect(accessiblePages.length).toBe(5);
  });

  test('Contract: Restricted roles have ZERO access to Settings', () => {
    restrictedRoles.forEach(role => {
      const user = createUserWithRole(role);
      expect(canViewSettings(user)).toBe(false);
    });
  });

  test('Contract: Restricted roles have ZERO access to administrative pages', () => {
    restrictedRoles.forEach(role => {
      const user = createUserWithRole(role);
      expect(canViewInsertRecord(user)).toBe(false);
      expect(canViewTableView(user)).toBe(false);
      expect(canAccessDrawerNotes(user)).toBe(false);
    });
  });
});

// ============================================================================
// TEST 9 - REGRESSION TESTS
// ============================================================================

describe('PHASE J-7 - Regression Tests', () => {
  test('No role should bypass guard system', () => {
    const unknownRoleUser = { roles: ['UNKNOWN_ROLE'] };
    
    // Unknown roles should be blocked from all restricted pages
    expect(canViewReporting(unknownRoleUser)).toBe(false);
    expect(canViewInvestigation(unknownRoleUser)).toBe(false);
    expect(canViewPersonReporting(unknownRoleUser)).toBe(false);
    expect(canViewInsight(unknownRoleUser)).toBe(false);
    expect(canViewTableView(unknownRoleUser)).toBe(false);
    expect(canViewInsertRecord(unknownRoleUser)).toBe(false);
    expect(canAccessDrawerNotes(unknownRoleUser)).toBe(false);
    expect(canViewSettings(unknownRoleUser)).toBe(false);
  });

  test('All guard functions handle null/undefined gracefully', () => {
    const guards = [
      canViewDashboard, canViewInbox, canViewFollowUp, canViewReporting,
      canViewInvestigation, canViewPersonReporting, canViewInsight,
      canViewTableView, canViewInsertRecord, canViewTrendMonitoring,
      canViewSettings, canViewCriticalIssues, canAccessDrawerNotes,
      canAccessMigration
    ];
    
    guards.forEach(guard => {
      expect(() => guard(null)).not.toThrow();
      expect(() => guard(undefined)).not.toThrow();
      expect(guard(null)).toBe(false);
      expect(guard(undefined)).toBe(false);
    });
  });
});
