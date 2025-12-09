// src/services/api.js
// API service for all backend calls

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
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

  // Get doctors
  getDoctors: async () => {
    // Placeholder: replace with actual API call
    return {
      data: [
        { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", department_id: 2 },
        { id: 2, name: "Dr. Michael Chen", specialty: "Emergency Medicine", department_id: 1 },
        { id: 3, name: "Dr. Emily Davis", specialty: "Pediatrics", department_id: 3 },
      ],
    };
    // return apiCall("/settings/doctors");
  },

  // Add new doctor
  addDoctor: async (data) => {
    // Placeholder: replace with actual API call
    return {
      data: {
        id: Date.now(),
        ...data,
      },
    };
    // return apiCall("/settings/doctors", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // });
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
