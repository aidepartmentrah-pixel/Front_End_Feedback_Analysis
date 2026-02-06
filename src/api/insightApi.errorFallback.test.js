// src/api/insightApi.errorFallback.test.js
/**
 * F-I15 — ERROR-STATE FALLBACK TESTS
 * 
 * Tests verify all adapter functions return safe fallback values
 * when backend returns null, undefined, or malformed data.
 * 
 * Goal: UI must not crash on bad data
 */

// Mock apiClient first to avoid axios ES module issues
jest.mock('./apiClient');

import {
  adaptKpiSummary,
  adaptDistribution,
  adaptTrend,
  adaptStuckCases,
} from './insightApi';

describe('insightApi - Error-State Fallback Tests', () => {
  // ============================================================================
  // adaptKpiSummary FALLBACKS
  // ============================================================================
  
  describe('adaptKpiSummary - Defensive Fallbacks', () => {
    test('should return safe empty shape for null input', () => {
      const result = adaptKpiSummary(null);
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should return safe empty shape for undefined input', () => {
      const result = adaptKpiSummary(undefined);
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should return safe empty shape for non-object input (string)', () => {
      const result = adaptKpiSummary('invalid');
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should return safe empty shape for non-object input (number)', () => {
      const result = adaptKpiSummary(42);
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should return safe empty shape for non-object input (array)', () => {
      const result = adaptKpiSummary([1, 2, 3]);
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should handle missing by_status field (treat as empty array)', () => {
      const input = {
        total_subcases: 10,
        action_items: { open: 5, overdue: 2 }
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(0); // No by_status data
      expect(result.active_action_items).toBe(5);
      expect(result.overdue_items).toBe(2);
    });

    test('should handle null by_status field (treat as empty array)', () => {
      const input = {
        by_status: null,
        action_items: { open: 5, overdue: 2 }
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(0);
      expect(result.active_action_items).toBe(5);
    });

    test('should handle non-array by_status field (treat as empty array)', () => {
      const input = {
        by_status: { invalid: 'data' },
        action_items: { open: 5, overdue: 2 }
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(0);
      expect(result.active_action_items).toBe(5);
    });

    test('should handle missing action_items field (treat as zeros)', () => {
      const input = {
        by_status: [
          { status: 'SUBMITTED', count: 10 }
        ]
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(10);
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });

    test('should handle null action_items field (treat as zeros)', () => {
      const input = {
        by_status: [{ status: 'SUBMITTED', count: 10 }],
        action_items: null
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });

    test('should handle non-object action_items field (treat as zeros)', () => {
      const input = {
        by_status: [{ status: 'SUBMITTED', count: 10 }],
        action_items: 'invalid'
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });

    test('should handle malformed by_status items (null items)', () => {
      const input = {
        by_status: [
          { status: 'SUBMITTED', count: 10 },
          null,
          { status: 'PENDING_REVIEW', count: 5 }
        ]
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(15); // Skip null item
    });

    test('should handle malformed by_status items (missing status field)', () => {
      const input = {
        by_status: [
          { status: 'SUBMITTED', count: 10 },
          { count: 5 }, // Missing status
          { status: 'PENDING_REVIEW', count: 3 }
        ]
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.open_subcases).toBe(13); // Skip item without status
    });

    test('should handle missing open field in action_items', () => {
      const input = {
        by_status: [],
        action_items: { overdue: 3 } // Missing open
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(3);
    });

    test('should handle missing overdue field in action_items', () => {
      const input = {
        by_status: [],
        action_items: { open: 5 } // Missing overdue
      };
      
      const result = adaptKpiSummary(input);
      
      expect(result.active_action_items).toBe(5);
      expect(result.overdue_items).toBe(0);
    });

    test('should handle completely empty object', () => {
      const result = adaptKpiSummary({});
      
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });
  });

  // ============================================================================
  // adaptDistribution FALLBACKS
  // ============================================================================
  
  describe('adaptDistribution - Defensive Fallbacks', () => {
    test('should return empty array for null input', () => {
      const result = adaptDistribution(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      const result = adaptDistribution(undefined);
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (object)', () => {
      const result = adaptDistribution({ key: 'value' });
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (string)', () => {
      const result = adaptDistribution('invalid');
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (number)', () => {
      const result = adaptDistribution(123);
      expect(result).toEqual([]);
    });

    test('should handle empty array input', () => {
      const result = adaptDistribution([]);
      expect(result).toEqual([]);
    });

    test('should filter out null items', () => {
      const input = [
        { key: 'A', count: 10 },
        null,
        { key: 'B', count: 5 }
      ];
      
      const result = adaptDistribution(input);
      
      expect(result).toEqual([
        { label: 'A', value: 10 },
        { label: 'B', value: 5 }
      ]);
    });

    test('should filter out undefined items', () => {
      const input = [
        { key: 'A', count: 10 },
        undefined,
        { key: 'B', count: 5 }
      ];
      
      const result = adaptDistribution(input);
      
      expect(result).toEqual([
        { label: 'A', value: 10 },
        { label: 'B', value: 5 }
      ]);
    });

    test('should handle items with missing key field', () => {
      const input = [
        { key: 'A', count: 10 },
        { count: 5 }, // Missing key
        { key: 'B', count: 3 }
      ];
      
      const result = adaptDistribution(input);
      
      expect(result).toEqual([
        { label: 'A', value: 10 },
        { label: '', value: 5 }, // Empty string for missing key
        { label: 'B', value: 3 }
      ]);
    });

    test('should handle items with missing count field', () => {
      const input = [
        { key: 'A', count: 10 },
        { key: 'B' }, // Missing count
        { key: 'C', count: 3 }
      ];
      
      const result = adaptDistribution(input);
      
      expect(result).toEqual([
        { label: 'A', value: 10 },
        { label: 'B', value: 0 }, // Zero for missing count
        { label: 'C', value: 3 }
      ]);
    });

    test('should handle array with all null items', () => {
      const result = adaptDistribution([null, null, null]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // adaptTrend FALLBACKS
  // ============================================================================
  
  describe('adaptTrend - Defensive Fallbacks', () => {
    test('should return empty array for null input', () => {
      const result = adaptTrend(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      const result = adaptTrend(undefined);
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (object)', () => {
      const result = adaptTrend({ bucket: 'value' });
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (string)', () => {
      const result = adaptTrend('invalid');
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (number)', () => {
      const result = adaptTrend(456);
      expect(result).toEqual([]);
    });

    test('should handle empty array input', () => {
      const result = adaptTrend([]);
      expect(result).toEqual([]);
    });

    test('should filter out null items', () => {
      const input = [
        { bucket: '2024-01', count: 10 },
        null,
        { bucket: '2024-02', count: 15 }
      ];
      
      const result = adaptTrend(input);
      
      expect(result).toEqual([
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 15 }
      ]);
    });

    test('should filter out undefined items', () => {
      const input = [
        { bucket: '2024-01', count: 10 },
        undefined,
        { bucket: '2024-02', count: 15 }
      ];
      
      const result = adaptTrend(input);
      
      expect(result).toEqual([
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 15 }
      ]);
    });

    test('should handle items with missing bucket field', () => {
      const input = [
        { bucket: '2024-01', count: 10 },
        { count: 15 }, // Missing bucket
        { bucket: '2024-02', count: 12 }
      ];
      
      const result = adaptTrend(input);
      
      expect(result).toEqual([
        { period: '2024-01', count: 10 },
        { period: '', count: 15 }, // Empty string for missing bucket
        { period: '2024-02', count: 12 }
      ]);
    });

    test('should handle items with missing count field', () => {
      const input = [
        { bucket: '2024-01', count: 10 },
        { bucket: '2024-02' }, // Missing count
        { bucket: '2024-03', count: 12 }
      ];
      
      const result = adaptTrend(input);
      
      expect(result).toEqual([
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 0 }, // Zero for missing count
        { period: '2024-03', count: 12 }
      ]);
    });

    test('should handle array with all null items', () => {
      const result = adaptTrend([null, null, null]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // adaptStuckCases FALLBACKS
  // ============================================================================
  
  describe('adaptStuckCases - Defensive Fallbacks', () => {
    test('should return empty array for null input', () => {
      const result = adaptStuckCases(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      const result = adaptStuckCases(undefined);
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (object)', () => {
      const result = adaptStuckCases({ subcase_id: 'value' });
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (string)', () => {
      const result = adaptStuckCases('invalid');
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input (number)', () => {
      const result = adaptStuckCases(789);
      expect(result).toEqual([]);
    });

    test('should handle empty array input', () => {
      const result = adaptStuckCases([]);
      expect(result).toEqual([]);
    });

    test('should filter out null items', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending', days_in_stage: 5 },
        null,
        { subcase_id: 'SC-002', target_org_unit_id: 'ORG-2', status: 'review', days_in_stage: 10 }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result.length).toBe(2);
      expect(result[0].subcase_id).toBe('SC-001');
      expect(result[1].subcase_id).toBe('SC-002');
    });

    test('should filter out undefined items', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending', days_in_stage: 5 },
        undefined,
        { subcase_id: 'SC-002', target_org_unit_id: 'ORG-2', status: 'review', days_in_stage: 10 }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result.length).toBe(2);
    });

    test('should handle items with missing days_in_stage (default to 0)', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending' } // Missing days_in_stage
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result[0].days_in_stage).toBe(0);
    });

    test('should handle items with null days_in_stage (default to 0)', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending', days_in_stage: null }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result[0].days_in_stage).toBe(0);
    });

    test('should handle items with string days_in_stage (convert to number)', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending', days_in_stage: '15' }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result[0].days_in_stage).toBe(15);
    });

    test('should add derived fields (stage, assigned_level)', () => {
      const input = [
        { subcase_id: 'SC-001', target_org_unit_id: 'ORG-1', status: 'pending', days_in_stage: 5 }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result[0].stage).toBe('pending'); // Derived from status
      expect(result[0].assigned_level).toBe('—'); // Fixed placeholder
    });

    test('should handle array with all null items', () => {
      const result = adaptStuckCases([null, null, null]);
      expect(result).toEqual([]);
    });

    test('should preserve all backend fields', () => {
      const input = [
        {
          subcase_id: 'SC-001',
          target_org_unit_id: 'ORG-1',
          updated_at: '2024-01-15',
          days_in_stage: 5,
          status: 'pending'
        }
      ];
      
      const result = adaptStuckCases(input);
      
      expect(result[0]).toMatchObject({
        subcase_id: 'SC-001',
        target_org_unit_id: 'ORG-1',
        updated_at: '2024-01-15',
        days_in_stage: 5,
        status: 'pending',
        stage: 'pending',
        assigned_level: '—'
      });
    });
  });

  // ============================================================================
  // CROSS-ADAPTER CONSISTENCY TESTS
  // ============================================================================
  
  describe('Cross-Adapter Consistency', () => {
    test('all array adapters should return empty array for null', () => {
      expect(adaptDistribution(null)).toEqual([]);
      expect(adaptTrend(null)).toEqual([]);
      expect(adaptStuckCases(null)).toEqual([]);
    });

    test('all array adapters should return empty array for undefined', () => {
      expect(adaptDistribution(undefined)).toEqual([]);
      expect(adaptTrend(undefined)).toEqual([]);
      expect(adaptStuckCases(undefined)).toEqual([]);
    });

    test('all array adapters should return empty array for non-array input', () => {
      expect(adaptDistribution('invalid')).toEqual([]);
      expect(adaptTrend('invalid')).toEqual([]);
      expect(adaptStuckCases('invalid')).toEqual([]);
    });

    test('KPI adapter should return zero object for null', () => {
      const result = adaptKpiSummary(null);
      expect(Object.values(result).every(val => val === 0)).toBe(true);
    });

    test('no adapter should throw error on bad input', () => {
      expect(() => adaptKpiSummary(null)).not.toThrow();
      expect(() => adaptDistribution(null)).not.toThrow();
      expect(() => adaptTrend(null)).not.toThrow();
      expect(() => adaptStuckCases(null)).not.toThrow();
    });
  });
});
