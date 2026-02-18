// src/api/personApiV2.js
// Phase D — V2 person API wrapper layer — unified person endpoints

import apiClient from "./apiClient";

// ============================================================
// PATIENT V2 ENDPOINTS
// ============================================================

/**
 * Search patients (V2)
 * GET /api/v2/patients/search?q={query}&limit={limit}
 * @param {string} query - Search text (name, ID, MRN)
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Object>} { success, patients: [...] }
 */
export const searchPatientsV2 = async (query, limit = 20) => {
  try {
    console.log("🔍 Searching patients (V2):", query);
    
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    const response = await apiClient.get(`/api/v2/patients/search?${params.toString()}`);
    
    console.log("✅ Patients search successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error searching patients (V2):", error);
    throw error;
  }
};

/**
 * Get patient full history (V2)
 * GET /api/v2/patients/{id}/full-history
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<Object>} { profile, metrics, items, meta }
 */
export const getPatientFullHistoryV2 = async (patientId) => {
  try {
    console.log("📋 Fetching patient full history (V2):", patientId);
    
    const response = await apiClient.get(`/api/v2/patients/${patientId}/full-history`);
    
    console.log("✅ Patient history fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching patient history (V2):", error);
    throw error;
  }
};

/**
 * Export patient data as CSV (V2)
 * GET /api/v2/patients/{id}/export?format=csv
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportPatientCsvV2 = async (patientId) => {
  try {
    console.log("📄 Exporting patient CSV (V2):", patientId);
    
    const response = await apiClient.get(`/api/v2/patients/${patientId}/export?format=csv`, {
      responseType: 'blob'
    });
    
    console.log("✅ Patient CSV export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting patient CSV (V2):", error);
    throw error;
  }
};

/**
 * Export patient data as JSON (V2)
 * GET /api/v2/patients/{id}/export?format=json
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<Blob>} JSON file blob
 */
export const exportPatientJsonV2 = async (patientId) => {
  try {
    console.log("📄 Exporting patient JSON (V2):", patientId);
    
    const response = await apiClient.get(`/api/v2/patients/${patientId}/export?format=json`, {
      responseType: 'blob'
    });
    
    console.log("✅ Patient JSON export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting patient JSON (V2):", error);
    throw error;
  }
};

/**
 * Export patient data as Word document (V2)
 * GET /api/v2/patients/{id}/export?format=word
 * @param {string|number} patientId - Patient ID
 * @returns {Promise<Blob>} Word (.docx) file blob
 */
export const exportPatientWordV2 = async (patientId) => {
  try {
    console.log("📄 Exporting patient Word report (V2):", patientId);
    
    const response = await apiClient.get(`/api/v2/patients/${patientId}/export?format=word`, {
      responseType: 'blob'
    });
    
    console.log("✅ Patient Word export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting patient Word (V2):", error);
    throw error;
  }
};

// ============================================================
// DOCTOR V2 ENDPOINTS
// ============================================================

/**
 * Search doctors (V2)
 * GET /api/v2/doctors/search?q={query}&limit={limit}
 * @param {string} query - Search text (name, ID, specialty)
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Object>} { success, doctors: [...] }
 */
export const searchDoctorsV2 = async (query, limit = 20) => {
  try {
    console.log("🔍 Searching doctors (V2):", query);
    
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    const response = await apiClient.get(`/api/v2/doctors/search?${params.toString()}`);
    
    console.log("✅ Doctors search successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error searching doctors (V2):", error);
    throw error;
  }
};

/**
 * Get doctor full report (V2) - LEGACY, use getDoctorFullHistoryV2 instead
 * GET /api/v2/doctors/{id}/full-report
 * @param {string|number} doctorId - Doctor ID
 * @param {string} date_from - Start date (optional, YYYY-MM-DD)
 * @param {string} date_to - End date (optional, YYYY-MM-DD)
 * @returns {Promise<Object>} { profile, metrics, items, meta }
 */
