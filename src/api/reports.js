// src/api/reports.js
// Centralized API client for all reporting endpoints
//
// ✅ USAGE EXAMPLES:
//
// 1. Fetch Monthly Report:
//    const data = await fetchMonthlyReport({
//      year: "2026",
//      month: "1",
//      mode: "detailed",
//      scope: "hospital"
//    });
//
// 2. Fetch Seasonal Report:
//    const data = await fetchSeasonalReport({
//      season_id: 123,
//      year: "2026",
//      trimester: "Trim1"
//    });
//
// 3. Export and Download:
//    await exportAndDownloadReport({
//      format: "pdf",  // or "excel", "word"
//      payload: {
//        reportType: "monthly",
//        filters: { ... },
//        data: { ... }
//      }
//    });
//
// 4. Export without auto-download:
//    const { blob, filename } = await exportReport({ format: "pdf", payload });
//    // Do something with blob...
//    downloadBlob(blob, filename);  // Download manually

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch Monthly Report
 * 
 * @param {Object} params - Query parameters for monthly report
 * @param {string} params.year - Year (required)
 * @param {string} [params.month] - Month (1-12) - used with month mode
 * @param {string} [params.start_date] - Start date (YYYY-MM-DD) - used with range mode
 * @param {string} [params.end_date] - End date (YYYY-MM-DD) - used with range mode
 * @param {string} [params.mode] - Report mode: "detailed" | "numeric"
 * @param {string} [params.scope] - Organization scope: "hospital" | "administration" | "department" | "section"
 * @param {string} [params.administration_ids] - Comma-separated administration IDs
 * @param {string} [params.department_ids] - Comma-separated department IDs
 * @param {string} [params.section_ids] - Comma-separated section IDs
 * 
 * @returns {Promise<Object>} Monthly report JSON data
 */
export async function fetchMonthlyReport(params) {
  const url = `${API_BASE_URL}/api/reports/monthly/view`;
  console.log("📡 Fetching Monthly Report (POST):", url, params);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch monthly report: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch Seasonal Report
 * 
 * @param {Object} params - Query parameters for seasonal report
 * @param {number|string} params.season_id - Seasonal report ID (required)
 * @param {number|string} [params.orgunit_id] - Organization unit ID (optional filter)
 * @param {string} [params.orgunit_type] - Organization type: "administration" | "department" | "section"
 * @param {string} [params.year] - Year filter
 * @param {string} [params.trimester] - Trimester: "Trim1" | "Trim2" | "Trim3" | "Trim4"
 * 
 * @returns {Promise<Object>} Seasonal report JSON data
 */
export async function fetchSeasonalReport(params) {
  const url = `${API_BASE_URL}/api/reports/seasonal/view`;
  console.log("📡 Fetching Seasonal Report (POST):", url, params);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch seasonal report: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Export Report to PDF, Excel, or Word
 * 
 * @param {Object} options - Export options
 * @param {string} options.report_type - Report type: "monthly" | "seasonal"
 * @param {string} options.format - Export format: "pdf" | "xlsx" | "docx"
 * @param {Object} options.filters - Filter parameters used to generate the report
 * 
 * @returns {Promise<Object>} Object containing { blob, filename }
 */
export async function exportReport({ report_type, format, filters }) {
  if (!["monthly", "seasonal"].includes(report_type)) {
    throw new Error(`Invalid report type: ${report_type}. Must be "monthly" or "seasonal".`);
  }
  
  if (!["pdf", "xlsx", "docx"].includes(format)) {
    throw new Error(`Invalid export format: ${format}. Must be "pdf", "xlsx", or "docx".`);
  }
  
  let url, requestOptions;
  
  if (report_type === "monthly") {
    // Monthly export: Build URL with query parameters
    const params = new URLSearchParams();
    
    // Required parameters
    params.append("format", format);
    params.append("year", filters.year);
    params.append("display_mode", filters.mode || "detailed");
    
    // Add time period based on dateMode
    if (filters.dateMode === "month" && filters.month) {
      params.append("month", filters.month);
    } else if (filters.dateMode === "range" && filters.fromDate && filters.toDate) {
      params.append("start_date", filters.fromDate);
      params.append("end_date", filters.toDate);
    }
    
    // Add organization scope filters
    if (filters.scope) {
      params.append("scope", filters.scope);
    }
    if (filters.administration_ids) {
      params.append("administration_ids", filters.administration_ids);
    }
    if (filters.department_ids) {
      params.append("department_ids", filters.department_ids);
    }
    if (filters.section_ids) {
      params.append("section_ids", filters.section_ids);
    }
    
    url = `${API_BASE_URL}/api/reports/monthly/export?${params.toString()}`;
    requestOptions = {
      method: "POST",
    };
  } else {
    // Seasonal export: Keep existing payload format with JSON body
    url = `${API_BASE_URL}/api/reports/${report_type}/export`;
    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        format,
        filters,
      }),
    };
  }
  
  console.log("📡 Exporting Report:", report_type.toUpperCase(), format.toUpperCase(), url);
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log("📥 Export Response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Export API Error:", errorText);
      throw new Error(`Failed to export report: ${response.status} ${response.statusText}`);
    }
    
    // Get the blob from response
    const blob = await response.blob();
    console.log("📦 Export Blob Size:", blob.size, "bytes");
    
    // Extract filename from Content-Disposition header or generate one
    const extension = format === "xlsx" ? "xlsx" : format === "docx" ? "docx" : "pdf";
    let filename = `${report_type}_report_${Date.now()}.${extension}`;
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }
    
    console.log("✅ Export successful:", filename);
    
    return {
      blob,
      filename,
    };
  } catch (error) {
    console.error("❌ Error exporting report:", error);
    throw error;
  }
}

/**
 * Helper function to trigger download of a blob
 * 
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Filename for the download
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  console.log("💾 Download triggered:", filename);
}

/**
 * Convenience function: Export and auto-download report
 * 
 * @param {Object} options - Same as exportReport options
 * @returns {Promise<void>}
 */
export async function exportAndDownloadReport(options) {
  const { blob, filename } = await exportReport(options);
  downloadBlob(blob, filename);
}

// Export a default object with all functions for alternative import style
export default {
  fetchMonthlyReport,
  fetchSeasonalReport,
  exportReport,
  downloadBlob,
  exportAndDownloadReport,
};
