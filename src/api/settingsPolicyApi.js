// src/api/settingsPolicyApi.js
// API service for organizational unit policy configuration (Policy Metrics Refactor)
import apiClient from "./apiClient";

const ORG_POLICY_BASE = "/api/org-policy";

/**
 * Load all 4 policy cards in one request.
 * GET /api/org-policy/levels
 * Returns: { hospital: {...}, sections: {...}, departments: {...}, administrations: {...} }
 */
export const fetchOrgLevelPolicy = async () => {
  const response = await apiClient.get(`${ORG_POLICY_BASE}/levels`);
  return response.data;
};

/**
 * Save hospital policy (single global row).
 * PUT /api/org-policy/hospital
 * Body: { low_severity_limit, medium_severity_limit, high_severity_limit,
 *         clinical_domain_limit, management_domain_limit, relational_domain_limit }
 */
export const saveHospitalPolicy = async (data) => {
  const response = await apiClient.put(`${ORG_POLICY_BASE}/hospital`, data);
  return response.data;
};

/**
 * Save sections policy — overwrites ALL section rows identically.
 * PUT /api/org-policy/sections
 * Body: { all_limit, medium_limit, high_limit }
 *   all_limit    → LowSeverityLimit  (low-severity incidents per HCAT classification)
 *   medium_limit → MediumSeverityLimit
 *   high_limit   → HighSeverityLimit
 */
export const saveSectionsPolicy = async (data) => {
  const response = await apiClient.put(`${ORG_POLICY_BASE}/sections`, data);
  return response.data;
};

/**
 * Save departments policy — overwrites ALL department rows identically.
 * PUT /api/org-policy/departments
 * Body: { clinical_domain_limit, management_domain_limit, relational_domain_limit }
 */
export const saveDepartmentsPolicy = async (data) => {
  const response = await apiClient.put(`${ORG_POLICY_BASE}/departments`, data);
  return response.data;
};

/**
 * Save administrations policy — overwrites ALL administration rows identically.
 * PUT /api/org-policy/administrations
 * Body: { clinical_domain_limit, management_domain_limit, relational_domain_limit }
 */
export const saveAdministrationsPolicy = async (data) => {
  const response = await apiClient.put(`${ORG_POLICY_BASE}/administrations`, data);
  return response.data;
};
