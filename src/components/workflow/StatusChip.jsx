import React from 'react';
import { Chip } from '@mui/joy';

// TODO (Stage 7 of the original Inbox Redesign roadmap): WorkflowInboxPage's
// getStatusDisplay duplicates this map with a long-form key
// (RETURNED_TO_DEPARTMENT_FOR_REVISION) that never matches the actual backend
// key (RETURNED_TO_DEPT_FOR_REVISION, short form) used here. Out of scope for
// the modal-only UI smoothing project — fix when a stage touches the Inbox
// page's status display system directly.
const STATUS_LABELS = {
  SUBMITTED_TO_SECTION:                { label: 'بانتظار رد القسم',          color: 'primary' },
  SUBMITTED_TO_DEPT:                   { label: 'بانتظار رد الدائرة',        color: 'primary' },
  SUBMITTED_TO_ADMIN:                  { label: 'بانتظار رد الإدارة',        color: 'primary' },
  RETURNED_TO_SECTION_FOR_REVISION:    { label: 'مُعاد للقسم للمراجعة',      color: 'warning' },
  SECTION_ACCEPTED_PENDING_DEPT:       { label: 'بانتظار موافقة الدائرة',    color: 'success' },
  RETURNED_TO_DEPT_FOR_REVISION:       { label: 'مُعاد للدائرة للمراجعة',    color: 'warning' },
  DEPT_ACCEPTED_PENDING_ADMIN:         { label: 'بانتظار موافقة الإدارة',    color: 'success' },
  ADMIN_APPROVED:                      { label: 'مُعتمدة',                    color: 'success' },
  SECTION_DENIED:                      { label: 'مرفوضة من القسم',            color: 'danger'  },
  WAITING_PATIENT_SERVICES_DECISION:   { label: 'بانتظار قرار خدمات المرضى',  color: 'warning' },
  PATIENT_SERVICES_DECISION_COMPLETED: { label: 'تم إدخال قرار خدمات المرضى', color: 'success' },
  DECISION_ACKNOWLEDGED:               { label: 'تم تأكيد القرار',            color: 'success' },
  FORCE_CLOSED:                        { label: 'مغلقة قسريًا',               color: 'danger'  },
  FORCE_CLOSED_AT_SECTION:             { label: 'مغلقة قسريًا — القسم',       color: 'danger'  },
  FORCE_CLOSED_AT_DEPARTMENT:          { label: 'مغلقة قسريًا — الدائرة',     color: 'danger'  },
  FORCE_CLOSED_AT_ADMINISTRATION:      { label: 'مغلقة قسريًا — الإدارة',     color: 'danger'  },
  FORCE_CLOSED_COMPLETE:               { label: 'مغلقة قسريًا (نهائي)',       color: 'danger'  },
  FORCE_CLOSED_DRAFT:                  { label: 'مسودة إغلاق قسري',           color: 'neutral' },
};

/**
 * StatusChip — shared workflow-status badge, usable by any Inbox modal
 * variant (extracted from CaseReviewModal in Stage S6 so the other modal
 * variants can show the same status chip).
 */
function StatusChip({ status }) {
  const entry = STATUS_LABELS[status] || { label: status, color: 'neutral' };
  return <Chip size="sm" color={entry.color} variant="soft">{entry.label}</Chip>;
}

export default StatusChip;
