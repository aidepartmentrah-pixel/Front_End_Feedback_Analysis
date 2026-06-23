// frontend/src/api/policy.js
import apiClient from "./apiClient";

/**
 * Fetch scope-driven domain targets (Clinical/Management/Relational) for
 * Target Analysis (HCAT Iteration 4, Session 2).
 *
 * Targets are raw incident-count ceilings, not percentages — the schema has
 * no percentage-of-total field. Section scope always returns
 * has_domain_targets=false: section policy is classification-based, not
 * domain-based.
 *
 * @param {Object} params - Query parameters
 * @param {string} params.scope - Scope: "hospital", "administration", "department", "section"
 * @param {number} [params.administration_id] - Required when scope is "administration"
 * @param {number} [params.department_id] - Required when scope is "department"
 * @returns {Promise<Object>} { scope, has_domain_targets, clinical_domain_limit, management_domain_limit, relational_domain_limit }
 */
export async function fetchDomainTargets({
  scope = "hospital",
  administration_id = null,
  department_id = null,
} = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append("scope", scope);

  if (scope === "administration" && administration_id) {
    queryParams.append("administration_id", administration_id);
  }
  if (scope === "department" && department_id) {
    queryParams.append("department_id", department_id);
  }

  const url = `/api/org-policy/target?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to load domain targets: ${error.message}`);
  }
}
