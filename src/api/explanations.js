// src/api/explanations.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Get all pending cases requiring explanation
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
    const response = await axios.get(`${API_BASE_URL}/api/explanations/pending`, {
      params: {
        dept_id: params.dept_id,
        start_date: params.start_date,
        end_date: params.end_date,
        case_type: params.case_type,
        include_red_flags_only: params.include_red_flags_only,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending explanations:", error);
    throw error;
  }
};

/**
 * Get explanation statistics
 * @returns {Promise} API response with statistics
 */
export const getExplanationStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/explanations/statistics`);
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
    const response = await axios.get(`${API_BASE_URL}/api/explanations/${caseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching case details for case ${caseId}:`, error);
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
    const response = await axios.get(`${API_BASE_URL}/api/explanations/${caseId}/completion-status`);
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
    const response = await axios.post(`${API_BASE_URL}/api/explanations/${caseId}`, data);
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
    const response = await axios.put(
      `${API_BASE_URL}/api/explanations/${caseId}/requires-explanation`,
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
    const response = await axios.post(`${API_BASE_URL}/api/explanations/${caseId}/force-close`, data);
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
    const response = await axios.post(
      `${API_BASE_URL}/api/explanations/${caseId}/check-closure`,
      null,
      { params: { user_id: userId } }
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
    const response = await axios.post(
      `${API_BASE_URL}/api/explanations/${caseId}/mark-action-complete`,
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
    const response = await axios.post(`${API_BASE_URL}/api/explanations/${caseId}/validate`, data);
    return response.data;
  } catch (error) {
    console.error(`Error validating explanation for case ${caseId}:`, error);
    throw error;
  }
};
