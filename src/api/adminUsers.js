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
export const createSectionWithAdmin = async (section_name, parent_department_id) => {
  try {
    const response = await apiClient.post("/api/admin/create-section-with-admin", {
      section_name,
      parent_department_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating section with admin:", error);
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
