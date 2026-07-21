// src/utils/incidentPayload.js
// Pure payload builder for POST /api/records/add-incident.

export function buildIncidentPayload(saveMode, incident, cases, refData) {
  return {
    save_mode: saveMode,
    common: {
      complaint_text: incident.complaint_summary || "",
      feedback_received_date: incident.feedback_received_date,
      incident_date: incident.incident_date,
      issuing_department_id: incident.issuing_department_id ? Number(incident.issuing_department_id) : null,
      source_id: incident.source_id ? Number(incident.source_id) : null,
      is_inpatient: incident.is_inpatient,
      building_id: incident.building_id ? Number(incident.building_id) : null,
      patient_name: incident.patient_name || "",
    },
    cases: cases.map((c) => {
      const caseIsNotice = !!(refData.feedback_intent_types || []).find(
        (f) => f.id === c.feedback_intent_type_id && f.code === "NOTICE"
      );
      return {
        record_type_id: caseIsNotice ? 2 : 1,
        complaint_text: c.complaint_text || "",
        immediate_action: c.immediate_action || "",
        taken_action: c.taken_action || "",
        feedback_received_date: incident.feedback_received_date,
        incident_date: incident.incident_date,
        issuing_department_id: incident.issuing_department_id ? Number(incident.issuing_department_id) : null,
        source_id: incident.source_id ? Number(incident.source_id) : null,
        building_id: incident.building_id ? Number(incident.building_id) : null,
        is_inpatient: incident.is_inpatient,
        is_morbidity: c.is_morbidity ?? false,
        feedback_intent_type_id: c.feedback_intent_type_id ? Number(c.feedback_intent_type_id) : null,
        patient_name: incident.patient_name || "",
        target_department_ids: c.target_department_id ? [Number(c.target_department_id)] : [],
        domain_id: c.domain_id ? Number(c.domain_id) : null,
        category_id: c.category_id ? Number(c.category_id) : null,
        subcategory_id: c.subcategory_id ? Number(c.subcategory_id) : null,
        classification_id: c.classification_id ? Number(c.classification_id) : null,
        severity_id: c.severity_id ? Number(c.severity_id) : null,
        stage_id: c.stage_id ? Number(c.stage_id) : null,
        harm_id: c.harm_id ? Number(c.harm_id) : null,
        clinical_risk_type_id: Number(c.clinical_risk_type_id || 1),
        requires_explanation: false,
        doctors: c.doctors?.length > 0 ? c.doctors : null,
        employees: c.employees?.length > 0 ? c.employees : null,
      };
    }),
  };
}
