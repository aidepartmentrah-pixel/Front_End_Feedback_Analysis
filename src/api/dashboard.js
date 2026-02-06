// frontend/src/api/dashboard.js
import apiClient from "./apiClient";

/**
 * Fetch dashboard hierarchy
 * @returns {Promise<Object>} Hierarchy data with administrations, departments, and sections
 */
export async function fetchDashboardHierarchy() {
  const url = "/api/dashboard/hierarchy";
  console.log("📡 Making API call to:", url);
  
  try {
    const response = await apiClient.get(url);
    console.log("📥 Response received");
    console.log("📦 Parsed data:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error);
    throw new Error(`Failed to load hierarchy: ${error.message}`);
  }
}

/**
 * Fetch dashboard statistics
 * @param {Object} params - Query parameters
 * @param {string} params.scope - Scope level: "hospital" | "administration" | "department" | "section"
 * @param {number} [params.administration_id] - Administration ID (required for administration, department, section scopes)
 * @param {number} [params.department_id] - Department ID (required for department, section scopes)
 * @param {number} [params.section_id] - Section ID (required for section scope)
 * @param {string} [params.start_date] - Start date in YYYY-MM-DD format (defaults to 30 days ago)
 * @param {string} [params.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @returns {Promise<Object>} Dashboard statistics data
 */
export async function fetchDashboardStats({
  scope,
  administration_id = null,
  department_id = null,
  section_id = null,
  start_date = null,
  end_date = null,
}) {
  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("scope", scope);

  if (administration_id !== null) {
    queryParams.append("administration_id", administration_id);
  }
  if (department_id !== null) {
    queryParams.append("department_id", department_id);
  }
  if (section_id !== null) {
    queryParams.append("section_id", section_id);
  }
  if (start_date !== null) {
    queryParams.append("start_date", start_date);
  }
  if (end_date !== null) {
    queryParams.append("end_date", end_date);
  }

  const url = `/api/dashboard/stats?${queryParams.toString()}`;
  console.log("📡 Making API call to:", url);

  try {
    const response = await apiClient.get(url);
    console.log("📥 Response received");
    
    const data = response.data;
    console.log("📦 Parsed stats data:", data);
    console.log("📦 Stats data structure:", JSON.stringify(data, null, 2));
    
    // Check actual structure
    if (data && typeof data === 'object') {
      console.log("🔍 Top-level keys:", Object.keys(data));
      if (data.data) console.log("🔍 data.data keys:", Object.keys(data.data));
      if (data.metrics) console.log("🔍 metrics keys:", Object.keys(data.metrics));
      if (data.stats) console.log("🔍 stats keys:", Object.keys(data.stats));
    }
    
    return data;
  } catch (error) {
    console.error("❌ API Error Response:", error);
    console.error("❌ Request URL was:", url);
    console.error("❌ Request params were:", {
      scope,
      administration_id,
      department_id,
      section_id,
      start_date,
      end_date
    });
    
    throw new Error(`Failed to load dashboard stats: ${error.message}`);
  }
}
