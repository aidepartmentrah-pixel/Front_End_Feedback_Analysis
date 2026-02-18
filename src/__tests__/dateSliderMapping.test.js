/**
 * PHASE DR - GROUP C - DATE SLIDER MAPPING TESTS
 * 
 * Tests pure utility functions for converting between dates and slider indices.
 * 
 * Test Coverage:
 * 7️⃣ Index to date conversion correct
 * 8️⃣ Date to index conversion correct
 * 9️⃣ Roundtrip conversion stable
 */

import {
  daysBetween,
  dateToIndex,
  indexToDate,
  clampIndex,
  isValidDateString,
  getDateRangeDays
} from '../utils/dateSliderMapping';

describe('PHASE DR - GROUP C - Date Slider Mapping Tests', () => {
  
  // ==========================================================================
  // TEST 7: Index to date conversion correct
  // ==========================================================================
  
  describe('7️⃣ Index to date conversion', () => {
    test('Converts index 0 to minDate', () => {
      const minDate = '2024-01-01';
      const result = indexToDate(0, minDate);
      expect(result).toBe('2024-01-01');
    });

    test('Converts index 1 to next day', () => {
      const minDate = '2024-01-01';
      const result = indexToDate(1, minDate);
      expect(result).toBe('2024-01-02');
    });

    test('Converts index 31 to one month later', () => {
      const minDate = '2024-01-01';
      const result = indexToDate(31, minDate);
      expect(result).toBe('2024-02-01');
    });

    test('Converts large index correctly', () => {
      const minDate = '2024-01-01';
      const result = indexToDate(365, minDate);
      expect(result).toBe('2024-12-31'); // 2024 is a leap year
    });

    test('Handles leap year correctly', () => {
      const minDate = '2024-02-28';
      const result = indexToDate(1, minDate);
      expect(result).toBe('2024-02-29'); // Leap day
    });

    test('Returns empty string for null minDate', () => {
      const result = indexToDate(10, null);
      expect(result).toBe('');
    });

    test('Returns empty string for undefined minDate', () => {
      const result = indexToDate(10, undefined);
      expect(result).toBe('');
    });

    test('Handles fractional index (floors to integer)', () => {
      const minDate = '2024-01-01';
      const result = indexToDate(2.7, minDate);
      expect(result).toBe('2024-01-03'); // Floors to 2
    });

    test('Handles negative index (should add negative days)', () => {
      const minDate = '2024-01-15';
      const result = indexToDate(-5, minDate);
      expect(result).toBe('2024-01-10');
    });
  });

  // ==========================================================================
  // TEST 8: Date to index conversion correct
  // ==========================================================================
  
  describe('8️⃣ Date to index conversion', () => {
    test('Converts minDate to index 0', () => {
      const minDate = '2024-01-01';
      const targetDate = '2024-01-01';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(0);
    });

    test('Converts next day to index 1', () => {
      const minDate = '2024-01-01';
      const targetDate = '2024-01-02';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(1);
    });

    test('Converts date one week later to index 7', () => {
      const minDate = '2024-01-01';
      const targetDate = '2024-01-08';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(7);
    });

    test('Converts date one month later correctly', () => {
      const minDate = '2024-01-01';
      const targetDate = '2024-02-01';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(31);
    });

    test('Converts year-end date correctly', () => {
      const minDate = '2024-01-01';
      const targetDate = '2024-12-31';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(365); // 2024 is a leap year
    });

    test('Returns 0 for null dateStr', () => {
      const minDate = '2024-01-01';
      const result = dateToIndex(null, minDate);
      expect(result).toBe(0);
    });

    test('Returns 0 for null minDate', () => {
      const targetDate = '2024-06-15';
      const result = dateToIndex(targetDate, null);
      expect(result).toBe(0);
    });

    test('Ensures non-negative index for date before minDate', () => {
      const minDate = '2024-06-15';
      const targetDate = '2024-06-10';
      const result = dateToIndex(targetDate, minDate);
      expect(result).toBe(0); // Clamped to 0, not -5
    });
  });

  // ==========================================================================
  // TEST 9: Roundtrip conversion stable
  // ==========================================================================
  
  describe('9️⃣ Roundtrip conversion stability', () => {
    test('Index → Date → Index roundtrip is stable', () => {
      const minDate = '2024-01-01';
      const originalIndex = 100;
      
      const date = indexToDate(originalIndex, minDate);
      const resultIndex = dateToIndex(date, minDate);
      
      expect(resultIndex).toBe(originalIndex);
    });

    test('Date → Index → Date roundtrip is stable', () => {
      const minDate = '2024-01-01';
      const originalDate = '2024-06-15';
      
      const index = dateToIndex(originalDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(originalDate);
    });

    test('Multiple roundtrips remain stable', () => {
      const minDate = '2024-01-01';
      let currentIndex = 50;
      
      // Perform 5 roundtrips
      for (let i = 0; i < 5; i++) {
        const date = indexToDate(currentIndex, minDate);
        currentIndex = dateToIndex(date, minDate);
      }
      
      expect(currentIndex).toBe(50);
    });

    test('Roundtrip works for edge dates', () => {
      const minDate = '2024-01-01';
      const maxDate = '2024-12-31';
      
      const index = dateToIndex(maxDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(maxDate);
    });

    test('Roundtrip stable for leap year dates', () => {
      const minDate = '2024-01-01';
      const leapDate = '2024-02-29';
      
      const index = dateToIndex(leapDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(leapDate);
    });

    test('Roundtrip stable across year boundary', () => {
      const minDate = '2023-12-30';
      const targetDate = '2024-01-05';
      
      const index = dateToIndex(targetDate, minDate);
      const resultDate = indexToDate(index, minDate);
      
      expect(resultDate).toBe(targetDate);
    });
  });

  // ==========================================================================
  // ADDITIONAL HELPER FUNCTION TESTS
  // ==========================================================================
  
  describe('✓ Helper functions', () => {
    test('daysBetween calculates correct difference', () => {
      const result = daysBetween('2024-01-01', '2024-01-10');
      expect(result).toBe(9);
    });

    test('daysBetween returns 0 for same date', () => {
      const result = daysBetween('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('daysBetween returns negative for reversed dates', () => {
      const result = daysBetween('2024-01-10', '2024-01-01');
      expect(result).toBe(-9);
    });

    test('daysBetween returns 0 for null dates', () => {
      expect(daysBetween(null, '2024-01-01')).toBe(0);
      expect(daysBetween('2024-01-01', null)).toBe(0);
    });

    test('clampIndex clamps to min', () => {
      const result = clampIndex(-5, 0, 100);
      expect(result).toBe(0);
    });

    test('clampIndex clamps to max', () => {
      const result = clampIndex(150, 0, 100);
      expect(result).toBe(100);
    });

    test('clampIndex returns value when in range', () => {
      const result = clampIndex(50, 0, 100);
      expect(result).toBe(50);
    });

    test('clampIndex floors fractional values', () => {
      const result = clampIndex(50.8, 0, 100);
      expect(result).toBe(50);
    });

    test('clampIndex handles min > max edge case', () => {
      const result = clampIndex(50, 100, 0);
      expect(result).toBe(100); // Returns min when min > max
    });

    test('isValidDateString validates correct format', () => {
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
    });

    test('isValidDateString rejects invalid format', () => {
      expect(isValidDateString('01-01-2024')).toBe(false);
      expect(isValidDateString('2024/01/01')).toBe(false);
      expect(isValidDateString('2024-1-1')).toBe(false);
      expect(isValidDateString('not-a-date')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null)).toBe(false);
    });

    // Note: JavaScript Date constructor is lenient and accepts invalid dates
    // like '2024-02-30' by rolling them over to valid dates.
    // This matches the implementation behavior.

    test('getDateRangeDays calculates range correctly', () => {
      const result = getDateRangeDays('2024-01-01', '2024-01-10');
      expect(result).toBe(9);
    });

    test('getDateRangeDays returns 0 for same date', () => {
      const result = getDateRangeDays('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('getDateRangeDays returns 0 for null dates', () => {
      expect(getDateRangeDays(null, '2024-01-01')).toBe(0);
      expect(getDateRangeDays('2024-01-01', null)).toBe(0);
    });
  });
});
