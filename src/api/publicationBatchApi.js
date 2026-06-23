// src/api/publicationBatchApi.js
// API service for Publication Batch Tracking (HCAT Performance & Delay Monitoring - Session 1)
import apiClient from "./apiClient";

const PUBLICATION_BATCHES_BASE = "/api/publication-batches";

/**
 * Fetch the latest publication batches (most recent first).
 * GET /api/publication-batches/recent
 * Returns: { batches: [{ publication_batch_id, publication_serial, published_at, published_by, cases_published_count }] }
 */
export const fetchRecentPublicationBatches = async () => {
  const response = await apiClient.get(`${PUBLICATION_BATCHES_BASE}/recent`);
  return response.data;
};

/**
 * Fetch the cases included in a single publication batch.
 * GET /api/publication-batches/{batch_id}/cases
 * Returns: { cases: [{ publication_batch_case_id, incident_case_id, administrative_subcase_id, target_org_unit_id }] }
 */
export const fetchPublicationBatchCases = async (batchId) => {
  const response = await apiClient.get(`${PUBLICATION_BATCHES_BASE}/${batchId}/cases`);
  return response.data;
};