export const getDoctorFullReportV2 = async (doctorId, date_from = null, date_to = null) => {
  try {
    console.log("📋 Fetching doctor full report (V2):", doctorId);
    
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/v2/doctors/${doctorId}/full-report?${queryString}`
      : `/api/v2/doctors/${doctorId}/full-report`;
    
    const response = await apiClient.get(url);
    
    console.log("✅ Doctor report fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching doctor report (V2):", error);
    throw error;
  }
};

/**
 * Get doctor full history (V2) - NEW unified endpoint matching patient
 * GET /api/v2/doctors/{id}/full-history
 * @param {string|number} doctorId - Doctor ID
 * @returns {Promise<Object>} { profile, metrics, items, meta }
 */
export const getDoctorFullHistoryV2 = async (doctorId) => {
  try {
    console.log("📋 Fetching doctor full history (V2):", doctorId);
    
    const response = await apiClient.get(`/api/v2/doctors/${doctorId}/full-history`);
    
    console.log("✅ Doctor history fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching doctor history (V2):", error);
    throw error;
  }
};

/**
 * Export doctor data as CSV (V2)
 * GET /api/v2/doctors/{id}/export?format=csv
 * @param {string|number} doctorId - Doctor ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportDoctorCsvV2 = async (doctorId) => {
  try {
    console.log("📄 Exporting doctor CSV (V2):", doctorId);
    
    const response = await apiClient.get(`/api/v2/doctors/${doctorId}/export?format=csv`, {
      responseType: 'blob'
    });
    
    console.log("✅ Doctor CSV export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting doctor CSV (V2):", error);
    throw error;
  }
};

/**
 * Export doctor data as JSON (V2)
 * GET /api/v2/doctors/{id}/export?format=json
 * @param {string|number} doctorId - Doctor ID
 * @returns {Promise<Blob>} JSON file blob
 */
export const exportDoctorJsonV2 = async (doctorId) => {
  try {
    console.log("📄 Exporting doctor JSON (V2):", doctorId);
    
    const response = await apiClient.get(`/api/v2/doctors/${doctorId}/export?format=json`, {
      responseType: 'blob'
    });
    
    console.log("✅ Doctor JSON export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting doctor JSON (V2):", error);
    throw error;
  }
};

/**
 * Export doctor data as Word document (V2)
 * GET /api/v2/doctors/{id}/export?format=word
 * @param {string|number} doctorId - Doctor ID
 * @returns {Promise<Blob>} Word (.docx) file blob
 */
export const exportDoctorWordV2 = async (doctorId) => {
  try {
    console.log("📄 Exporting doctor Word report (V2):", doctorId);
    
    const response = await apiClient.get(`/api/v2/doctors/${doctorId}/export?format=word`, {
      responseType: 'blob'
    });
    
    console.log("✅ Doctor Word export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting doctor Word (V2):", error);
    throw error;
  }
};

/**
 * Download doctor seasonal Word report
 * GET /api/person-reports/doctor/{id}/seasonal-word
 * @param {string|number} doctorId - Doctor ID
 * @param {string} season_start - Season start date (YYYY-MM-DD)
 * @param {string} season_end - Season end date (YYYY-MM-DD)
 * @returns {Promise<Blob>} Word (.docx) file blob
 */
export const downloadDoctorSeasonalWordV2 = async (doctorId, season_start, season_end) => {
  try {
    console.log("📄 Downloading doctor seasonal Word report (V2):", doctorId);
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/doctor/${doctorId}/seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ Doctor seasonal Word report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading doctor seasonal Word report (V2):", error);
    throw error;
  }
};

/**
 * Download aggregate seasonal Word report for ALL doctors
 * GET /api/person-reports/doctors/all-seasonal-word
 * @param {string} season_start - Season start date (YYYY-MM-DD)
 * @param {string} season_end - Season end date (YYYY-MM-DD)
 * @returns {Promise<Blob>} Word (.docx) file blob with all doctors
 */
export const downloadAllDoctorsSeasonalWordV2 = async (season_start, season_end) => {
  try {
    console.log("📄 Downloading ALL doctors seasonal report (V2)");
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/doctors/all-seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ ALL doctors seasonal report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading ALL doctors seasonal report (V2):", error);
    throw error;
  }
};

// ============================================================
// WORKER V2 ENDPOINTS
// ============================================================

/**
 * Search workers (V2)
 * GET /api/v2/workers/search?q={query}&limit={limit}
 * @param {string} query - Search text (name, ID, role)
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Object>} { success, workers: [...] }
 */
export const searchWorkersV2 = async (query, limit = 20) => {
  try {
    console.log("🔍 Searching workers (V2):", query);
    
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    const response = await apiClient.get(`/api/v2/workers/search?${params.toString()}`);
    
    console.log("✅ Workers search successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error searching workers (V2):", error);
    throw error;
  }
};

/**
 * Get worker profile (V2) - LEGACY, use getWorkerFullHistoryV2 instead
 * GET /api/v2/workers/{id}/profile
 * @param {string|number} employeeId - Employee ID
 * @param {string} date_from - Start date (optional, YYYY-MM-DD)
 * @param {string} date_to - End date (optional, YYYY-MM-DD)
 * @returns {Promise<Object>} { profile, metrics, items, meta }
 */
export const getWorkerProfileV2 = async (employeeId, date_from = null, date_to = null) => {
  try {
    console.log("📋 Fetching worker profile (V2):", employeeId);
    
    const params = new URLSearchParams();
    if (date_from) params.append('date_from', date_from);
    if (date_to) params.append('date_to', date_to);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/v2/workers/${employeeId}/profile?${queryString}`
      : `/api/v2/workers/${employeeId}/profile`;
    
    const response = await apiClient.get(url);
    
    console.log("✅ Worker profile fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching worker profile (V2):", error);
    throw error;
  }
};

