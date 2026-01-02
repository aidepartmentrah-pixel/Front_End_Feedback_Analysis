// src/api/customViews.js
// API service for Custom Table Views

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Fetch all custom views
 * GET /api/custom-views?active_only=true|false
 */
export const fetchCustomViews = async (activeOnly = true) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/custom-views?active_only=${activeOnly}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || "Failed to fetch custom views");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching custom views:", error);
    throw error;
  }
};

/**
 * Fetch a single custom view by ID
 * GET /api/custom-views/{view_id}
 */
export const fetchCustomView = async (viewId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/custom-views/${viewId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || "Failed to fetch custom view");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching custom view:", error);
    throw error;
  }
};

/**
 * Create a new custom view
 * POST /api/custom-views
 */
export const createCustomView = async (viewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/custom-views`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(viewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || "Failed to create custom view");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating custom view:", error);
    throw error;
  }
};

/**
 * Update an existing custom view
 * PUT /api/custom-views/{view_id}
 */
export const updateCustomView = async (viewId, viewData) => {
  try {
    console.log(`Calling PUT /api/custom-views/${viewId}`, viewData);
    const response = await fetch(
      `${API_BASE_URL}/api/custom-views/${viewId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(viewData),
      }
    );

    console.log("Update response status:", response.status);
    
    if (!response.ok) {
      let errorMessage = "Failed to update custom view";
      try {
        const error = await response.json();
        console.log("Error response:", error);
        errorMessage = error.detail?.message || error.message || errorMessage;
      } catch (e) {
        console.log("Could not parse error response");
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Error updating custom view:", error);
    throw error;
  }
};

/**
 * Delete a custom view
 * DELETE /api/custom-views/{view_id}?hard=false|true
 */
export const deleteCustomView = async (viewId, hardDelete = false) => {
  try {
    // Convert boolean to string for URL parameter
    const hardParam = hardDelete ? "true" : "false";
    const url = `${API_BASE_URL}/api/custom-views/${viewId}?hard=${hardParam}`;
    
    console.log(`Deleting view ${viewId}`);
    console.log(`Hard delete: ${hardDelete}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", response.status);
    console.log("Response headers:", {
      contentType: response.headers.get("content-type"),
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to delete custom view";
      const contentType = response.headers.get("content-type");
      
      try {
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          console.log("Error response JSON:", error);
          
          // Safely extract error message
          if (typeof error === 'object' && error !== null) {
            if (error.detail) {
              errorMessage = typeof error.detail === 'string' 
                ? error.detail 
                : (error.detail.message || JSON.stringify(error.detail));
            } else if (error.message) {
              errorMessage = error.message;
            } else {
              errorMessage = JSON.stringify(error);
            }
          } else {
            errorMessage = String(error);
          }
        } else {
          const text = await response.text();
          console.log("Error response text:", text);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.log("Could not parse error response:", e);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.log("Final error message:", errorMessage);
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    let result = null;
    
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    console.log("Delete successful:", result);
    return result;
  } catch (error) {
    console.error("Error deleting custom view:", error);
    // Ensure we're throwing a proper Error object with a string message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
};

/**
 * Default view columns for reference
 */
export const DEFAULT_VIEW_COLUMNS = [
  { key: "ShowIncidentRequestCaseID", label: "Case ID" },
  { key: "ShowComplaintText", label: "Complaint Text" },
  { key: "ShowImmediateAction", label: "Immediate Action" },
  { key: "ShowTakenAction", label: "Taken Action" },
  { key: "ShowFeedbackRecievedDate", label: "Feedback Received Date" },
  { key: "ShowPatientName", label: "Patient Name" },
  { key: "ShowIssuingOrgUnitID", label: "Issuing Department" },
  { key: "ShowCreatedAt", label: "Created At" },
  { key: "ShowCreatedByUserID", label: "Created By" },
  { key: "ShowIsInPatient", label: "Is In Patient" },
  { key: "ShowClinicalRiskTypeID", label: "Clinical Risk Type" },
  { key: "ShowFeedbackIntentTypeID", label: "Feedback Intent Type" },
  { key: "ShowBuildingID", label: "Building" },
  { key: "ShowDomainID", label: "Domain" },
  { key: "ShowCategoryID", label: "Category" },
  { key: "ShowSubCategoryID", label: "Sub Category" },
  { key: "ShowClassificationID", label: "Classification" },
  { key: "ShowSeverityID", label: "Severity" },
  { key: "ShowStageID", label: "Stage" },
  { key: "ShowHarmLevelID", label: "Harm Level" },
  { key: "ShowCaseStatusID", label: "Case Status" },
  { key: "ShowSourceID", label: "Source" },
  { key: "ShowExplanationStatusID", label: "Explanation Status" },
];
