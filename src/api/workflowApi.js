// src/api/workflowApi.js
/**
 * Normalized API wrapper for API v2 workflow endpoints.
 * Handles snake_case → camelCase conversion, date parsing, and error normalization.
 * This is a PURE API ACCESS LAYER - no UI logic, no side effects.
 */

import apiClient from './apiClient';

// ============================================================================
// HELPER FUNCTIONS (Internal)
// ============================================================================

/**
 * Convert backend date/datetime strings to JS Date objects, or null if falsy
 * @param {string|null|undefined} value - ISO date/datetime string from backend
 * @returns {Date|null}
 */
const toDateOrNull = (value) => {
  if (!value) return null;
  return new Date(value);
};

/**
 * Map backend error responses to normalized Error objects
 * @param {Error} error - Axios error object
 * @returns {Error} - Normalized error with user-friendly message
 */
const mapWorkflowError = (error) => {
  if (error.response && error.response.data) {
    const detail = error.response.data.detail || 'Workflow API error';
    return new Error(detail);
  }
  if (error.request) {
    return new Error('Network error');
  }
  return new Error('Workflow API error');
};

/**
 * Normalize inbox item from snake_case to camelCase with date parsing
 * @param {Object} item - Raw inbox item from backend
 * @returns {Object} - Normalized inbox item
 */
const normalizeInboxItem = (item) => ({
  subcaseId: item.subcase_id,
  caseType: item.case_type,
  incidentId: item.incident_id,
  seasonalReportId: item.seasonal_report_id,
  targetOrgUnitId: item.target_org_unit_id,
  status: item.status,
  createdAt: toDateOrNull(item.created_at),
  allowedActions: item.allowed_actions || [],
});

/**
 * Normalize follow-up action item from snake_case to camelCase with date parsing
 * @param {Object} item - Raw action item from backend
 * @returns {Object} - Normalized action item
 */
const normalizeFollowUpItem = (item) => ({
  actionItemId: item.action_item_id,
  subcaseId: item.subcase_id,
  status: item.status,
  title: item.title,
  description: item.description,
  dueDate: toDateOrNull(item.due_date),
  assignedToUserId: item.assigned_to_user_id,
  startedAt: toDateOrNull(item.started_at),
  completedAt: toDateOrNull(item.completed_at),
  verifiedAt: toDateOrNull(item.verified_at),
  createdAt: toDateOrNull(item.created_at),
  createdByUserId: item.created_by_user_id,
  updatedAt: toDateOrNull(item.updated_at),
  updatedByUserId: item.updated_by_user_id,
});

// ============================================================================
// EXPORTED API FUNCTIONS
// ============================================================================

/**
 * Get inbox items for current authenticated user
 * 
 * Endpoint: GET /api/v2/workflow/inbox
 * 
 * @returns {Promise<Array>} Array of normalized inbox items with:
 *   - subcaseId: number
 *   - caseType: string ("INCIDENT" | "SEASONAL_REPORT")
 *   - incidentId: number | null
 *   - seasonalReportId: number | null
 *   - targetOrgUnitId: number
 *   - status: string (workflow status code)
 *   - createdAt: Date
 *   - allowedActions: string[] (e.g., ["view", "accept", "reject"])
 * 
 * @throws {Error} Normalized error with detail message
 */
export const getWorkflowInbox = async () => {
  try {
    const response = await apiClient.get('/api/v2/workflow/inbox');
    const items = response.data.items || [];
    return items.map(normalizeInboxItem);
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Get follow-up action items for current authenticated user
 * 
 * Endpoint: GET /api/v2/workflow/follow-up
 * 
 * @returns {Promise<Array>} Array of normalized action items with:
 *   - actionItemId: number
 *   - subcaseId: number
 *   - status: string ("DRAFT" | "CANCELLED" | etc.)
 *   - title: string
 *   - description: string | null
 *   - dueDate: Date | null
 *   - assignedToUserId: number | null
 *   - startedAt: Date | null
 *   - completedAt: Date | null
 *   - verifiedAt: Date | null
 *   - createdAt: Date
 *   - createdByUserId: number
 *   - updatedAt: Date | null
 *   - updatedByUserId: number | null
 * 
 * @throws {Error} Normalized error with detail message
 */
export const getFollowUpItems = async () => {
  try {
    const response = await apiClient.get('/api/v2/workflow/follow-up');
    const items = response.data.items || [];
    return items.map(normalizeFollowUpItem);
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Start an action item (marks as started)
 * 
 * Endpoint: POST /api/v2/workflow/follow-up/{action_item_id}/start
 * 
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} true if successful, false otherwise
 * @throws {Error} Normalized error (401/403/404)
 */
export const startActionItem = async (actionItemId) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/follow-up/${actionItemId}/start`);
    return response.data.success || false;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Complete an action item (marks as completed)
 * 
 * Endpoint: POST /api/v2/workflow/follow-up/{action_item_id}/complete
 * 
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} true if successful, false otherwise
 * @throws {Error} Normalized error (401/403/404)
 */
export const completeActionItem = async (actionItemId) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/follow-up/${actionItemId}/complete`);
    return response.data.success || false;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Delay an action item (marks as cancelled/delayed)
 * 
 * Endpoint: POST /api/v2/workflow/follow-up/{action_item_id}/delay
 * 
 * Note: Backend sets status to "CANCELLED"
 * 
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} true if successful, false otherwise
 * @throws {Error} Normalized error (401/403/404)
 */
export const delayActionItem = async (actionItemId) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/follow-up/${actionItemId}/delay`);
    return response.data.success || false;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Perform an action on a subcase (workflow transition)
 * 
 * Endpoint: POST /api/v2/workflow/case/{subcase_id}/act
 * 
 * Supported actions:
 * - "SUBMIT_RESPONSE" - Section admin submits explanation + action items
 * - "REJECT" - Reject at current level (level determined by status)
 * - "APPROVE" - Approve at department or administration level
 * - "OVERRIDE" - Override action items at dept/admin level
 * - "FORCE_CLOSE" - Force close subcase (admin only)
 * 
 * Payload examples:
 * 
 * SUBMIT_RESPONSE / OVERRIDE:
 * {
 *   explanation_text: "...",
 *   action_items: [
 *     { title: "...", description: "...", due_date: "2026-02-10" }
 *   ]
 * }
 * 
 * REJECT:
 * {
 *   rejection_text: "..."
 * }
 * 
 * FORCE_CLOSE:
 * {
 *   reason: "..."
 * }
 * 
 * @param {number} subcaseId - Subcase ID
 * @param {string} action - Action code (see above)
 * @param {Object} payload - Action-specific payload (default: {})
 * @returns {Promise<boolean>} true if successful
 * @throws {Error} Normalized error (400/403/404/500)
 */
export const actOnSubcase = async (subcaseId, action, payload = {}) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/case/${subcaseId}/act`, {
      action,
      payload,
    });
    return response.data.success || false;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};
