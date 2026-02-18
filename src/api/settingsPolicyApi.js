// src/api/settingsPolicyApi.js
// API service for policy configuration settings
import apiClient from "./apiClient";

const POLICY_BASE = "/api/settings/policy";

/**
 * Fetch the policy configuration for a specific department
 * GET /api/settings/policy/:departmentId
 * Returns: { policy: { severityLimits, highSeverityPercentageLimits, ruleActivation } }
 */
export const fetchPolicy = async (departmentId) => {
  const response = await apiClient.get(`${POLICY_BASE}/${departmentId}`);
  return response.data;
};

/**
 * Save (create or update) the policy configuration for a department
 * PUT /api/settings/policy/:departmentId
 * Body: { severityLimits, highSeverityPercentageLimits, ruleActivation }
 */
export const savePolicy = async (departmentId, policyData) => {
  const response = await apiClient.put(`${POLICY_BASE}/${departmentId}`, policyData);
  return response.data;
};
