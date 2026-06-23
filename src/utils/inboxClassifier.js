/**
 * inboxClassifier.js — Inbox Area Classification (Stage 4)
 *
 * Single source of truth for deciding which inbox area an item belongs to.
 * No UI logic. No rendering. Classification only.
 *
 * Uses Stage 2 fields (isForceClosed) and existing allowedActions.
 * No new backend fields required.
 */

const VIEW_ONLY = new Set(['view']);

/**
 * Returns whether the item has any actionable workflow button beyond 'view'.
 */
function isActionable(item) {
  return (item.allowedActions || []).some((a) => !VIEW_ONLY.has(a));
}

/**
 * Classify a single inbox item into one of three areas.
 *
 * @param {Object} item - Normalized inbox item from workflowApi
 * @returns {'NORMAL' | 'PROBLEM_ACTIVE' | 'PROBLEM_INACTIVE'}
 *
 * NORMAL          — active work; appears in the Normal Inbox
 * PROBLEM_ACTIVE  — force-closed but still actionable (e.g. give_more_time available)
 * PROBLEM_INACTIVE — force-closed, no longer actionable; progressed upward; read-only
 */
export function classifyInboxArea(item) {
  const forceClosed =
    item.isForceClosed ||
    (item.workflowIndicators || []).includes('FORCE_CLOSED');

  if (!forceClosed) return 'NORMAL';

  return isActionable(item) ? 'PROBLEM_ACTIVE' : 'PROBLEM_INACTIVE';
}

/**
 * Split an already-filtered item list into normal and problem buckets.
 *
 * @param {Array} items - Filtered inbox items
 * @returns {{ normalItems: Array, problemItems: Array }}
 */
export function splitInboxAreas(items) {
  const normalItems  = [];
  const problemItems = [];

  for (const item of items) {
    if (classifyInboxArea(item) === 'NORMAL') {
      normalItems.push(item);
    } else {
      problemItems.push(item);
    }
  }

  return { normalItems, problemItems };
}
