// src/api/sectionApi.js
// Section & department management API
import apiClient from "./apiClient";

export const fetchSections = async () => {
  const resp = await apiClient.get("/api/settings/sections");
  return resp.data.sections || [];
};

export const fetchDepartmentsForReassignment = async () => {
  const resp = await apiClient.get("/api/settings/sections/departments");
  return resp.data.departments || [];
};

export const updateSection = async (sectionId, { name, parent_id }) => {
  const resp = await apiClient.put(`/api/settings/sections/${sectionId}`, { name, parent_id });
  return resp.data;
};
