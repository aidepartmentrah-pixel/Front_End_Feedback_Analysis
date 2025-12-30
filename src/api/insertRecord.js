  // src/api/insertRecord.js
  // API service for Insert Record page

  const API_BASE_URL = "http://127.0.0.1:8000";

  /**
   * Fetch all reference data (departments, sources, domains, severity, stages, harm)
   * GET /api/reference/all
   */
  export const fetchReferenceData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reference/all`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to fetch reference data");
      }
      
      const data = await response.json();
      console.log("Reference data received:", data);
      console.log("Sample domain:", data.domains?.[0]);
      console.log("Sample source:", data.sources?.[0]);
      console.log("Sample department:", data.departments?.[0]);
      console.log("Sample severity:", data.severity_levels?.[0] || data.severity?.[0]);
      console.log("Sample stage:", data.stages?.[0]);
      console.log("Sample harm:", data.harm_levels?.[0] || data.harm?.[0]);
      console.log("Worker types raw:", data.worker_types);
      console.log("Worker types count:", data.worker_types?.length);
      
      // Normalize the data structure to ensure arrays
      return {
        departments: Array.isArray(data.departments) ? data.departments : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        domains: Array.isArray(data.domains) ? data.domains : [],
        severity: Array.isArray(data.severity_levels) ? data.severity_levels : (Array.isArray(data.severity) ? data.severity : []),
        stages: Array.isArray(data.stages) ? data.stages : [],
        harm: Array.isArray(data.harm_levels) ? data.harm_levels : (Array.isArray(data.harm) ? data.harm : []),
        worker_types: Array.isArray(data.worker_types) ? data.worker_types : [],
        feedback_intent_types: Array.isArray(data.feedback_intent_types) ? data.feedback_intent_types : [],
        clinical_risk_types: Array.isArray(data.clinical_risk_types) ? data.clinical_risk_types : [],
      };
    } catch (error) {
      console.error("Error fetching reference data:", error);
      throw error;
    }
  };

  /**
   * Fetch categories for a specific domain
   * GET /api/reference/categories?domain_id=X
   */
  export const fetchCategories = async (domainId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reference/categories?domain_id=${domainId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to fetch categories");
      }
      
      const data = await response.json();
      console.log(`Categories for domain ${domainId}:`, data);
      
      // Return array directly if it's already an array, otherwise return empty array
      return Array.isArray(data) ? data : (data.categories ? data.categories : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  /**
   * Fetch subcategories for a specific category
   * GET /api/reference/subcategories?category_id=X
   */
  export const fetchSubcategories = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reference/subcategories?category_id=${categoryId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to fetch subcategories");
      }
      
      const data = await response.json();
      console.log(`Subcategories for category ${categoryId}:`, data);
      
      return Array.isArray(data) ? data : (data.subcategories ? data.subcategories : []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  };

  /**
   * Fetch classifications for a specific subcategory
   * GET /api/reference/classifications?subcategory_id=X
   */
  export const fetchClassifications = async (subcategoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reference/classifications?subcategory_id=${subcategoryId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to fetch classifications");
      }
      
      const data = await response.json();
      console.log(`Classifications for subcategory ${subcategoryId}:`, data);
      
      return Array.isArray(data) ? data : (data.classifications ? data.classifications : []);
    } catch (error) {
      console.error("Error fetching classifications:", error);
      throw error;
    }
  };

  /**
   * Submit a new record
   * POST /api/records/add
   */
  export const submitRecord = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/records/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        // Handle backend error format: { detail: { error, message, message_ar, field } }
        throw {
          message: error.detail?.message || "Failed to add record",
          message_ar: error.detail?.message_ar,
          field: error.detail?.field,
          error: error.detail?.error,
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error submitting record:", error);
      throw error;
    }
  };

  /**
   * Extract entities using NER
   * POST /api/ner/extract
   */
  export const extractNER = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ner/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to extract NER");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error extracting NER:", error);
      throw error;
    }
  };

  /**
   * Classify text using AI
   * POST /api/classification/classify
   */
  export const classifyText = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classification/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to classify text");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error classifying text:", error);
      throw error;
    }
  };

  /**
   * Convert speech to text
   * POST /api/stt/transcribe
   */
  export const transcribeAudio = async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      
      const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to transcribe audio");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  };

  /**
   * Search for patients
   * GET /api/records/search/patients?q={text}&limit=20
   */
  export const searchPatients = async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/records/search/patients?q=${encodeURIComponent(query)}&limit=20`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to search patients");
      }
      
      const data = await response.json();
      console.log("Search patients response:", data);
      // API returns {success: true, patients: [...]}
      return Array.isArray(data.patients) ? data.patients : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  };

  /**
   * Search for doctors
   * GET /api/records/search/doctors?q={text}&limit=20
   */
  export const searchDoctors = async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/records/search/doctors?q=${encodeURIComponent(query)}&limit=20`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to search doctors");
      }
      
      const data = await response.json();
      console.log("Search doctors response:", data);
      // API returns {success: true, doctors: [...]}
      return Array.isArray(data.doctors) ? data.doctors : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching doctors:", error);
      throw error;
    }
  };

  /**
   * Search for employees
   * GET /api/records/search/employees?q={text}&limit=20
   */
  export const searchEmployees = async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/records/search/employees?q=${encodeURIComponent(query)}&limit=20`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "Failed to search employees");
      }
      
      const data = await response.json();
      console.log("Search employees response:", data);
      // API returns {success: true, employees: [...]}
      return Array.isArray(data.employees) ? data.employees : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching employees:", error);
      throw error;
    }
  };
