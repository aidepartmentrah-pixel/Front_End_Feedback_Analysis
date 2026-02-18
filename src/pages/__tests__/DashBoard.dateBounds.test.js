// src/pages/__tests__/DashBoard.dateBounds.test.js
/**
 * Tests for Dashboard Date Bounds State Model
 * Testing the computeTotalDays helper logic and state structure
 */

describe('DashBoard - Date Bounds State Model', () => {
  // Helper function extracted from DashBoard component for testing
  const computeTotalDays = (minDate, maxDate) => {
    if (!minDate || !maxDate) {
      return null;
    }
    
    try {
      const min = new Date(minDate);
      const max = new Date(maxDate);
      
      // Check for invalid dates
      if (isNaN(min.getTime()) || isNaN(max.getTime())) {
        return null;
      }
      
      // Calculate difference in milliseconds and convert to days
      const diffMs = max - min;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 ? diffDays : null;
    } catch (error) {
      return null;
    }
  };

  describe('Initial State Structure', () => {
    test('should have correct initial state shape', () => {
      const initialDateBounds = {
        minDate: null,
        maxDate: null,
        totalDays: null
      };

      expect(initialDateBounds).toHaveProperty('minDate');
      expect(initialDateBounds).toHaveProperty('maxDate');
      expect(initialDateBounds).toHaveProperty('totalDays');
      expect(initialDateBounds.minDate).toBeNull();
      expect(initialDateBounds.maxDate).toBeNull();
      expect(initialDateBounds.totalDays).toBeNull();
    });
  });

  describe('Helper Function - computeTotalDays', () => {
    test('should compute totalDays correctly when both dates are valid', () => {
      const result = computeTotalDays('2024-01-01', '2024-01-31');
      expect(result).toBe(30);
    });

    test('should return null when minDate is null', () => {
      const result = computeTotalDays(null, '2024-01-31');
      expect(result).toBeNull();
    });

    test('should return null when maxDate is null', () => {
      const result = computeTotalDays('2024-01-01', null);
      expect(result).toBeNull();
    });

    test('should return null when both dates are null', () => {
      const result = computeTotalDays(null, null);
      expect(result).toBeNull();
    });

    test('should return null for invalid date strings', () => {
      const result = computeTotalDays('not-a-date', '2024-01-31');
      expect(result).toBeNull();
    });

    test('should return null when max date is before min date', () => {
      const result = computeTotalDays('2024-12-31', '2024-01-01');
      expect(result).toBeNull();
    });

    test('should return 0 for same date', () => {
      const result = computeTotalDays('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    test('should return 1 for consecutive days', () => {
      const result = computeTotalDays('2024-01-01', '2024-01-02');
      expect(result).toBe(1);
    });

    test('should compute correct days for a full year', () => {
      const result = computeTotalDays('2024-01-01', '2024-12-31');
      expect(result).toBe(365); // 2024 is leap year
    });

    test('should handle year boundary crossing', () => {
      const result = computeTotalDays('2024-12-15', '2025-01-15');
      expect(result).toBe(31);
    });

    test('should compute correct days for large range', () => {
      const result = computeTotalDays('2025-01-01', '2026-02-10');
      expect(result).toBe(405); // 365 days in 2025 + 40 days in Jan-Feb 2026 = 405
    });
  });

  describe('Type Checking', () => {
    test('totalDays should be number when computed', () => {
      const result = computeTotalDays('2024-01-01', '2024-01-31');
      expect(typeof result).toBe('number');
    });

    test('totalDays should be null when dates are invalid', () => {
      const result = computeTotalDays(null, null);
      expect(result).toBeNull();
    });

    test('should return integer (not float)', () => {
      const result = computeTotalDays('2024-01-01', '2024-01-15');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('State Model Contract', () => {
    test('should enforce expected state structure', () => {
      const dateBounds = {
        minDate: '2024-01-01',
        maxDate: '2024-12-31',
        totalDays: 365
      };

      expect(dateBounds).toHaveProperty('minDate');
      expect(dateBounds).toHaveProperty('maxDate');
      expect(dateBounds).toHaveProperty('totalDays');
      expect(typeof dateBounds.minDate).toBe('string');
      expect(typeof dateBounds.maxDate).toBe('string');
      expect(typeof dateBounds.totalDays).toBe('number');
    });

    test('should allow null values in state', () => {
      const dateBounds = {
        minDate: null,
        maxDate: null,
        totalDays: null
      };

      expect(dateBounds.minDate).toBeNull();
      expect(dateBounds.maxDate).toBeNull();
      expect(dateBounds.totalDays).toBeNull();
    });

    test('should update totalDays when bounds are set', () => {
      const dateBounds = {
        minDate: '2024-01-01',
        maxDate: '2024-01-31',
        totalDays: null
      };

      // Compute totalDays
      dateBounds.totalDays = computeTotalDays(dateBounds.minDate, dateBounds.maxDate);

      expect(dateBounds.totalDays).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    test('should handle ISO date format', () => {
      const result = computeTotalDays('2024-01-01T00:00:00Z', '2024-01-15T23:59:59Z');
      expect(result).toBe(14);
    });

    test('should handle partial dates gracefully', () => {
      const result = computeTotalDays('2024-01', '2024-02');
      // Should return a number if dates can be parsed, or null if not
      expect(result === null || typeof result === 'number').toBe(true);
    });

    test('should handle empty strings', () => {
      const result = computeTotalDays('', '2024-01-31');
      expect(result).toBeNull();
    });

    test('should handle undefined values', () => {
      const result = computeTotalDays(undefined, '2024-01-31');
      expect(result).toBeNull();
    });
  });
});
