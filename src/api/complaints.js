// src/api/complaints.js
import apiClient from "./apiClient";

// Helper to convert apiClient response to match old fetch pattern
const fetchWithAuth = async (url) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Header filters may store a value as an array of IDs (multi-select) or a
// plain scalar (single-select, e.g. from the older filter panel). The backend
// accepts both shapes as one comma-separated string.
const toMultiParam = (value) => (Array.isArray(value) ? value.join(",") : value);

/**
 * Fetch complaints with pagination, filtering, sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Complaints data with pagination info
 */
export async function fetchComplaints(params = {}) {
  console.log("🔍 Fetching complaints with params:", params);

  // Build query parameters
  const queryParams = new URLSearchParams();
  
  // Pagination
  if (params.page) queryParams.append("page", params.page);
  if (params.page_size) queryParams.append("page_size", params.page_size);
  
  // Search
  if (params.search) queryParams.append("search", params.search);
  
  // Filters
  if (params.issuing_org_unit_id) queryParams.append("issuing_org_unit_id", params.issuing_org_unit_id);
  if (params.target_department_id) queryParams.append("target_department_id", params.target_department_id);
  if (params.target_dept_parent_id) queryParams.append("target_dept_parent_id", params.target_dept_parent_id);
  if (params.target_admin_id) queryParams.append("target_admin_id", params.target_admin_id);
  if (params.domain_id) queryParams.append("domain_id", toMultiParam(params.domain_id));
  if (params.category_id) queryParams.append("category_id", toMultiParam(params.category_id));
  if (params.subcategory_id) queryParams.append("subcategory_id", toMultiParam(params.subcategory_id));
  if (params.classification_id) queryParams.append("classification_id", toMultiParam(params.classification_id));
  if (params.severity_id) queryParams.append("severity_id", toMultiParam(params.severity_id));
  if (params.stage_id) queryParams.append("stage_id", toMultiParam(params.stage_id));
  if (params.harm_level_id) queryParams.append("harm_level_id", toMultiParam(params.harm_level_id));
  if (params.case_status_id) queryParams.append("case_status_id", toMultiParam(params.case_status_id));
  if (params.clinical_risk_type_id) queryParams.append("clinical_risk_type_id", toMultiParam(params.clinical_risk_type_id));
  if (params.feedback_intent_type_id) queryParams.append("feedback_intent_type_id", toMultiParam(params.feedback_intent_type_id));
  if (params.source_id) queryParams.append("source_id", toMultiParam(params.source_id));
  if (params.year) queryParams.append("year", params.year);
  if (params.month) queryParams.append("month", params.month);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);

  // Sorting
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  // View
  if (params.view) queryParams.append("view", params.view);

  // Tab
  if (params.tab) queryParams.append("tab", params.tab);

  const url = `/api/complaints?${queryParams.toString()}`;
  console.log("📡 Complaints API URL:", url);
  
  // Enhanced logging for sort debugging
  if (params.sort_by) {
    console.log("🔀 SORT DEBUG:", {
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      message: params.sort_by === 'id' ? '⚠️ Sorting by ID - Backend must use NUMERIC sort, not string sort!' : ''
    });
  }

  try {
    const response = await apiClient.get(url);
    
    console.log("✅ Complaints loaded:", {
      count: response.data.complaints?.length,
      total_records: response.data.pagination?.total_records,
      page: response.data.pagination?.page,
    });
    
    // Debug: Log first few complaint IDs to verify sort order
    if (response.data.complaints?.length > 0 && params.sort_by === 'id') {
      const ids = response.data.complaints.slice(0, 5).map(c => c.id || c.complaint_number);
      console.log("🔍 SORT VERIFICATION - First 5 IDs:", ids);
      console.log("⚠️ If IDs show: [177, 175, 176...] this confirms BACKEND is doing STRING sort instead of NUMERIC sort");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    throw error;
  }
}

/**
 * Fetch filter options for dropdowns
 * @returns {Promise<Object>} Filter options
 */
