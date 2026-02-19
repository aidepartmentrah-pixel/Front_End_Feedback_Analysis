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
 * @returns {Error} - Normalized error with user-friendly message and response preserved
 */
const mapWorkflowError = (error) => {
  if (error.response && error.response.data) {
    const detail = error.response.data.detail || 'Workflow API error';
    const err = new Error(detail);
    err.response = error.response; // Preserve response for status code checking
    return err;
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
  targetOrgUnitName: item.target_org_unit_name || null,
  status: item.status,
  createdAt: toDateOrNull(item.created_at),
  allowedActions: item.allowed_actions || [],
});

/**
 * Normalize archive item from snake_case to camelCase with date parsing
 * Archive items include updatedAt field to show when they were processed
 * @param {Object} item - Raw archive item from backend
 * @returns {Object} - Normalized archive item
 */
const normalizeArchiveItem = (item) => ({
  subcaseId: item.subcase_id,
  caseType: item.case_type,
  incidentId: item.incident_id,
  seasonalReportId: item.seasonal_report_id,
  targetOrgUnitId: item.target_org_unit_id,
  targetOrgUnitName: item.target_org_unit_name || null,
  status: item.status,
  createdAt: toDateOrNull(item.created_at),
  updatedAt: toDateOrNull(item.updated_at),  // When it was processed
  allowedActions: item.allowed_actions || [],  // Always ["view"] for archive
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
 * 
 * Note: 403 responses are treated as empty inbox (not errors)
 */
export const getWorkflowInbox = async () => {
  try {
    const response = await apiClient.get('/api/v2/workflow/inbox');
    const items = response.data.items || [];
    return items.map(normalizeInboxItem);
  } catch (error) {
    // Handle 403 (Forbidden) as empty inbox - not an error
    // This occurs for roles without inbox access (e.g., WORKER)
    if (error.response && error.response.status === 403) {
      return [];
    }
    throw mapWorkflowError(error);
  }
};

/**
 * Get archive items (completed/processed) for current authenticated user
 * 
 * Endpoint: GET /api/v2/workflow/inbox/archive
 * 
 * Archive shows subcases that the user previously processed and that have
 * moved past their workflow stage. These are READ-ONLY (view action only).
 * 
 * @returns {Promise<Array>} Array of normalized archive items with:
 *   - subcaseId: number
 *   - caseType: string ("INCIDENT" | "SEASONAL_REPORT")
 *   - incidentId: number | null
 *   - seasonalReportId: number | null
 *   - targetOrgUnitId: number
 *   - targetOrgUnitName: string | null
 *   - status: string (current workflow status)
 *   - createdAt: Date
 *   - updatedAt: Date | null (when it was last processed)
 *   - allowedActions: string[] (always ["view"])
 * 
 * @throws {Error} Normalized error with detail message
 * 
 * Note: 403 responses are treated as empty archive (not errors)
 */
export const getWorkflowInboxArchive = async () => {
  try {
    const response = await apiClient.get('/api/v2/workflow/inbox/archive');
    const items = response.data.items || [];
    return items.map(normalizeArchiveItem);
  } catch (error) {
    // Handle 403 (Forbidden) as empty archive - not an error
    if (error.response && error.response.status === 403) {
      return [];
    }
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
 * Note: Backend extends the DueDate by delay_days from current DueDate or today
 * 
 * @param {number} actionItemId - Action item ID
 * @param {number} delayDays - Number of days to extend the due date (1-90)
 * @returns {Promise<Object>} Result with success, previous_due_date, new_due_date, delay_days
 * @throws {Error} Normalized error (401/403/404)
 */
export const delayActionItem = async (actionItemId, delayDays = 7) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/follow-up/${actionItemId}/delay`, {
      delay_days: delayDays
    });
    return response.data;
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

/**
 * Force close an incident and all its subcases (administrative action)
 * 
 * Endpoint: POST /api/v2/workflow/case/{incident_id}/force-close
 * 
 * Authorization: SOFTWARE_ADMIN, WORKER, COMPLAINT_SUPERVISOR only
 * 
 * This will:
 * - Close the main incident
 * - Close ALL subcases (regardless of status)
 * - Remove from all user inboxes
 * - Prevent any further actions
 * - Record audit trail (who, when, why)
 * 
 * @param {number} incidentId - Incident ID to force close
 * @param {string} reason - Reason for force closure (min 10 characters)
 * @returns {Promise<Object>} Response with:
 *   - success: boolean
 *   - incident_id: number
 *   - incident_status: string
 *   - subcases_closed: number[] (array of closed subcase IDs)
 *   - total_subcases_closed: number
 *   - closed_at: string (ISO datetime)
 *   - closed_by: string (username)
 *   - reason: string
 * @throws {Error} Normalized error (400/403/404)
 */
export const forceCloseCase = async (incidentId, reason) => {
  try {
    const response = await apiClient.post(`/api/v2/workflow/case/${incidentId}/force-close`, {
      reason,
    });
    return response.data;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Get the submitted response data for a subcase (explanation + action items)
 *
 * Endpoint: GET /api/v2/workflow/case/{subcase_id}/response
 *
 * Returns the latest SUBMIT_RESPONSE / OVERRIDE payload attached to the subcase,
 * so reviewers can see what they are approving or rejecting.
 *
 * @param {number} subcaseId - Subcase ID
 * @returns {Promise<Object>} Normalized response data:
 *   - explanationText: string
 *   - actionItems: Array<{ title, description, dueDate, status }>
 *   - submittedBy: string (username or display name)
 *   - submittedAt: Date | null
 * @throws {Error} Normalized error (403/404)
 */
export const getSubcaseResponse = async (subcaseId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/case/${subcaseId}/response`);
    const d = response.data;
    return {
      explanationText: d.explanation_text || '',
      isRejection: d.is_rejection || false,
      rejectionText: d.rejection_text || '',
      actionItems: (d.action_items || []).map((item) => ({
        title: item.title,
        description: item.description || '',
        dueDate: item.due_date || null,
        status: item.status || null,
      })),
      submittedBy: d.submitted_by || 'Unknown',
      submittedAt: toDateOrNull(d.submitted_at),
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Get seasonal report detail data for the inbox "view" action
 *
 * Endpoint: GET /api/v2/workflow/seasonal-report/{seasonal_report_id}
 *
 * Returns:
 * - header: season/org/severity/domain/compliance info
 * - classification_stats: per-classification breakdown
 * - policy_snapshot: threshold limits (may be null)
 *
 * @param {number} seasonalReportId - The SeasonalReportID
 * @returns {Promise<Object>} Full seasonal report data
 * @throws {Error} Normalized error (403/404)
 */
export const getSeasonalReportDetail = async (seasonalReportId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/seasonal-report/${seasonalReportId}`);
    return response.data;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Get incident detail data for the inbox "view" action (read-only)
 *
 * Endpoint: GET /api/v2/workflow/incident/{incident_id}
 *
 * Authorization:
 * - SOFTWARE_ADMIN, COMPLAINT_SUPERVISOR, ADMINISTRATION_ADMIN: can view any incident
 * - Others: must have an active subcase for this incident in their org unit scope
 *
 * @param {number} incidentId - The IncidentRequestCasesID
 * @returns {Promise<Object>} Incident detail data
 * @throws {Error} Normalized error (403/404)
 */
export const getWorkflowIncidentDetail = async (incidentId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/incident/${incidentId}`);
    return response.data;
  } catch (error) {
    throw mapWorkflowError(error);
  }
};
