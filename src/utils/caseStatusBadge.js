// src/utils/caseStatusBadge.js
// Single source of truth for the case-status pill colors shown on tab labels
// (EditRecord.js and InspectRecord.js). Previously each page had its own
// copy of this function; they drifted (Inspect invented a 4th branch with a
// different fallback color for the same "anything else" status), so any
// case not literally "Draft" or "Ready to Send" rendered a different color
// on the two pages. Extracted here so that can't happen again.
export const statusBadgeStyle = (statusName) => {
  if (statusName === "Draft") return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
  if (statusName === "Ready to Send") return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
  return { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" };
};

export default statusBadgeStyle;
