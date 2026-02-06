// src/utils/roleGuards.js
/**
 * Centralized role-based guards for frontend UX.
 * These are UX-level guards, NOT security enforcement.
 * Backend must enforce all authorization independently.
 */

/**
 * Check if user can view the Inbox page
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInbox = (user) => {
  if (!user || !user.roles) return false;
  // ALL authenticated users can view inbox
  return true;
};

/**
 * Check if user can perform actions on inbox items (accept, reject, etc.)
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canActOnInbox = (user) => {
  if (!user || !user.roles) return false;
  
  const allowedRoles = [
    'SOFTWARE_ADMIN',
    'ADMINISTRATION_ADMIN',
    'DEPARTMENT_ADMIN',
    'SECTION_ADMIN',
    'COMPLAINT_SUPERVISOR',
    'WORKER'
  ];
  
  return user.roles.some(role => allowedRoles.includes(role));
};

/**
 * Check if user can view the Follow-up page
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewFollowUp = (user) => {
  if (!user || !user.roles) return false;
  // ALL authenticated users can view follow-up
  return true;
};

/**
 * Check if user can perform actions on follow-up items (start, complete, delay)
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canActOnFollowUp = (user) => {
  if (!user || !user.roles) return false;
  
  const allowedRoles = [
    'SOFTWARE_ADMIN',
    'ADMINISTRATION_ADMIN',
    'DEPARTMENT_ADMIN',
    'SECTION_ADMIN',
    'COMPLAINT_SUPERVISOR',
    'WORKER'
  ];
  
  return user.roles.some(role => allowedRoles.includes(role));
};

/**
 * Check if user can view the Insight page
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canViewInsight = (user) => {
  if (!user || !user.roles) return false;
  
  const allowedRoles = [
    'SOFTWARE_ADMIN',
    'ADMINISTRATION_ADMIN',
    'DEPARTMENT_ADMIN',
    'SECTION_ADMIN',
    'COMPLAINT_SUPERVISOR'
  ];
  
  return user.roles.some(role => allowedRoles.includes(role));
};

/**
 * Check if user can generate seasonal reports
 * @param {Object} user - user object from AuthContext
 * @returns {boolean}
 */
export const canGenerateSeasonalReports = (user) => {
  if (!user || !user.roles) return false;
  
  const allowedRoles = [
    'SOFTWARE_ADMIN',
    'ADMINISTRATION_ADMIN'
  ];
  
  return user.roles.some(role => allowedRoles.includes(role));
};
