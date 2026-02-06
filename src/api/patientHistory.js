// src/api/patientHistory.js
// API service for Patient History page

import apiClient from "./apiClient";

/**
 * Search for patients
 * GET /search?query=...&mrn=...&phone=...&limit=50
 */
export const searchPatients = async (query, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (query) params.append("query", query);
    if (options.mrn) params.append("mrn", options.mrn);
    if (options.phone) params.append("phone", options.phone);
    params.append("limit", options.limit || 50);
    
    const response = await apiClient.get(`/api/patients/search?${params.toString()}`);
    
    const data = response.data;
    console.log("Patient search response:", data);
    return data;
  } catch (error) {
    console.error("Error searching patients:", error);
    throw error;
  }
};

/**
 * Get patient profile
 * GET /{patient_id}/profile
 */
export const getPatientProfile = async (patientId) => {
  try {
    const response = await apiClient.get(`/api/patients/${patientId}/profile`);
    
    const data = response.data;
    console.log("Patient profile response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw error;
  }
};

/**
 * Get patient incidents/feedback
 * GET /{patient_id}/incidents?severity=...&from_date=...&to_date=...&limit=100&offset=0
 */
export const getPatientIncidents = async (patientId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.severity) params.append("severity", filters.severity);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.department) params.append("department", filters.department);
    if (filters.status) params.append("status", filters.status);
    params.append("limit", filters.limit || 100);
    params.append("offset", filters.offset || 0);
    
    const response = await apiClient.get(`/api/patients/${patientId}/incidents?${params.toString()}`);
    
    const data = response.data;
    console.log("Patient incidents response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching patient incidents:", error);
    throw error;
  }
};

/**
 * Get incident details
 * GET /{patient_id}/incidents/{incident_id}
 */
export const getIncidentDetails = async (patientId, incidentId) => {
  try {
    const response = await apiClient.get(`/api/patients/${patientId}/incidents/${incidentId}`);
    
    const data = response.data;
    console.log("Incident details response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching incident details:", error);
    throw error;
  }
};

/**
 * Get full patient history (profile + incidents together) - MOST EFFICIENT
 * GET /{patient_id}/full-history
 */
export const getPatientFullHistory = async (patientId) => {
  try {
    const response = await apiClient.get(`/api/patients/${patientId}/full-history`);
    
    const data = response.data;
    console.log("Patient full history response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching patient full history:", error);
    throw error;
  }
};

/**
 * Export patient history as CSV or JSON
 * GET /{patient_id}/export?format=csv|json
 */
export const exportPatientHistory = async (patientId, format = "csv") => {
  try {
    const response = await apiClient.get(`/api/patients/${patientId}/export?format=${format}`, {
      responseType: format === "csv" ? "blob" : "json"
    });
    
    if (format === "csv") {
      // For CSV, return blob from response
      const blob = response.data;
      return blob;
    } else {
      // For JSON, return data
      const data = response.data;
      console.log("Export JSON response:", data);
      return data;
    }
  } catch (error) {
    console.error("Error exporting patient history:", error);
    throw error;
  }
};

/**
 * Helper: Download CSV file
 */
export const downloadCSV = async (patientId, patientName = "patient") => {
  try {
    const blob = await exportPatientHistory(patientId, "csv");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patientName}_history_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    throw error;
  }
};

/**
 * Helper: Download JSON file
 */
export const downloadJSON = async (patientId, patientName = "patient") => {
  try {
    const data = await exportPatientHistory(patientId, "json");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patientName}_history_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading JSON:", error);
    throw error;
  }
};
