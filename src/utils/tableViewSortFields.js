// Maps Table View column keys (frontend display) to backend sort_by parameter values.
// Must stay in sync with SORT_FIELD_MAP in backend/api/services/table_view_service.py —
// every value here must exist as a key in that dict, or the backend silently falls back
// to the default sort (FeedbackRecievedDate).
export const SORT_FIELD_MAP = {
  complaint_number: "id",
  received_date: "FeedbackRecievedDate",
  incident_number: "IncidentNumber",
  last_edited: "UpdatedAt",
  created_at: "CreatedAt",
  patient_name: "PatientName",
  source_name: "SourceName",
  feedback_intent_type_name: "FeedbackIntentTypeName",
  domain_name: "DomainName",
  category_name: "CategoryName",
  subcategory_name: "SubCategoryName",
  classification_name: "ClassificationName",
  severity_name: "SeverityID",
  harm_level: "HarmSeverityOrder",
  status_name: "StatusDisplayOrder",
  target_department_name: "TargetDepartmentName",
};

export const getBackendSortField = (columnKey) => SORT_FIELD_MAP[columnKey] || columnKey;
