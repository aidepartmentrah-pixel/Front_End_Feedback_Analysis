// src/utils/roleGuards.js
/**
 * PHASE J — Centralized role-based guards using visibility map
 * 
 * Centralized role-based guards for frontend UX.
 * These are UX-level guards, NOT security enforcement.
 * Backend must enforce all authorization independently.
 * 
 * All role decisions now come from:
 * src/security/roleVisibilityMap.js
 */

import { canRoleSeePage, canRoleSeeSettingsTab, PAGE_KEYS } from '../security/roleVisibilityMap';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the primary role from user object
 * Phase J convention: use first role in array
 * @param {Object} user - user object from AuthContext (shape: { roles: string[] })
 * @returns {string|null} - first role string or null
 */
const getPrimaryRole = (user) => {
  if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return null;
  }
  return user.roles[0];
};

// ============================================================================
// PAGE VIEW GUARDS
// ============================================================================

/**
 * PHASE J — Check if user can view the Dashboard page
 * Maps to pageKey: "dashboard"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewDashboard = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.DASHBOARD);
};

/**
 * PHASE J — Check if user can view the Inbox page
 * Maps to pageKey: "inbox"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInbox = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.INBOX);
};

/**
 * PHASE J — Check if user can perform actions on inbox items (accept, reject, etc.)
 * Action allowed if user can see the inbox page
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canActOnInbox = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.INBOX);
};

/**
 * PHASE J — Check if user can view the Follow-up page
 * Maps to pageKey: "follow_up"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewFollowUp = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.FOLLOW_UP);
};

/**
 * PHASE J — Check if user can perform actions on follow-up items (start, complete, delay)
 * Action allowed if user can see the follow-up page
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canActOnFollowUp = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.FOLLOW_UP);
};

/**
 * PHASE J — Check if user can view the Insight page
 * Maps to pageKey: "insight"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInsight = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.INSIGHT);
};

/**
 * PHASE J — Check if user can view the Reporting page
 * Maps to pageKey: "reporting"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewReporting = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.REPORTING);
};

/**
 * PHASE J — Check if user can view the Investigation page
 * Maps to pageKey: "investigation"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInvestigation = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.INVESTIGATION);
};

/**
 * PHASE J — Check if user can view the Table View page
 * Maps to pageKey: "table_view"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewTableView = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.TABLE_VIEW);
};

/**
 * PHASE J — Check if user can view the Insert Record page
 * Maps to pageKey: "insert_record"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInsertRecord = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.INSERT_RECORD);
};

/**
 * PHASE J — Check if user can view the Trend Monitoring page
 * Maps to pageKey: "trend_monitoring"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewTrendMonitoring = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.TREND_MONITORING);
};

/**
 * PHASE J — Check if user can view the Settings page
 * Maps to pageKey: "settings"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewSettings = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.SETTINGS);
};

/**
 * PHASE J — Check if user can view the Critical Issues page
 * Maps to pageKey: "critical_issues"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewCriticalIssues = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.CRITICAL_ISSUES);
};

/**
 * PHASE J — Check if user can generate seasonal reports
 * Seasonal reports are part of Insight/Reporting functionality
 * Maps to pageKey: "reporting"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canGenerateSeasonalReports = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.REPORTING);
};

/**
 * PHASE J — Check if user is a SOFTWARE_ADMIN
 * Direct role check (not using visibility map)
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const isSoftwareAdmin = (user) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) return false;
  return user.roles.includes('SOFTWARE_ADMIN');
};

/**
 * PHASE J — Check if user can view person reporting (Doctor/Worker history and seasonal reports)
 * Maps to pageKey: "history"
 * Uses central visibility map
 * Replaces old hardcoded role checks
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewPersonReporting = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.HISTORY);
};

/**
 * PHASE J — Check if user can access drawer notes
 * Maps to pageKey: "drawer_notes"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canAccessDrawerNotes = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.DRAWER_NOTES);
};

/**
 * PHASE J — Check if user can access migration pages (view/migrate legacy cases)
 * Maps to pageKey: "data_migration"
 * Uses central visibility map
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canAccessMigration = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  return canRoleSeePage(role, PAGE_KEYS.DATA_MIGRATION);
};

/**
 * Check if user has full operational access (not a limited monitoring admin)
 * Limited admins (ADMINISTRATION_ADMIN, DEPARTMENT_ADMIN, SECTION_ADMIN) can only view dashboards
 * They should not see Quick Actions or Recent Activity sections
 * @param {Object} user - user object from AuthContext
 * @returns {boolean} - True if user has full operational access
 */
export const hasFullOperationalAccess = (user) => {
  const role = getPrimaryRole(user);
  if (!role) return false;
  
  // Limited admin roles (the 3 monkeys)
  const limitedAdminRoles = ['ADMINISTRATION_ADMIN', 'DEPARTMENT_ADMIN', 'SECTION_ADMIN'];
  
  // Return false if user is a limited admin, true otherwise
  return !limitedAdminRoles.includes(role);
};
