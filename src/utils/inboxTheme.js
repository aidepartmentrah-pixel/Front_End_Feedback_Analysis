/**
 * inboxTheme.js — Universal Case Theme for Inbox rows (Stage 3)
 *
 * Single source of truth for all visual display decisions on an inbox item.
 * No business logic. No workflow logic. Display only.
 *
 * Design principle: professional and minimal — not a rainbow.
 * Only the row background shifts slightly by message type.
 * Everything else is communicated through small, restrained badges.
 *
 * Icons: MUI Icons Material (already installed).
 * Icon keys are returned as strings; the component maps them to <SvgIcon />.
 *
 * Usage:
 *   const theme = getRowTheme(item);
 *   // theme.rowStyle, theme.typeIconKey, theme.typeLabel, theme.typeChipColor,
 *   // theme.visibleBadges, theme.overflowCount, theme.allBadges, theme.ownershipChip
 */

// ─── Layer 1 — Message Type ───────────────────────────────────────────────────
// Row backgrounds are intentionally very faint.
// The goal is a hint of color — not a bold background.

const MESSAGE_TYPE_CONFIG = {
  COMPLAINT: {
    iconKey: null,
    label: 'Complaint',
    chipColor: 'neutral',
    rowBg: null,             // white / default — no background override
  },
  PATIENT_SERVICES_OPINION: {
    iconKey: null,
    label: 'Patient Services',
    chipColor: 'neutral',
    rowBg: null,
  },
  NOTICE: {
    iconKey: 'Campaign',
    label: 'Notice',
    chipColor: 'primary',
    rowBg: '#f0f7ff',        // very faint blue
  },
  SEASONAL_REPORT: {
    iconKey: 'BarChart',
    label: 'Seasonal Report',
    chipColor: 'warning',
    rowBg: '#fffbf0',        // very faint amber
  },
  DECISION_TAKEN: {
    iconKey: 'CheckCircle',
    label: 'Decision Taken',
    chipColor: 'success',
    rowBg: '#f4fbf6',        // very faint green
  },
};

const DEFAULT_TYPE_CONFIG = {
  iconKey: null,
  label: 'Complaint',
  chipColor: 'neutral',
  rowBg: null,
};

// ─── Layer 2 & 3 — Badge Definitions (priority order) ────────────────────────
// Workflow failures come first, then clinical indicators.
// Badges are small and use muted variants — not solid saturated colors.

const BADGE_DEFINITIONS = [
  {
    key: 'FORCE_CLOSED',
    iconKey: 'Lock',
    label: 'Force Closed',
    color: 'danger',
    check: (item) => item.isForceClosed || (item.workflowIndicators || []).includes('FORCE_CLOSED'),
  },
  {
    key: 'LATE',
    iconKey: 'History',
    label: 'Late',
    color: 'warning',
    check: (item) => item.isLate || (item.workflowIndicators || []).includes('LATE'),
  },
  {
    key: 'NEVER_EVENT',
    iconKey: 'WarningAmber',
    label: 'Never Event',
    color: 'danger',
    check: (item) => item.isNeverEvent || (item.clinicalIndicators || []).includes('NEVER_EVENT'),
  },
  {
    key: 'RED_FLAG',
    iconKey: 'Flag',
    label: 'Red Flag',
    color: 'danger',
    check: (item) => item.isRedFlag || (item.clinicalIndicators || []).includes('RED_FLAG'),
  },
  {
    key: 'MORBIDITY',
    iconKey: 'Favorite',
    label: 'Morbidity',
    color: 'warning',
    check: (item) => item.isMorbidity || (item.clinicalIndicators || []).includes('MORBIDITY'),
  },
];

const MAX_VISIBLE_BADGES = 2;

// ─── Layer 4 — Ownership ─────────────────────────────────────────────────────
// Ownership chip is intentionally secondary — small, soft, low contrast.

const OWNERSHIP_CONFIG = {
  section:         { label: 'Section',         color: 'success' },
  department:      { label: 'Department',      color: 'primary' },
  administration:  { label: 'Administration',  color: 'neutral',
                     sx: { backgroundColor: '#ede7f6', color: '#5e35b1', border: 'none' } },
  patient_services:{ label: 'Patient Services', color: 'primary' },
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Compute all visual theme properties for a single inbox or archive item.
 * Consumes Stage 2 normalized fields only — no raw status string parsing.
 *
 * @param {Object} item - Normalized inbox item from workflowApi
 * @returns {Object} theme properties
 */
export function getRowTheme(item) {
  const typeConfig = MESSAGE_TYPE_CONFIG[item.messageType] || DEFAULT_TYPE_CONFIG;

  const isForceClosed =
    item.isForceClosed || (item.workflowIndicators || []).includes('FORCE_CLOSED');

  // Row style: faint background + red left strip for force-closed only
  const rowStyle = {
    ...(typeConfig.rowBg ? { backgroundColor: typeConfig.rowBg } : {}),
    ...(isForceClosed
      ? { borderLeft: '3px solid #c0392b', paddingLeft: 4 }
      : { borderLeft: '3px solid transparent' }), // keeps layout stable
  };

  // Build badge list in priority order
  const allBadges = BADGE_DEFINITIONS
    .filter((def) => def.check(item))
    .map(({ key, iconKey, label, color }) => ({ key, iconKey, label, color }));

  const visibleBadges  = allBadges.slice(0, MAX_VISIBLE_BADGES);
  const overflowCount  = allBadges.length - visibleBadges.length;
  const overflowTooltip = allBadges.slice(MAX_VISIBLE_BADGES).map((b) => b.label).join(' · ');

  // Ownership: prefer currentLevel, fall back to targetLevel
  const level = item.currentLevel || item.targetLevel || null;
  const ownershipChip = level ? (OWNERSHIP_CONFIG[level] || null) : null;

  return {
    rowStyle,
    typeIconKey:   typeConfig.iconKey,
    typeLabel:     typeConfig.label,
    typeChipColor: typeConfig.chipColor,
    visibleBadges,
    overflowCount,
    overflowTooltip,
    allBadges,
    ownershipChip,
  };
}
