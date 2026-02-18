// PHASE G — G-F2 — Drawer Labels API Wrapper
// src/api/drawerLabelsApi.js

import apiClient from "./apiClient";

/**
 * List all active drawer labels.
 * 
 * @returns {Promise<Array>} Array of active labels
 * @throws {Error} Propagates API errors to caller
 */
export async function listDrawerLabels() {
  const response = await apiClient.get("/api/v2/drawer-labels");
  return response.data;
}

/**
 * Create a new drawer label.
 * 
 * @param {string} label_name - The label name (required, min length 2)
 * @returns {Promise<Object>} Created label response
 * @throws {Error} Propagates API errors to caller
 */
export async function createDrawerLabel(label_name) {
  const response = await apiClient.post("/api/v2/drawer-labels", {
    label_name,
  });
  return response.data;
}

/**
 * Disable a drawer label (soft delete).
 * 
 * @param {number} label_id - The label ID
 * @returns {Promise<Object>} Disable response
 * @throws {Error} Propagates API errors to caller
 */
export async function disableDrawerLabel(label_id) {
  const response = await apiClient.delete(`/api/v2/drawer-labels/${label_id}`);
  return response.data;
}
