// src/utils/incidentValidation.js
// Pure validation-rule computation for the Incident + multi-case form.
// Side effects (setState, scrolling, active-tab focus) stay in the page.

export function computeIncidentValidation(incident, cases, refData) {
  const errs = {};
  if (!incident.patient_name?.trim()) errs.patient_name = "Patient name is required";
  if (!incident.issuing_department_id) errs.issuing_department_id = "Issuing unit is required";
  if (!incident.source_id) errs.source_id = "Source is required";
  if (!incident.building_id) errs.building_id = "Building is required";
  if (!incident.feedback_received_date) errs.feedback_received_date = "Received Date is required";
  if (!incident.incident_date) errs.incident_date = "Incident Date is required";
  if (
    incident.incident_date &&
    incident.feedback_received_date &&
    incident.incident_date > incident.feedback_received_date
  ) {
    errs.incident_date = "Incident Date cannot be after Received Date";
  }

  const caseErrs = cases.map((c) => {
    const caseIsNotice = !!(refData.feedback_intent_types || []).find(
      (f) => f.id === c.feedback_intent_type_id && f.code === "NOTICE"
    );
    const ce = {};
    if (!c.target_department_id) ce.target_department_id = "Target unit is required";
    if (!c.feedback_intent_type_id) ce.feedback_intent_type_id = "Feedback intent is required";
    if (!c.complaint_text?.trim()) {
      ce.complaint_text = caseIsNotice ? "Notice description is required" : "Complaint text is required";
    }
    if (!caseIsNotice) {
      if (!c.immediate_action?.trim()) ce.immediate_action = "Immediate action is required";
      if (!c.domain_id) ce.domain_id = "Domain is required";
      if (!c.category_id) ce.category_id = "Category is required";
      if (!c.subcategory_id) ce.subcategory_id = "Subcategory is required";
      if (!c.classification_id) ce.classification_id = "Classification is required";
      if (!c.severity_id) ce.severity_id = "Severity is required";
      if (!c.stage_id) ce.stage_id = "Stage is required";
      if (!c.harm_id) ce.harm_id = "Harm level is required";
    }
    return ce;
  });

  return { errs, caseErrs };
}
