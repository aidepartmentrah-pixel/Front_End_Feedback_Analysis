/**
 * PHASE J — Role Visibility Map
 * Single source of truth for role-based page and settings tab visibility
 * 
 * This file defines which roles can access which pages and settings tabs.
 * All visibility logic should reference this centralized map.
 */

// ============================================================================
// ROLE CONSTANTS
// ============================================================================

export const ROLES = {
  SOFTWARE_ADMIN: 'SOFTWARE_ADMIN',
  COMPLAINT_SUPERVISOR: 'COMPLAINT_SUPERVISOR',
  ADMINISTRATION_ADMIN: 'ADMINISTRATION_ADMIN',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  SECTION_ADMIN: 'SECTION_ADMIN',
  WORKER: 'WORKER',
};

// ============================================================================
// PAGE KEYS
// ============================================================================

export const PAGE_KEYS = {
  DASHBOARD: 'dashboard',
  INBOX: 'inbox',
  FOLLOW_UP: 'follow_up',
  INSIGHT: 'insight',
  REPORTING: 'reporting',
  INVESTIGATION: 'investigation',
  TREND_MONITORING: 'trend_monitoring',
  TABLE_VIEW: 'table_view',
  INSERT_RECORD: 'insert_record',
  HISTORY: 'history',
  DRAWER_NOTES: 'drawer_notes',
  SETTINGS: 'settings',
  CRITICAL_ISSUES: 'critical_issues',
  DATA_MIGRATION: 'data_migration',
};

// ============================================================================
// SETTINGS TAB KEYS
// ============================================================================

export const SETTINGS_TAB_KEYS = {
  DEPARTMENTS: 'departments',
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  VARIABLE_ATTRIBUTES: 'variable_attributes',
  POLICY: 'policy',
  TRAINING: 'training',
  USERS: 'users',
  HARDWARE_CONFIG: 'hardware_config',
  SECTION_MANAGEMENT: 'section_management',
  CLASSIFICATION_MANAGEMENT: 'classification_management',
  DATA_IMPORT: 'data_import',
  REPORT_CONFIG: 'report_config',
  RCA_SUGGESTIONS: 'rca_suggestions',
  FORCE_CLOSE_POLICY: 'force_close_policy',
};

// ============================================================================
// ROLE PAGE VISIBILITY MAP
// ============================================================================

/**
 * Maps each role to the pages they can access
 * @type {Object.<string, string[]>}
 */
export const rolePageVisibilityMap = {
  // SUPER ROLES - Full access to all pages
  [ROLES.SOFTWARE_ADMIN]: [
    PAGE_KEYS.DASHBOARD,
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
  ],
  
  [ROLES.COMPLAINT_SUPERVISOR]: [
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
  ],
  
  // WORKER - All operational pages + limited settings (Doctors & Patients only)
  [ROLES.WORKER]: [
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
  ],
  
  // LIMITED_ADMIN_ROLES - Read-only Table View + basic monitoring + Insight (view-only)
  [ROLES.ADMINISTRATION_ADMIN]: [
    PAGE_KEYS.DASHBOARD,
    PAGE_KEYS.INBOX,
    PAGE_KEYS.FOLLOW_UP,
    PAGE_KEYS.INSIGHT,
    PAGE_KEYS.TREND_MONITORING,
    PAGE_KEYS.TABLE_VIEW,
    PAGE_KEYS.CRITICAL_ISSUES,
  ],

  [ROLES.DEPARTMENT_ADMIN]: [
    PAGE_KEYS.DASHBOARD,
    PAGE_KEYS.INBOX,
    PAGE_KEYS.FOLLOW_UP,
    PAGE_KEYS.INSIGHT,
    PAGE_KEYS.TREND_MONITORING,
    PAGE_KEYS.TABLE_VIEW,
    PAGE_KEYS.CRITICAL_ISSUES,
  ],

  [ROLES.SECTION_ADMIN]: [
    PAGE_KEYS.DASHBOARD,
    PAGE_KEYS.INBOX,
    PAGE_KEYS.FOLLOW_UP,
    PAGE_KEYS.INSIGHT,
    PAGE_KEYS.TREND_MONITORING,
    PAGE_KEYS.TABLE_VIEW,
    PAGE_KEYS.CRITICAL_ISSUES,
  ],
};

