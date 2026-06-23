/**
 * deadlineCountdown.js — computes a human-readable "days remaining" label
 * for an active workflow deadline (Section / Department / Administration).
 *
 * Pure display helper. Does not decide which deadline field applies —
 * callers pass the resolved deadline Date (e.g. item.sectionDeadlineAt).
 */

const WARNING_THRESHOLD_DAYS = 2;

// The only statuses where a deadline is actively ticking toward force-close.
// Everything else (SECTION_DENIED, WAITING_PATIENT_SERVICES_DECISION,
// PATIENT_SERVICES_DECISION_COMPLETED, FORCE_CLOSED_AT_*, ADMIN_APPROVED, ...)
// either has no real deadline or is already resolved/escalated — showing a
// countdown there is misleading (often a stale leftover Section deadline).
const ACTIVE_PENDING_STATUSES = new Set([
  'SUBMITTED_TO_SECTION',
  'RETURNED_TO_SECTION_FOR_REVISION',
  'SECTION_ACCEPTED_PENDING_DEPT',
  'RETURNED_TO_DEPT_FOR_REVISION',
  'DEPT_ACCEPTED_PENDING_ADMIN',
]);

/**
 * Whether an inbox/archive item should show a deadline countdown at all.
 * Only real complaints (messageType COMPLAINT) actively pending at Section/
 * Department/Administration qualify — never Notice, Seasonal Report,
 * Decision Taken, Patient Services Opinion, or any force-closed status.
 *
 * @param {Object} item - Normalized inbox item from workflowApi
 * @returns {boolean}
 */
export function isCountdownEligible(item) {
  return item.messageType === 'COMPLAINT' && ACTIVE_PENDING_STATUSES.has(item.status);
}

/**
 * @param {Date|null} deadlineDate
 * @returns {{ label: string, color: 'neutral'|'warning'|'danger', days: number } | null}
 */
export function getDeadlineCountdown(deadlineDate) {
  if (!deadlineDate) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDeadline = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const days = Math.round((startOfDeadline - startOfToday) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { label: `متأخر ${Math.abs(days)} يوم`, color: 'danger', days };
  }
  if (days === 0) {
    return { label: 'مستحق اليوم', color: 'danger', days };
  }
  if (days === 1) {
    return { label: 'متبقي يوم واحد', color: 'warning', days };
  }
  if (days <= WARNING_THRESHOLD_DAYS) {
    return { label: `متبقي ${days} أيام`, color: 'warning', days };
  }
  return { label: `متبقي ${days} أيام`, color: 'neutral', days };
}
