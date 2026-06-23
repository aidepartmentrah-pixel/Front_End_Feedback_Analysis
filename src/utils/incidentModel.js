// src/utils/incidentModel.js
// Shared Incident + Case default-state shapes used by InsertRecord (and, in a
// future session, EditRecord once it maps its loaded record onto this shape).

const TODAY = new Date().toISOString().split("T")[0];

export function emptyIncident() {
  return {
    complaint_summary: "",
    feedback_received_date: TODAY,
    issuing_department_id: null,
    source_id: null,
    is_inpatient: true,
    building_id: null,
    patient_name: "",
    patient_ids: [],
  };
}

export function emptyCase() {
  return {
    target_department_id: null,
    feedback_intent_type_id: null,
    complaint_text: "",
    immediate_action: "",
    taken_action: "",
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,
    severity_id: null,
    stage_id: null,
    harm_id: null,
    clinical_risk_type_id: 1,
    is_morbidity: false,
    doctors: [],
    employees: [],
    _categories: [],
    _subcategories: [],
    _classifications: [],
  };
}
