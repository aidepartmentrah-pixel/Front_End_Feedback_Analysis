// src/api/neverEvents.js
import apiClient from "./apiClient";

/**
 * Fetch never events list with filters and pagination
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Never events list with pagination info
 */
export async function fetchNeverEvents(filters = {}) {
  console.log("⚠️ Fetching never events with filters:", filters);

  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);
  if (filters.department) queryParams.append("department", filters.department);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);

  const url = `/api/never-events?${queryParams.toString()}`;
  console.log("⚠️ Request URL:", url);

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Never events loaded:", data.total, "total records");
    return data;
  } catch (error) {
    console.error("❌ Error fetching never events:", error);
    throw error;
  }
}

/**
 * Fetch never events statistics for KPI cards
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} Statistics data
 */
export async function fetchNeverEventsStatistics(filters = {}) {
  console.log("📊 Fetching never events statistics...");

  const queryParams = new URLSearchParams();
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);

  const url = `/api/never-events/statistics?${queryParams.toString()}`;

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
export async function fetchNeverEventsTrends(params = {}) {
  console.log("📈 Fetching never events trends...");

  const queryParams = new URLSearchParams();
  if (params.from_date) queryParams.append("from_date", params.from_date);
  if (params.to_date) queryParams.append("to_date", params.to_date);
  if (params.granularity) queryParams.append("granularity", params.granularity);
  if (params.group_by) queryParams.append("group_by", params.group_by);

  const url = `/api/never-events/trends?${queryParams.toString()}`;

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
 * Fetch single never event details
 * @param {number} id - Never event ID
 * @returns {Promise<Object>} Never event details
 */
export async function fetchNeverEventDetails(id) {
  console.log("🔍 Fetching never event details for ID:", id);

  const url = `/api/never-events/${id}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Never event details loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching never event details:", error);
    throw error;
  }
}

/**
 * Fetch category breakdown for never events
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} Category breakdown data
 */
export async function fetchNeverEventsCategoryBreakdown(filters = {}) {
  console.log("📊 Fetching never events category breakdown...");

  const queryParams = new URLSearchParams();
  if (filters.from_date) queryParams.append("from_date", filters.from_date);
  if (filters.to_date) queryParams.append("to_date", filters.to_date);

  const url = `/api/never-events/category-breakdown?${queryParams.toString()}`;

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
 * Fetch timeline comparison for never events
 * @param {string} period - Period type (month, quarter, year)
 * @returns {Promise<Object>} Timeline comparison data
 */
export async function fetchNeverEventsTimelineComparison(period = 'month') {
  console.log("📅 Fetching never events timeline comparison...");

  const queryParams = new URLSearchParams();
  if (period) queryParams.append("period", period);

  const url = `/api/never-events/timeline-comparison?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);

    const data = response.data;
    console.log("✅ Timeline comparison loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching timeline comparison:", error);
    throw error;
  }
}
