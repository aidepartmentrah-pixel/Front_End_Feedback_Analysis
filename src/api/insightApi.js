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
function adaptDistribution(rawList) {
  // Defensive fallback to prevent Insight UI crash on bad payload
  if (!Array.isArray(rawList)) {
    return [];
  }

  // Map each item to {label, value} format
  return rawList
    .filter(row => row != null) // Skip null/undefined rows
    .map(row => ({
      label: String(row.key ?? ''),
      value: Number(row.count) || 0,
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

// ============================================================================
// TEST EXPORTS (for unit testing only)
// ============================================================================

export { 
  adaptKpiSummary, 
  adaptDistribution, 
  adaptTrend, 
  adaptStuckCases,
  buildDistributionRequest,
  buildTrendRequest,
  buildStuckQuery,
};
