  // src/api/insertRecord.js
  // API service for Insert Record page
  import apiClient from "./apiClient";
  import { fetchLeaves } from "./orgUnits";

  /**
   * Fetch all reference data (sections/leaves, sources, domains, severity, stages, harm)
   * GET /api/reference/all + /api/org-units/leaves for sections
   */
  export const fetchReferenceData = async () => {
    try {
      // Fetch main reference data
      const response = await apiClient.get("/api/reference/all");
      const data = response.data;
      
      // Fetch sections/leaves separately (for issuing department)
      const leaves = await fetchLeaves();
      
      console.log("Reference data received:", data);
      console.log("Sample domain:", data.domains?.[0]);
      console.log("Sample source:", data.sources?.[0]);
      console.log("Sample section/leaf:", leaves?.[0]);
      console.log("Sample severity:", data.severity_levels?.[0] || data.severity?.[0]);
      console.log("Sample stage:", data.stages?.[0]);
      console.log("Sample harm:", data.harm_levels?.[0] || data.harm?.[0]);
      console.log("Worker types raw:", data.worker_types);
      console.log("Worker types count:", data.worker_types?.length);
      
      // Normalize the data structure to ensure arrays
      return {
        departments: Array.isArray(leaves) ? leaves : [], // Using leaves/sections instead of departments
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
      const response = await apiClient.get(`/api/reference/categories?domain_id=${domainId}`);
      const data = response.data;
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
      const response = await apiClient.get(`/api/reference/subcategories?category_id=${categoryId}`);
      const data = response.data;
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
      const response = await apiClient.get(`/api/reference/classifications?subcategory_id=${subcategoryId}`);
      const data = response.data;
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
      const response = await apiClient.post("/api/records/add", payload);
      return response.data;
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
      const response = await apiClient.post("/api/ner/extract", { text });
      return response.data;
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
      const response = await apiClient.post("/api/classification/classify", { text });
      return response.data;
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
      
      const response = await apiClient.post("/api/stt/transcribe", formData);
      return response.data;
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
      
      const response = await apiClient.get(
        `/api/records/search/patients?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = response.data;
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
      
      const response = await apiClient.get(
        `/api/records/search/doctors?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = response.data;
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
      
      const response = await apiClient.get(
        `/api/records/search/employees?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = response.data;
      console.log("Search employees response:", data);
      // API returns {success: true, employees: [...]}
      return Array.isArray(data.employees) ? data.employees : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching employees:", error);
      throw error;
    }
  };
