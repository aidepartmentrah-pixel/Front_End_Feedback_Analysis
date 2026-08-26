// src/utils/workflowStatusLabels.js
// Human-readable labels for APP_AdministrativeSubcase.Status values.
// Shared by TableView.js and InspectRecord.js.
export const WORKFLOW_STATUS_LABELS = {
  SUBMITTED_TO_SECTION: 'Pending Section',
  RETURNED_TO_SECTION_FOR_REVISION: 'Returned to Section',
  SECTION_ACCEPTED_PENDING_DEPT: 'Pending Department',
  RETURNED_TO_DEPT_FOR_REVISION: 'Returned to Department',
  DEPT_ACCEPTED_PENDING_ADMIN: 'Pending Administration',
  ADMIN_APPROVED: 'Approved',
  SECTION_DENIED: 'Denied',
  FORCE_CLOSED_DRAFT: 'Force Closed (Draft)',
  FORCE_CLOSED_COMPLETE: 'Force Closed (Complete)',
};

export default WORKFLOW_STATUS_LABELS;
