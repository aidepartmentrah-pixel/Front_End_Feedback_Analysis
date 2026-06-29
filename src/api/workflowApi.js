// src/api/workflowApi.js
/**
 * Normalized API wrapper for API v2 workflow endpoints.
 * Handles snake_case → camelCase conversion, date parsing, and error normalization.
 * This is a PURE API ACCESS LAYER - no UI logic, no side effects.
 */

import apiClient from './apiClient';
import { parseDueDate } from '../utils/dateOnly';

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
  incidentNumber: item.incident_number || null,
  seasonalReportId: item.seasonal_report_id,
  targetOrgUnitId: item.target_org_unit_id,
  targetOrgUnitName: item.target_org_unit_name || null,
  targetOrgUnitType: item.target_org_unit_type || null,
  status: item.status,
  createdAt: toDateOrNull(item.created_at),
  allowedActions: item.allowed_actions || [],
  // HCAT Automatic Force Close Policy (Session 6) - per-level deadline state
  sectionDeadlineAt: toDateOrNull(item.section_deadline_at),
  departmentDeadlineAt: toDateOrNull(item.department_deadline_at),
  administrationDeadlineAt: toDateOrNull(item.administration_deadline_at),
  sectionForceClosedAt: toDateOrNull(item.section_force_closed_at),
  sectionLateReply: !!item.section_late_reply,
  sectionExtraTimeGrantedAt: toDateOrNull(item.section_extra_time_granted_at),
  departmentForceClosedAt: toDateOrNull(item.department_force_closed_at),
  departmentLateReply: !!item.department_late_reply,
  departmentExtraTimeGrantedAt: toDateOrNull(item.department_extra_time_granted_at),
  administrationForceClosedAt: toDateOrNull(item.administration_force_closed_at),
  administrationLateReply: !!item.administration_late_reply,
  administrationExtraTimeGrantedAt: toDateOrNull(item.administration_extra_time_granted_at),
  // Stage 2 — explicit display metadata
  messageType:        item.message_type        ?? 'COMPLAINT',
  messageCategory:    item.message_category    ?? 'WORKFLOW',
  currentLevel:       item.current_level       ?? null,
  targetLevel:        item.target_level        ?? null,
  incidentDate:       item.incident_date  ? new Date(item.incident_date)  : null,
  displayDate:        item.display_date   ? new Date(item.display_date)   : null,
  isForceClosed:      item.is_force_closed     ?? false,
  forceClosedAtLevel: item.force_closed_at_level ?? null,
  isLate:             item.is_late             ?? false,
  isRedFlag:          item.is_red_flag         ?? false,
  isNeverEvent:       item.is_never_event      ?? false,
  isMorbidity:        item.is_morbidity        ?? false,
  clinicalIndicators: item.clinical_indicators ?? [],
  workflowIndicators: item.workflow_indicators ?? [],
  patientServicesDecisionText: item.patient_services_decision_text ?? null,
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
  incidentNumber: item.incident_number || null,
  seasonalReportId: item.seasonal_report_id,
  targetOrgUnitId: item.target_org_unit_id,
  targetOrgUnitName: item.target_org_unit_name || null,
  targetOrgUnitType: item.target_org_unit_type || null,
  status: item.status,
  createdAt: toDateOrNull(item.created_at),
  updatedAt: toDateOrNull(item.updated_at),  // When it was processed
  allowedActions: item.allowed_actions || [],  // Always ["view"] for archive
  // HCAT Automatic Force Close Policy (Session 6) - per-level deadline state
  sectionDeadlineAt: toDateOrNull(item.section_deadline_at),
  departmentDeadlineAt: toDateOrNull(item.department_deadline_at),
  administrationDeadlineAt: toDateOrNull(item.administration_deadline_at),
  sectionForceClosedAt: toDateOrNull(item.section_force_closed_at),
  sectionLateReply: !!item.section_late_reply,
  sectionExtraTimeGrantedAt: toDateOrNull(item.section_extra_time_granted_at),
  departmentForceClosedAt: toDateOrNull(item.department_force_closed_at),
  departmentLateReply: !!item.department_late_reply,
  departmentExtraTimeGrantedAt: toDateOrNull(item.department_extra_time_granted_at),
  administrationForceClosedAt: toDateOrNull(item.administration_force_closed_at),
  administrationLateReply: !!item.administration_late_reply,
  administrationExtraTimeGrantedAt: toDateOrNull(item.administration_extra_time_granted_at),
  // Stage 2 — explicit display metadata
  messageType:        item.message_type        ?? 'COMPLAINT',
  messageCategory:    item.message_category    ?? 'WORKFLOW',
  currentLevel:       item.current_level       ?? null,
  targetLevel:        item.target_level        ?? null,
  incidentDate:       item.incident_date  ? new Date(item.incident_date)  : null,
  displayDate:        item.display_date   ? new Date(item.display_date)   : null,
  isForceClosed:      item.is_force_closed     ?? false,
  forceClosedAtLevel: item.force_closed_at_level ?? null,
  isLate:             item.is_late             ?? false,
  isRedFlag:          item.is_red_flag         ?? false,
  isNeverEvent:       item.is_never_event      ?? false,
  isMorbidity:        item.is_morbidity        ?? false,
  clinicalIndicators: item.clinical_indicators ?? [],
  workflowIndicators: item.workflow_indicators ?? [],
  patientServicesDecisionText: item.patient_services_decision_text ?? null,
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
  // Date-only value - parsed to local midnight, NOT toDateOrNull (see utils/dateOnly)
  dueDate: parseDueDate(item.due_date),
  assignedToUserId: item.assigned_to_user_id,
  startedAt: toDateOrNull(item.started_at),
  completedAt: toDateOrNull(item.completed_at),
  verifiedAt: toDateOrNull(item.verified_at),
  createdAt: toDateOrNull(item.created_at),
  createdByUserId: item.created_by_user_id,
  updatedAt: toDateOrNull(item.updated_at),
  updatedByUserId: item.updated_by_user_id,
  // Case context fields (from subcase + incident joins)
  caseType: item.case_type || null,
  incidentRequestCaseId: item.incident_request_case_id || null,
  incidentNumber: item.incident_number || null,
  patientName: item.patient_name || null,
  caseDescription: item.case_description || null,
  orgUnitName: item.org_unit_name || null,
  severityName: item.severity_name || null,
  categoryName: item.category_name || null,
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
export const getInboxAccountability = async () => {
  try {
    const response = await apiClient.get('/api/v2/workflow/inbox/accountability');
    const toDate = (s) => s ? new Date(s) : null;
    const normalize = (item) => ({
      subcaseId:            item.subcase_id,
      incidentId:           item.incident_id,
      incidentNumber:       item.incident_number || null,
      status:               item.status,
      targetOrgUnitId:      item.target_org_unit_id,
      targetOrgUnitName:    item.target_org_unit_name || null,
      createdAt:            toDate(item.created_at),
      sectionForceClosedAt:          toDate(item.section_force_closed_at),
      sectionExtraTimeGrantedAt:     toDate(item.section_extra_time_granted_at),
      departmentForceClosedAt:       toDate(item.department_force_closed_at),
      departmentExtraTimeGrantedAt:  toDate(item.department_extra_time_granted_at),
      messageType:          item.message_type ?? 'COMPLAINT',
    });
    return {
      red:  (response.data.red  || []).map(normalize),
      gray: (response.data.gray || []).map(normalize),
    };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return { red: [], gray: [] };
    }
    throw mapWorkflowError(error);
  }
};

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
 * Save (or update) the Patient Services scientific decision on an administrative
 * complaint subcase.
 *
 * Wraps actOnSubcase with action = 'SAVE_PATIENT_SERVICES_DECISION'.
 * Works on both WAITING_PATIENT_SERVICES_DECISION (first save) and
 * PATIENT_SERVICES_DECISION_COMPLETED (re-edit — decision_at is preserved).
 *
 * @param {number} subcaseId
 * @param {string} decisionText - The قرار خدمات المرضى بحسب المراجع العلميّة text
 * @returns {Promise<boolean>}
 */
