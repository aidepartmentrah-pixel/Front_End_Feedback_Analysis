/**
 * Satisfaction API
 * Endpoints for managing patient/case satisfaction data.
 */

import apiClient from './apiClient';

/**
 * Get satisfaction status lookup values
 * @returns {Promise<Array>} List of satisfaction statuses
 */
export const getSatisfactionStatuses = async () => {
  const response = await apiClient.get('/api/v2/lookup/satisfaction-statuses');
  return response.data;
};

/**
 * Get satisfaction for a specific case
 * @param {number} caseId - The incident case ID
 * @returns {Promise<Object>} Satisfaction data or { exists: false }
 */
export const getCaseSatisfaction = async (caseId) => {
  const response = await apiClient.get(`/api/v2/cases/${caseId}/satisfaction`);
  return response.data;
};

/**
 * Create satisfaction for a case
 * @param {number} caseId - The incident case ID
 * @param {Object} data - Satisfaction data
 * @param {boolean} data.feedback_needed - Whether feedback was requested
 * @param {boolean} data.feedback_given - Whether feedback was given
 * @param {string|null} data.feedback_datetime - ISO datetime when feedback was given
 * @param {number} data.satisfaction_status_id - Status (1=Not Present, 2=Satisfied, 3=Not Satisfied)
 * @returns {Promise<Object>} { success, satisfaction_id }
 */
export const createCaseSatisfaction = async (caseId, data) => {
  const response = await apiClient.post(`/api/v2/cases/${caseId}/satisfaction`, data);
  return response.data;
};

export default {
  getSatisfactionStatuses,
  getCaseSatisfaction,
  createCaseSatisfaction,
};
