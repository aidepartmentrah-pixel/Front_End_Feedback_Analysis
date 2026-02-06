// src/api/actionItems.js
// API service for Action Items / Follow-Up

import apiClient from "./apiClient";

/**
 * Get a single action item by ID
 * GET /api/action-items/{action_item_id}
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<Object>} Action item details
 */
export const getActionItem = async (actionItemId) => {
  try {
    console.log("🔍 Fetching action item:", actionItemId);
    
    const response = await apiClient.get(`/api/action-items/${actionItemId}`);
    
    const data = response.data;
    console.log("✅ Action item fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching action item:", error);
    throw error;
  }
};

/**
 * Get action items for a specific incident case
 * GET /api/action-items/by-incident/{incident_case_id}
 * @param {number} incidentCaseId - Incident Request Case ID
 * @returns {Promise<Array>} Array of action items
 */
export const getActionItemsByIncident = async (incidentCaseId) => {
  try {
    console.log("🔍 Fetching action items for incident:", incidentCaseId);
    
    const response = await apiClient.get(`/api/action-items/by-incident/${incidentCaseId}`);
    
    const data = response.data;
    console.log("✅ Incident action items fetched:", data.length, "items");
    return data;
  } catch (error) {
    console.error("❌ Error fetching incident action items:", error);
    throw error;
  }
};

/**
 * Get action items for a specific seasonal report
 * GET /api/action-items/by-seasonal-report/{seasonal_report_id}
 * @param {number} seasonalReportId - Seasonal Report ID
 * @returns {Promise<Array>} Array of action items
 */
export const getActionItemsBySeasonalReport = async (seasonalReportId) => {
  try {
    console.log("🔍 Fetching action items for seasonal report:", seasonalReportId);
    
    const response = await apiClient.get(`/api/action-items/by-seasonal-report/${seasonalReportId}`);
    
    const data = response.data;
    console.log("✅ Seasonal report action items fetched:", data.length, "items");
    return data;
  } catch (error) {
    console.error("❌ Error fetching seasonal report action items:", error);
    throw error;
  }
};

/**
 * Get action items for a specific season case
 * GET /api/action-items/by-season/{season_case_id}
 * @param {number} seasonCaseId - Season Case ID
 * @returns {Promise<Array>} Array of action items
 */
export const getActionItemsBySeason = async (seasonCaseId) => {
  try {
    console.log("🔍 Fetching action items for season case:", seasonCaseId);
    
    const response = await apiClient.get(`/api/action-items/by-season/${seasonCaseId}`);
    
    const data = response.data;
    console.log("✅ Season case action items fetched:", data.length, "items");
    return data;
  } catch (error) {
    console.error("❌ Error fetching season case action items:", error);
    throw error;
  }
};

/**
 * Mark an action item as done/completed
 * POST /api/action-items/{action_item_id}/mark-done
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<Object>} Status response
 */
export const markActionItemDone = async (actionItemId) => {
  try {
    console.log("✓ Marking action item as done:", actionItemId);
    
    const response = await apiClient.post(`/api/action-items/${actionItemId}/mark-done`);
    
    const data = response.data;
    console.log("✅ Action item marked as done:", data);
    return data;
  } catch (error) {
    console.error("❌ Error marking action item as done:", error);
    throw error;
  }
};

/**
 * Delay an action item by a specified number of days
 * POST /api/follow-up/actions/{id}/delay
 * @param {number} actionId - The action item ID
 * @param {number} delayDays - Number of days to delay
 * @returns {Promise<Object>} Updated action item
 */
export const delayActionItem = async (actionId, delayDays) => {
  try {
    console.log(`⏰ Delaying action item ${actionId} by ${delayDays} days`);
    
    const response = await apiClient.post(
      `/api/follow-up/actions/${actionId}/delay`,
      { delayDays }
    );
    
    const data = response.data;
    console.log("✅ Action item delayed successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error delaying action item:", error);
    throw error;
  }
};

