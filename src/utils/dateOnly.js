// src/utils/dateOnly.js
/**
 * Canonical handling for "date-only" values (e.g. Action Item due dates).
 *
 * The backend stores due dates as SQL `DATE` columns and returns them as
 * plain "YYYY-MM-DD" strings with no time-of-day or timezone component.
 * `new Date("YYYY-MM-DD")` parses that as UTC midnight, which then drifts to
 * the previous (or next) local calendar day once read back with local-time
 * methods (toDateString, getDate, setHours, direct comparison to `new
 * Date()`, etc.) depending on the viewer's UTC offset.
 *
 * To avoid that drift, every date-only value is represented in memory as a
 * JS Date pinned to LOCAL midnight, and read/written using local-time
 * components only. Use these helpers everywhere a due date is parsed,
 * formatted, compared, or matched against "today" - calendar placement,
 * operational grouping, due date display, and sorting should all derive
 * from the same representation.
 */

// Parse a "YYYY-MM-DD" string (or a Date) into a Date at local midnight.
export const parseDueDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

// Format a date-only Date back to "YYYY-MM-DD" using local components.
export const formatDueDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// "Today" as a date-only Date at local midnight.
export const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
