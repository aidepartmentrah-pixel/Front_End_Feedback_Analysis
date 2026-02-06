// src/api/seasonalReports.js
// API service for Seasonal Reports

import apiClient from "./apiClient";

/**
 * Generate or regenerate a seasonal report
 * POST /api/seasonal-reports/generate
 * @param {Object} params - { seasonId, orgUnitId, orgUnitType }
 * @returns {Promise<Object>} Generated seasonal report
 */
export const generateSeasonalReport = async (params) => {
  try {
    console.log("🔄 Generating seasonal report:", params);
    
    const response = await apiClient.post(`/api/seasonal-reports/generate`, params);
    
    const data = response.data;
    console.log("✅ Seasonal report generated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error generating seasonal report:", error);
    throw error;
  }
};

/**
 * Get seasonal report by season and org unit
 * GET /api/seasonal-reports/by-season?seasonId=X&orgUnitId=Y&orgUnitType=Z
 * @param {Object} params - { seasonId, orgUnitId, orgUnitType }
 * @returns {Promise<Object|null>} Seasonal report or null if not found
 */
export const getSeasonalReportBySeason = async (params) => {
  try {
    const { seasonId, orgUnitId, orgUnitType } = params;
    console.log("🔍 Fetching seasonal report by season:", params);
    
    const queryParams = new URLSearchParams({
      seasonId: seasonId.toString(),
      orgUnitId: orgUnitId.toString(),
      orgUnitType: orgUnitType.toString(),
    });
    
    try {
      const response = await apiClient.get(
        `/api/seasonal-reports/by-season?${queryParams.toString()}`
      );
      
      const data = response.data;
      console.log("✅ Seasonal report found:", data);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("ℹ️ No seasonal report found for this season/org unit");
        return null;
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Error fetching seasonal report by season:", error);
    throw error;
  }
};

/**
 * Get seasonal report by ID
 * GET /api/seasonal-reports/{id}
 * @param {number} id - Seasonal report ID
 * @returns {Promise<Object>} Seasonal report
 */
export const getSeasonalReportById = async (id) => {
  try {
    console.log("🔍 Fetching seasonal report by ID:", id);
    
    const response = await apiClient.get(`/api/seasonal-reports/${id}`);
    
    const data = response.data;
    console.log("✅ Seasonal report fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching seasonal report by ID:", error);
    throw error;
  }
};

/**
 * Save or update explanation for a seasonal report
 * POST /api/seasonal-reports/{id}/explanation
 * @param {number} reportId - Seasonal report ID
 * @param {Object} payload - { explanationStatusId, explanationText }
 * @returns {Promise<void>}
 */
export const saveSeasonalReportExplanation = async (reportId, payload) => {
  try {
    console.log("💾 Saving explanation for seasonal report:", reportId, payload);
    
    const response = await apiClient.post(
      `/api/seasonal-reports/${reportId}/explanation`,
      payload
    );
    
    console.log("✅ Explanation saved successfully");
    
    // Return response data if backend sends any
    if (response.status !== 204) {
      return response.data;
    }
  } catch (error) {
    console.error("❌ Error saving explanation:", error);
    throw error;
  }
};

/**
 * Get action items linked to a seasonal report
 * GET /api/action-items?seasonalReportId={reportId}
 * @param {number} reportId - Seasonal report ID
 * @returns {Promise<Array>} List of action items
 */
export const getActionItemsBySeasonalReport = async (reportId) => {
  try {
    console.log("🔍 Fetching action items for seasonal report:", reportId);
    
    const response = await apiClient.get(
      `/api/action-items?seasonalReportId=${reportId}`
    );
    
    const data = response.data;
    console.log("✅ Action items fetched:", data);
    
    // Handle both array response and object with items array
    return Array.isArray(data) ? data : (data.actionItems || data.items || []);
  } catch (error) {
    console.error("❌ Error fetching action items:", error);
    throw error;
  }
};

/**
 * Export seasonal report to Word/PDF
 * GET /api/seasonal-reports/{id}/export?format=pdf|docx
 * @param {number} reportId - Seasonal report ID
 * @param {string} format - Export format: "pdf" or "docx"
 * @returns {Promise<Blob>} File blob for download
 */
export const exportSeasonalReport = async (reportId, format = "pdf") => {
  try {
    console.log(`📄 Exporting seasonal report ${reportId} as ${format}`);
    
    const response = await apiClient.get(
      `/api/seasonal-reports/${reportId}/export?format=${format}`,
      { responseType: 'blob' }
    );
    
    const blob = response.data;
    console.log("✅ Report exported successfully");
    
    return blob;
  } catch (error) {
    console.error("❌ Error exporting report:", error);
    throw error;
  }
};

/**
 * Get available quarters for seasonal reports
 * GET /api/seasonal-comparison/available-quarters
 * @param {number} orgunitId - Organization unit ID (default: 1 for hospital)
 * @param {number} orgunitType - Organization type: 0=Hospital, 1=Admin, 2=Dept, 3=Section (default: 0)
 * @returns {Promise<Array>} List of available seasons
 */
export const getAvailableQuarters = async (orgunitId = 1, orgunitType = 0) => {
  try {
    console.log("🔍 Fetching available quarters for orgunit:", { orgunitId, orgunitType });
    
    const queryParams = new URLSearchParams({
      orgunit_id: orgunitId.toString(),
      orgunit_type: orgunitType.toString()
    });
    
    const response = await apiClient.get(
      `/api/seasonal-comparison/available-quarters?${queryParams.toString()}`
    );
    
    const data = response.data;
    console.log("✅ Available quarters fetched:", data);
    return data.available_seasons || data.seasons || data || [];
  } catch (error) {
    console.error("❌ Error fetching available quarters:", error);
    throw error;
  }
};

/**
 * View/Generate single seasonal report
 * POST /api/reports/seasonal/view
 * @param {Object} params - { year, trimester, orgunit_id, orgunit_type, user_id }
 * @returns {Promise<Object>} JSON report data
 */
export const viewSeasonalReport = async (params) => {
  try {
    console.log("📄 Viewing seasonal report:", params);
    
    const response = await apiClient.post(`/api/reports/seasonal/view`, params);
    
    const data = response.data;
    console.log("✅ Seasonal report generated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error generating seasonal report:", error);
    throw error;
  }
};

/**
 * Export single seasonal report
 * POST /api/reports/seasonal/export
 * @param {Object} params - { year, period, orgunit_id, orgunit_type, format, language }
 * @returns {Promise<Blob|Object>} File blob for export formats or JSON data
 */
export const exportSingleSeasonalReport = async (params) => {
  try {
    console.log("📄 Exporting single seasonal report:", params);
    
    const isFileFormat = ["docx", "pdf", "xlsx", "csv"].includes(params.format);
    const response = await apiClient.post(`/api/reports/seasonal/export`, params, {
      responseType: isFileFormat ? 'blob' : 'json'
    });
    
    if (isFileFormat) {
      const blob = response.data;
      console.log("✅ Report exported successfully as", params.format);
      return { blob, contentType: response.headers['content-type'], contentDisposition: response.headers['content-disposition'] };
    } else {
      const data = response.data;
      console.log("✅ JSON report exported successfully");
      return data;
    }
  } catch (error) {
    console.error("❌ Error exporting single seasonal report:", error);
    throw error;
  }
};

/**
 * Generate 2-quarter comparison report
 * POST /api/seasonal-comparison/2-quarters
 * @param {Object} params - { season_ids, orgunit_id, orgunit_type, format }
 * @returns {Promise<Blob|Object>} File blob for DOCX or JSON data
 */
export const generate2QuarterComparison = async (params) => {
  try {
    console.log("📊 Generating 2-quarter comparison:", params);
    
    const isDocx = params.format === "docx";
    const response = await apiClient.post(`/api/seasonal-comparison/2-quarters`, params, {
      responseType: isDocx ? 'blob' : 'json'
    });
    
    if (isDocx) {
      const blob = response.data;
      console.log("✅ 2-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers['content-type'], contentDisposition: response.headers['content-disposition'] };
    } else {
      const data = response.data;
      console.log("✅ 2-quarter JSON comparison generated successfully");
      return data;
    }
  } catch (error) {
    console.error("❌ Error generating 2-quarter comparison:", error);
    throw error;
  }
};

/**
 * Generate 3-quarter comparison report
 * POST /api/seasonal-comparison/3-quarters
 * @param {Object} params - { season_ids, orgunit_id, orgunit_type, format }
 * @returns {Promise<Blob|Object>} File blob for DOCX or JSON data
 */
export const generate3QuarterComparison = async (params) => {
  try {
    console.log("📊 Generating 3-quarter comparison:", params);
    
    const isDocx = params.format === "docx";
    const response = await apiClient.post(`/api/seasonal-comparison/3-quarters`, params, {
      responseType: isDocx ? 'blob' : 'json'
    });
    
    if (isDocx) {
      const blob = response.data;
      console.log("✅ 3-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers['content-type'], contentDisposition: response.headers['content-disposition'] };
    } else {
      const data = response.data;
      console.log("✅ 3-quarter JSON comparison generated successfully");
      return data;
    }
  } catch (error) {
    console.error("❌ Error generating 3-quarter comparison:", error);
    throw error;
  }
};

/**
 * Generate 4-quarter comparison report
 * POST /api/seasonal-comparison/4-quarters
 * @param {Object} params - { season_ids, orgunit_id, orgunit_type, format }
 * @returns {Promise<Blob|Object>} File blob for DOCX or JSON data
 */
export const generate4QuarterComparison = async (params) => {
  try {
    console.log("📊 Generating 4-quarter comparison:", params);
    
    const isDocx = params.format === "docx";
    const response = await apiClient.post(`/api/seasonal-comparison/4-quarters`, params, {
      responseType: isDocx ? 'blob' : 'json'
    });
    
    if (isDocx) {
      const blob = response.data;
      console.log("✅ 4-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers['content-type'], contentDisposition: response.headers['content-disposition'] };
    } else {
      const data = response.data;
      console.log("✅ 4-quarter JSON comparison generated successfully");
      return data;
    }
  } catch (error) {
    console.error("❌ Error generating 4-quarter comparison:", error);
    throw error;
  }
};
