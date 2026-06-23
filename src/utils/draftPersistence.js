// src/utils/draftPersistence.js
// Local-storage draft persistence for the InsertRecord incident form.

export const DRAFT_KEY = "incidentDraft_v2";

export function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; }
}
export function saveDraft(incident, cases) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ incident, cases, savedAt: new Date().toISOString() })); } catch { /* ignore quota errors */ }
}
export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}
export function hasMeaningfulContent(incident, cases) {
  if (incident.patient_name?.trim()) return true;
  if (incident.complaint_summary?.trim()) return true;
  if (cases.some((c) => c.complaint_text?.trim() || c.target_department_id || c.feedback_intent_type_id)) return true;
  return false;
}
