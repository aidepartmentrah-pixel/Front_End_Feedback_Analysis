/**
 * PHASE J — TASK J-3 — SIDEBAR VISIBILITY TEST
 * 
 * Comprehensive test suite for Sidebar menu visibility contracts
 * Tests guard functions directly against the Phase J visibility contract
 * without rendering the full component (to avoid axios import issues)
 */

import { 
  canViewInbox,
  canViewFollowUp,
  canViewInsight,
  canViewPersonReporting,
  canAccessDrawerNotes,
  canAccessMigration 
} from '../../../utils/roleGuards';
import { canRoleSeePage, PAGE_KEYS } from '../../../security/roleVisibilityMap';

describe('PHASE J — Sidebar Visibility Contract Tests', () => {
  
  // ============================================================================
  // TEST USER OBJECTS
  //============================================================================
  
  const softwareAdmin = { roles: ['SOFTWARE_ADMIN'] };
  const complaintSupervisor = { roles: ['COMPLAINT_SUPERVISOR'] };
  const worker = { roles: ['WORKER'] };
  const adminAdmin = { roles: ['ADMINISTRATION_ADMIN'] };
  const deptAdmin = { roles: ['DEPARTMENT_ADMIN'] };
  const sectionAdmin = { roles: ['SECTION_ADMIN'] };
  
  // ============================================================================
  // HELPER FUNCTIONS TO SIMULATE SIDEBAR GUARDS
  // ============================================================================
  
  /**
   * Get primary role (matches Sidebar and roleGuards convention)
   */
  const getPrimaryRole = (user) => {
    if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return null;
    }
    return user.roles[0];
  };
  
  /**
   * Sidebar guard wrappers (matching actual Sidebar implementation)
   */
  const sidebarGuards = {
    canViewDashboard: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.DASHBOARD);
    },
    canViewInbox: canViewInbox,
    canViewFollowUp: canViewFollowUp,
    canViewInsight: canViewInsight,
    canViewReporting: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.REPORTING);
    },
    canViewInvestigation: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.INVESTIGATION);
    },
    canViewTrendMonitoring: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.TREND_MONITORING);
    },
    canViewTableView: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.TABLE_VIEW);
    },
    canViewInsertRecord: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.INSERT_RECORD);
    },
    canViewHistory: canViewPersonReporting,
    canViewDrawerNotes: canAccessDrawerNotes,
    canViewCriticalIssues: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.CRITICAL_ISSUES);
    },
    canViewMigration: canAccessMigration,
    canViewSettings: (user) => {
      const role = getPrimaryRole(user);
      if (!role) return false;
      return canRoleSeePage(role, PAGE_KEYS.SETTINGS);
    }
  };
  
  /**
   * Get visible menu items for a user based on sidebar guards
   */
  const getVisibleMenuItems = (user) => {
    const menuItems = {
      'dashboard': sidebarGuards.canViewDashboard,
      'inbox': sidebarGuards.canViewInbox,
      'follow-up': sidebarGuards.canViewFollowUp,
      'insight': sidebarGuards.canViewInsight,
      'reporting': sidebarGuards.canViewReporting,
      'investigation': sidebarGuards.canViewInvestigation,
      'trend-monitoring': sidebarGuards.canViewTrendMonitoring,
      'table-view': sidebarGuards.canViewTableView,
      'insert': sidebarGuards.canViewInsertRecord,
      'history': sidebarGuards.canViewHistory,
      'drawer-notes': sidebarGuards.canViewDrawerNotes,
      'critical-issues': sidebarGuards.canViewCriticalIssues,
      'migration': sidebarGuards.canViewMigration,
      'settings': sidebarGuards.canViewSettings
    };
    
    const visible = [];
    Object.entries(menuItems).forEach(([key, guardFn]) => {
      if (guardFn(user)) {
        visible.push(key);
      }
    });
    
    return visible;
  };
  
  // ============================================================================
  // SOFTWARE_ADMIN TESTS
  // ============================================================================
  
  describe('SOFTWARE_ADMIN Visibility', () => {
    test('should see all menu items', () => {
      const visible = getVisibleMenuItems(softwareAdmin);
      
      const expected = [
        'dashboard', 'inbox', 'follow-up', 'insight', 'reporting',
        'investigation', 'trend-monitoring', 'table-view', 'insert',
        'history', 'drawer-notes', 'critical-issues', 'migration', 'settings'
      ];
      
      expected.forEach(item => {
        expect(visible).toContain(item);
      });
      
      expect(visible.length).toBe(expected.length);
    });
  });
  
  // ============================================================================
  // COMPLAINT_SUPERVISOR TESTS
  // ============================================================================
  
  describe('COMPLAINT_SUPERVISOR Visibility', () => {
    test('should see all menu items (same as SOFTWARE_ADMIN)', () => {
      const visible = getVisibleMenuItems(complaintSupervisor);
      
      const expected = [
        'dashboard', 'inbox', 'follow-up', 'insight', 'reporting',
        'investigation', 'trend-monitoring', 'table-view', 'insert',
        'history', 'drawer-notes', 'critical-issues', 'migration', 'settings'
      ];
      
      expected.forEach(item => {
        expect(visible).toContain(item);
      });
      
      expect(visible.length).toBe(expected.length);
    });
  });
  
  // ============================================================================
  // WORKER TESTS
  // ============================================================================
  
  describe('WORKER Visibility', () => {
    test('should see all operational pages but NOT settings', () => {
      const visible = getVisibleMenuItems(worker);
      
      const shouldSee = [
        'dashboard', 'inbox', 'follow-up', 'insight', 'reporting',
        'investigation', 'trend-monitoring', 'table-view', 'insert',
        'history', 'drawer-notes', 'critical-issues', 'migration'
      ];
      
      const shouldNotSee = ['settings'];
      
      shouldSee.forEach(item => {
        expect(visible).toContain(item);
      });
      
      shouldNotSee.forEach(item => {
        expect(visible).not.toContain(item);
      });
      
      expect(visible.length).toBe(shouldSee.length);
    });
  });
  
  // ============================================================================
  // THREE MONKEYS TESTS
  // ============================================================================
  
  describe('ADMINISTRATION_ADMIN Visibility (Three Monkeys)', () => {
    test('should see only basic monitoring pages', () => {
      const visible = getVisibleMenuItems(adminAdmin);
      
      const shouldSee = [
        'dashboard', 'inbox', 'follow-up', 'trend-monitoring', 'critical-issues'
      ];
      
      const shouldNotSee = [
        'insight', 'reporting', 'investigation', 'table-view', 'insert',
        'history', 'drawer-notes', 'migration', 'settings'
      ];
      
      shouldSee.forEach(item => {
        expect(visible).toContain(item);
      });
      
      shouldNotSee.forEach(item => {
        expect(visible).not.toContain(item);
      });
      
      expect(visible.length).toBe(shouldSee.length);
    });
  });
  
  describe('DEPARTMENT_ADMIN Visibility (Three Monkeys)', () => {
    test('should have same visibility as ADMINISTRATION_ADMIN', () => {
      const visibleAdmin = getVisibleMenuItems(adminAdmin);
      const visibleDept = getVisibleMenuItems(deptAdmin);
      
      expect(visibleDept).toEqual(visibleAdmin);
    });
  });
  
  describe('SECTION_ADMIN Visibility (Three Monkeys)', () => {
    test('should have same visibility as ADMINISTRATION_ADMIN', () => {
      const visibleAdmin = getVisibleMenuItems(adminAdmin);
      const visibleSection = getVisibleMenuItems(sectionAdmin);
      
      expect(visibleSection).toEqual(visibleAdmin);
    });
  });
  
  // ============================================================================
  // COMPREHENSIVE TEST TABLE OUTPUT
  // ============================================================================
  
  describe('Comprehensive Visibility Matrix', () => {
    test('Print complete visibility table for all roles', () => {
      console.log('\n');
      console.log('='.repeat(100));
      console.log('PHASE J — TASK J-3 — SIDEBAR VISIBILITY TEST RESULTS');
      console.log('='.repeat(100));
      console.log('\n');
      
      const roles = [
        { name: 'SOFTWARE_ADMIN', user: softwareAdmin },
        { name: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor },
        { name: 'WORKER', user: worker },
        { name: 'ADMINISTRATION_ADMIN', user: adminAdmin },
        { name: 'DEPARTMENT_ADMIN', user: deptAdmin },
        { name: 'SECTION_ADMIN', user: sectionAdmin }
      ];
      
      const menuItems = [
        'dashboard', 'inbox', 'follow-up', 'insight', 'reporting',
        'investigation', 'trend-monitoring', 'table-view', 'insert',
        'history', 'drawer-notes', 'critical-issues', 'migration', 'settings'
      ];
      
      // Expected visibility per role (Phase J contract)
      const expectedVisibility = {
        'SOFTWARE_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': true
        },
        'COMPLAINT_SUPERVISOR': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': true
        },
        'WORKER': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': false
        },
        'ADMINISTRATION_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        },
        'DEPARTMENT_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        },
        'SECTION_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        }
      };
      
      console.log('ROLE'.padEnd(25) + ' | ' + 'MENU ITEM'.padEnd(20) + ' | ' + 'EXPECTED'.padEnd(8) + ' | ' + 'ACTUAL'.padEnd(8) + ' | STATUS');
      console.log('-'.repeat(100));
      
      let passCount = 0;
      let failCount = 0;
      
      roles.forEach(({ name, user }) => {
        const visibleItems = getVisibleMenuItems(user);
        
        menuItems.forEach(item => {
          const expected = expectedVisibility[name][item];
          const actual = visibleItems.includes(item);
          const status = actual === expected ? '✅ PASS' : '❌ FAIL';
          
          if (actual === expected) {
            passCount++;
          } else {
            failCount++;
          }
          
          console.log(
            name.padEnd(25) + ' | ' +
            item.padEnd(20) + ' | ' +
            String(expected).padEnd(8) + ' | ' +
            String(actual).padEnd(8) + ' | ' +
            status
          );
        });
      });
      
      console.log('-'.repeat(100));
      console.log(`TOTAL: ${passCount}/${passCount + failCount} tests passed (${((passCount/(passCount + failCount))*100).toFixed(1)}%)`);
      console.log('='.repeat(100));
      console.log('\n');
      
      // All tests must pass
      expect(failCount).toBe(0);
    });
  });
});

  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Render sidebar with a specific user
   */
  const renderSidebarWithUser = (user) => {
    return render(
      <MockAuthProvider user={user}>
        <Sidebar />
      </MockAuthProvider>
    );
  };
  
  /**
   * Get visible menu items from rendered sidebar
   */
  const getVisibleMenuItems = () => {
    const menuItems = [];
    
    // All possible menu items with their display names
    const menuMap = {
      '📊 Dashboard': 'dashboard',
      '📥 Inbox': 'inbox',
      '📋 Follow Up': 'follow-up',
      '💡 Insight': 'insight',
      '📊 Reporting': 'reporting',
      '🔍 Investigation': 'investigation',
      '📈 Trend Monitoring': 'trend-monitoring',
      '📋 Table View': 'table-view',
      '➕ Insert Record': 'insert',
      '📋 History': 'history',
      '📝 Drawer Notes': 'drawer-notes',
      '🚩 Critical Issues': 'critical-issues',
      '🔄 Data Migration': 'migration',
      '⚙️ Settings': 'settings'
    };
    
    Object.entries(menuMap).forEach(([displayName, key]) => {
      try {
        screen.getByText(displayName);
        menuItems.push(key);
      } catch (e) {
        // Not visible
      }
    });
    
    return menuItems;
  };
  
  // ============================================================================
  // SOFTWARE_ADMIN TESTS
  // ============================================================================
  
  describe('SOFTWARE_ADMIN Visibility', () => {
    test('should see all menu items', () => {
      renderSidebarWithUser(softwareAdmin);
      
      const expectedItems = [
        'dashboard',
        'inbox',
        'follow-up',
        'insight',
        'reporting',
        'investigation',
        'trend-monitoring',
        'table-view',
        'insert',
        'history',
        'drawer-notes',
        'critical-issues',
        'migration',
        'settings'
      ];
      
      expectedItems.forEach(item => {
        expect(screen.queryByText(new RegExp(item.replace('-', ' '), 'i'))).toBeTruthy();
      });
    });
    
    test('should see Dashboard', () => {
      renderSidebarWithUser(softwareAdmin);
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
    });
    
    test('should see Settings', () => {
      renderSidebarWithUser(softwareAdmin);
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });
    
    test('should see Drawer Notes', () => {
      renderSidebarWithUser(softwareAdmin);
      expect(screen.getByText('📝 Drawer Notes')).toBeInTheDocument();
    });
  });
  
  // ============================================================================
  // COMPLAINT_SUPERVISOR TESTS
  // ============================================================================
  
  describe('COMPLAINT_SUPERVISOR Visibility', () => {
    test('should see all menu items (same as SOFTWARE_ADMIN)', () => {
      renderSidebarWithUser(complaintSupervisor);
      
      const expectedItems = [
        'dashboard',
        'inbox',
        'follow-up',
        'insight',
        'reporting',
        'investigation',
        'trend-monitoring',
        'table-view',
        'insert',
        'history',
        'drawer-notes',
        'critical-issues',
        'migration',
        'settings'
      ];
      
      expectedItems.forEach(item => {
        expect(screen.queryByText(new RegExp(item.replace('-', ' '), 'i'))).toBeTruthy();
      });
    });
  });
  
  // ============================================================================
  // WORKER TESTS
  // ============================================================================
  
  describe('WORKER Visibility', () => {
    test('should see operational pages', () => {
      renderSidebarWithUser(worker);
      
      // Should see
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📥 Inbox')).toBeInTheDocument();
      expect(screen.getByText('📋 Follow Up')).toBeInTheDocument();
      expect(screen.getByText('💡 Insight')).toBeInTheDocument();
      expect(screen.getByText('📊 Reporting')).toBeInTheDocument();
      expect(screen.getByText('🔍 Investigation')).toBeInTheDocument();
      expect(screen.getByText('📈 Trend Monitoring')).toBeInTheDocument();
      expect(screen.getByText('📋 Table View')).toBeInTheDocument();
      expect(screen.getByText('➕ Insert Record')).toBeInTheDocument();
      expect(screen.getByText('📋 History')).toBeInTheDocument();
      expect(screen.getByText('📝 Drawer Notes')).toBeInTheDocument();
      expect(screen.getByText('🚩 Critical Issues')).toBeInTheDocument();
      expect(screen.getByText('🔄 Data Migration')).toBeInTheDocument();
    });
    
    test('should NOT see Settings', () => {
      renderSidebarWithUser(worker);
      expect(screen.queryByText('⚙️ Settings')).not.toBeInTheDocument();
    });
  });
  
  // ============================================================================
  // THREE MONKEYS TESTS (ADMINISTRATION_ADMIN, DEPARTMENT_ADMIN, SECTION_ADMIN)
  // ============================================================================
  
  describe('ADMINISTRATION_ADMIN Visibility (Three Monkeys)', () => {
    test('should see only basic monitoring pages', () => {
      renderSidebarWithUser(adminAdmin);
      
      // Should see
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📥 Inbox')).toBeInTheDocument();
      expect(screen.getByText('📋 Follow Up')).toBeInTheDocument();
      expect(screen.getByText('📈 Trend Monitoring')).toBeInTheDocument();
      expect(screen.getByText('🚩 Critical Issues')).toBeInTheDocument();
    });
    
    test('should NOT see restricted pages', () => {
      renderSidebarWithUser(adminAdmin);
      
      // Should NOT see
      expect(screen.queryByText('💡 Insight')).not.toBeInTheDocument();
      expect(screen.queryByText('📊 Reporting')).not.toBeInTheDocument();
      expect(screen.queryByText('🔍 Investigation')).not.toBeInTheDocument();
      expect(screen.queryByText('📋 Table View')).not.toBeInTheDocument();
      expect(screen.queryByText('➕ Insert Record')).not.toBeInTheDocument();
      expect(screen.queryByText('📋 History')).not.toBeInTheDocument();
      expect(screen.queryByText('📝 Drawer Notes')).not.toBeInTheDocument();
      expect(screen.queryByText('⚙️ Settings')).not.toBeInTheDocument();
      expect(screen.queryByText('🔄 Data Migration')).not.toBeInTheDocument();
    });
  });
  
  describe('DEPARTMENT_ADMIN Visibility (Three Monkeys)', () => {
    test('should have same visibility as ADMINISTRATION_ADMIN', () => {
      renderSidebarWithUser(deptAdmin);
      
      // Should see
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📥 Inbox')).toBeInTheDocument();
      expect(screen.getByText('📋 Follow Up')).toBeInTheDocument();
      expect(screen.getByText('📈 Trend Monitoring')).toBeInTheDocument();
      expect(screen.getByText('🚩 Critical Issues')).toBeInTheDocument();
      
      // Should NOT see
      expect(screen.queryByText('💡 Insight')).not.toBeInTheDocument();
      expect(screen.queryByText('📊 Reporting')).not.toBeInTheDocument();
      expect(screen.queryByText('⚙️ Settings')).not.toBeInTheDocument();
    });
  });
  
  describe('SECTION_ADMIN Visibility (Three Monkeys)', () => {
    test('should have same visibility as ADMINISTRATION_ADMIN', () => {
      renderSidebarWithUser(sectionAdmin);
      
      // Should see
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📥 Inbox')).toBeInTheDocument();
      expect(screen.getByText('📋 Follow Up')).toBeInTheDocument();
      expect(screen.getByText('📈 Trend Monitoring')).toBeInTheDocument();
      expect(screen.getByText('🚩 Critical Issues')).toBeInTheDocument();
      
      // Should NOT see
      expect(screen.queryByText('💡 Insight')).not.toBeInTheDocument();
      expect(screen.queryByText('📊 Reporting')).not.toBeInTheDocument();
      expect(screen.queryByText('⚙️ Settings')).not.toBeInTheDocument();
    });
  });
  
  // ============================================================================
  // COMPREHENSIVE TEST TABLE OUTPUT
  // ============================================================================
  
  describe('Comprehensive Visibility Matrix', () => {
    test('Print complete visibility table for all roles', () => {
      console.log('\n');
      console.log('='.repeat(100));
      console.log('PHASE J — TASK J-3 — SIDEBAR VISIBILITY TEST RESULTS');
      console.log('='.repeat(100));
      console.log('\n');
      
      const roles = [
        { name: 'SOFTWARE_ADMIN', user: softwareAdmin },
        { name: 'COMPLAINT_SUPERVISOR', user: complaintSupervisor },
        { name: 'WORKER', user: worker },
        { name: 'ADMINISTRATION_ADMIN', user: adminAdmin },
        { name: 'DEPARTMENT_ADMIN', user: deptAdmin },
        { name: 'SECTION_ADMIN', user: sectionAdmin }
      ];
      
      const menuItems = [
        'dashboard',
        'inbox',
        'follow-up',
        'insight',
        'reporting',
        'investigation',
        'trend-monitoring',
        'table-view',
        'insert',
        'history',
        'drawer-notes',
        'critical-issues',
        'migration',
        'settings'
      ];
      
      // Expected visibility per role (Phase J contract)
      const expectedVisibility = {
        'SOFTWARE_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': true
        },
        'COMPLAINT_SUPERVISOR': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': true
        },
        'WORKER': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': true,
          'reporting': true, 'investigation': true, 'trend-monitoring': true,
          'table-view': true, 'insert': true, 'history': true, 'drawer-notes': true,
          'critical-issues': true, 'migration': true, 'settings': false
        },
        'ADMINISTRATION_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        },
        'DEPARTMENT_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        },
        'SECTION_ADMIN': {
          'dashboard': true, 'inbox': true, 'follow-up': true, 'insight': false,
          'reporting': false, 'investigation': false, 'trend-monitoring': true,
          'table-view': false, 'insert': false, 'history': false, 'drawer-notes': false,
          'critical-issues': true, 'migration': false, 'settings': false
        }
      };
      
      console.log('ROLE'.padEnd(25) + ' | ' + 'MENU ITEM'.padEnd(20) + ' | ' + 'EXPECTED'.padEnd(8) + ' | ' + 'ACTUAL'.padEnd(8) + ' | STATUS');
      console.log('-'.repeat(100));
      
      let passCount = 0;
      let failCount = 0;
      
      roles.forEach(({ name, user }) => {
        const { unmount } = renderSidebarWithUser(user);
        const visibleItems = getVisibleMenuItems();
        
        menuItems.forEach(item => {
          const expected = expectedVisibility[name][item];
          const actual = visibleItems.includes(item);
          const status = actual === expected ? '✅ PASS' : '❌ FAIL';
          
          if (actual === expected) {
            passCount++;
          } else {
            failCount++;
          }
          
          console.log(
            name.padEnd(25) + ' | ' +
            item.padEnd(20) + ' | ' +
            String(expected).padEnd(8) + ' | ' +
            String(actual).padEnd(8) + ' | ' +
            status
          );
        });
        
        unmount();
      });
      
      console.log('-'.repeat(100));
      console.log(`TOTAL: ${passCount}/${passCount + failCount} tests passed (${((passCount/(passCount + failCount))*100).toFixed(1)}%)`);
      console.log('='.repeat(100));
      console.log('\n');
      
      // All tests must pass
      expect(failCount).toBe(0);
    });
  });
});
