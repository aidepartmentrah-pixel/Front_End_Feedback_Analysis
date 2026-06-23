// src/utils/editRecordMapping.js
// Pure mapping functions between the flat GET /api/records/{id} response shape
// and the shared incident + case state shape used by the Incident-style UI.

import { emptyIncident, emptyCase } from "./incidentModel";

/**
 * Maps a flat API record (getRecordById response) into the shared
 * { incident, caseObj } state shape expected by IncidentMetadataSection + CaseTabContent.
 */
export function recordToIncidentAndCase(record) {
  const incident = {
    ...emptyIncident(),
    patient_name: record.patient_name || "",
    feedback_received_date: record.received_date || record.feedback_received_date || emptyIncident().feedback_received_date,
    issuing_department_id: record.issuing_org_unit_id || null,
    source_id: record.source_id || null,
    is_inpatient: record.is_in_patient != null ? record.is_in_patient
                : record.is_inpatient != null ? record.is_inpatient
                : true,
    building_id: record.building_id || null,
    // complaint_summary: old flat records have no separate incident-level summary;
    // leave blank — IncidentMetadataSection shows it as an optional field.
    complaint_summary: record.incident_summary || "",
    patient_ids: [],
  };

  const caseObj = {
    ...emptyCase(),
    target_department_id: record.target_departments?.[0]?.section_id
                       || record.target_departments?.[0]?.id
                       || null,
    feedback_intent_type_id: record.feedback_intent_type_id || null,
    complaint_text: record.complaint_text || "",
    immediate_action: record.immediate_action || "",
    taken_action: record.taken_action || "",
    domain_id: record.domain_id || null,
    category_id: record.category_id || null,
    subcategory_id: record.subcategory_id || null,
    classification_id: record.classification_id || null,
    severity_id: record.severity_id || null,
    stage_id: record.stage_id || null,
    harm_id: record.harm_level_id || null,
    clinical_risk_type_id: record.clinical_risk_type_id || 1,
    is_morbidity: record.is_morbidity != null ? record.is_morbidity : false,
    doctors: Array.isArray(record.doctors) ? record.doctors.map((d) => ({
      doctor_id: d.doctor_id ?? d.id ?? d.employee_id,
      doctor_name: d.doctor_name ?? d.name ?? "",
    })) : [],
    employees: Array.isArray(record.employees) ? record.employees.map((e) => ({
      employee_id: e.employee_id ?? e.id,
      full_name: e.full_name ?? e.name ?? "",
      employee_name: e.full_name ?? e.name ?? "",
    })) : [],
    // Cascade option caches start empty; ClassificationCascade loads them on user interaction.
    // They will be pre-loaded during EditRecord's mount effect for pre-populated dropdowns.
    _categories: [],
    _subcategories: [],
    _classifications: [],
  };

  return { incident, caseObj };
}

/**
 * Builds the PUT /api/records/{id} payload from the shared incident + case state.
 * Mirrors InsertRecord.js's isEditingDraft update-payload block exactly.
 */
export function buildUpdatePayload(saveMode, incident, caseData) {
  return {
    save_mode: saveMode,
    complaint_text: caseData.complaint_text || "",
    immediate_action: caseData.immediate_action || "",
    taken_action: caseData.taken_action || "",
    feedback_received_date: incident.feedback_received_date,
    issuing_department_id: incident.issuing_department_id ? Number(incident.issuing_department_id) : undefined,
    source_id: incident.source_id ? Number(incident.source_id) : undefined,
    building_id: incident.building_id ? Number(incident.building_id) : undefined,
    is_inpatient: incident.is_inpatient,
    is_morbidity: caseData.is_morbidity ?? false,
    feedback_intent_type_id: caseData.feedback_intent_type_id ? Number(caseData.feedback_intent_type_id) : undefined,
    patient_name: incident.patient_name || "",
    target_department_ids: caseData.target_department_id ? [Number(caseData.target_department_id)] : [],
    domain_id: caseData.domain_id ? Number(caseData.domain_id) : undefined,
    category_id: caseData.category_id ? Number(caseData.category_id) : undefined,
    subcategory_id: caseData.subcategory_id ? Number(caseData.subcategory_id) : undefined,
    classification_id: caseData.classification_id ? Number(caseData.classification_id) : undefined,
    severity_id: caseData.severity_id ? Number(caseData.severity_id) : undefined,
    stage_id: caseData.stage_id ? Number(caseData.stage_id) : undefined,
    harm_id: caseData.harm_id ? Number(caseData.harm_id) : undefined,
    clinical_risk_type_id: Number(caseData.clinical_risk_type_id || 1),
    requires_explanation: false,
    doctors: caseData.doctors?.length > 0 ? caseData.doctors : undefined,
    employees: caseData.employees?.length > 0 ? caseData.employees : undefined,
  };
}
