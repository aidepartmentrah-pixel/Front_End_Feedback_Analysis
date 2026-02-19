// PHASE G — G-F1 — Drawer Notes API Wrapper
// src/api/drawerNotesApi.js

import apiClient from "./apiClient";

/**
 * List drawer notes with optional label and patient filtering.
 * 
 * @param {Object} params - Query parameters
 * @param {number[]} params.labelIds - Array of label IDs for filtering (AND logic)
 * @param {number} params.patientAdmissionId - Optional patient admission ID to filter by
 * @param {number} params.limit - Maximum number of results (default 50)
 * @param {number} params.offset - Pagination offset (default 0)
 * @returns {Promise<Object>} Notes list response
 * @throws {Error} Propagates API errors to caller
 */
export async function listDrawerNotes({ labelIds = [], patientAdmissionId = null, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  
  // Add repeated label_ids params for AND filtering
  labelIds.forEach(id => {
    params.append('label_ids', id);
  });
  
  // Add patient filter if provided
  if (patientAdmissionId) {
    params.append('patient_admission_id', patientAdmissionId);
  }
  
  params.append('limit', limit);
  params.append('offset', offset);

  const response = await apiClient.get(`/api/v2/drawer-notes?${params.toString()}`);
  return response.data;
}

/**
 * Get a single drawer note by ID.
 * 
 * @param {number} noteId - The note ID
 * @returns {Promise<Object>} Note details
 * @throws {Error} Propagates API errors to caller
 */
export async function getDrawerNote(noteId) {
  const response = await apiClient.get(`/api/v2/drawer-notes/${noteId}`);
  return response.data;
}

/**
 * Create a new drawer note.
 * 
 * @param {Object} payload - Note creation payload
 * @param {string} payload.note_text - The note text content (required)
 * @param {number[]} payload.label_ids - Array of label IDs (required, min 1)
 * @param {number} payload.patient_admission_id - Optional patient admission ID to link
 * @returns {Promise<Object>} Created note response
 * @throws {Error} Propagates API errors to caller
 */
export async function createDrawerNote({ note_text, label_ids, patient_admission_id = null }) {
  const payload = {
    note_text,
    label_ids,
  };
  
  // Only include patient_admission_id if provided
  if (patient_admission_id) {
    payload.patient_admission_id = patient_admission_id;
  }
  
  const response = await apiClient.post("/api/v2/drawer-notes", payload);
  return response.data;
}

/**
 * Update the text content of an existing drawer note.
 * 
 * @param {number} noteId - The note ID
 * @param {string} note_text - The new note text content
 * @returns {Promise<Object>} Updated note response
 * @throws {Error} Propagates API errors to caller
 */
export async function updateDrawerNoteText(noteId, note_text) {
  const response = await apiClient.put(`/api/v2/drawer-notes/${noteId}/text`, {
    note_text,
  });
  return response.data;
}

/**
 * Update the labels of an existing drawer note (full overwrite).
 * 
 * @param {number} noteId - The note ID
 * @param {number[]} label_ids - Array of label IDs (overwrites existing)
 * @returns {Promise<Object>} Updated note response
 * @throws {Error} Propagates API errors to caller
 */
export async function updateDrawerNoteLabels(noteId, label_ids) {
  const response = await apiClient.put(`/api/v2/drawer-notes/${noteId}/labels`, {
    label_ids,
  });
  return response.data;
}

/**
 * Soft delete a drawer note.
 * 
 * @param {number} noteId - The note ID
 * @returns {Promise<Object>} Deletion response
 * @throws {Error} Propagates API errors to caller
 */
export async function deleteDrawerNote(noteId) {
  if (!noteId && noteId !== 0) {
    throw new Error("Cannot delete note: note ID is missing");
  }
  const response = await apiClient.delete(`/api/v2/drawer-notes/${noteId}`);
  return response.data;
}

/**
 * Export all non-deleted drawer notes as a Word document.
 * 
 * @returns {Promise<Blob>} Word document blob
 * @throws {Error} Propagates API errors to caller
 */
export async function exportDrawerNotesWord() {
  const response = await apiClient.get("/api/v2/drawer-notes/export/word", {
    responseType: "blob",
  });
  return response.data;
}
