import apiClient from './apiClient';

const INBOX_BASE = '/api/v2/administrative-subcases';
const SETTINGS_BASE = '/api/settings/rca';

// ── Section Inbox ────────────────────────────────────────────

export const getRcaSuggestionsForSubcase = (subcaseId) =>
  apiClient.get(`${INBOX_BASE}/${subcaseId}/rca-suggestions`).then(r => r.data);

export const getRcaPairsForSubcase = (subcaseId) =>
  apiClient.get(`${INBOX_BASE}/${subcaseId}/rca-pairs`).then(r => r.data);

export const saveRcaSelections = (subcaseId, selectedSuggestionIds) =>
  apiClient.put(`${INBOX_BASE}/${subcaseId}/rca-selections`, {
    selected_suggestion_ids: selectedSuggestionIds,
  }).then(r => r.data);

// ── Settings: Categories ─────────────────────────────────────

export const getRcaCategories = (activeOnly = false) =>
  apiClient.get(`${SETTINGS_BASE}/categories`, {
    params: { active_only: activeOnly },
  }).then(r => r.data);

export const createRcaCategory = (data) =>
  apiClient.post(`${SETTINGS_BASE}/categories`, data).then(r => r.data);

export const updateRcaCategory = (categoryId, data) =>
  apiClient.put(`${SETTINGS_BASE}/categories/${categoryId}`, data).then(r => r.data);

export const toggleRcaCategoryActive = (categoryId, isActive) =>
  apiClient.patch(`${SETTINGS_BASE}/categories/${categoryId}/active`, {
    is_active: isActive,
  }).then(r => r.data);

// ── Settings: Suggestions ────────────────────────────────────

export const getRcaSuggestions = ({ activeOnly = false, suggestionType = null, categoryId = null } = {}) => {
  const params = { active_only: activeOnly };
  if (suggestionType) params.suggestion_type = suggestionType;
  if (categoryId !== null) params.category_id = categoryId;
  return apiClient.get(`${SETTINGS_BASE}/suggestions`, { params }).then(r => r.data);
};

export const createRcaSuggestion = (data) =>
  apiClient.post(`${SETTINGS_BASE}/suggestions`, data).then(r => r.data);

export const updateRcaSuggestion = (suggestionId, data) =>
  apiClient.put(`${SETTINGS_BASE}/suggestions/${suggestionId}`, data).then(r => r.data);

export const toggleRcaSuggestionActive = (suggestionId, isActive) =>
  apiClient.patch(`${SETTINGS_BASE}/suggestions/${suggestionId}/active`, {
    is_active: isActive,
  }).then(r => r.data);

// ── Settings: Cause/Action Pairs ─────────────────────────────

export const getRcaPairs = (categoryId = null, activeOnly = false) => {
  const params = { active_only: activeOnly };
  if (categoryId !== null) params.category_id = categoryId;
  return apiClient.get(`${SETTINGS_BASE}/pairs`, { params }).then(r => r.data);
};

export const createRcaPair = (data) =>
  apiClient.post(`${SETTINGS_BASE}/pairs`, data).then(r => r.data);

export const updateRcaPair = (pairId, data) =>
  apiClient.put(`${SETTINGS_BASE}/pairs/${pairId}`, data).then(r => r.data);

export const toggleRcaPairActive = (pairId, isActive) =>
  apiClient.patch(`${SETTINGS_BASE}/pairs/${pairId}/active`, {
    is_active: isActive,
  }).then(r => r.data);
