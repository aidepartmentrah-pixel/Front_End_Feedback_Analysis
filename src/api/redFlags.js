// src/api/redFlags.js
const BASE_URL = "http://127.0.0.1:8000/api/red-flags";

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

  const url = `${BASE_URL}?${queryParams.toString()}`;
  console.log("🚩 Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب الأعلام الحمراء: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Red flags loaded:", data.total, "total records");
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

  const url = `${BASE_URL}/statistics?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب الإحصائيات: ${response.status}`);
    }

    const data = await response.json();
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

  const url = `${BASE_URL}/trends?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب بيانات الاتجاهات: ${response.status}`);
    }

    const data = await response.json();
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

  const url = `${BASE_URL}/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب تفاصيل العلم الأحمر: ${response.status}`);
    }

    const data = await response.json();
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

  const url = `${BASE_URL}/category-breakdown?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب تفصيل الفئات: ${response.status}`);
    }

    const data = await response.json();
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

  const url = `${BASE_URL}/department-breakdown?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`فشل في جلب تفصيل الإدارات: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Department breakdown loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching department breakdown:", error);
    throw error;
  }
}
