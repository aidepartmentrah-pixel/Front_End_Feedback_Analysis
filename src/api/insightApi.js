/**
 * Insight API Wrapper
 * 
 * Purpose:
 * - Provides normalized API calls to Insight Analytics endpoints
 * - Follows same pattern as workflowApi.js
 * - No UI logic, no business logic
 * - Returns response.data only
 * 
 * Backend Endpoints:
 * - GET  /api/v2/insight/kpi-summary
 * - POST /api/v2/insight/distribution
 * - POST /api/v2/insight/trend
 * - GET  /api/v2/insight/stuck
 */

import apiClient from './apiClient';

// ============================================================================
// Insight API Normalizers
// Response + Request Adapters
// ============================================================================

/**
 * Adapt KPI summary response from backend to frontend shape.
 * 
 * Backend Shape:
 * {
 *   total_subcases,
 *   by_status: [{ status, count }],
 *   action_items: { total, open, completed, overdue }
 * }
 * 
 * Frontend Shape:
 * {
 *   open_subcases,
 *   pending_approvals,
 *   active_action_items,
 *   overdue_items
 * }
 * 
 * @param {Object|null|undefined} raw - Raw backend response
 * @returns {Object} Normalized KPI object with counts
 */
function adaptKpiSummary(raw) {
  // Defensive fallback to prevent Insight UI crash on bad payload
  if (!raw || typeof raw !== 'object') {
    return {
      open_subcases: 0,
      pending_approvals: 0,
      active_action_items: 0,
      overdue_items: 0,
    };
  }

  // Terminal statuses (considered closed)
  const terminalStatuses = [
    'ADMIN_APPROVED',
    'SECTION_DENIED',
    'FORCE_CLOSED',
  ];

  // Pending approval statuses
  const pendingApprovalStatuses = [
    'SECTION_ACCEPTED_PENDING_DEPT',
    'DEPT_ACCEPTED_PENDING_ADMIN',
  ];

  // Build status count map from by_status array
  // Defensive fallback: treat missing by_status as empty array
  const statusCountMap = {};
  const byStatusArray = Array.isArray(raw.by_status) ? raw.by_status : [];
  byStatusArray.forEach(item => {
    if (item && item.status) {
      // Ensure count is a number (convert strings, default to 0)
      statusCountMap[item.status] = Number(item.count) || 0;
    }
  });

  // Calculate open_subcases (all non-terminal statuses)
  let open_subcases = 0;
  Object.entries(statusCountMap).forEach(([status, count]) => {
    if (!terminalStatuses.includes(status)) {
      open_subcases += count;
    }
  });

  // Calculate pending_approvals
  let pending_approvals = 0;
  pendingApprovalStatuses.forEach(status => {
    pending_approvals += statusCountMap[status] || 0;
  });

  // Extract action item metrics (ensure numbers)
  // Defensive fallback: treat missing action_items as zeros
  const actionItems = raw.action_items && typeof raw.action_items === 'object' ? raw.action_items : {};
  const active_action_items = Number(actionItems.open) || 0;
  const overdue_items = Number(actionItems.overdue) || 0;

  return {
    open_subcases,
    pending_approvals,
    active_action_items,
    overdue_items,
  };
}

/**
 * Adapt distribution response from backend to Recharts PieChart shape.
 * 
 * Backend Shape:
 * [
 *   { key, count },
 *   ...
 * ]
 * 
 * Frontend PieChart Shape:
 * [
 *   { label, value },
 *   ...
 * ]
 * 
 * @param {Array|null|undefined} rawList - Raw backend response array
 * @returns {Array} Array of {label, value} objects for Recharts
 */
const STATUS_DISPLAY_LABELS = {
  SUBMITTED_TO_SECTION: 'Submitted to Section',
  SECTION_ACCEPTED: 'Accepted by Section',
  SECTION_ACCEPTED_PENDING_DEPT: 'Pending Department',
  DEPT_ACCEPTED_PENDING_ADMIN: 'Pending Administration',
  ADMIN_APPROVED: 'Approved',
  SECTION_DENIED: 'Denied',
  FORCE_CLOSED: 'Force Closed',
  FORCE_CLOSED_DRAFT: 'Force Closed (Draft)',
  FORCE_CLOSED_COMPLETE: 'Force Closed (Complete)',
  RETURNED_TO_SECTION_FOR_REVISION: 'Returned for Revision',
  RETURNED_TO_DEPARTMENT_FOR_REVISION: 'Returned to Dept',
};

