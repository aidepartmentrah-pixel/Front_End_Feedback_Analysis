// src/api/systemSettings.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/system-settings";

/**
 * Get all system settings
 * @returns {Promise} Array of all settings with parsed values
 */
export const getAllSettings = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching all settings:", error);
    throw error;
  }
};

/**
 * Get a single setting by key
 * @param {string} key - The setting key (e.g., "ComplaintDelayDays")
 * @returns {Promise} Setting object with parsed value
 */
export const getSetting = async (key) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    throw error;
  }
};

/**
 * Update a setting value
 * @param {string} key - The setting key (e.g., "ComplaintDelayDays")
 * @param {string} value - The new value (must be a string, even for numbers)
 * @param {number|null} userId - Optional user ID for audit trail
 * @returns {Promise} Updated setting object
 */
export const updateSetting = async (key, value, userId = null) => {
  try {
    const payload = {
      value: String(value), // Always convert to string as per API spec
    };
    
    if (userId) {
      payload.updated_by_user_id = userId;
    }
    
    const response = await axios.put(`${API_BASE_URL}/${key}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
};

/**
 * Helper function to get ComplaintDelayDays setting specifically
 * @returns {Promise<number>} The delay days as a number
 */
export const getComplaintDelayDays = async () => {
  try {
    const setting = await getSetting("ComplaintDelayDays");
    return setting.parsed_value; // Returns the number directly
  } catch (error) {
    console.error("Error fetching ComplaintDelayDays:", error);
    throw error;
  }
};

/**
 * Helper function to update ComplaintDelayDays setting
 * @param {number} days - Number of days
 * @param {number|null} userId - Optional user ID for audit trail
 * @returns {Promise} Updated setting object
 */
export const updateComplaintDelayDays = async (days, userId = null) => {
  try {
    return await updateSetting("ComplaintDelayDays", days, userId);
  } catch (error) {
    console.error("Error updating ComplaintDelayDays:", error);
    throw error;
  }
};

export default {
  getAllSettings,
  getSetting,
  updateSetting,
  getComplaintDelayDays,
  updateComplaintDelayDays,
};
