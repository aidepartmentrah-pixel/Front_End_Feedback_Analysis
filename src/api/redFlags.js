// src/api/redFlags.js
import apiClient from "./apiClient";

/**
 * Fetch red flags list with filters and pagination
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Red flags list with pagination info
 */
export async function fetchRedFlags(filters = {}) {
  console.log("🚩 Fetching red flags with filters:", filters);

  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);
  if (filters.severity) queryParams.append("severity", filters.severity);
  if (filters.department) queryParams.append("department", filters.department);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);
  if (filters.is_never_event !== undefined) queryParams.append("is_never_event", filters.is_never_event);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);

  const url = `/api/red-flags?${queryParams.toString()}`;
  console.log("🚩 Request URL:", url);

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Red flags loaded:", data.total, "total records");
    console.log("🔍 RED FLAGS DATA STRUCTURE:", JSON.stringify(data.red_flags?.[0], null, 2));
    console.log("🔍 All field names:", data.red_flags?.[0] ? Object.keys(data.red_flags[0]) : []);
    return data;
  } catch (error) {
    console.error("❌ Error fetching red flags:", error);
    throw error;
  }
}

/**
 * Fetch red flags statistics for KPI cards
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} Statistics data
 */
export async function fetchRedFlagStatistics(filters = {}) {
  console.log("📊 Fetching red flags statistics...");

  const queryParams = new URLSearchParams();
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);

  const url = `/api/red-flags/statistics?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Statistics loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    throw error;
  }
}

/**
 * Fetch trend data for charts
 * @param {Object} params - Trend parameters
 * @returns {Promise<Object>} Trend data
 */
export async function fetchRedFlagTrends(params = {}) {
  console.log("📈 Fetching red flags trends...");

  const queryParams = new URLSearchParams();
  if (params.from_date) queryParams.append("from_date", params.from_date);
  if (params.to_date) queryParams.append("to_date", params.to_date);
  if (params.granularity) queryParams.append("granularity", params.granularity);
  if (params.group_by) queryParams.append("group_by", params.group_by);

  const url = `/api/red-flags/trends?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Trends loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching trends:", error);
    throw error;
  }
}

/**
 * Fetch single red flag details
 * @param {number} id - Red flag ID
 * @returns {Promise<Object>} Red flag details
 */
export async function fetchRedFlagDetails(id) {
  console.log("🔍 Fetching red flag details for ID:", id);

  const url = `/api/red-flags/${id}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Red flag details loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching red flag details:", error);
    throw error;
  }
}

/**
 * Fetch category breakdown for red flags
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} Category breakdown data
 */
export async function fetchRedFlagsCategoryBreakdown(filters = {}) {
  console.log("📊 Fetching red flags category breakdown...");

  const queryParams = new URLSearchParams();
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);

  const url = `/api/red-flags/category-breakdown?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Category breakdown loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching category breakdown:", error);
    throw error;
  }
}

/**
 * Fetch department breakdown for red flags
 * @param {Object} filters - Date and limit filters
 * @returns {Promise<Object>} Department breakdown data
 */
export async function fetchRedFlagsDepartmentBreakdown(filters = {}) {
  console.log("📊 Fetching red flags department breakdown...");

  const queryParams = new URLSearchParams();
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const url = `/api/red-flags/department-breakdown?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Department breakdown loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching department breakdown:", error);
    throw error;
  }
}