function adaptDistribution(rawList) {
  // Defensive fallback to prevent Insight UI crash on bad payload
  if (!Array.isArray(rawList)) {
    return [];
  }

  // Map each item to {label, value} format
  return rawList
    .filter(row => row != null) // Skip null/undefined rows
    .map(row => ({
      label: STATUS_DISPLAY_LABELS[row.key] || String(row.key ?? ''),
      value: Number(row.count) || 0,
    }));
}

/**
 * Adapt distribution response to raw {status, count} pairs — no label
 * translation. Used by callers that group statuses into their own
 * business categories (e.g. workflow ownership) rather than displaying
 * one slice per raw status.
 */
function adaptStatusCounts(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .filter(row => row != null)
    .map(row => ({
      status: String(row.key ?? ''),
      count: Number(row.count) || 0,
    }));
}

/**
 * Adapt trend response from backend to LineChart shape.
 * 
 * Backend Shape:
 * [
 *   { bucket, count },
 *   ...
 * ]
 * 
 * Frontend LineChart Shape:
 * [
 *   { period, count },
 *   ...
 * ]
 * 
 * @param {Array|null|undefined} rawList - Raw backend response array
 * @returns {Array} Array of {period, count} objects for LineChart
 */
function adaptTrend(rawList) {
  // Defensive fallback to prevent Insight UI crash on bad payload
  if (!Array.isArray(rawList)) {
    return [];
  }

  // Map each item to {period, count} format
  return rawList
    .filter(row => row != null) // Skip null/undefined rows
    .map(row => ({
      period: String(row.bucket ?? ''),
      count: Number(row.count) || 0,
    }));
}

/**
 * Adapt stuck cases response from backend to InsightPage table shape.
 * 
 * Backend Shape:
 * {
 *   subcase_id,
 *   target_org_unit_id,
 *   updated_at,
 *   days_in_stage,
 *   status
 * }
 * 
 * Frontend Table Shape (adds derived fields):
 * {
 *   ...all backend fields,
 *   stage: status,
 *   assigned_level: "—"
 * }
 * 
 * @param {Array|null|undefined} rawList - Raw backend response array
 * @returns {Array} Array of stuck case objects with derived fields
 */
function adaptStuckCases(rawList) {
  // Defensive fallback to prevent Insight UI crash on bad payload
  if (!Array.isArray(rawList)) {
    return [];
  }

  // Map each item, preserving all fields and adding derived ones
  return rawList
    .filter(row => row != null) // Skip null/undefined rows
    .map(row => ({
      subcase_id: row.subcase_id,
      target_org_unit_id: row.target_org_unit_id,
      updated_at: row.updated_at,
      days_in_stage: Number(row.days_in_stage) || 0,
      status: row.status,
      stage: row.status, // Derived: stage = status
      assigned_level: '—', // Derived: placeholder value
    }));
}

// ============================================================================
// NOTE:
// Backend Insight endpoints do not yet support filters.
// Filters are intentionally stripped here (Phase 4C safe mode).
// ============================================================================

/**
 * Build normalized distribution request payload.
 * 
 * Frontend may pass extra fields:
 * {
 *   entity,
 *   dimension,
 *   org_unit_id,
 *   status,
 *   date_from,
 *   date_to,
 *   ...filters
 * }
 * 
 * Backend expects only:
 * {
 *   dimension
 * }
 * 
 * @param {Object} params - Request parameters
 * @returns {Object} Normalized payload with only dimension
 * @throws {Error} If dimension is missing
 */
function buildDistributionRequest(params) {
  // Validate required field
  if (!params || params.dimension === null || params.dimension === undefined) {
    throw new Error('dimension required');
  }

  // Return only dimension field
  return {
    dimension: params.dimension,
  };
}

/**
 * Build normalized trend request payload.
 * 
 * Frontend may pass extra fields:
 * {
 *   entity,
 *   interval,
 *   org_unit_id,
 *   status,
 *   date_from,
 *   date_to,
 *   ...filters
 * }
 * 
 * Backend expects:
 * {
 *   bucket
 * }
 * 
 * @param {Object} params - Request parameters
 * @returns {Object} Normalized payload with interval mapped to bucket
 * @throws {Error} If interval is missing
 */
function buildTrendRequest(params) {
  // Validate required field
  if (!params || params.interval === null || params.interval === undefined) {
    throw new Error('interval required');
  }

  // Map interval → bucket
  return {
    bucket: params.interval,
  };
}

/**
 * Build query parameters for stuck cases endpoint.
 * 
 * @param {number} daysThreshold - Days threshold for stuck cases (optional, defaults to 7)
 * @returns {Object} Query parameters with days_threshold
 */
function buildStuckQuery(daysThreshold) {
  return {
    days_threshold: daysThreshold ?? 7,
  };
}

