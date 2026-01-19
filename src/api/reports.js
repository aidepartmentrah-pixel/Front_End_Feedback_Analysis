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
//      year: 2025,
//      trimester: "Q1",
//      orgunit_id: 123,
//      orgunit_type: 1,
//      user_id: 1
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
 * Fetch Seasonal Report (Backend V2 API)
 * 
 * @param {Object} params - Query parameters for seasonal report
 * @param {number} params.year - Year (required)
 * @param {string} params.trimester - Trimester: "Q1" | "Q2" | "Q3" | "Q4" (required)
 * @param {number} params.orgunit_id - Organization unit ID (required)
 * @param {number} params.orgunit_type - Organization type: 0=hospital, 1=administration, 2=department, 3=section (required)
 * @param {number} params.user_id - User ID (required)
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
 * @returns {Promise<Object>} Object containing { blob, filename, isMultiExport }
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
    // Seasonal export: Backend V2 API format
    url = `${API_BASE_URL}/api/reports/${report_type}/export`;
    
    // Extract required parameters from filters
    const year = Number(filters.year);
    const period = filters.trimester; // "Q1", "Q2", "Q3", "Q4"
    const orgunit_id = Number(filters.orgunit_id || 1);
    const orgunit_type = Number(filters.orgunit_type || 0);
    const language = filters.language || "en";
    
    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year,
        period,
        orgunit_id,
        orgunit_type,
        format,
        language,
      }),
    };
    
    console.log("🔍 SEASONAL EXPORT PAYLOAD:", {
      year,
      period,
      orgunit_id,
      orgunit_type,
      format,
      language,
    });
  }
  
  console.log("📡 Exporting Report:", report_type.toUpperCase(), format.toUpperCase(), url);
  
  try {
    // Step 1: First request to detect response type (JSON or blob)
    const response = await fetch(url, requestOptions);
    
    console.log("📥 Export Response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Export API Error:", errorText);
      throw new Error(`Failed to export report: ${response.status} ${response.statusText}`);
    }
    
    // Check Content-Type to determine if it's JSON or a file
    const contentType = response.headers.get("Content-Type");
    console.log("📋 Response Content-Type:", contentType);
    
    // Step 2: Check if response is JSON (multi-export metadata)
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();
      console.log("📄 JSON Response:", jsonData);
      
      // Check if it's a multi-export with download URL
      if (jsonData.is_multi_export && jsonData.download_url) {
        console.log(`📦 Multi-export detected: ${jsonData.file_name}`);
        console.log(`🔗 Download URL: ${jsonData.download_url}`);
        
        // Step 3: Download the actual file from the download URL
        const downloadUrl = `${API_BASE_URL}${jsonData.download_url}`;
        console.log(`📡 Fetching multi-export file from: ${downloadUrl}`);
        
        const fileResponse = await fetch(downloadUrl, {
          method: "GET",
        });
        
        if (!fileResponse.ok) {
          throw new Error(`Failed to download multi-export file: ${fileResponse.status}`);
        }
        
        const blob = await fileResponse.blob();
        console.log("📦 Multi-export Blob Size:", blob.size, "bytes");
        
        return {
          blob,
          filename: jsonData.file_name,
          isMultiExport: true,
          exportId: jsonData.export_id,
          expiresAt: jsonData.expires_at,
        };
      } else {
        // JSON response but not a multi-export (unexpected)
        throw new Error("Unexpected JSON response from export endpoint");
      }
    } else {
      // Step 4: Direct file response (single file or ZIP)
      const blob = await response.blob();
      console.log("📦 Export Blob Size:", blob.size, "bytes");
      
      // Extract filename from Content-Disposition header
      let filename = null;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }
      
      // Check if response is a ZIP file (seasonal reports with comparison charts)
      const isZip = contentType && contentType.includes("application/zip");
      
      if (isZip) {
        console.log("🗜️ ZIP file detected (seasonal report with comparison)");
        console.log("📦 ZIP Contents: Regular report + Comparison report with charts");
        
        // Use backend filename as-is (already has .zip extension)
        if (!filename) {
          // Fallback only if header is missing
          filename = `${report_type}_report_${Date.now()}.zip`;
        }
        
        console.log("✅ ZIP Export successful:", filename);
        
        return {
          blob,
          filename,
          isMultiExport: true, // ZIP contains multiple documents
          isZip: true,
        };
      } else {
        // Single file export (monthly reports or legacy format)
        if (!filename) {
          // Generate fallback filename based on format
          const extension = format === "xlsx" ? "xlsx" : format === "docx" ? "docx" : "pdf";
          filename = `${report_type}_report_${Date.now()}.${extension}`;
        }
        
        console.log("✅ Single file export successful:", filename);
        
        return {
          blob,
          filename,
          isMultiExport: false,
          isZip: false,
        };
      }
    }
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