export async function fetchFilterOptions() {
  console.log("🔍 Fetching filter options...");
  // Use the reference/all endpoint which provides all filter data
  const url = "/api/reference/all";
  console.log("🔗 Filter options URL:", url);

  try {
    const response = await apiClient.get(url);
    const data = response.data;
    console.log("✅ Filter options loaded:", data);
    
    // Fetch case statuses from dedicated endpoint
    try {
      const statusResponse = await apiClient.get("/api/reference/case-statuses");
      const statusData = statusResponse.data;
      console.log("✅ Case statuses loaded:", statusData);
      data.statuses = statusData.case_statuses || [];
    } catch (statusError) {
      console.warn("⚠️ Could not fetch case statuses:", statusError);
    }
    
    // Also fetch classifications from the dashboard debug endpoint
    try {
      const classResponse = await apiClient.get("/api/dashboard/debug/classifications");
      const classData = classResponse.data;
      console.log("✅ Classifications loaded from debug endpoint:", classData);
      // Merge classifications into data
      data.classifications_en = classData.classifications || [];
    } catch (classError) {
      console.warn("⚠️ Could not fetch classifications from debug endpoint:", classError);
    }
    
    // Fetch all subcategories by iterating through all categories
    try {
      console.log("🔍 Fetching all subcategories...");
      const allSubcategories = [];
      
      if (data.categories && Array.isArray(data.categories)) {
        console.log(`📊 Found ${data.categories.length} categories, fetching their subcategories...`);
        
        // Fetch subcategories for each category
        for (const category of data.categories) {
          try {
            const subcatResponse = await apiClient.get(`/api/reference/subcategories?category_id=${category.id}`);
            const subcatData = subcatResponse.data;
            const subcats = Array.isArray(subcatData) ? subcatData : (subcatData.subcategories || []);
            
            if (subcats.length > 0) {
              console.log(`✅ Loaded ${subcats.length} subcategories for category ${category.id} (${category.name})`);
              allSubcategories.push(...subcats);
            }
          } catch (e) {
            console.warn(`⚠️ Could not fetch subcategories for category ${category.id}:`, e);
          }
        }
        
        data.subcategories = allSubcategories;
        console.log(`✅ Total subcategories loaded: ${allSubcategories.length}`);
        console.log("📋 Sample subcategories:", allSubcategories.slice(0, 3));
      } else {
        console.warn("⚠️ No categories available to fetch subcategories");
        data.subcategories = [];
      }
    } catch (subcatError) {
      console.error("❌ Error fetching subcategories:", subcatError);
      data.subcategories = [];
    }
    
    return data;
  } catch (error) {
    console.error("❌ Error fetching filter options:", error.message);
    throw error;
  }
}

/**
 * Fetch single complaint by ID
 * @param {number} id - Complaint ID
 * @returns {Promise<Object>} Complaint details
 */
export async function fetchComplaintById(id) {
  console.log("🔍 Fetching complaint:", id);
  const url = `/api/complaints/${id}`;

  try {
    const response = await apiClient.get(url);
    const data = response.data;
    console.log("✅ Complaint loaded:", data.complaint_number);
    return data;
  } catch (error) {
    console.error("❌ Error fetching complaint:", error);
    throw error;
  }
}

/**
 * Get total count of complaints matching filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<number>} Total count
 */
export async function fetchComplaintsCount(filters = {}) {
  console.log("🔍 Fetching complaints count...");
  
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) queryParams.append(key, toMultiParam(filters[key]));
  });

  const url = `/api/complaints/count?${queryParams.toString()}`;

  try {
    const response = await apiClient.get(url);
    const data = response.data;
    console.log("✅ Complaints count:", data.count);
    return data.count;
  } catch (error) {
    console.error("❌ Error fetching count:", error);
    throw error;
  }
}

/**
 * Export complaints data
 * @param {Object} params - Export parameters (filters, search, sort, view)
 * @returns {Promise<Blob>} File blob
 */