/**
 * Adapt grouped inbox response from backend to frontend shape.
 * 
 * Backend Shape:
 * [
 *   {
 *     section_id,
 *     section_name,
 *     org_type,
 *     supervisor_name,
 *     pending_count,
 *     subcases: [{ subcase_id, case_description, patient_name, severity, waiting_days, ... }]
 *   }
 * ]
 * 
 * Frontend Shape (adds defensive fallbacks):
 * - Empty sections (pending_count = 0) are filtered out
 * - Missing supervisor shows "Unassigned"
 * - Seasonal reports get "NEUTRAL" severity
 * - Ensures subcases is always an array
 * - Infers org_type from section_name if not provided by backend
 * 
 * @param {Array|null|undefined} rawList - Raw backend response array
 * @returns {Array} Array of section objects with subcases
 */
function adaptGroupedInbox(rawList) {
  // Debug: log raw data to help diagnose issues
  console.log('[adaptGroupedInbox] Raw data received:', rawList);
  console.log('[adaptGroupedInbox] Is array:', Array.isArray(rawList));
  console.log('[adaptGroupedInbox] Length:', rawList?.length);
  
  // Defensive fallback to prevent UI crash on bad payload
  if (!Array.isArray(rawList)) {
    console.warn('[adaptGroupedInbox] Data is not an array, returning empty');
    return [];
  }

  /**
   * Infer org_type from section_name using Arabic/English pattern matching.
   * Used as fallback when backend doesn't provide org_type correctly.
   */
  function inferOrgType(sectionName, backendOrgType) {
    // Safely convert to string (backend may return numeric type codes like 323)
    const orgTypeStr = backendOrgType != null ? String(backendOrgType).toUpperCase() : '';
    
    // If backend provided a valid org_type string, use it
    if (['DEPARTMENT', 'ADMINISTRATION'].includes(orgTypeStr)) {
      return orgTypeStr;
    }

    const name = (sectionName || '').toLowerCase();
    
    // Administration patterns (Arabic/English)
    // الادارة، الإدارة، ادارة، إدارة = Administration
    const adminPatterns = [
      'الادارة', 'الإدارة', 'ادارة', 'إدارة', // Arabic with/without ال
      'administration', 'admin', 'الادارية', 'الإدارية'
    ];
    
    // Department patterns (Arabic/English)
    // دائرة، الدائرة، department
    const deptPatterns = [
      'دائرة', 'الدائرة', 'department', 'dept'
    ];
    
    // Check for administration
    for (const pattern of adminPatterns) {
      if (name.includes(pattern)) {
        return 'ADMINISTRATION';
      }
    }
    
    // Check for department
    for (const pattern of deptPatterns) {
      if (name.includes(pattern)) {
        return 'DEPARTMENT';
      }
    }
    
    // Default to SECTION (includes قسم patterns)
    return 'SECTION';
  }

  const nonNull = rawList.filter(section => section != null);
  console.log('[adaptGroupedInbox] Non-null sections:', nonNull.length);
  
  const withPending = nonNull.filter(section => section.pending_count > 0);
  console.log('[adaptGroupedInbox] Sections with pending_count > 0:', withPending.length);
  
  // Log first section to see structure
  if (rawList.length > 0) {
    console.log('[adaptGroupedInbox] First section structure:', {
      section_id: rawList[0]?.section_id,
      section_name: rawList[0]?.section_name,
      pending_count: rawList[0]?.pending_count,
      subcases_length: rawList[0]?.subcases?.length
    });
  }

  return nonNull
    .filter(section => section.pending_count > 0) // Hide empty sections
    .map(section => ({
      section_id: section.section_id,
      section_name: String(section.section_name ?? 'Unknown Section'),
      org_type: inferOrgType(section.section_name, section.org_type),
      supervisor_name: String(section.supervisor_name ?? 'Unassigned'),
      pending_count: Number(section.pending_count) || 0,
      subcases: Array.isArray(section.subcases) 
        ? section.subcases.map(subcase => ({
            subcase_id: subcase.subcase_id,
            case_type: subcase.case_type,
            incident_id: subcase.incident_request_case_id || subcase.incident_id,
            incident_number: subcase.incident_number || null,
            seasonal_report_id: subcase.seasonal_report_id,
            case_description: String(subcase.case_description ?? ''),
            patient_name: String(subcase.patient_name ?? ''),
            severity: subcase.severity ?? 'NEUTRAL', // Neutral for seasonal reports
            severity_id: subcase.severity_id,
            category: String(subcase.category ?? ''),
            waiting_days: Number(subcase.waiting_days) || 0,
            created_at: subcase.created_at,
            status: subcase.status,
            force_close_reason: subcase.force_close_reason || null,
            is_red_flag: Boolean(subcase.is_red_flag),
            is_never_event: Boolean(subcase.is_never_event),
            is_morbidity: Boolean(subcase.is_morbidity),
            is_late: Boolean(
              subcase.is_late ||
              subcase.section_late_reply ||
              subcase.department_late_reply ||
              subcase.administration_late_reply
            ),
          }))
        : [],
    }));
}

