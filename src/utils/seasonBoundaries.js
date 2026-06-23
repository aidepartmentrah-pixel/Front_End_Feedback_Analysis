// src/utils/seasonBoundaries.js
//
// Seasonal context markers for trend graphs (HCAT Iteration 4 — Target Analysis).
// Seasons are fixed calendar quarters (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec),
// matching the backend's QUARTER_DATE_RANGES convention (backend/api_v2/db_layer/season_db.py).
// Computed purely from the chart's own month labels so markers automatically
// adapt whenever the selected date range changes — no extra API call needed.

const QUARTER_START_MONTHS = ["Jan", "Apr", "Jul", "Oct"];

/**
 * Given chart_labels in "MMM YYYY" format (e.g. "Jan 2026"), return the
 * subset that mark the start of a calendar quarter.
 * @param {string[]} chartLabels
 * @returns {{ label: string, seasonLabel: string }[]}
 */
export function getSeasonBoundaries(chartLabels) {
  if (!Array.isArray(chartLabels)) return [];

  return chartLabels
    .map((label) => {
      const [monthAbbr, year] = label.split(" ");
      const quarterIndex = QUARTER_START_MONTHS.indexOf(monthAbbr);
      if (quarterIndex === -1) return null;
      return { label, seasonLabel: `Q${quarterIndex + 1} ${year}` };
    })
    .filter(Boolean);
}
