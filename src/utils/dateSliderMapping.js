// src/utils/dateSliderMapping.js
/**
 * Pure utility functions for converting between dates and slider indices.
 * All functions use UTC to avoid timezone drift.
 * 
 * Date format: YYYY-MM-DD
 * Index: integer representing day offset from minDate
 */

/**
 * Calculate the number of days between two dates.
 * Uses UTC midnight normalization to avoid timezone issues.
 * 
 * @param {string} dateA - First date in YYYY-MM-DD format
 * @param {string} dateB - Second date in YYYY-MM-DD format
 * @returns {number} Integer day difference (dateB - dateA)
 */
export function daysBetween(dateA, dateB) {
  if (!dateA || !dateB) {
    return 0;
  }

  try {
    // Parse dates and normalize to UTC midnight
    const dateObjA = new Date(dateA + 'T00:00:00.000Z');
    const dateObjB = new Date(dateB + 'T00:00:00.000Z');

    // Check for invalid dates
    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      return 0;
    }

    // Calculate difference in milliseconds and convert to days
    const diffMs = dateObjB.getTime() - dateObjA.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
}

/**
 * Convert a date string to a slider index (day offset from minDate).
 * 
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @param {string} minDateStr - Minimum date (index 0) in YYYY-MM-DD format
 * @returns {number} Integer index (days from minDate)
 */
export function dateToIndex(dateStr, minDateStr) {
  if (!dateStr || !minDateStr) {
    return 0;
  }

  try {
    const days = daysBetween(minDateStr, dateStr);
    // Ensure non-negative index
    return Math.max(0, days);
  } catch (error) {
    console.error('Error converting date to index:', error);
    return 0;
  }
}

/**
 * Convert a slider index to a date string.
 * 
 * @param {number} index - Slider index (day offset from minDate)
 * @param {string} minDateStr - Minimum date (index 0) in YYYY-MM-DD format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function indexToDate(index, minDateStr) {
  if (!minDateStr) {
    return '';
  }

  try {
    // Parse minDate and normalize to UTC midnight
    const minDate = new Date(minDateStr + 'T00:00:00.000Z');

    // Check for invalid date
    if (isNaN(minDate.getTime())) {
      return '';
    }

    // Add index days to minDate
    const resultDate = new Date(minDate);
    resultDate.setUTCDate(resultDate.getUTCDate() + Math.floor(index));

    // Format as YYYY-MM-DD
    const year = resultDate.getUTCFullYear();
    const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(resultDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting index to date:', error);
    return '';
  }
}

/**
 * Clamp an index value to min/max bounds.
 * 
 * @param {number} index - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped integer value
 */
export function clampIndex(index, min, max) {
  if (typeof index !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    return min;
  }

  // Handle edge case where min > max
  if (min > max) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.floor(index)));
}

/**
 * Validate if a date string is in valid YYYY-MM-DD format.
 * 
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  // Check format with regex
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return !isNaN(date.getTime());
}

/**
 * Get the date range (number of days) between min and max dates.
 * 
 * @param {string} minDateStr - Start date in YYYY-MM-DD format
 * @param {string} maxDateStr - End date in YYYY-MM-DD format
 * @returns {number} Number of days in range (inclusive)
 */
export function getDateRangeDays(minDateStr, maxDateStr) {
  if (!minDateStr || !maxDateStr) {
    return 0;
  }

  const days = daysBetween(minDateStr, maxDateStr);
  // Add 1 to make it inclusive (e.g., Jan 1 to Jan 1 = 1 day, not 0)
  return Math.max(0, days);
}
