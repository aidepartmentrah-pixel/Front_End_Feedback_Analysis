// src/api/seasonalReports.js
// API service for Seasonal Reports

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Generate or regenerate a seasonal report
 * POST /api/seasonal-reports/generate
 * @param {Object} params - { seasonId, orgUnitId, orgUnitType }
 * @returns {Promise<Object>} Generated seasonal report
 */
export const generateSeasonalReport = async (params) => {
  try {
    console.log("🔄 Generating seasonal report:", params);
    
    const response = await fetch(`${API_BASE_URL}/api/seasonal-reports/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to generate seasonal report");
    }
    
    const data = await response.json();
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
    
    const response = await fetch(
      `${API_BASE_URL}/api/seasonal-reports/by-season?${queryParams.toString()}`
    );
    
    if (response.status === 404) {
      console.log("ℹ️ No seasonal report found for this season/org unit");
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to fetch seasonal report");
    }
    
    const data = await response.json();
    console.log("✅ Seasonal report found:", data);
    return data;
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
    
    const response = await fetch(`${API_BASE_URL}/api/seasonal-reports/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to fetch seasonal report");
    }
    
    const data = await response.json();
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
    
    const response = await fetch(
      `${API_BASE_URL}/api/seasonal-reports/${reportId}/explanation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to save explanation");
    }
    
    console.log("✅ Explanation saved successfully");
    
    // Return response data if backend sends any
    if (response.status !== 204) {
      return await response.json();
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
    
    const response = await fetch(
      `${API_BASE_URL}/api/action-items?seasonalReportId=${reportId}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to fetch action items");
    }
    
    const data = await response.json();
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
    
    const response = await fetch(
      `${API_BASE_URL}/api/seasonal-reports/${reportId}/export?format=${format}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to export report");
    }
    
    const blob = await response.blob();
    console.log("✅ Report exported successfully");
    
    return blob;
  } catch (error) {
    console.error("❌ Error exporting report:", error);
    throw error;
  }
};
