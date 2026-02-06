// src/services/api.js
// API service for all backend calls
import apiClient from "../api/apiClient";

// Helper function for API calls using apiClient
const apiCall = async (endpoint, options = {}) => {
  try {
    const { method = "GET", body, ...restOptions } = options;
    
    const config = {
      method,
      ...restOptions,
    };
    
    if (body) {
      config.data = body;
    }

    const response = await apiClient.request({
      url: endpoint,
      ...config,
    });

    return response.data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    
    // Extract error details from axios error
    if (error.response) {
      const data = error.response.data;
      const customError = new Error(data.message || "API request failed");
      customError.code = data.error;
      customError.field = data.field;
      customError.message_ar = data.message_ar;
      customError.status = error.response.status;
      throw customError;
    }
    
    throw error;
  }
};

const api = {
  // ==================== SETTINGS API ====================

  // Get departments (with optional view filter)
  getDepartments: async (viewMode = "internal") => {
    // Placeholder: replace with actual API call
    return {
      data: [
        { id: 1, name: "Emergency Department", parent_id: null, type: "internal", category: "قسم" },
        { id: 2, name: "Cardiology", parent_id: null, type: "internal", category: "دائرة" },
        { id: 3, name: "Pediatrics", parent_id: null, type: "internal", category: "إدارة" },
        { id: 4, name: "Radiology", parent_id: 2, type: "internal", category: "قسم" },
        { id: 5, name: "External Clinic A", parent_id: null, type: "external", category: "دائرة" },
      ].filter((dept) => dept.type === viewMode),
    };
    // return apiCall(`/settings/departments?view=${viewMode}`);
  },

  // Add new department
  addDepartment: async (data) => {
    // Placeholder: replace with actual API call
    return {
      data: {
        id: Date.now(),
        ...data,
      },
    };
    // return apiCall("/settings/departments", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // });
  },

  // Update department
  updateDepartment: async (id, data) => {
    // Placeholder: replace with actual API call
    return { data: { id, ...data } };
    // return apiCall(`/settings/departments/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // });
  },

  // Delete department
  deleteDepartment: async (id) => {
    // Placeholder: replace with actual API call
    return { success: true };
    // return apiCall(`/settings/departments/${id}`, {
    //   method: "DELETE",
    // });
  },

  // Get reserve doctors only (for settings page)
  getDoctors: async (limit = 100) => {
    return apiCall(`/api/doctors/reserve?limit=${limit}`);
  },

  // Add new doctor
  addDoctor: async (data) => {
    // Transform frontend data to match backend API spec
    const requestBody = {
      doctor_name: data.doctor_name || data.name,
      specialty: data.specialty || "",
      is_active: data.is_active !== undefined ? data.is_active : true,
      source_system: data.source_system || "MANUAL",
    };
    
    return apiCall("/api/doctors", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },

  // Update doctor
  updateDoctor: async (id, data) => {
    // Placeholder: replace with actual API call
    return { data: { id, ...data } };
    // return apiCall(`/settings/doctors/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // });
  },

  // Delete doctor
  deleteDoctor: async (id) => {
    // Placeholder: replace with actual API call
    return { success: true };
    // return apiCall(`/settings/doctors/${id}`, {
    //   method: "DELETE",
    // });
  },

  // ==================== PATIENTS API ====================

  // Get reserve patients only (for settings page)
  getPatients: async (limit = 100, offset = 0, orderBy = "created_at") => {
    return apiCall(`/api/patients/reserve?limit=${limit}&offset=${offset}&order_by=${orderBy}`);
  },

  // Add new patient
  addPatient: async (data) => {
    // Transform frontend data to match backend API spec
    const requestBody = {
      first_name: data.first_name,
      middle_name: data.middle_name || undefined,
      last_name: data.last_name || undefined,
      mother_name: data.mother_name || undefined,
      phone_number: data.phone_number || undefined,
      phone_number2: data.phone_number2 || undefined,
      birth_date: data.birth_date || undefined,
      sex: data.sex || undefined,
      document_number: data.document_number || undefined,
      medical_file_number: data.medical_file_number || undefined,
      spouse: data.spouse || undefined,
      address_line1: data.address_line1 || undefined,
      address_line2: data.address_line2 || undefined,
    };

    // Remove undefined values
    Object.keys(requestBody).forEach((key) => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });

    return apiCall("/api/patients/create", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },

  // Update patient
  updatePatient: async (id, data) => {
    // Placeholder: replace with actual API call when backend supports it
    return { data: { id, ...data } };
    // return apiCall(`/patients/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // });
  },

  // Delete patient
  deletePatient: async (id) => {
    // Placeholder: replace with actual API call when backend supports it
    return { success: true };
    // return apiCall(`/patients/${id}`, {
    //   method: "DELETE",
    // });
  },

  // ==================== CONFIGURATION API ====================

  // Save configuration
  saveConfiguration: async (data) => {
    // Placeholder: replace with actual API call
    console.log("Saving configuration:", data);
    return { success: true };
    // return apiCall("/settings/save", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // });
  },

  // ==================== RECORDS API ====================

  // Add new record
  addRecord: async (data) => {
    // Placeholder
    return { success: true, data };
    // return apiCall("/records/add", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // });
  },

  // Update record
  updateRecord: async (id, data) => {
    // Placeholder
    return { success: true, data: { id, ...data } };
    // return apiCall(`/records/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // });
  },

  // ==================== NER & CLASSIFICATION API ====================

  // Extract NER entities
  extractNER: async (text) => {
    // Placeholder
    return {
      patientName: "Ahmed Mohammed",
      doctorName: "Dr. Fatima Ali",
      otherEntities: ["Emergency", "Hospital"],
    };
    // return apiCall("/ner/extract", {
    //   method: "POST",
    //   body: JSON.stringify({ text }),
    // });
  },

  // Predict classification
  predictClassification: async (text) => {
    // Placeholder
    return {
      category: "Medical Care",
      subCategory: "Treatment Delay",
      severity: "High",
      stage: "Investigation",
      harmLevel: "Moderate",
      improvementArea: "Process Improvement",
    };
    // return apiCall("/classification/predict", {
    //   method: "POST",
    //   body: JSON.stringify({ text }),
    // });
  },
};

export default api;
