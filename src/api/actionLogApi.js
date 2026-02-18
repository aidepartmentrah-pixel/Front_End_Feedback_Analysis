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
