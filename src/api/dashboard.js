// frontend/src/api/dashboard.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch dashboard hierarchy
 * @returns {Promise<Object>} Hierarchy data with administrations, departments, and sections
 */
export async function fetchDashboardHierarchy() {
  const url = `${API_BASE_URL}/api/dashboard/hierarchy`;
  console.log("📡 Making API call to:", url);
  
  const res = await fetch(url);
  console.log("📥 Response status:", res.status, res.statusText);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ API Error:", errorText);
    throw new Error(`Failed to load hierarchy: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log("📦 Parsed data:", data);
  return data;
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

  const url = `${API_BASE_URL}/api/dashboard/stats?${queryParams.toString()}`;
  console.log("📡 Making API call to:", url);

  const res = await fetch(url);
  console.log("📥 Response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ API Error Response:", errorText);
    console.error("❌ Request URL was:", url);
    console.error("❌ Request params were:", {
      scope,
      administration_id,
      department_id,
      section_id,
      start_date,
      end_date
    });
    
    // Try to parse error details
    let errorMessage = `Failed to load dashboard stats: ${res.status} ${res.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        errorMessage += ` - ${errorData.detail}`;
      }
    } catch (e) {
      // If not JSON, use the text as is
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await res.json();
  console.log("📦 Parsed stats data:", data);
  return data;
}