// ============================================================================
// EXPORTED API FUNCTIONS
// ============================================================================

/**
 * Get KPI summary metrics
 * @returns {Promise<Object>} KPI data with counts
 */
export async function getInsightKpis() {
  try {
    const res = await apiClient.get('/api/v2/insight/kpi-summary');
    return adaptKpiSummary(res.data);
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load KPI summary';
    throw new Error(message);
  }
}

/**
 * Get distribution data (status, stage, etc.)
 * @param {Object} params - { entity, dimension }
 * @returns {Promise<Object>} Distribution data
 */
export async function getInsightDistribution(params) {
  try {
    const payload = buildDistributionRequest(params);
    const res = await apiClient.post('/api/v2/insight/distribution', payload);
    return adaptDistribution(res.data);
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load distribution data';
    throw new Error(message);
  }
}

/**
 * Get raw subcase status counts, unmapped to any display label.
 * @param {Object} params - { dimension }
 * @returns {Promise<Array>} Array of {status, count} objects
 */
export async function getInsightStatusCounts(params) {
  try {
    const payload = buildDistributionRequest(params);
    const res = await apiClient.post('/api/v2/insight/distribution', payload);
    return adaptStatusCounts(res.data);
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load status counts';
    throw new Error(message);
  }
}

/**
 * Get trend data over time
 * @param {Object} params - { entity, interval }
 * @returns {Promise<Object>} Trend data
  buildTrendRequest,
 */
export async function getInsightTrend(params) {
  try {
    const payload = buildTrendRequest(params);
    const res = await apiClient.post('/api/v2/insight/trend', payload);
    return adaptTrend(res.data);
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load trend data';
    throw new Error(message);
  }
}

/**
 * Get stuck/escalated cases
 * @param {number} daysThreshold - Optional days threshold (defaults to 7)
 * @returns {Promise<Object>} Stuck cases data
 */
export async function getStuckCases(daysThreshold) {
  try {
    const query = buildStuckQuery(daysThreshold);
    const res = await apiClient.get('/api/v2/insight/stuck', { params: query });
    return adaptStuckCases(res.data);
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load stuck cases';
    throw new Error(message);
  }
}

/**
 * Get user workload summary (person-centric view)
 * @param {Object} filters - Optional filters { orgUnitId, role, minItems, sortBy, sortOrder }
 * @returns {Promise<Array>} User workload data
 */
export async function getUserWorkload(filters = {}) {
  try {
    const params = {};
    if (filters.orgUnitId) params.org_unit_id = filters.orgUnitId;
    if (filters.role) params.role = filters.role;
    if (filters.minItems) params.min_items = filters.minItems;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.sortOrder) params.sort_order = filters.sortOrder;
    
    const res = await apiClient.get('/api/v2/insight/user-workload', { params });
    // Backend returns array directly - no adaptation needed
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load user workload';
    throw new Error(message);
  }
}

/**
 * Get grouped inbox for administration overview
 * Shows all sections with pending subcases, supervisor names, and case details
 * 
 * @returns {Promise<Array>} Grouped inbox data with sections and subcases
 */
export async function getGroupedInbox() {
  try {
    console.log('[getGroupedInbox] Calling /api/v2/insight/grouped-inbox...');
    const res = await apiClient.get('/api/v2/insight/grouped-inbox');
    console.log('[getGroupedInbox] Response status:', res.status);
    console.log('[getGroupedInbox] Response data type:', typeof res.data);
    console.log('[getGroupedInbox] Response data:', res.data);
    return adaptGroupedInbox(res.data);
  } catch (err) {
    console.error('[getGroupedInbox] API Error:', err);
    console.error('[getGroupedInbox] Error response:', err.response?.data);
    const message = err.response?.data?.detail || 'Failed to load grouped inbox';
    throw new Error(message);
  }
}

/**
 * Get force-closed subcases for the Insight page tabs.
 * Authorization: COMPLAINT_SUPERVISOR and WORKER only (enforced by backend).
 *
 * @param {'FORCE_CLOSED_DRAFT'|'FORCE_CLOSED_COMPLETE'} status
 * @returns {Promise<Array>} Array of force-closed subcase objects
 */