export const savePatientServicesDecision = (subcaseId, decisionText) =>
  actOnSubcase(subcaseId, 'SAVE_PATIENT_SERVICES_DECISION', { decision_text: decisionText });

/**
 * Acknowledge a completed Patient Services decision.
 *
 * Wraps actOnSubcase with action = 'ACKNOWLEDGE_DECISION'.
 * Transitions PATIENT_SERVICES_DECISION_COMPLETED → DECISION_ACKNOWLEDGED,
 * removing the item from the office's active inbox and placing it in archive.
 *
 * Allowed roles: SECTION_ADMIN, DEPARTMENT_ADMIN, ADMINISTRATION_ADMIN
 *
 * @param {number} subcaseId
 * @returns {Promise<boolean>}
 */
export const acknowledgePatientServicesDecision = (subcaseId) =>
  actOnSubcase(subcaseId, 'ACKNOWLEDGE_DECISION');


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
        actionItemId: item.action_item_id || null,
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

/**
 * Get all subcases + their responses for an incident (used by Table View "View Responses").
 *
 * Endpoint: GET /api/v2/workflow/incident/{incident_id}/responses
 *
 * @param {number} incidentId
 * @returns {Promise<Object>} { incidentId, subcases: [{subcaseId, targetOrgUnitName, status,
 *   sectionExplanation, departmentExplanation, administrationExplanation, actionItems}] }
 * @throws {Error} Normalized error (403/404)
 */
