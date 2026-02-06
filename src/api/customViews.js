// src/api/customViews.js
// API service for Custom Table Views

import apiClient from "./apiClient";

/**
 * Fetch all custom views
 * GET /api/custom-views?active_only=true|false
 */
export const fetchCustomViews = async (activeOnly = true) => {
  try {
    const response = await apiClient.get(
      `/api/custom-views?active_only=${activeOnly}`
    );

    return response.data;
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
    const response = await apiClient.get(
      `/api/custom-views/${viewId}`
    );

    return response.data;
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
    const response = await apiClient.post(`/api/custom-views`, viewData);

    return response.data;
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
    const response = await apiClient.put(
      `/api/custom-views/${viewId}`,
      viewData
    );

    console.log("Update response status:", response.status);
    
    const result = response.data;
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
    const url = `/api/custom-views/${viewId}?hard=${hardParam}`;
    
    console.log(`Deleting view ${viewId}`);
    console.log(`Hard delete: ${hardDelete}`);
    console.log(`URL: ${url}`);
    
    const response = await apiClient.delete(url);

    console.log("Delete response status:", response.status);
    
    const result = response.data;
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