// ============================================================================
// ROLE SETTINGS TAB VISIBILITY MAP
// ============================================================================

/**
 * Maps each role to the settings tabs they can access
 * @type {Object.<string, string[]>}
 */
export const roleSettingsTabVisibilityMap = {
  // SUPER ROLES - All settings tabs
  [ROLES.SOFTWARE_ADMIN]: [
    SETTINGS_TAB_KEYS.DEPARTMENTS,
    SETTINGS_TAB_KEYS.DOCTORS,
    SETTINGS_TAB_KEYS.PATIENTS,
    SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES,
    SETTINGS_TAB_KEYS.POLICY,
    SETTINGS_TAB_KEYS.TRAINING,
    SETTINGS_TAB_KEYS.USERS,
    SETTINGS_TAB_KEYS.HARDWARE_CONFIG,
    SETTINGS_TAB_KEYS.SECTION_MANAGEMENT,
    SETTINGS_TAB_KEYS.CLASSIFICATION_MANAGEMENT,
    SETTINGS_TAB_KEYS.DATA_IMPORT,
    SETTINGS_TAB_KEYS.REPORT_CONFIG,
    SETTINGS_TAB_KEYS.RCA_SUGGESTIONS,
    SETTINGS_TAB_KEYS.FORCE_CLOSE_POLICY,
  ],

  [ROLES.COMPLAINT_SUPERVISOR]: [
    SETTINGS_TAB_KEYS.DEPARTMENTS,
    SETTINGS_TAB_KEYS.DOCTORS,
    SETTINGS_TAB_KEYS.PATIENTS,
    SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES,
    SETTINGS_TAB_KEYS.POLICY,
    SETTINGS_TAB_KEYS.TRAINING,
    SETTINGS_TAB_KEYS.USERS,
    SETTINGS_TAB_KEYS.HARDWARE_CONFIG,
    SETTINGS_TAB_KEYS.SECTION_MANAGEMENT,
    SETTINGS_TAB_KEYS.CLASSIFICATION_MANAGEMENT,
    SETTINGS_TAB_KEYS.DATA_IMPORT,
    SETTINGS_TAB_KEYS.REPORT_CONFIG,
    SETTINGS_TAB_KEYS.RCA_SUGGESTIONS,
    SETTINGS_TAB_KEYS.FORCE_CLOSE_POLICY,
  ],
  
  // WORKER - Only Doctors and Patients tabs
  [ROLES.WORKER]: [
    SETTINGS_TAB_KEYS.DOCTORS,
    SETTINGS_TAB_KEYS.PATIENTS,
  ],
  
  // LIMITED_ADMIN_ROLES - No settings access
  [ROLES.ADMINISTRATION_ADMIN]: [],
  [ROLES.DEPARTMENT_ADMIN]: [],
  [ROLES.SECTION_ADMIN]: [],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role can see a specific page
 * @param {string} role - The user role (e.g., 'SOFTWARE_ADMIN')
 * @param {string} pageKey - The page key (e.g., 'dashboard')
 * @returns {boolean} - True if role can see the page, false otherwise
 */
export const canRoleSeePage = (role, pageKey) => {
  if (!role || !pageKey) return false;
  const allowedPages = rolePageVisibilityMap[role];
  if (!allowedPages) return false;
  return allowedPages.includes(pageKey);
};

/**
 * Check if a role can see a specific settings tab
 * @param {string} role - The user role (e.g., 'SOFTWARE_ADMIN')
 * @param {string} tabKey - The settings tab key (e.g., 'doctors')
 * @returns {boolean} - True if role can see the tab, false otherwise
 */
export const canRoleSeeSettingsTab = (role, tabKey) => {
  if (!role || !tabKey) return false;
  const allowedTabs = roleSettingsTabVisibilityMap[role];
  if (!allowedTabs) return false;
  return allowedTabs.includes(tabKey);
};
