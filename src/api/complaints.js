// src/api/complaints.js

const BASE_URL = "http://127.0.0.1:8000/api/complaints";

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
  if (params.domain_id) queryParams.append("domain_id", params.domain_id);
  if (params.category_id) queryParams.append("category_id", params.category_id);
  if (params.severity_id) queryParams.append("severity_id", params.severity_id);
  if (params.stage_id) queryParams.append("stage_id", params.stage_id);
  if (params.harm_level_id) queryParams.append("harm_level_id", params.harm_level_id);
  if (params.case_status_id) queryParams.append("case_status_id", params.case_status_id);
  if (params.year) queryParams.append("year", params.year);
  if (params.month) queryParams.append("month", params.month);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);
  
  // Sorting
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  
  // View
  if (params.view) queryParams.append("view", params.view);

  const url = `${BASE_URL}?${queryParams.toString()}`;
  console.log("📡 Complaints API URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    console.log("📥 Complaints response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Complaints API error:", errorText);
      throw new Error(`Failed to fetch complaints: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Complaints loaded:", {
      count: data.complaints?.length,
      total_records: data.pagination?.total_records,
      page: data.pagination?.page,
    });

    return data;
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
  const url = "http://127.0.0.1:8000/api/reference/all";
  console.log("🔗 Filter options URL:", url);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Filter options error response:", errorText);
      throw new Error(`Failed to fetch filter options: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Filter options loaded:", data);
    
    // Fetch case statuses from dedicated endpoint
    try {
      const statusResponse = await fetch("http://127.0.0.1:8000/api/reference/case-statuses", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log("✅ Case statuses loaded:", statusData);
        data.statuses = statusData.case_statuses || [];
      }
    } catch (statusError) {
      console.warn("⚠️ Could not fetch case statuses:", statusError);
    }
    
    // Also fetch classifications from the dashboard debug endpoint
    try {
      const classResponse = await fetch("http://127.0.0.1:8000/api/dashboard/debug/classifications", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      
      if (classResponse.ok) {
        const classData = await classResponse.json();
        console.log("✅ Classifications loaded from debug endpoint:", classData);
        // Merge classifications into data
        data.classifications_en = classData.classifications || [];
      }
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
            const subcatResponse = await fetch(`http://127.0.0.1:8000/api/reference/subcategories?category_id=${category.id}`, {
              method: "GET",
              headers: { "Accept": "application/json" },
            });
            
            if (subcatResponse.ok) {
              const subcatData = await subcatResponse.json();
              const subcats = Array.isArray(subcatData) ? subcatData : (subcatData.subcategories || []);
              
              if (subcats.length > 0) {
                console.log(`✅ Loaded ${subcats.length} subcategories for category ${category.id} (${category.name})`);
                allSubcategories.push(...subcats);
              }
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
  const url = `${BASE_URL}/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch complaint: ${response.status}`);
    }

    const data = await response.json();
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
    if (filters[key]) queryParams.append(key, filters[key]);
  });

  const url = `${BASE_URL}/count?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch count: ${response.status}`);
    }

    const data = await response.json();
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
  if (params.domain_id) queryParams.append("domain_id", params.domain_id);
  if (params.category_id) queryParams.append("category_id", params.category_id);
  if (params.severity_id) queryParams.append("severity_id", params.severity_id);
  if (params.stage_id) queryParams.append("stage_id", params.stage_id);
  if (params.harm_level_id) queryParams.append("harm_level_id", params.harm_level_id);
  if (params.case_status_id) queryParams.append("case_status_id", params.case_status_id);
  if (params.year) queryParams.append("year", params.year);
  if (params.month) queryParams.append("month", params.month);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);
  
  // Sorting
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  
  // View mode
  if (params.view) queryParams.append("view", params.view);

  const url = `${BASE_URL}/export?${queryParams.toString()}`;
  console.log("📤 Export URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export: ${response.status}`);
    }

    const blob = await response.blob();
    console.log("✅ Export complete, blob size:", blob.size);
    return blob;
  } catch (error) {
    console.error("❌ Error exporting:", error);
    throw error;
  }
}

/**
 * Import complaints from Excel file
 * @param {File} file - Excel file to upload
 * @returns {Promise<Object>} Import result with success/error details
 */
export async function importExcel(file) {
  console.log("📥 Importing Excel file:", file.name);
  
  const formData = new FormData();
  formData.append("file", file);

  const url = `${BASE_URL}/import-excel`;
  console.log("📥 Import URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to import" }));
      throw new Error(errorData.message || `Failed to import: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Import complete:", result);
    return result;
  } catch (error) {
    console.error("❌ Error importing:", error);
    throw error;
  }
}

/**
 * Fetch available table views
 * @returns {Promise<Object>} Table view configurations
 */
export async function fetchTableViews() {
  console.log("🔍 Fetching table views...");
  const url = `${BASE_URL}/views`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch views: ${response.status}`);
    }

    const data = await response.json();
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
  const url = `${BASE_URL}/${complaintId}/hard-delete`;
  console.log("🔗 DELETE URL:", url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response OK:", response.ok);

    let data;
    try {
      data = await response.json();
      console.log("📊 Response data:", data);
    } catch (e) {
      console.log("⚠️ Could not parse response as JSON");
      data = { success: response.ok };
    }

    // Check if response indicates success (200-299 status)
    if (!response.ok) {
      throw new Error(data?.detail?.message || data?.message || `Failed to delete: ${response.status}`);
    }

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
  const url = `http://127.0.0.1:8000/api/records/${recordId}`;
  console.log("🔗 GET URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Record fetch error:", errorText);
      throw new Error(`Failed to fetch record: ${response.status}`);
    }

    const data = await response.json();
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
  const url = `http://127.0.0.1:8000/api/records/${recordId}`;
  console.log("🔗 PUT URL:", url);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: { message: `HTTP ${response.status}` } };
      }
      const errorMessage = errorData?.detail?.message || errorData?.message || `Update failed: ${response.status}`;
      console.error("❌ Update error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Record updated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating record:", error.message);
    throw error;
  }
}