/**
 * Get all action items from the unified endpoint
 * GET /api/follow-up/actions
 * @returns {Promise<Array>} Array of all action items
 */
export const getAllActionItems = async () => {
  try {
    console.log("🔍 Fetching all action items from unified endpoint");
    
    const response = await apiClient.get(`/api/follow-up/actions`);
    
    const data = response.data;
    console.log("✅ All action items fetched:", data.actions?.length || 0, "items");
    return data.actions || [];
  } catch (error) {
    console.error("❌ Error fetching all action items:", error);
    throw error;
  }
};

/**
 * Transform backend action item to frontend format
 * @param {Object} apiItem - Action item from backend
 * @returns {Object} Transformed action item for frontend
 */
export const transformActionItem = (apiItem) => {
  // Handle both old format (ActionItemID) and new format (id)
  const id = apiItem.id || apiItem.ActionItemID;
  const actionTitle = apiItem.actionTitle || apiItem.ActionTitle;
  const actionDescription = apiItem.actionDescription || apiItem.ActionDescription || '';
  const dueDate = apiItem.dueDate || apiItem.DueDate;
  const status = apiItem.status || (apiItem.IsDone ? 'completed' : (apiItem.isOverdue ? 'overdue' : 'pending'));
  const priority = apiItem.priority || 'medium';
  const assignedTo = apiItem.assignedTo || 'N/A';
  
  // Determine source/parent type and ID
  let parentType = apiItem.sourceType || null;
  let parentId = apiItem.sourceId || null;
  
  if (!parentType) {
    if (apiItem.IncidentRequestCaseID) {
      parentType = 'incident';
      parentId = apiItem.IncidentRequestCaseID;
    } else if (apiItem.SeasonalReportID) {
      parentType = 'seasonal_report';
      parentId = apiItem.SeasonalReportID;
    } else if (apiItem.SeasonCaseID) {
      parentType = 'season_case';
      parentId = apiItem.SeasonCaseID;
    }
  }
  
  // Calculate if overdue (if not provided)
  const isOverdue = apiItem.isOverdue !== undefined ? apiItem.isOverdue : 
    (dueDate && dueDate < new Date().toISOString().split('T')[0] && status !== 'completed');
  
  const daysOverdue = apiItem.daysOverdue || 0;
  const daysRemaining = apiItem.daysRemaining || 0;
  
  // Department determination
  let department = 'Unknown';
  if (parentType === 'incident_explanation') {
    department = `Incident #${parentId}`;
  } else if (parentType === 'seasonal_explanation') {
    department = `Seasonal Report #${parentId}`;
  } else if (parentType === 'incident') {
    department = `Incident #${parentId}`;
  } else if (parentType === 'seasonal_report') {
    department = `Seasonal Report #${parentId}`;
  } else if (parentType === 'season_case') {
    department = `Season Case #${parentId}`;
  }
  
  return {
    id: id,
    actionTitle: actionTitle,
    actionDescription: actionDescription,
    dueDate: dueDate,
    isDone: status === 'completed',
    dateSubmitted: apiItem.dateSubmitted || apiItem.DateSubmitted || apiItem.completedDate,
    createdByUserId: apiItem.createdByUserId || apiItem.CreatedByUserID,
    createdAt: apiItem.createdAt || apiItem.CreatedAt,
    
    // Parent information
    parentType: parentType,
    parentId: parentId,
    sourceType: apiItem.sourceType,
    sourceId: apiItem.sourceId,
    
    // Status and priority
    status: status,
    priority: priority,
    
    // Additional calculated fields
    isOverdue: isOverdue,
    daysOverdue: daysOverdue,
    daysRemaining: daysRemaining,
    
    // Assignment
    department: department,
    assignedTo: assignedTo,
    
    // Notes
    notes: apiItem.notes || ''
  };
};

/**
 * Transform multiple action items
 * @param {Array} apiItems - Array of action items from backend
 * @returns {Array} Transformed action items
 */
export const transformActionItems = (apiItems) => {
  return apiItems.map(transformActionItem);
};