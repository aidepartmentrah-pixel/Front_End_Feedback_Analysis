// PHASE F — F-F1 — Action Log Export API Wrapper
// src/api/actionLogApi.js

import apiClient from "./apiClient";

/**
 * Export Action Log report as Word document for a specific season.
 * 
 * @param {number|string} seasonId - The season ID to generate report for
 * @returns {Promise<Blob>} Word document blob
 * @throws {Error} Propagates API errors to caller
 */
export async function exportActionLog(seasonId) {
  const response = await apiClient.get("/api/v2/action-log/export", {
    params: { season_id: seasonId },
    responseType: "blob",
  });

  return response.data;
}

/**
 * Export Action Log report as Word document for a custom date range.
 *
 * @param {string} dateFrom - Start date as "YYYY-MM-DD" (inclusive)
 * @param {string} dateTo   - End date as "YYYY-MM-DD" (inclusive)
 * @returns {Promise<Blob>} Word document blob
 * @throws {Error} Propagates API errors to caller
 */
export async function exportActionLogByDateRange(dateFrom, dateTo) {
  const response = await apiClient.get("/api/v2/action-log/export-by-date", {
    params: { date_from: dateFrom, date_to: dateTo },
    responseType: "blob",
  });

  return response.data;
}
