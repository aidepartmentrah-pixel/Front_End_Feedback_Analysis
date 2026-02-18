// src/api/settingsUsersApi.js
import apiClient from "./apiClient";

/**
 * List all users
 * @returns {Promise<Object>} Response data with users list
 */
export async function listUsers() {
  const response = await apiClient.get("/api/settings/users");
  return response.data;
}

/**
 * Create a new user
 * @param {Object} payload - User creation data
 * @param {string} payload.username - Username
 * @param {string} payload.password - Password
 * @param {string} payload.display_name - Display name
 * @param {string} payload.department_display_name - Department display name
 * @param {string} payload.role_id - Role ID
 * @param {number} payload.org_unit_id - Organization unit ID
 * @returns {Promise<Object>} Response data with created user
 */
export async function createUser(payload) {
  const response = await apiClient.post("/api/settings/users", payload);
  return response.data;
}

/**
 * Update user identity information
 * @param {number} userId - User ID
 * @param {Object} payload - Identity update data
 * @returns {Promise<Object>} Response data with updated user
 */
export async function updateUserIdentity(userId, payload) {
  const response = await apiClient.patch(`/api/settings/users/${userId}/identity`, payload);
  return response.data;
}

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {Object} payload - Password update data
 * @param {string} payload.new_password - New password
 * @returns {Promise<Object>} Response data
 */
export async function updateUserPassword(userId, payload) {
  const response = await apiClient.patch(`/api/settings/users/${userId}/password`, payload);
  return response.data;
}

/**
 * Delete a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Response data
 */
export async function deleteUser(userId) {
  const response = await apiClient.delete(`/api/settings/users/${userId}`);
  return response.data;
}

/**
 * Bulk delete multiple users
 * @param {number[]} userIds - Array of user IDs to delete
 * @returns {Promise<Object>} Response data with results
 */
export async function bulkDeleteUsers(userIds) {
  const response = await apiClient.post("/api/settings/users/bulk-delete", {
    user_ids: userIds
  });
  return response.data;
}