/**
 * Get worker full history (V2) - NEW unified endpoint matching patient/doctor
 * GET /api/v2/workers/{id}/full-history
 * @param {string|number} employeeId - Employee ID
 * @returns {Promise<Object>} { profile, metrics, items, meta }
 */
export const getWorkerFullHistoryV2 = async (employeeId) => {
  try {
    console.log("📋 Fetching worker full history (V2):", employeeId);
    
    const response = await apiClient.get(`/api/v2/workers/${employeeId}/full-history`);
    
    console.log("✅ Worker history fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching worker history (V2):", error);
    throw error;
  }
};

/**
 * Export worker data as CSV (V2)
 * GET /api/v2/workers/{id}/export?format=csv
 * @param {string|number} employeeId - Employee ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportWorkerCsvV2 = async (employeeId) => {
  try {
    console.log("📄 Exporting worker CSV (V2):", employeeId);
    
    const response = await apiClient.get(`/api/v2/workers/${employeeId}/export?format=csv`, {
      responseType: 'blob'
    });
    
    console.log("✅ Worker CSV export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting worker CSV (V2):", error);
    throw error;
  }
};

/**
 * Export worker data as JSON (V2)
 * GET /api/v2/workers/{id}/export?format=json
 * @param {string|number} employeeId - Employee ID
 * @returns {Promise<Blob>} JSON file blob
 */
export const exportWorkerJsonV2 = async (employeeId) => {
  try {
    console.log("📄 Exporting worker JSON (V2):", employeeId);
    
    const response = await apiClient.get(`/api/v2/workers/${employeeId}/export?format=json`, {
      responseType: 'blob'
    });
    
    console.log("✅ Worker JSON export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting worker JSON (V2):", error);
    throw error;
  }
};

/**
 * Export worker data as Word document (V2)
 * GET /api/v2/workers/{id}/export?format=word
 * @param {string|number} employeeId - Employee ID
 * @returns {Promise<Blob>} Word (.docx) file blob
 */
export const exportWorkerWordV2 = async (employeeId) => {
  try {
    console.log("📄 Exporting worker Word report (V2):", employeeId);
    
    const response = await apiClient.get(`/api/v2/workers/${employeeId}/export?format=word`, {
      responseType: 'blob'
    });
    
    console.log("✅ Worker Word export successful (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting worker Word (V2):", error);
    throw error;
  }
};

/**
 * Get worker actions (V2)
 * GET /api/v2/workers/{id}/actions
 * @param {string|number} employeeId - Employee ID
 * @param {number} limit - Max results (default 50)
 * @param {number} offset - Pagination offset (default 0)
 * @returns {Promise<Object>} { actions: [...], total, limit, offset }
 */
export const getWorkerActionsV2 = async (employeeId, limit = 50, offset = 0) => {
  try {
    console.log("📋 Fetching worker actions (V2):", employeeId);
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const response = await apiClient.get(
      `/api/v2/workers/${employeeId}/actions?${params.toString()}`
    );
    
    console.log("✅ Worker actions fetched (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching worker actions (V2):", error);
    throw error;
  }
};

/**
 * Download worker seasonal Word report
 * GET /api/person-reports/worker/{id}/seasonal-word
 * @param {string|number} employeeId - Employee ID
 * @param {string} season_start - Season start date (YYYY-MM-DD)
 * @param {string} season_end - Season end date (YYYY-MM-DD)
 * @returns {Promise<Blob>} Word (.docx) file blob
 */
export const downloadWorkerSeasonalWordV2 = async (employeeId, season_start, season_end) => {
  try {
    console.log("📄 Downloading worker seasonal Word report (V2):", employeeId);
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/worker/${employeeId}/seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ Worker seasonal Word report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading worker seasonal Word report (V2):", error);
    throw error;
  }
};

/**
 * Download aggregate seasonal Word report for ALL workers
 * GET /api/person-reports/workers/all-seasonal-word
 * @param {string} season_start - Season start date (YYYY-MM-DD)
 * @param {string} season_end - Season end date (YYYY-MM-DD)
 * @returns {Promise<Blob>} Word (.docx) file blob with all workers
 */
export const downloadAllWorkersSeasonalWordV2 = async (season_start, season_end) => {
  try {
    console.log("📄 Downloading ALL workers seasonal report (V2)");
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/workers/all-seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ ALL workers seasonal report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading ALL workers seasonal report (V2):", error);
    throw error;
  }
};

// ============================================================
// BLOB DOWNLOAD HELPER
// ============================================================

/**
 * Helper function to trigger browser download of a blob
 * Reuses the pattern from reports.js
 * 
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Filename for the download
 */
export const downloadBlobFile = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("💾 Download triggered:", filename);
  } catch (error) {
    console.error("❌ Error triggering download:", error);
    throw error;
  }
};