export async function getForceClosedCases(status) {
  try {
    const res = await apiClient.get('/api/v2/insight/force-closed', { params: { status } });
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(row => ({
      subcase_id: row.subcase_id,
      case_type: row.case_type,
      status: row.status,
      created_at: row.created_at,
      force_closed_at: row.force_closed_at,
      force_close_reason: row.force_close_reason,
      waiting_days: Number(row.waiting_days) || 0,
      target_org_unit_id: row.target_org_unit_id,
      org_unit_name: String(row.org_unit_name ?? ''),
      incident_request_case_id: row.incident_request_case_id,
      incident_number: row.incident_number || null,
      case_description: String(row.case_description ?? ''),
      patient_name: String(row.patient_name ?? ''),
      severity: row.severity ?? 'NEUTRAL',
      severity_id: row.severity_id,
      category: String(row.category ?? ''),
      is_red_flag: Boolean(row.is_red_flag),
      is_never_event: Boolean(row.is_never_event),
      seasonal_report_id: row.seasonal_report_id,
    }));
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load force-closed cases';
    throw new Error(message);
  }
}

/**
 * Get administrative complaint subcases waiting for the Patient Services
 * scientific decision (قرار خدمات المرضى بحسب المراجع العلميّة).
 *
 * Endpoint: GET /api/v2/insight/patient-services-pending
 * Scope-filtered by backend (Phase 2.5 allowed_unit_ids).
 *
 * @returns {Promise<Array>} Array of subcase objects with fields:
 *   subcase_id, incident_request_case_id, incident_number,
 *   target_org_unit_id, org_unit_name, status, created_at, updated_at,
 *   administration_explanation_text
 */
export async function getPatientServicesPendingCases() {
  try {
    const res = await apiClient.get('/api/v2/insight/patient-services-pending');
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(row => ({
      subcaseId: row.subcase_id,
      incidentId: row.incident_request_case_id,
      incidentNumber: row.incident_number || null,
      targetOrgUnitId: row.target_org_unit_id,
      targetOrgUnitName: row.org_unit_name || null,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
      administrationExplanationText: row.administration_explanation_text || '',
    }));
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load patient services pending cases';
    throw new Error(message);
  }
}


/**
 * Get pipeline-stuck force-closed cases (FORCE_CLOSED_AT_SECTION/DEPARTMENT/ADMINISTRATION).
 * Authorization: COMPLAINT_SUPERVISOR and SOFTWARE_ADMIN only (enforced by backend).
 *
 * @returns {Promise<Array>} Array of force-closed pipeline subcase objects
 */
export async function getForceClosedPipelineCases() {
  try {
    const res = await apiClient.get('/api/v2/insight/force-closed-pipeline');
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(row => ({
      subcase_id:               row.subcase_id,
      case_type:                row.case_type,
      status:                   row.status,
      created_at:               row.created_at,
      waiting_days:             Number(row.waiting_days) || 0,
      target_org_unit_id:       row.target_org_unit_id,
      org_unit_name:            String(row.org_unit_name ?? ''),
      incident_request_case_id: row.incident_request_case_id,
      incident_id:              row.incident_request_case_id,
      incident_number:          row.incident_number || null,
      case_description:         String(row.case_description ?? ''),
      patient_name:             String(row.patient_name ?? ''),
      severity:                 row.severity ?? 'NEUTRAL',
      severity_id:              row.severity_id,
      category:                 String(row.category ?? ''),
      is_red_flag:              Boolean(row.is_red_flag),
      is_never_event:           Boolean(row.is_never_event),
      seasonal_report_id:       row.seasonal_report_id,
      give_more_time_action:    row.give_more_time_action || null,
    }));
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load force-closed pipeline cases';
    throw new Error(message);
  }
}


/**
 * Export current Insight page state as a Word (.docx) document and trigger download.
 *
 * @param {Object} options
 * @param {string} [options.searchTerm] - Current search filter value from the Insight page
 */
export async function exportInsightWord({ searchTerm } = {}) {
  const params = {};
  if (searchTerm && searchTerm.trim()) {
    params.search_term = searchTerm.trim();
  }

  const res = await apiClient.get('/api/v2/insight/export-word', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob(
    [res.data],
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `insight_report_${dateStr}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// TEST EXPORTS (for unit testing only)
// ============================================================================

export {
  adaptKpiSummary,
  adaptDistribution,
  adaptStatusCounts,
  adaptTrend,
  adaptStuckCases,
  adaptGroupedInbox,
  buildDistributionRequest,
  buildTrendRequest,
  buildStuckQuery,
};
