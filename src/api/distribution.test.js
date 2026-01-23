// src/api/distribution.test.js
import {
  fetchDistributionData,
  buildTimeWindow,
  isValidDateFormat,
  isValidSeasonFormat,
  isValidMonthFormat,
} from './distribution';

// Mock fetch globally
global.fetch = jest.fn();

describe('Distribution API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('fetchDistributionData', () => {
    const mockSuccessResponse = {
      dimension: 'severity',
      time_mode: 'single',
      data: [
        { label: 'High', count: 10, percentage: 50 },
        { label: 'Medium', count: 8, percentage: 40 },
        { label: 'Low', count: 2, percentage: 10 },
      ],
    };

    test('should successfully fetch distribution data with single mode', async () => {
      const requestBody = {
        dimension: 'severity',
        time_mode: 'single',
        time_window: { type: 'year', value: 2025 },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockSuccessResponse,
      });

      const result = await fetchDistributionData(requestBody);

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/operators/distribution',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );

      expect(result).toEqual(mockSuccessResponse);
    });

    test('should successfully fetch distribution data with multi mode', async () => {
      const requestBody = {
        dimension: 'domain',
        time_mode: 'multi',
        time_windows: [
          { type: 'season', value: '2024-Q4' },
          { type: 'season', value: '2025-Q1' },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ ...mockSuccessResponse, time_mode: 'multi' }),
      });

      const result = await fetchDistributionData(requestBody);

      expect(fetch).toHaveBeenCalled();
      expect(result.time_mode).toBe('multi');
    });

    test('should successfully fetch distribution data with binary_split mode', async () => {
      const requestBody = {
        dimension: 'stage',
        time_mode: 'binary_split',
        split_date: '2024-06-01',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ ...mockSuccessResponse, time_mode: 'binary_split' }),
      });

      const result = await fetchDistributionData(requestBody);

      expect(result.time_mode).toBe('binary_split');
    });

    test('should handle validation error (422)', async () => {
      const requestBody = {
        dimension: 'severity',
        time_mode: 'single',
        // Missing time_window
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({
          detail: [
            { loc: ['body', 'time_window'], msg: 'field required' },
          ],
        }),
      });

      await expect(fetchDistributionData(requestBody)).rejects.toThrow(
        /Validation error.*time_window.*field required/
      );
    });

    test('should handle bad request error (400)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({
          detail: 'Invalid dimension value',
        }),
      });

      await expect(fetchDistributionData({})).rejects.toThrow('Invalid dimension value');
    });

    test('should handle server error (500)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({
          detail: 'Internal server error',
        }),
      });

      await expect(fetchDistributionData({})).rejects.toThrow('Internal server error');
    });

    test('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(fetchDistributionData({})).rejects.toThrow(
        'Network error. Please check your connection.'
      );
    });

    test('should handle non-JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'text/html',
        },
        text: async () => '<html>Error page</html>',
      });

      await expect(fetchDistributionData({})).rejects.toThrow(
        'Unexpected response format'
      );
    });

    test('should include filters in request body', async () => {
      const requestBody = {
        dimension: 'severity',
        time_mode: 'single',
        time_window: { type: 'year', value: 2025 },
        filters: {
          department_id: 42,
          severity: 'High',
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockSuccessResponse,
      });

      await fetchDistributionData(requestBody);

      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.filters).toEqual({
        department_id: 42,
        severity: 'High',
      });
    });
  });

  describe('buildTimeWindow', () => {
    test('should build year window', () => {
      const window = buildTimeWindow('year', 2025);
      expect(window).toEqual({ type: 'year', value: 2025 });
    });

    test('should build season window', () => {
      const window = buildTimeWindow('season', '2025-Q1');
      expect(window).toEqual({ type: 'season', value: '2025-Q1' });
    });

    test('should build month window', () => {
      const window = buildTimeWindow('month', '2025-06');
      expect(window).toEqual({ type: 'month', value: '2025-06' });
    });

    test('should build range window', () => {
      const window = buildTimeWindow('range', {
        from_date: '2025-01-01',
        to_date: '2025-12-31',
      });
      expect(window).toEqual({
        type: 'range',
        value: { from_date: '2025-01-01', to_date: '2025-12-31' },
      });
    });
  });

  describe('isValidDateFormat', () => {
    test('should validate correct date format', () => {
      expect(isValidDateFormat('2025-01-15')).toBe(true);
      expect(isValidDateFormat('2024-12-31')).toBe(true);
    });

    test('should reject invalid date format', () => {
      expect(isValidDateFormat('2025-1-15')).toBe(false); // Missing leading zero
      expect(isValidDateFormat('2025/01/15')).toBe(false); // Wrong separator
      expect(isValidDateFormat('01-15-2025')).toBe(false); // Wrong order
      expect(isValidDateFormat('2025-13-01')).toBe(false); // Invalid month
      expect(isValidDateFormat('2025-01-32')).toBe(false); // Invalid day
    });

    test('should reject non-string values', () => {
      expect(isValidDateFormat(null)).toBe(false);
      expect(isValidDateFormat(undefined)).toBe(false);
      expect(isValidDateFormat(20250115)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(isValidDateFormat('')).toBe(false);
    });
  });

  describe('isValidSeasonFormat', () => {
    test('should validate correct season format', () => {
      expect(isValidSeasonFormat('2025-Q1')).toBe(true);
      expect(isValidSeasonFormat('2024-Q2')).toBe(true);
      expect(isValidSeasonFormat('2023-Q3')).toBe(true);
      expect(isValidSeasonFormat('2022-Q4')).toBe(true);
    });

    test('should reject invalid season format', () => {
      expect(isValidSeasonFormat('2025-Q5')).toBe(false); // Invalid quarter
      expect(isValidSeasonFormat('2025-Q0')).toBe(false); // Invalid quarter
      expect(isValidSeasonFormat('2025-q1')).toBe(false); // Lowercase
      expect(isValidSeasonFormat('2025Q1')).toBe(false); // Missing dash
      expect(isValidSeasonFormat('25-Q1')).toBe(false); // Short year
    });

    test('should reject non-string values', () => {
      expect(isValidSeasonFormat(null)).toBe(false);
      expect(isValidSeasonFormat(undefined)).toBe(false);
      expect(isValidSeasonFormat(2025)).toBe(false);
    });
  });

  describe('isValidMonthFormat', () => {
    test('should validate correct month format', () => {
      expect(isValidMonthFormat('2025-01')).toBe(true);
      expect(isValidMonthFormat('2025-06')).toBe(true);
      expect(isValidMonthFormat('2025-12')).toBe(true);
    });

    test('should reject invalid month format', () => {
      expect(isValidMonthFormat('2025-1')).toBe(false); // Missing leading zero
      expect(isValidMonthFormat('2025-13')).toBe(false); // Invalid month
      expect(isValidMonthFormat('2025-00')).toBe(false); // Invalid month
      expect(isValidMonthFormat('2025/06')).toBe(false); // Wrong separator
      expect(isValidMonthFormat('06-2025')).toBe(false); // Wrong order
    });

    test('should reject non-string values', () => {
      expect(isValidMonthFormat(null)).toBe(false);
      expect(isValidMonthFormat(undefined)).toBe(false);
      expect(isValidMonthFormat(202506)).toBe(false);
    });
  });
});
