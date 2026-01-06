// frontend/src/api/trends.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch all trends (domains, categories, classifications) by scope
 * @param {Object} params - Query parameters
 * @param {string} [params.scope] - Scope: "hospital", "administration", "department", "section"
 * @param {number} [params.department_id] - Required when scope is "department"
 * @param {number} [params.administration_id] - Required when scope is "administration"
 * @param {number} [params.section_id] - Required when scope is "section"
 * @param {string} [params.start_date] - Start date in ISO 8601 format (YYYY-MM or YYYY-MM-DD)
 * @param {string} [params.end_date] - End date in ISO 8601 format (YYYY-MM or YYYY-MM-DD)
 * @returns {Promise<Object>} Trends data with domain, category, classification
 */
export async function fetchTrendsByScope({
  scope = "hospital",
  department_id = null,
  administration_id = null,
  section_id = null,
  start_date = null,
  end_date = null,
} = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append("scope", scope);
  
  // Add scope-specific IDs
  if (scope === "department" && department_id) {
    queryParams.append("department_id", department_id);
  }
  if (scope === "administration" && administration_id) {
    queryParams.append("administration_id", administration_id);
  }
  if (scope === "section" && section_id) {
    queryParams.append("section_id", section_id);
  }
  
  if (start_date) queryParams.append("start_date", start_date);
  if (end_date) queryParams.append("end_date", end_date);

  const url = `${API_BASE_URL}/api/trends/analysis?${queryParams.toString()}`;
  console.log("📡 Fetching trends from:", url);

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ API Error Response:", errorText);
    
    let errorMessage = `Failed to load trends: ${res.status} ${res.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) errorMessage += ` - ${errorData.detail}`;
    } catch (e) {
      if (errorText) errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  console.log("📦 Trends data loaded:", data);
  return data;
}

/**
 * Fetch monthly incident trends aggregated by clinical domain (HCAT)
 * @param {Object} params - Query parameters
 * @param {string} [params.start_date] - Start month in YYYY-MM format (defaults to 12 months ago)
 * @param {string} [params.end_date] - End month in YYYY-MM format (defaults to current month)
 * @param {boolean} [params.include_zero_months] - Include months with zero incidents (default: true)
 * @param {boolean} [params.include_inactive_domains] - Include domains with no incidents (default: false)
 * @param {boolean} [params.calculate_trends] - Calculate trend direction and percentage (default: true)
 * @returns {Promise<Object>} Domain trends data
 */
export async function fetchDomainTrends({
  start_date = null,
  end_date = null,
  include_zero_months = true,
  include_inactive_domains = false,
  calculate_trends = true,
} = {}) {
  // Build query parameters
  const queryParams = new URLSearchParams();

  if (start_date !== null) {
    queryParams.append("start_date", start_date);
  }
  if (end_date !== null) {
    queryParams.append("end_date", end_date);
  }
  if (include_zero_months !== null) {
    queryParams.append("include_zero_months", include_zero_months);
  }
  if (include_inactive_domains !== null) {
    queryParams.append("include_inactive_domains", include_inactive_domains);
  }
  if (calculate_trends !== null) {
    queryParams.append("calculate_trends", calculate_trends);
  }

  const url = `${API_BASE_URL}/api/trends/domains?${queryParams.toString()}`;
  console.log("📡 Fetching domain trends from:", url);

  const res = await fetch(url);
  console.log("📥 Response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ API Error Response:", errorText);
    
    let errorMessage = `Failed to load domain trends: ${res.status} ${res.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        errorMessage += ` - ${errorData.detail}`;
      }
    } catch (e) {
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await res.json();
  console.log("📦 Domain trends data loaded:", data);
  return data;
}
