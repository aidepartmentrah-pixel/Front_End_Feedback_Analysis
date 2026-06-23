// src/api/forceClosePolicyApi.js
// API service for the Automatic Force Close Policy settings (HCAT Session 6)
import apiClient from "./apiClient";

const FORCE_CLOSE_POLICY_BASE = "/api/settings/force-close-policy";

/**
 * Load the Automatic Force Close Policy settings.
 * GET /api/settings/force-close-policy
 * Returns: { automatic_force_close_enabled, section_deadline_days,
 *            department_deadline_days, administration_deadline_days, labels }
 */
export const fetchForceClosePolicy = async () => {
  const response = await apiClient.get(FORCE_CLOSE_POLICY_BASE);
  return response.data;
};

/**
 * Save the Automatic Force Close Policy settings.
 * PUT /api/settings/force-close-policy
 * Body: { automatic_force_close_enabled, section_deadline_days,
 *         department_deadline_days, administration_deadline_days }
 */
export const saveForceClosePolicy = async (data) => {
  const response = await apiClient.put(FORCE_CLOSE_POLICY_BASE, data);
  return response.data;
};
