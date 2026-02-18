// src/api/adminUsers.js
import apiClient from "./apiClient";

/**
 * Get user inventory (org units hierarchy)
 * Returns all administrations, departments, and sections
 */
export const getUserInventory = async () => {
  try {
    const response = await apiClient.get("/api/admin/user-inventory");
    return response.data;
  } catch (error) {
    console.error("Error fetching user inventory:", error);
    throw error;
  }
};

/**
 * Create a new section with an admin user
 * @param {string} section_name - Name of the new section
 * @param {number} parent_department_id - ID of the parent department
 */
export const createSectionWithAdmin = async (section_name, parent_unit_id) => {
  try {
    const response = await apiClient.post("/api/admin/create-section-with-admin", {
      section_name,
      parent_unit_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating section with admin:", error);
    throw error;
  }
};

/**
 * PHASE C — F-C2 — Create Section API Wrapper
 * Create a new section with auto-generated admin user
 * Production-safe endpoint with frozen contract
 * 
 * @param {Object} payload - Section creation payload
 * @param {string} payload.section_name - Name of the new section
 * @param {number} payload.parent_unit_id - ID of the parent org unit (Department or Administration)
 * @returns {Promise<Object>} Response with section_id, username, and password
 * 
 * @example
 * const result = await createSection({
 *   section_name: "Emergency Section A",
 *   parent_unit_id: 42
 * });
 * // Returns: { section_id: 101, username: "sec_101_admin", password: "..." }
 */
export const createSection = async (payload) => {
  try {
    // Send exactly what backend SectionCreateRequest expects
    const requestBody = {
      section_name: payload.section_name,
      parent_unit_id: payload.parent_unit_id,
    };
    
    const response = await apiClient.post("/api/admin/create-section-with-admin", requestBody);
    // Backend returns temp_password, normalize to password for frontend
    const data = response.data;
    return {
      section_id: data.section_id,
      username: data.username,
      password: data.temp_password || data.password,
    };
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

/**
 * Get all user credentials for testing
 * Returns username, role, org unit, and test password
 */
export const getUserCredentials = async () => {
  try {
    const response = await apiClient.get("/api/admin/testing/user-credentials");
    return response.data;
  } catch (error) {
    console.error("Error fetching user credentials:", error);
    throw error;
  }
};

/**
 * Delete a user by user_id
 * @param {number} user_id - ID of the user to delete
 */
export const deleteUser = async (user_id) => {
  try {
    const response = await apiClient.delete(`/api/admin/users/${user_id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/**
 * Recreate section admin user
 * @param {number} section_id - ID of the section
 */
export const recreateSectionAdmin = async (section_id) => {
  try {
    const response = await apiClient.post(`/api/admin/sections/${section_id}/recreate-admin`);
    return response.data;
  } catch (error) {
    console.error("Error recreating section admin:", error);
    throw error;
  }
};

/**
 * Export user credentials as markdown
 * Downloads a markdown file with all test credentials
 */
export const exportCredentialsMarkdown = async () => {
  try {
    const response = await apiClient.get("/api/admin/testing/user-credentials-markdown", {
      responseType: "text",
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_credentials_${new Date().toISOString().split("T")[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("Error exporting credentials markdown:", error);
    throw error;
  }
};

/**
 * Update user credentials (display name, username, password)
 * @param {number} user_id - ID of the user to update
 * @param {Object} updates - Fields to update
 * @param {string} updates.display_name - New display name (optional)
 * @param {string} updates.username - New username (optional)
 * @param {string} updates.password - New password (optional)
 */
export const updateUser = async (user_id, updates) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${user_id}`, updates);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    // Extract error message from response
    const errorMsg = error.response?.data?.detail || "Failed to update user";
    throw new Error(errorMsg);
  }
};
