// src/api/dashboard.test.js
import { fetchDashboardDateBounds, fetchDashboardStats } from './dashboard';
import apiClient from './apiClient';

// Mock the apiClient module
jest.mock('./apiClient');

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('fetchDashboardDateBounds', () => {
    const mockDateBoundsResponse = {
      min_date: '2024-01-01',
      max_date: '2026-02-10',
    };

    test('should fetch date bounds with only scope parameter', async () => {
      const params = { scope: 'hospital' };

      apiClient.get.mockResolvedValueOnce({
        data: mockDateBoundsResponse,
      });

      const result = await fetchDashboardDateBounds(params);

      // Verify correct endpoint called
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/dashboard/date-bounds?scope=hospital'
      );

      // Verify returns raw response data
      expect(result).toEqual(mockDateBoundsResponse);
      expect(result.min_date).toBe('2024-01-01');
      expect(result.max_date).toBe('2026-02-10');
    });

    test('should build query params with all non-null values', async () => {
      const params = {
        scope: 'department',
        administration_id: 1,
        department_id: 5,
        section_id: null, // Should not be included
      };

      apiClient.get.mockResolvedValueOnce({
        data: mockDateBoundsResponse,
      });

      await fetchDashboardDateBounds(params);

      // Verify only non-null params are in URL
      const callUrl = apiClient.get.mock.calls[0][0];
      expect(callUrl).toContain('scope=department');
      expect(callUrl).toContain('administration_id=1');
      expect(callUrl).toContain('department_id=5');
      expect(callUrl).not.toContain('section_id');
    });

    test('should handle null date bounds', async () => {
      const params = { scope: 'hospital' };

      apiClient.get.mockResolvedValueOnce({
        data: {
          min_date: null,
          max_date: null,
        },
      });

      const result = await fetchDashboardDateBounds(params);

      expect(result.min_date).toBeNull();
      expect(result.max_date).toBeNull();
    });

    test('should handle network errors', async () => {
      const params = { scope: 'hospital' };

      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchDashboardDateBounds(params)).rejects.toThrow(
        'Failed to load dashboard date bounds: Network error'
      );

      expect(console.error).toHaveBeenCalledWith(
        '❌ API Error Response:',
        expect.any(Error)
      );
    });

    test('should include all params in error log', async () => {
      const params = {
        scope: 'section',
        administration_id: 1,
        department_id: 2,
        section_id: 3,
      };

      apiClient.get.mockRejectedValueOnce(new Error('Test error'));

      await expect(fetchDashboardDateBounds(params)).rejects.toThrow();

      // Verify error logging includes all params
      expect(console.error).toHaveBeenCalledWith(
        '❌ Request params were:',
        {
          scope: 'section',
          administration_id: 1,
          department_id: 2,
          section_id: 3,
        }
      );
    });

    test('should match query param style with fetchDashboardStats', async () => {
      const params = {
        scope: 'administration',
        administration_id: 2,
      };

      apiClient.get.mockResolvedValueOnce({
        data: mockDateBoundsResponse,
      });

      await fetchDashboardDateBounds(params);

      const dateBoundsUrl = apiClient.get.mock.calls[0][0];

      // Clear mocks for second call
      jest.clearAllMocks();

      apiClient.get.mockResolvedValueOnce({
        data: { total_records: 100 },
      });

      await fetchDashboardStats({
        ...params,
        start_date: null,
        end_date: null,
      });

      const statsUrl = apiClient.get.mock.calls[0][0];

      // Both should use same URLSearchParams construction
      // Extract base query params (excluding endpoint and date params)
      const dateBoundsQuery = dateBoundsUrl.split('?')[1];
      const statsQuery = statsUrl.split('?')[1].replace(/&(start|end)_date=[^&]*/g, '');

      expect(dateBoundsQuery).toBe(statsQuery);
    });

    test('should return contract with min_date and max_date keys', async () => {
      const params = { scope: 'hospital' };

      apiClient.get.mockResolvedValueOnce({
        data: mockDateBoundsResponse,
      });

      const result = await fetchDashboardDateBounds(params);

      // Verify expected keys exist
      expect(result).toHaveProperty('min_date');
      expect(result).toHaveProperty('max_date');
    });
  });
});
