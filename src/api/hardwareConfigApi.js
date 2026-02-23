// src/api/hardwareConfigApi.js
/**
 * Hardware Configuration API
 * 
 * API service for hardware/deployment configuration management.
 * All endpoints require SOFTWARE_ADMIN role.
 */
import apiClient from "./apiClient";

const BASE_PATH = "/api/hardware-config";

/**
 * Hardware Configuration API Service
 */
const hardwareConfigApi = {
  /**
   * Get all configurations organized by group
   * @returns {Promise<{groups: Object, total_configs: number}>}
   */
  getAllConfigs: async () => {
    const response = await apiClient.get(BASE_PATH);
    return response.data;
  },

  /**
   * Get deployment summary (quick overview)
   * @returns {Promise<Object>}
   */
  getSummary: async () => {
    const response = await apiClient.get(`${BASE_PATH}/summary`);
    return response.data;
  },

  /**
   * Get list of configuration groups with metadata
   * @returns {Promise<{groups: Object}>}
   */
  getGroups: async () => {
    const response = await apiClient.get(`${BASE_PATH}/groups`);
    return response.data;
  },

  /**
   * Get configurations for a specific group
   * @param {string} groupName - Group name (database, views, network, email, system)
   * @returns {Promise<Object>}
   */
  getGroupConfigs: async (groupName) => {
    const response = await apiClient.get(`${BASE_PATH}/group/${groupName}`);
    return response.data;
  },

  /**
   * Get a single configuration by key
   * @param {string} configKey - Configuration key
   * @returns {Promise<Object>}
   */
  getConfig: async (configKey) => {
    const response = await apiClient.get(`${BASE_PATH}/key/${configKey}`);
    return response.data;
  },

  /**
   * Update a single configuration
   * @param {string} configKey - Configuration key
   * @param {string} value - New value
   * @returns {Promise<{success: boolean, message: string}>}
   */
  updateConfig: async (configKey, value) => {
    const response = await apiClient.put(`${BASE_PATH}/key/${configKey}`, { value });
    return response.data;
  },

  /**
   * Update multiple configurations at once
   * @param {Array<{key: string, value: string}>} updates - Array of updates
   * @returns {Promise<{success_count: number, error_count: number, errors: Array}>}
   */
  updateConfigsBatch: async (updates) => {
    const response = await apiClient.put(`${BASE_PATH}/batch`, { updates });
    return response.data;
  },

  /**
   * Test database connection with current configuration
   * @returns {Promise<{success: boolean, message: string}>}
   */
  testDatabaseConnection: async () => {
    const response = await apiClient.post(`${BASE_PATH}/test/database`);
    return response.data;
  },

  /**
   * Test database connection with custom parameters
   * @param {Object} params - Connection parameters
   * @param {string} params.server - Database server
   * @param {string} params.database - Database name
   * @param {string} [params.driver] - ODBC driver
   * @param {boolean} [params.use_windows_auth] - Use Windows auth
   * @param {string} [params.username] - SQL username
   * @param {string} [params.password] - SQL password
   * @returns {Promise<{success: boolean, message: string}>}
   */
  testCustomDatabaseConnection: async (params) => {
    const response = await apiClient.post(`${BASE_PATH}/test/database/custom`, params);
    return response.data;
  },

  /**
   * Test SMTP connection with current configuration
   * @returns {Promise<{success: boolean, message: string}>}
   */
  testSmtpConnection: async () => {
    const response = await apiClient.post(`${BASE_PATH}/test/smtp`);
    return response.data;
  },

  /**
   * Test SMTP connection with custom parameters
   * @param {Object} params - SMTP parameters
   * @param {string} params.host - SMTP server host
   * @param {number} [params.port] - SMTP port
   * @param {boolean} [params.use_tls] - Use TLS
   * @param {boolean} [params.use_ssl] - Use SSL
   * @param {string} [params.username] - SMTP username
   * @param {string} [params.password] - SMTP password
   * @returns {Promise<{success: boolean, message: string}>}
   */
  testCustomSmtpConnection: async (params) => {
    const response = await apiClient.post(`${BASE_PATH}/test/smtp/custom`, params);
    return response.data;
  },
};

export default hardwareConfigApi;
