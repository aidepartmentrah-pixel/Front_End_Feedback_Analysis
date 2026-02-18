// src/utils/__tests__/dateSliderMapping.test.js
/**
 * Tests for date slider mapping utility functions (DR-F4)
 * Testing pure date<->index conversion functions
 */

import {
  daysBetween,
  dateToIndex,
  indexToDate,
  clampIndex,
  isValidDateString,
  getDateRangeDays,
} from '../dateSliderMapping';

describe('Date Slider Mapping Utilities', () => {
  describe('daysBetween', () => {
    test('should return 0 for same day', () => {
      const result = daysBetween('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('should return 1 for next day', () => {
      const result = daysBetween('2024-01-01', '2024-01-02');
      expect(result).toBe(1);
    });

    test('should return negative for reverse order', () => {
      const result = daysBetween('2024-01-02', '2024-01-01');
      expect(result).toBe(-1);
    });

    test('should calculate correct days for larger range', () => {
      const result = daysBetween('2024-01-01', '2024-01-31');
      expect(result).toBe(30);
    });

    test('should calculate correct days for full year', () => {
      const result = daysBetween('2024-01-01', '2024-12-31');
      expect(result).toBe(365); // 2024 is a leap year
    });

    test('should handle year boundary crossing', () => {
      const result = daysBetween('2024-12-31', '2025-01-01');
      expect(result).toBe(1);
    });

    test('should handle leap year correctly (Feb 29)', () => {
      const result = daysBetween('2024-02-28', '2024-03-01');
      expect(result).toBe(2); // Includes Feb 29
    });

    test('should handle non-leap year February', () => {
      const result = daysBetween('2025-02-28', '2025-03-01');
      expect(result).toBe(1); // No Feb 29 in 2025
    });

    test('should handle null inputs', () => {
      expect(daysBetween(null, '2024-01-01')).toBe(0);
      expect(daysBetween('2024-01-01', null)).toBe(0);
      expect(daysBetween(null, null)).toBe(0);
    });

    test('should handle invalid date strings', () => {
      expect(daysBetween('not-a-date', '2024-01-01')).toBe(0);
      expect(daysBetween('2024-01-01', 'invalid')).toBe(0);
    });

    test('should return integer (not float)', () => {
      const result = daysBetween('2024-01-01', '2024-01-15');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('dateToIndex', () => {
    test('should return 0 for minDate', () => {
      const result = dateToIndex('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('should return 10 for minDate + 10 days', () => {
      const result = dateToIndex('2024-01-11', '2024-01-01');
      expect(result).toBe(10);
    });

    test('should return correct index for larger range', () => {
      const result = dateToIndex('2024-12-31', '2024-01-01');
      expect(result).toBe(365);
    });

    test('should return 0 for dates before minDate', () => {
      const result = dateToIndex('2023-12-31', '2024-01-01');
      expect(result).toBe(0); // Clamped to non-negative
    });

    test('should handle leap year dates', () => {
      const result = dateToIndex('2024-03-01', '2024-02-28');
      expect(result).toBe(2); // Feb 29 exists in 2024
    });

    test('should handle null inputs', () => {
      expect(dateToIndex(null, '2024-01-01')).toBe(0);
      expect(dateToIndex('2024-01-01', null)).toBe(0);
    });

    test('should return integer', () => {
      const result = dateToIndex('2024-01-15', '2024-01-01');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('indexToDate', () => {
    test('should return minDate for index 0', () => {
      const result = indexToDate(0, '2024-01-01');
      expect(result).toBe('2024-01-01');
    });

    test('should return minDate + 15 days for index 15', () => {
      const result = indexToDate(15, '2024-01-01');
      expect(result).toBe('2024-01-16');
    });

    test('should handle larger indices', () => {
      const result = indexToDate(365, '2024-01-01');
      expect(result).toBe('2024-12-31'); // 2024 is leap year
    });

    test('should handle year boundary crossing', () => {
      const result = indexToDate(1, '2024-12-31');
      expect(result).toBe('2025-01-01');
    });

    test('should handle leap year correctly', () => {
      const result = indexToDate(1, '2024-02-28');
      expect(result).toBe('2024-02-29');
    });

    test('should handle negative index gracefully', () => {
      const result = indexToDate(-5, '2024-01-01');
      // Should still work, going backwards
      expect(result).toBe('2023-12-27');
    });

    test('should return empty string for null minDate', () => {
      const result = indexToDate(10, null);
      expect(result).toBe('');
    });

    test('should return YYYY-MM-DD format', () => {
      const result = indexToDate(5, '2024-01-01');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should pad single-digit months and days', () => {
      const result = indexToDate(0, '2024-03-05');
      expect(result).toBe('2024-03-05');
    });
  });

  describe('roundtrip conversion', () => {
    test('indexToDate(dateToIndex(date)) should equal date', () => {
      const originalDate = '2024-06-15';
      const minDate = '2024-01-01';
      
      const index = dateToIndex(originalDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(originalDate);
    });

    test('should maintain consistency across multiple dates', () => {
      const minDate = '2024-01-01';
      const testDates = [
        '2024-01-01',
        '2024-02-29', // Leap day
        '2024-06-15',
        '2024-12-31',
      ];

      testDates.forEach((date) => {
        const index = dateToIndex(date, minDate);
        const resultDate = indexToDate(index, minDate);
        expect(resultDate).toBe(date);
      });
    });

    test('should work for year boundary', () => {
      const originalDate = '2025-01-01';
      const minDate = '2024-12-31';
      
      const index = dateToIndex(originalDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(originalDate);
    });
  });

  describe('clampIndex', () => {
    test('should return value when within bounds', () => {
      const result = clampIndex(5, 0, 10);
      expect(result).toBe(5);
    });

    test('should return min when below minimum', () => {
      const result = clampIndex(-5, 0, 10);
      expect(result).toBe(0);
    });

    test('should return max when above maximum', () => {
      const result = clampIndex(15, 0, 10);
      expect(result).toBe(10);
    });

    test('should handle min equals max', () => {
      const result = clampIndex(5, 7, 7);
      expect(result).toBe(7);
    });

    test('should handle invalid min > max', () => {
      const result = clampIndex(5, 10, 0);
      expect(result).toBe(10); // Returns min
    });

    test('should floor float values', () => {
      const result = clampIndex(5.7, 0, 10);
      expect(result).toBe(5);
    });

    test('should handle zero bounds', () => {
      expect(clampIndex(-1, 0, 0)).toBe(0);
      expect(clampIndex(1, 0, 0)).toBe(0);
    });

    test('should return integer', () => {
      const result = clampIndex(5.9, 0, 10);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('should handle non-number inputs gracefully', () => {
      expect(clampIndex('not a number', 0, 10)).toBe(0);
      expect(clampIndex(5, 'not a number', 10)).toBe(0);
      expect(clampIndex(5, 0, 'not a number')).toBe(0);
    });
  });

  describe('isValidDateString', () => {
    test('should return true for valid date', () => {
      expect(isValidDateString('2024-01-01')).toBe(true);
    });

    test('should return true for leap day', () => {
      expect(isValidDateString('2024-02-29')).toBe(true);
    });

    test('should return false for invalid leap day', () => {
      expect(isValidDateString('2025-02-29')).toBe(false);
    });

    test('should return false for invalid format', () => {
      expect(isValidDateString('01-01-2024')).toBe(false);
      expect(isValidDateString('2024/01/01')).toBe(false);
      expect(isValidDateString('2024-1-1')).toBe(false);
    });

    test('should return false for null or empty', () => {
      expect(isValidDateString(null)).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
    });

    test('should return false for non-string', () => {
      expect(isValidDateString(123)).toBe(false);
      expect(isValidDateString({})).toBe(false);
    });

    test('should return false for invalid date values', () => {
      expect(isValidDateString('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2024-01-32')).toBe(false); // Invalid day
    });
  });

  describe('getDateRangeDays', () => {
    test('should return 0 for same date', () => {
      const result = getDateRangeDays('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('should return correct days for range', () => {
      const result = getDateRangeDays('2024-01-01', '2024-01-31');
      expect(result).toBe(30);
    });

    test('should return 0 for null inputs', () => {
      expect(getDateRangeDays(null, '2024-01-01')).toBe(0);
      expect(getDateRangeDays('2024-01-01', null)).toBe(0);
    });

    test('should return 0 for reversed dates', () => {
      const result = getDateRangeDays('2024-01-31', '2024-01-01');
      expect(result).toBe(0); // Clamped to non-negative
    });
  });

  describe('UTC timezone consistency', () => {
    test('should not be affected by local timezone', () => {
      // This test verifies UTC normalization
      const result = daysBetween('2024-01-01', '2024-01-02');
      expect(result).toBe(1);
      
      // Should be same regardless of when/where test runs
      const index = dateToIndex('2024-01-15', '2024-01-01');
      expect(index).toBe(14);
    });

    test('should handle DST transitions correctly', () => {
      // Spring forward DST in US (example)
      const result = daysBetween('2024-03-09', '2024-03-11');
      expect(result).toBe(2); // Should still be 2 days, not affected by DST
    });
  });

  describe('leap year edge cases', () => {
    test('should correctly handle Feb 29 in leap year', () => {
      const days = daysBetween('2024-02-28', '2024-03-01');
      expect(days).toBe(2); // Includes Feb 29
    });

    test('should correctly handle Feb 28 in non-leap year', () => {
      const days = daysBetween('2025-02-28', '2025-03-01');
      expect(days).toBe(1); // No Feb 29
    });

    test('should convert index across leap day correctly', () => {
      const date = indexToDate(1, '2024-02-28');
      expect(date).toBe('2024-02-29');
      
      const date2 = indexToDate(2, '2024-02-28');
      expect(date2).toBe('2024-03-01');
    });

    test('should handle dateToIndex across leap day', () => {
      const index = dateToIndex('2024-03-01', '2024-02-28');
      expect(index).toBe(2); // Feb 29 exists
    });
  });

  describe('boundary conditions', () => {
    test('should handle very large date ranges', () => {
      const days = daysBetween('2000-01-01', '2100-01-01');
      expect(days).toBeGreaterThan(36000); // Roughly 100 years
      expect(Number.isInteger(days)).toBe(true);
    });

    test('should handle zero index', () => {
      const date = indexToDate(0, '2024-06-15');
      expect(date).toBe('2024-06-15');
    });

    test('should handle large positive index', () => {
      const date = indexToDate(1000, '2024-01-01');
      expect(isValidDateString(date)).toBe(true);
    });
  });
});