export async function exportComplaints(params = {}) {
  console.log("📤 Exporting complaints with params:", params);
  
  // Build query string - params already have _id suffix from TableView
  const queryParams = new URLSearchParams();

  // Search
  if (params.search) queryParams.append("search", params.search);

  // Filters (already have _id suffix)
  if (params.issuing_org_unit_id) queryParams.append("issuing_org_unit_id", params.issuing_org_unit_id);
  if (params.target_department_id) queryParams.append("target_department_id", params.target_department_id);
  if (params.target_dept_parent_id) queryParams.append("target_dept_parent_id", params.target_dept_parent_id);
  if (params.target_admin_id) queryParams.append("target_admin_id", params.target_admin_id);
  if (params.domain_id) queryParams.append("domain_id", toMultiParam(params.domain_id));
  if (params.category_id) queryParams.append("category_id", toMultiParam(params.category_id));
  if (params.subcategory_id) queryParams.append("subcategory_id", toMultiParam(params.subcategory_id));
  if (params.classification_id) queryParams.append("classification_id", toMultiParam(params.classification_id));
  if (params.severity_id) queryParams.append("severity_id", toMultiParam(params.severity_id));
  if (params.stage_id) queryParams.append("stage_id", toMultiParam(params.stage_id));
  if (params.harm_level_id) queryParams.append("harm_level_id", toMultiParam(params.harm_level_id));
  if (params.case_status_id) queryParams.append("case_status_id", toMultiParam(params.case_status_id));
  if (params.clinical_risk_type_id) queryParams.append("clinical_risk_type_id", toMultiParam(params.clinical_risk_type_id));
  if (params.feedback_intent_type_id) queryParams.append("feedback_intent_type_id", toMultiParam(params.feedback_intent_type_id));
  if (params.source_id) queryParams.append("source_id", toMultiParam(params.source_id));
  if (params.year) queryParams.append("year", params.year);
  if (params.month) queryParams.append("month", params.month);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);

  // Sorting
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  // View mode and active tab
  if (params.view) queryParams.append("view", params.view);
  if (params.tab) queryParams.append("tab", params.tab);

  const url = `/api/complaints/export?${queryParams.toString()}`;
  console.log("📤 Export URL:", url);

  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
      headers: {
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    const blob = response.data;
    console.log("✅ Export complete, blob size:", blob.size);
    return blob;
  } catch (error) {
    console.error("❌ Error exporting:", error);
    throw error;
  }
}

/**
 * Fetch available table views
 * @returns {Promise<Object>} Table view configurations
 */
export async function fetchTableViews() {
  console.log("🔍 Fetching table views...");
  const url = `/api/complaints/views`;

  try {
    const response = await apiClient.get(url);
    const data = response.data;
    console.log("✅ Table views loaded");
    return data;
  } catch (error) {
    console.error("❌ Error fetching views:", error);
    throw error;
  }
}

/**
 * Delete a complaint by ID
 * @param {number} complaintId - The ID of the complaint to delete
 * @returns {Promise<Object>} Success response
 */
export async function deleteComplaint(complaintId) {
  console.log("🗑️ Hard deleting complaint:", complaintId);
  const url = `/api/complaints/${complaintId}/hard-delete`;
  console.log("🔗 DELETE URL:", url);

  try {
    const response = await apiClient.delete(url);
    const data = response.data;
    console.log("✅ Complaint permanently deleted:", data);
    return data;
  } catch (error) {
    console.error("❌ Error deleting complaint:", error.message);
    throw error;
  }
}

/**
 * Fetch a single record by ID for editing
 * @param {number} recordId - The record ID
 * @returns {Promise<Object>} Record data with all fields for editing
 */
export async function getRecordById(recordId) {
  console.log("📖 Fetching record details:", recordId);
  const url = `/api/records/${recordId}`;
  console.log("🔗 GET URL:", url);

  try {
    const response = await apiClient.get(url);
    const data = response.data;
    console.log("✅ Record loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching record:", error.message);
    throw error;
  }
}

/**
 * Update an existing record
 * @param {number} recordId - The record ID
 * @param {Object} payload - Updated record data (same structure as insert)
 * @returns {Promise<Object>} Updated record confirmation
 */
export async function updateRecord(recordId, payload) {
  console.log("✏️ Updating record:", recordId);
  const url = `/api/records/${recordId}`;
  console.log("🔗 PUT URL:", url);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await apiClient.put(url, payload);
    const data = response.data;
    console.log("✅ Record updated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating record:", error.message);
    throw error;
  }
}

export async function markAsReady(caseId) {
  const response = await apiClient.post(`/api/records/mark-ready/${caseId}`);
  return response.data;
}

export async function publishComplaint(caseId) {
  const response = await apiClient.post(`/api/records/publish/${caseId}`);
  return response.data;
}

export async function bulkPublishComplaints(caseIds = null) {
  const response = await apiClient.post("/api/records/bulk-publish", {
    case_ids: caseIds,
  });
  return response.data;
}
