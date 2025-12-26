// frontend/src/api/trends.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

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
