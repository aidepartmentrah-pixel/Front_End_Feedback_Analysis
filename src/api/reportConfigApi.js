/**
 * Report Configuration API
 * Manages institutional header / footer / report-code metadata stored in APP_ReportConfig.
 */

const BASE = "/api/settings/report-config";

/**
 * Fetch all report config values.
 * @returns {Promise<{header_title, header_subtitle, footer_text, report_code}>}
 */
export async function getReportConfig() {
  const resp = await fetch(BASE, { credentials: "include" });
  if (!resp.ok) throw new Error(`GET report-config failed: ${resp.status}`);
  return resp.json();
}

/**
 * Update one or more report config values.
 * @param {Partial<{header_title, header_subtitle, footer_text, report_code}>} updates
 * @returns {Promise<{header_title, header_subtitle, footer_text, report_code}>}
 */
export async function updateReportConfig(updates) {
  const resp = await fetch(BASE, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.detail || `PUT report-config failed: ${resp.status}`);
  }
  return resp.json();
}
