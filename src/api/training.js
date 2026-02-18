// src/api/training.js
import apiClient from "./apiClient";

const TRAINING_BASE = "/api/settings/training";

/**
 * Get grouped model status
 * @returns {Promise} Grouped model status data
 */
export const getGroupedStatus = async () => {
  try {
    const response = await apiClient.get(`${TRAINING_BASE}/grouped-status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching grouped status:", error);
    throw error;
  }
};

/**
 * Get training progress
 * @returns {Promise} Training progress data
 */
export const getTrainingProgress = async () => {
  try {
    const response = await apiClient.get(`${TRAINING_BASE}/progress`);
    return response.data;
  } catch (error) {
    console.error("Error fetching training progress:", error);
    throw error;
  }
};

/**
 * Get database growth chart data
 * @param {number} days - Number of days to fetch
 * @returns {Promise} DB growth chart data
 */
export const getDbGrowthChart = async (days = 30) => {
  try {
    const response = await apiClient.get(`${TRAINING_BASE}/charts/db-growth`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching DB growth chart:", error);
    throw error;
  }
};

/**
 * Get performance trends chart data
 * @returns {Promise} Performance trends chart data
 */
export const getPerformanceTrendsChart = async () => {
  try {
    const response = await apiClient.get(`${TRAINING_BASE}/charts/performance-trends`);
    return response.data;
  } catch (error) {
    console.error("Error fetching performance trends chart:", error);
    throw error;
  }
};

/**
 * Get family comparison chart data
 * @returns {Promise} Family comparison chart data
 */
export const getFamilyComparisonChart = async () => {
  try {
    const response = await apiClient.get(`${TRAINING_BASE}/charts/family-comparison`);
    return response.data;
  } catch (error) {
    console.error("Error fetching family comparison chart:", error);
    throw error;
  }
};

/**
 * Start training process
 * @returns {Promise} Training run response with run_id
 */
export const runTraining = async () => {
  try {
    const response = await apiClient.post(`${TRAINING_BASE}/run`);
    return response.data;
  } catch (error) {
    console.error("Error starting training:", error);
    throw error;
  }
};

export default {
  getGroupedStatus,
  getTrainingProgress,
  getDbGrowthChart,
  getPerformanceTrendsChart,
  getFamilyComparisonChart,
  runTraining,
};
