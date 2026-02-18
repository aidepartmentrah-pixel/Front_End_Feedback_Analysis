// src/api/orgUnits.js
// API service for organizational units (leaves, administrations, departments)
import apiClient from "./apiClient";

/**
 * Fetch all sections/leaves (smallest organizational units)
 * Used in Insert Page for issuing department selection
 * GET /api/org-units/leaves
 * Returns: { leaves: [...], count: number }
 */
export const fetchLeaves = async () => {
  try {
    const response = await apiClient.get("/api/org-units/leaves");
    console.log("Leaves response:", response.data);
    // Backend returns { leaves: [...], count: number }
    return response.data.leaves || [];
  } catch (error) {
    console.error("Error fetching leaves:", error);
    throw error;
  }
};

/**
 * Fetch all administrations
 * Used in Settings > Policy Configuration to show all administrations
 * GET /api/org-units/administrations
 * Returns: { administrations: [...], count: number }
 */
export const fetchAdministrations = async () => {
  try {
    const response = await apiClient.get("/api/org-units/administrations");
    console.log("Administrations response:", response.data);
    // Backend returns { administrations: [...], count: number }
    return response.data.administrations || [];
  } catch (error) {
    console.error("Error fetching administrations:", error);
    throw error;
  }
};

/**
 * Fetch all departments
 * Used in Create Section when selecting a department as parent
 * GET /api/org-units/departments
 * Returns: { departments: [...], count: number }
 */
export const fetchDepartments = async () => {
  try {
    const response = await apiClient.get("/api/org-units/departments");
    console.log("Departments response:", response.data);
    // Backend returns { departments: [...], count: number }
    return response.data.departments || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};
