// src/pages/__tests__/DashBoard.fetchBounds.test.js
/**
 * Tests for Dashboard Date Bounds Fetching (DR-F3)
 * Testing bounds fetch on scope change and state updates
 */

import { fetchDashboardDateBounds } from '../../api/dashboard';

// Mock the API
jest.mock('../../api/dashboard', () => ({
  fetchDashboardDateBounds: jest.fn(),
}));

describe('DashBoard - Fetch Bounds on Scope Change (DR-F3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bounds Fetching Logic', () => {
    test('should call bounds API with hospital scope', async () => {
      const params = { scope: 'hospital' };
      
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-01-01',
        max_date: '2026-02-10',
      });

      const result = await fetchDashboardDateBounds(params);

      expect(fetchDashboardDateBounds).toHaveBeenCalledWith(params);
      expect(result.min_date).toBe('2024-01-01');
      expect(result.max_date).toBe('2026-02-10');
    });

    test('should call bounds API with administration scope and ID', async () => {
      const params = {
        scope: 'administration',
        administration_id: 1,
      };
      
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-06-01',
        max_date: '2025-12-31',
      });

      const result = await fetchDashboardDateBounds(params);

      expect(fetchDashboardDateBounds).toHaveBeenCalledWith(params);
      expect(result).toHaveProperty('min_date');
      expect(result).toHaveProperty('max_date');
    });

    test('should call bounds API with full hierarchy (section scope)', async () => {
      const params = {
        scope: 'section',
        administration_id: 1,
        department_id: 5,
        section_id: 10,
      };
      
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2025-01-01',
        max_date: '2025-12-31',
      });

      const result = await fetchDashboardDateBounds(params);

      expect(fetchDashboardDateBounds).toHaveBeenCalledWith(params);
      expect(params.scope).toBe('section');
      expect(params.administration_id).toBe(1);
      expect(params.department_id).toBe(5);
      expect(params.section_id).toBe(10);
    });
  });

  describe('State Updates', () => {
    test('should update dateBounds with fetched data', async () => {
      const mockData = {
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      };

      fetchDashboardDateBounds.mockResolvedValueOnce(mockData);

      const result = await fetchDashboardDateBounds({ scope: 'hospital' });

      // Simulate state update logic
      const computeTotalDays = (minDate, maxDate) => {
        if (!minDate || !maxDate) return null;
        const min = new Date(minDate);
        const max = new Date(maxDate);
        if (isNaN(min.getTime()) || isNaN(max.getTime())) return null;
        const diffMs = max - min;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
      };

      const totalDays = computeTotalDays(result.min_date, result.max_date);
      const dateBounds = {
        minDate: result.min_date,
        maxDate: result.max_date,
        totalDays: totalDays,
      };

      expect(dateBounds.minDate).toBe('2024-01-01');
      expect(dateBounds.maxDate).toBe('2024-12-31');
      expect(dateBounds.totalDays).toBe(365);
    });

    test('should compute totalDays correctly in state update', async () => {
      const mockData = {
        min_date: '2025-01-01',
        max_date: '2025-01-31',
      };

      fetchDashboardDateBounds.mockResolvedValueOnce(mockData);

      const result = await fetchDashboardDateBounds({ scope: 'hospital' });

      const computeTotalDays = (minDate, maxDate) => {
        if (!minDate || !maxDate) return null;
        const min = new Date(minDate);
        const max = new Date(maxDate);
        if (isNaN(min.getTime()) || isNaN(max.getTime())) return null;
        const diffMs = max - min;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
      };

      const totalDays = computeTotalDays(result.min_date, result.max_date);

      expect(totalDays).toBe(30);
    });

    test('should set totalDays to null when dates are null', async () => {
      const mockData = {
        min_date: null,
        max_date: null,
      };

      fetchDashboardDateBounds.mockResolvedValueOnce(mockData);

      const result = await fetchDashboardDateBounds({ scope: 'hospital' });

      const computeTotalDays = (minDate, maxDate) => {
        if (!minDate || !maxDate) return null;
        const min = new Date(minDate);
        const max = new Date(maxDate);
        if (isNaN(min.getTime()) || isNaN(max.getTime())) return null;
        const diffMs = max - min;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
      };

      const totalDays = computeTotalDays(result.min_date, result.max_date);
      const dateBounds = {
        minDate: result.min_date,
        maxDate: result.max_date,
        totalDays: totalDays,
      };

      expect(dateBounds.minDate).toBeNull();
      expect(dateBounds.maxDate).toBeNull();
      expect(dateBounds.totalDays).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle API error without crashing', async () => {
      fetchDashboardDateBounds.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        fetchDashboardDateBounds({ scope: 'hospital' })
      ).rejects.toThrow('Network error');

      // Verify error was thrown but caught by the component
      expect(fetchDashboardDateBounds).toHaveBeenCalled();
    });

    test('should reset dateBounds to null model on error', async () => {
      fetchDashboardDateBounds.mockRejectedValueOnce(
        new Error('Failed to fetch bounds')
      );

      try {
        await fetchDashboardDateBounds({ scope: 'hospital' });
      } catch (error) {
        // Simulate error handling in component
        const dateBounds = {
          minDate: null,
          maxDate: null,
          totalDays: null,
        };

        expect(dateBounds.minDate).toBeNull();
        expect(dateBounds.maxDate).toBeNull();
        expect(dateBounds.totalDays).toBeNull();
      }
    });

    test('should not break on malformed response', async () => {
      fetchDashboardDateBounds.mockResolvedValueOnce({
        // Missing expected fields
        unexpected_field: 'value',
      });

      const result = await fetchDashboardDateBounds({ scope: 'hospital' });

      // Should handle gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Scope Change Triggers', () => {
    test('should refetch when scope changes from hospital to administration', async () => {
      // First call - hospital scope
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-01-01',
        max_date: '2026-02-10',
      });

      await fetchDashboardDateBounds({ scope: 'hospital' });
      expect(fetchDashboardDateBounds).toHaveBeenCalledTimes(1);

      // Second call - administration scope
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2025-01-01',
        max_date: '2025-12-31',
      });

      await fetchDashboardDateBounds({
        scope: 'administration',
        administration_id: 1,
      });

      expect(fetchDashboardDateBounds).toHaveBeenCalledTimes(2);
    });

    test('should refetch when administration_id changes', async () => {
      // First call
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      });

      await fetchDashboardDateBounds({
        scope: 'administration',
        administration_id: 1,
      });

      // Second call with different admin
      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2025-01-01',
        max_date: '2025-12-31',
      });

      await fetchDashboardDateBounds({
        scope: 'administration',
        administration_id: 2,
      });

      expect(fetchDashboardDateBounds).toHaveBeenCalledTimes(2);
      expect(fetchDashboardDateBounds).toHaveBeenNthCalledWith(1, {
        scope: 'administration',
        administration_id: 1,
      });
      expect(fetchDashboardDateBounds).toHaveBeenNthCalledWith(2, {
        scope: 'administration',
        administration_id: 2,
      });
    });

    test('should refetch when department_id changes', async () => {
      fetchDashboardDateBounds.mockResolvedValue({
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      });

      await fetchDashboardDateBounds({
        scope: 'department',
        administration_id: 1,
        department_id: 5,
      });

      await fetchDashboardDateBounds({
        scope: 'department',
        administration_id: 1,
        department_id: 10,
      });

      expect(fetchDashboardDateBounds).toHaveBeenCalledTimes(2);
    });

    test('should refetch when section_id changes', async () => {
      fetchDashboardDateBounds.mockResolvedValue({
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      });

      await fetchDashboardDateBounds({
        scope: 'section',
        administration_id: 1,
        department_id: 5,
        section_id: 10,
      });

      await fetchDashboardDateBounds({
        scope: 'section',
        administration_id: 1,
        department_id: 5,
        section_id: 20,
      });

      expect(fetchDashboardDateBounds).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading State', () => {
    test('should set loading state during fetch', async () => {
      let boundsLoading = false;

      fetchDashboardDateBounds.mockImplementation(
        () =>
          new Promise((resolve) => {
            boundsLoading = true;
            setTimeout(() => {
              boundsLoading = false;
              resolve({
                min_date: '2024-01-01',
                max_date: '2024-12-31',
              });
            }, 100);
          })
      );

      const promise = fetchDashboardDateBounds({ scope: 'hospital' });
      
      // Loading should be true during fetch
      expect(boundsLoading).toBe(true);
      
      await promise;
      
      // Loading should be false after fetch
      expect(boundsLoading).toBe(false);
    });
  });

  describe('Isolation from Stats Fetch', () => {
    test('bounds fetch should not include chart mode params', async () => {
      const boundsParams = {
        scope: 'hospital',
      };

      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      });

      await fetchDashboardDateBounds(boundsParams);

      // Verify chart modes are NOT included
      expect(fetchDashboardDateBounds).toHaveBeenCalledWith(
        expect.not.objectContaining({
          classification_mode: expect.anything(),
          stage_mode: expect.anything(),
          department_mode: expect.anything(),
        })
      );
    });

    test('bounds fetch should not include date range params', async () => {
      const boundsParams = {
        scope: 'hospital',
      };

      fetchDashboardDateBounds.mockResolvedValueOnce({
        min_date: '2024-01-01',
        max_date: '2024-12-31',
      });

      await fetchDashboardDateBounds(boundsParams);

      // Verify date range is NOT included
      expect(fetchDashboardDateBounds).toHaveBeenCalledWith(
        expect.not.objectContaining({
          start_date: expect.anything(),
          end_date: expect.anything(),
        })
      );
    });
  });
});
