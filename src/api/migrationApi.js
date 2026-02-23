// src/api/migrationApi.js
// API service for Migration Main Page (Phase K)
import apiClient from "./apiClient";

/**
 * Fetch paginated list of legacy cases that are not yet migrated
 * GET /api/migration/legacy/list?page=&page_size=
 * 
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of records per page
 * @returns {Promise<{cases: Array, total: number}>} - Legacy cases and total count
 */
export const fetchLegacyCases = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get("/api/migration/legacy/list", {
      params: { page, page_size: pageSize },
    });
    
    const data = response.data;
    console.log("Legacy cases received:", data);
    
    // Normalize response structure
    return {
      cases: Array.isArray(data.cases) ? data.cases : (Array.isArray(data.items) ? data.items : []),
      total: data.total || data.total_count || 0,
    };
  } catch (error) {
    console.error("Error fetching legacy cases:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch legacy cases");
  }
};

/**
 * Fetch legacy case detail by ID
 * GET /api/migration/legacy/{id}
 * 
 * @param {number|string} legacyId - Legacy case ID
 * @returns {Promise<Object>} - Legacy case detail with concatenated preview
 */
export const fetchLegacyCaseDetail = async (legacyId) => {
  try {
    const response = await apiClient.get(`/api/migration/legacy/${legacyId}`);
    console.log("Legacy case detail received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching legacy case detail:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch legacy case detail");
  }
};

/**
 * Fetch migration progress statistics
 * GET /api/migration/progress
 * 
 * @returns {Promise<{total: number, migrated: number, percent: number}>} - Progress stats
 */
export const fetchMigrationProgress = async () => {
  try {
    const response = await apiClient.get("/api/migration/progress");
    const data = response.data;
    
    console.log("Migration progress received:", data);
    
    // Normalize response structure
    // Backend returns: total_cases, migrated_cases, percent_complete
    return {
      total: data.total_cases || data.total_legacy || data.total || 0,
      migrated: data.migrated_cases || data.migrated_total || data.migrated || 0,
      percent: data.percent_complete || data.percent || 0,
    };
  } catch (error) {
    console.error("Error fetching migration progress:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch migration progress");
  }
};

/**
 * Submit migration for a legacy case
 * POST /api/migration/migrate/{legacy_id}
 * 
 * @param {number|string} legacyId - Legacy case ID
 * @param {Object} payload - Same structure as normal insert payload
 * @returns {Promise<Object>} - Migration result with new case ID
 */
export const submitMigration = async (legacyId, payload) => {
  try {
    const response = await apiClient.post(`/api/migration/migrate/${legacyId}`, payload);
    console.log("Migration submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting migration:", error);
    throw new Error(error.response?.data?.message || "Failed to submit migration");
  }
};

// Alias for K-UI-3 specification
export const migrateLegacyCase = submitMigration;
