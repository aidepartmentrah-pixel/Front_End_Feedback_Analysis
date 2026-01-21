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
    
    const response = await fetch(
      `${API_BASE_URL}/api/seasonal-comparison/available-quarters?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      throw new Error(error.detail?.message || error.message || "Failed to fetch available quarters");
    }
    
    const data = await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/api/reports/seasonal/view`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/reports/seasonal/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to export report");
    }
    
    if (params.format === "docx" || params.format === "pdf" || params.format === "xlsx" || params.format === "csv") {
      const blob = await response.blob();
      console.log("✅ Report exported successfully as", params.format);
      return { blob, contentType: response.headers.get("Content-Type"), contentDisposition: response.headers.get("Content-Disposition") };
    } else {
      const data = await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/api/seasonal-comparison/2-quarters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to generate 2-quarter comparison");
    }
    
    if (params.format === "docx") {
      const blob = await response.blob();
      console.log("✅ 2-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers.get("Content-Type"), contentDisposition: response.headers.get("Content-Disposition") };
    } else {
      const data = await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/api/seasonal-comparison/3-quarters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to generate 3-quarter comparison");
    }
    
    if (params.format === "docx") {
      const blob = await response.blob();
      console.log("✅ 3-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers.get("Content-Type"), contentDisposition: response.headers.get("Content-Disposition") };
    } else {
      const data = await response.json();
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
    
    const response = await fetch(`${API_BASE_URL}/api/seasonal-comparison/4-quarters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || error.message || "Failed to generate 4-quarter comparison");
    }
    
    if (params.format === "docx") {
      const blob = await response.blob();
      console.log("✅ 4-quarter DOCX comparison generated successfully");
      return { blob, contentType: response.headers.get("Content-Type"), contentDisposition: response.headers.get("Content-Disposition") };
    } else {
      const data = await response.json();
      console.log("✅ 4-quarter JSON comparison generated successfully");
      return data;
    }
  } catch (error) {
    console.error("❌ Error generating 4-quarter comparison:", error);
    throw error;
  }
};
