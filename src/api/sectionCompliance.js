// src/api/sectionCompliance.js
import apiClient from "./apiClient";

/**
 * Fetch section compliance data for the Section Compliance module.
 *
 * scope=section  → one specific section vs its policy targets.
 * scope=hospital → all sections aggregated per classification (Option B).
 *
 * Dates use the page-level From/To range (same component, different module).
 *
 * @param {Object} params
 * @param {string} params.scope         - "section" | "hospital"
 * @param {string} params.start_date    - YYYY-MM-DD
 * @param {string} params.end_date      - YYYY-MM-DD
 * @param {number} [params.section_id]  - Required when scope="section"
 */
export async function fetchSectionCompliance({
  scope,
  start_date,
  end_date,
  section_id = null,
} = {}) {
  const q = new URLSearchParams({ scope, start_date, end_date });
  if (scope === "section" && section_id) {
    q.append("section_id", section_id);
  }
  const url = `/api/org-policy/section-compliance?${q.toString()}`;
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to load section compliance: ${error.message}`);
  }
}
