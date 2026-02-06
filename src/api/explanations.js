// src/api/explanations.js
import apiClient from "./apiClient";

/**
 * Get all pending cases requiring explanation (Red Flag, Never Event, Ordinary)
 * @param {Object} params - Query parameters
 * @param {number} params.dept_id - Department ID filter
 * @param {string} params.start_date - Start date filter (YYYY-MM-DD)
 * @param {string} params.end_date - End date filter (YYYY-MM-DD)
 * @param {string} params.case_type - Case type filter (e.g., "Red Flag", "Never Event")
 * @param {boolean} params.include_red_flags_only - Only include red flags
 * @returns {Promise} API response with pending cases and statistics
 */
export const getPendingExplanations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.dept_id) queryParams.append('dept_id', params.dept_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.case_type) queryParams.append('case_type', params.case_type);
    if (params.include_red_flags_only !== undefined) queryParams.append('include_red_flags_only', params.include_red_flags_only);
    
    const response = await apiClient.get(`/api/explanations/pending/cases?${queryParams.toString()}`);
    
    console.log('[DEBUG] Pending Cases API Response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch pending cases');
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching pending cases:", error);
    throw error;
  }
};

/**
 * Get all pending seasonal reports requiring explanation
 * @param {Object} params - Query parameters
 * @param {number} params.org_unit_id - Organization unit ID filter
 * @param {number} params.season_id - Season ID filter
 * @param {boolean} params.non_compliant_only - Only include non-compliant reports
 * @returns {Promise} API response with pending seasonal reports
 */
export const getPendingSeasonalReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.org_unit_id) queryParams.append('org_unit_id', params.org_unit_id);
    if (params.season_id) queryParams.append('season_id', params.season_id);
    if (params.non_compliant_only !== undefined) queryParams.append('non_compliant_only', params.non_compliant_only);
    
    const response = await apiClient.get(`/api/explanations/pending/seasonal?${queryParams.toString()}`);
    
    console.log('[DEBUG] Pending Seasonal Reports API Response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch pending seasonal reports');
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching pending seasonal reports:", error);
    throw error;
  }
};

/**
 * Get explanation statistics
 * @returns {Promise} API response with statistics
 */
export const getExplanationStatistics = async () => {
  try {
    const response = await apiClient.get(`/api/explanations/statistics`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch statistics');
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching explanation statistics:", error);
    throw error;
  }
};

/**
 * Get detailed information about a specific case
 * @param {number} caseId - The case ID
 * @returns {Promise} API response with case details, validation, and action items
 */
export const getCaseDetails = async (caseId) => {
  try {
    const response = await apiClient.get(`/api/explanations/${caseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching case details for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Get Red Flag/Never Event feedback for a case
 * @param {number} caseId - The case ID
 * @returns {Promise} API response with feedback data
 */
export const getRedFlagFeedback = async (caseId) => {
  try {
    const response = await apiClient.get(`/api/explanations/red-flag/${caseId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch Red Flag feedback');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching Red Flag feedback for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Submit Red Flag/Never Event feedback
 * @param {number} caseId - The case ID
 * @param {Object} data - Feedback data with causes and preventive actions
 * @returns {Promise} API response with submission result
 */
export const submitRedFlagFeedback = async (caseId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/red-flag/${caseId}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit Red Flag feedback');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error submitting Red Flag feedback for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Get Ordinary case explanation
 * @param {number} caseId - The case ID
 * @returns {Promise} API response with explanation data
 */
export const getOrdinaryExplanation = async (caseId) => {
  try {
    const response = await apiClient.get(`/api/explanations/ordinary/${caseId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch Ordinary explanation');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching Ordinary explanation for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Submit Ordinary case explanation
 * @param {number} caseId - The case ID
 * @param {Object} data - Simple explanation data
 * @returns {Promise} API response with submission result
 */
export const submitOrdinaryExplanation = async (caseId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/ordinary/${caseId}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit Ordinary explanation');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error submitting Ordinary explanation for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Get Seasonal report explanation
 * @param {number} reportId - The seasonal report ID
 * @returns {Promise} API response with seasonal explanation data
 */
export const getSeasonalExplanation = async (reportId) => {
  try {
    const response = await apiClient.get(`/api/explanations/seasonal/${reportId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch Seasonal explanation');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching Seasonal explanation for report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Submit Seasonal report explanation
 * @param {number} reportId - The seasonal report ID
 * @param {Object} data - Seasonal explanation data
 * @returns {Promise} API response with submission result
 */
export const submitSeasonalExplanation = async (reportId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/seasonal/${reportId}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit Seasonal explanation');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error submitting Seasonal explanation for report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get action item completion status for a case
 * @param {number} caseId - The case ID
 * @returns {Promise} API response with completion status and action items
 */
export const getCompletionStatus = async (caseId) => {
  try {
    const response = await apiClient.get(`/api/explanations/${caseId}/completion-status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching completion status for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Submit an explanation for a case
 * @param {number} caseId - The case ID
 * @param {Object} data - Explanation data
 * @param {string} data.explanation_text - The explanation text
 * @param {Array} data.action_items - Array of action items
 * @param {number} data.user_id - User ID submitting the explanation
 * @returns {Promise} API response with submitted explanation
 */
export const submitExplanation = async (caseId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/${caseId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error submitting explanation for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Update whether a case requires explanation
 * @param {number} caseId - The case ID
 * @param {Object} data - Update data
 * @param {boolean} data.requires_explanation - Whether explanation is required
 * @param {string} data.reason - Optional reason for the change
 * @param {number} data.user_id - User ID making the change
 * @returns {Promise} API response
 */
export const updateRequiresExplanation = async (caseId, data) => {
  try {
    const response = await apiClient.put(
      `/api/explanations/${caseId}/requires-explanation`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating requires_explanation for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Force close a case
 * @param {number} caseId - The case ID
 * @param {Object} data - Closure data
 * @param {string} data.reason - Reason for force closing
 * @param {number} data.user_id - User ID performing the action
 * @returns {Promise} API response
 */
export const forceCloseCase = async (caseId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/${caseId}/force-close`, data);
    return response.data;
  } catch (error) {
    console.error(`Error force closing case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Check if a case can be closed (based on action item completion)
 * @param {number} caseId - The case ID
 * @param {number} userId - User ID checking closure
 * @returns {Promise} API response with closure eligibility
 */
export const checkCaseClosure = async (caseId, userId) => {
  try {
    const response = await apiClient.post(
      `/api/explanations/${caseId}/check-closure?user_id=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error checking case closure for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Mark an action item as complete
 * @param {number} caseId - The case ID
 * @param {Object} data - Action item data
 * @param {number} data.action_item_id - The action item ID
 * @param {number} data.user_id - User ID marking the item complete
 * @returns {Promise} API response
 */
export const markActionComplete = async (caseId, data) => {
  try {
    const response = await apiClient.post(
      `/api/explanations/${caseId}/mark-action-complete`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error marking action complete for case ${caseId}:`, error);
    throw error;
  }
};

/**
 * Validate explanation data before submission
 * @param {number} caseId - The case ID
 * @param {Object} data - Data to validate
 * @param {string} data.explanation_text - The explanation text
 * @param {Array} data.action_items - Array of action items
 * @returns {Promise} API response with validation results
 */
export const validateExplanation = async (caseId, data) => {
  try {
    const response = await apiClient.post(`/api/explanations/${caseId}/validate`, data);
    return response.data;
  } catch (error) {
    console.error(`Error validating explanation for case ${caseId}:`, error);
    throw error;
  }
};
