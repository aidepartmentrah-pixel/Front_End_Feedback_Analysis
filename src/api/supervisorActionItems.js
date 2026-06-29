// src/api/supervisorActionItems.js
/**
 * Normalized API wrapper for /api/v2/supervisor-action-items.
 * Action Item Coordination (Iteration 4) — administrative scope.
 */

import apiClient from './apiClient';
import { parseDueDate } from '../utils/dateOnly';

const toDateOrNull = (value) => (value ? new Date(value) : null);

const mapError = (error) => {
  if (error.response?.data) {
    const detail = error.response.data.detail || 'Supervisor action item API error';
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    err.response = error.response;
    return err;
  }
  if (error.request) return new Error('Network error');
  return new Error('Supervisor action item API error');
};

const normalizeItem = (raw) => ({
  actionItemId: raw.action_item_id,
  incidentRequestCaseId: raw.incident_request_case_id,
  subcaseId: raw.subcase_id,
  targetOrgUnitId: raw.target_org_unit_id,
  targetUserId: raw.target_user_id,
  createdByUserId: raw.created_by_user_id,
  createdByRoleCode: raw.created_by_role_code,
  description: raw.description,
  dueDate: parseDueDate(raw.due_date),
  status: raw.status,
  createdAt: toDateOrNull(raw.created_at),
  completedAt: toDateOrNull(raw.completed_at),
  cancelledAt: toDateOrNull(raw.cancelled_at),
  updatedAt: toDateOrNull(raw.updated_at),
  updatedByUserId: raw.updated_by_user_id,
  targetOrgUnitName: raw.target_org_unit_name,
  targetUserDisplayName: raw.target_user_display_name,
  createdByDisplayName: raw.created_by_display_name,
  caseDescription: raw.case_description,
  patientName: raw.patient_name,
  incidentNumber: raw.incident_number,
  // Discriminator so the calendar merge can badge these differently from
  // normal case-bound follow-up items.
  sourceType: 'SUPERVISOR',
});

/**
 * Create a new supervisor action item.
 * Only Complaint Supervisor / Software Admin may call this.
 */
export const createSupervisorActionItem = async ({
  incidentRequestCaseId,
  targetOrgUnitId,
  description,
  subcaseId = null,
  targetUserId = null,
  dueDate = null,
}) => {
  try {
    const resp = await apiClient.post('/api/v2/supervisor-action-items', {
      incident_request_case_id: incidentRequestCaseId,
      target_org_unit_id: targetOrgUnitId,
      description,
      subcase_id: subcaseId || undefined,
      target_user_id: targetUserId || undefined,
      due_date: dueDate || undefined,
    });
    return normalizeItem(resp.data.item);
  } catch (err) {
    throw mapError(err);
  }
};

/**
 * List supervisor action items visible to the current user (scoped server-side).
 */
export const listSupervisorActionItems = async () => {
  try {
    const resp = await apiClient.get('/api/v2/supervisor-action-items');
    return (resp.data.items || []).map(normalizeItem);
  } catch (err) {
    throw mapError(err);
  }
};

/**
 * Mark a supervisor action item as completed.
 */
export const completeSupervisorActionItem = async (actionItemId) => {
  try {
    const resp = await apiClient.post(`/api/v2/supervisor-action-items/${actionItemId}/complete`);
    return normalizeItem(resp.data.item);
  } catch (err) {
    throw mapError(err);
  }
};

/**
 * Cancel a supervisor action item (creator only).
 */
export const cancelSupervisorActionItem = async (actionItemId) => {
  try {
    const resp = await apiClient.post(`/api/v2/supervisor-action-items/${actionItemId}/cancel`);
    return normalizeItem(resp.data.item);
  } catch (err) {
    throw mapError(err);
  }
};