export const getIncidentResponses = async (incidentId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/incident/${incidentId}/responses`);
    const d = response.data;
    return {
      incidentId: d.incident_id,
      subcases: (d.subcases || []).map(sc => ({
        subcaseId: sc.subcase_id,
        targetOrgUnitId: sc.target_org_unit_id,
        targetOrgUnitName: sc.target_org_unit_name,
        status: sc.status,
        sectionExplanation: sc.section_explanation || '',
        departmentExplanation: sc.department_explanation || '',
        administrationExplanation: sc.administration_explanation || '',
        actionItems: (sc.action_items || []).map(item => ({
          title: item.title,
          description: item.description || '',
          dueDate: item.due_date || null,
          status: item.status || null,
        })),
      })),
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Get the current manual-fill state for a subcase (all three levels + ownership)
 *
 * Endpoint: GET /api/v2/workflow/subcase/{subcase_id}/fill-state
 *
 * Authorization: COMPLAINT_SUPERVISOR and WORKER only.
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} Normalized fill state:
 *   - subcaseId: number
 *   - status: string
 *   - incidentId: number | null
 *   - forceCloseReason: string | null
 *   - forceClosedAt: Date | null
 *   - forceClosedBy: string | null
 *   - section: { explanationText, enteredBy, enteredForRole, entryMode, entryTimestamp }
 *   - department: { ... }
 *   - administration: { ... }
 * @throws {Error} Normalized error (403/404)
 */
export const getSubcaseFillState = async (subcaseId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/subcase/${subcaseId}/fill-state`);
    const d = response.data;
    const normalizeLevel = (level) => ({
      explanationText: level?.explanation_text || '',
      enteredBy: level?.entered_by || null,
      enteredForRole: level?.entered_for_role || null,
      entryMode: level?.entry_mode || null,
      entryTimestamp: toDateOrNull(level?.entry_timestamp),
    });
    const ps = d.patient_services_decision || {};
    return {
      subcaseId: d.subcase_id,
      status: d.status,
      incidentId: d.incident_id || null,
      forceCloseReason: d.force_close_reason || null,
      forceClosedAt: toDateOrNull(d.force_closed_at),
      forceClosedBy: d.force_closed_by || null,
      section: normalizeLevel(d.section),
      department: normalizeLevel(d.department),
      administration: normalizeLevel(d.administration),
      patientServicesDecision: {
        decisionText: ps.decision_text || '',
        enteredBy: ps.entered_by || null,
        decisionAt: toDateOrNull(ps.decision_at),
        updatedAt: toDateOrNull(ps.updated_at),
      },
      caseDescription: d.case_description || null,
      patientName: d.patient_name || null,
      incidentNumber: d.incident_number || null,
      domainName: d.domain_name || null,
      categoryName: d.category_name || null,
      subCategoryName: d.sub_category_name || null,
      classificationEN: d.classification_en || null,
      issuingOrgUnitName: d.issuing_org_unit_name || null,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Fill one level (section / department / administration) on behalf of the role
 * that normally owns that level.
 *
 * Endpoints:
 *   POST /api/v2/workflow/subcase/{subcase_id}/fill/section
 *   POST /api/v2/workflow/subcase/{subcase_id}/fill/department
 *   POST /api/v2/workflow/subcase/{subcase_id}/fill/administration
 *
 * Authorization: COMPLAINT_SUPERVISOR and WORKER only.
 *
 * @param {number} subcaseId
 * @param {'section'|'department'|'administration'} level
 * @param {string} explanationText
 * @returns {Promise<Object>} { success, subcaseId, level, entryMode }
 * @throws {Error} Normalized error (400/403/404)
 */
export const fillLevelOnBehalf = async (subcaseId, level, explanationText, actionItems = []) => {
  try {
    const body = { explanation_text: explanationText };
    if (level === 'section' && actionItems && actionItems.length > 0) {
      body.action_items = actionItems;
    }
    const response = await apiClient.post(
      `/api/v2/workflow/subcase/${subcaseId}/fill/${level}`,
      body
    );
    return {
      success: response.data.success || false,
      subcaseId: response.data.subcase_id,
      level: response.data.level,
      entryMode: response.data.entry_mode,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Transition a FORCE_CLOSED_DRAFT subcase to FORCE_CLOSED_COMPLETE.
 * All three explanation levels must be filled before calling this.
 *
 * Endpoint: POST /api/v2/workflow/subcase/{subcase_id}/complete-force-close
 *
 * Authorization: COMPLAINT_SUPERVISOR and WORKER only.
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} { success, subcaseId, newStatus }
 * @throws {Error} Normalized error (400/403/404)
 */
export const completeForceClosedDraft = async (subcaseId) => {
  try {
    const response = await apiClient.post(
      `/api/v2/workflow/subcase/${subcaseId}/complete-force-close`
    );
    return {
      success: response.data.success || false,
      subcaseId: response.data.subcase_id,
      newStatus: response.data.new_status,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Give the Section level more time after it was force-closed for missing its deadline.
 * Transitions FORCE_CLOSED_AT_SECTION -> SUBMITTED_TO_SECTION (HCAT Session 6).
 *
 * Endpoint: POST /api/v2/workflow/subcase/{subcase_id}/give-section-more-time
 *
 * Authorization: DEPARTMENT_ADMIN, COMPLAINT_SUPERVISOR, SOFTWARE_ADMIN.
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} { success, subcaseId, workflowState }
 * @throws {Error} Normalized error (400/403/404)
 */
export const giveSectionMoreTime = async (subcaseId) => {
  try {
    const response = await apiClient.post(
      `/api/v2/workflow/subcase/${subcaseId}/give-section-more-time`
    );
    return {
      success: response.data.success || false,
      subcaseId: response.data.subcase_id,
      workflowState: response.data.workflow_state,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Give the Department level more time after it was force-closed for missing its deadline.
 * Transitions FORCE_CLOSED_AT_DEPARTMENT -> SECTION_ACCEPTED_PENDING_DEPT (HCAT Session 6).
 *
 * Endpoint: POST /api/v2/workflow/subcase/{subcase_id}/give-department-more-time
 *
 * Authorization: ADMINISTRATION_ADMIN, COMPLAINT_SUPERVISOR, SOFTWARE_ADMIN.
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} { success, subcaseId, workflowState }
 * @throws {Error} Normalized error (400/403/404)
 */
/**
 * Get investigation history (all response levels + action items) for a subcase
 *
 * Endpoint: GET /api/v2/workflow/case/{subcase_id}/history
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} { section, department, administration, patient_services, action_items }
 * @throws {Error} Normalized error (403/404)
 */
export const getSubcaseHistory = async (subcaseId) => {
  try {
    const response = await apiClient.get(`/api/v2/workflow/case/${subcaseId}/history`);
    const d = response.data;
    const normalizeLevel = (level) => ({
      hasContent: !!level?.has_content,
      text: level?.text || null,
      enteredBy: level?.entered_by || null,
      enteredAt: toDateOrNull(level?.entered_at),
    });
    return {
      subcaseId: d.subcase_id,
      orgUnitName: d.org_unit_name || null,
      section: normalizeLevel(d.section),
      department: normalizeLevel(d.department),
      administration: normalizeLevel(d.administration),
      patientServices: normalizeLevel(d.patient_services),
      actionItems: (d.action_items || []).map((i) => ({
        title: i.title,
        description: i.description || null,
        dueDate: i.due_date || null,
        status: i.status || null,
      })),
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

export const giveDepartmentMoreTime = async (subcaseId) => {
  try {
    const response = await apiClient.post(
      `/api/v2/workflow/subcase/${subcaseId}/give-department-more-time`
    );
    return {
      success: response.data.success || false,
      subcaseId: response.data.subcase_id,
      workflowState: response.data.workflow_state,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};

/**
 * Give the Administration level more time after it was force-closed for missing its deadline.
 * Transitions FORCE_CLOSED_AT_ADMINISTRATION -> DEPT_ACCEPTED_PENDING_ADMIN (HCAT Session 6).
 *
 * Endpoint: POST /api/v2/workflow/subcase/{subcase_id}/give-administration-more-time
 *
 * Authorization: COMPLAINT_SUPERVISOR, SOFTWARE_ADMIN only.
 *
 * @param {number} subcaseId
 * @returns {Promise<Object>} { success, subcaseId, workflowState }
 * @throws {Error} Normalized error (400/403/404)
 */
export const giveAdministrationMoreTime = async (subcaseId) => {
  try {
    const response = await apiClient.post(
      `/api/v2/workflow/subcase/${subcaseId}/give-administration-more-time`
    );
    return {
      success: response.data.success || false,
      subcaseId: response.data.subcase_id,
      workflowState: response.data.workflow_state,
    };
  } catch (error) {
    throw mapWorkflowError(error);
  }
};
