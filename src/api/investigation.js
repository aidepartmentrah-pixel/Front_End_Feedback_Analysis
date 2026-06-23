// src/api/investigation.js

import apiClient from "./apiClient";

/**
 * Fetch available seasons from the backend.
 * Used by the seasonal period selector.
 * Each season includes start_date and end_date so the caller can
 * pass those directly to fetchInvestigationTree.
 *
 * @returns {Promise<{seasons: Array, current_season: string}>}
 */
export async function fetchSeasons() {
  const response = await apiClient.get("/api/investigation/seasons");
  return response.data;
}

const VALID_TREE_TYPES = [
  "incident_count",
  "domain_distribution_numbers",
  "domain_distribution_percentage",
  "severity_distribution_numbers",
  "severity_distribution_percentage",
  "red_flag_incidents",
  "never_event_incidents",
  "notice_count",
];

/**
 * Fetch hierarchical investigation tree with aggregated incident data.
 *
 * @param {Object} params
 * @param {string} params.start_date   ISO date string "YYYY-MM-DD"
 * @param {string} params.end_date     ISO date string "YYYY-MM-DD"
 * @param {string} params.tree_type    One of VALID_TREE_TYPES
 * @param {number|null} params.administration_id
 * @param {number|null} params.department_id
 * @param {number|null} params.section_id
 * @returns {Promise<Object>} Investigation tree data
 */
export async function fetchInvestigationTree({
  start_date,
  end_date,
  tree_type,
  administration_id = null,
  department_id = null,
  section_id = null,
}) {
  // ── validation ──────────────────────────────────────────────────────────
  const errors = [];

  if (!start_date) errors.push("start_date is required");
  if (!end_date)   errors.push("end_date is required");
  if (!tree_type || !VALID_TREE_TYPES.includes(tree_type))
    errors.push(`tree_type must be one of: ${VALID_TREE_TYPES.join(", ")}`);

  if (errors.length > 0) {
    throw new Error(`Invalid parameters: ${errors.join("; ")}`);
  }

  // ── build query string ───────────────────────────────────────────────────
  const params = new URLSearchParams();
  params.append("start_date", start_date);
  params.append("end_date",   end_date);
  params.append("tree_type",  tree_type);

  if (administration_id && !isNaN(administration_id))
    params.append("administration_id", String(administration_id));
  if (department_id && !isNaN(department_id))
    params.append("department_id", String(department_id));
  if (section_id && !isNaN(section_id))
    params.append("section_id", String(section_id));

  const response = await apiClient.get(`/api/investigation/tree?${params.toString()}`);
  return response.data;
}
