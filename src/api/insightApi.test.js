/**
 * Unit Tests for Insight API Adapters
 * 
 * Tests verify:
 * - adaptKpiSummary adapter function
 * - Null/undefined handling
 * - Status filtering logic
 * - Action item extraction
 * - Edge cases
 */

// Mock apiClient before importing insightApi
jest.mock('./apiClient');

import { 
  adaptKpiSummary, 
  adaptDistribution, 
  adaptTrend, 
  adaptStuckCases,
  buildDistributionRequest,
  buildTrendRequest,
  buildStuckQuery,
  getInsightKpis,
  getInsightDistribution,
  getInsightTrend,
  getStuckCases,
} from './insightApi';

import apiClient from './apiClient';

describe('insightApi - adaptKpiSummary', () => {
  describe('Null/Undefined Handling', () => {
    test('should return all zeros for null input', () => {
      const result = adaptKpiSummary(null);
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });
    
    test('should return all zeros for undefined input', () => {
      const result = adaptKpiSummary(undefined);
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });
    
    test('should handle empty object', () => {
      const result = adaptKpiSummary({});
      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });
  });

  describe('Open Subcases Calculation', () => {
    test('should count non-terminal statuses only', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 5 },
          { status: 'PENDING_REVIEW', count: 3 },
          { status: 'ADMIN_APPROVED', count: 10 }, // Terminal - should NOT count
          { status: 'SECTION_DENIED', count: 2 },  // Terminal - should NOT count
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(8); // 5 + 3
    });
    
    test('should return 0 when all statuses are terminal', () => {
      const raw = {
        by_status: [
          { status: 'ADMIN_APPROVED', count: 10 },
          { status: 'SECTION_DENIED', count: 5 },
          { status: 'FORCE_CLOSED', count: 3 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(0);
    });
    
    test('should handle missing by_status array', () => {
      const raw = {
        action_items: { open: 5, overdue: 2 },
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(0);
    });
    
    test('should handle by_status with null items', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 5 },
          null,
          { status: 'PENDING_REVIEW', count: 3 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(8);
    });
    
    test('should handle by_status items without status field', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 5 },
          { count: 10 }, // Missing status
          { status: 'PENDING_REVIEW', count: 3 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(8);
    });
  });

  describe('Pending Approvals Calculation', () => {
    test('should sum only pending approval statuses', () => {
      const raw = {
        by_status: [
          { status: 'SECTION_ACCEPTED_PENDING_DEPT', count: 7 },
          { status: 'DEPT_ACCEPTED_PENDING_ADMIN', count: 4 },
          { status: 'SUBMITTED', count: 10 }, // Should NOT count
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.pending_approvals).toBe(11); // 7 + 4
    });
    
    test('should return 0 when no pending approval statuses exist', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 10 },
          { status: 'ADMIN_APPROVED', count: 5 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.pending_approvals).toBe(0);
    });
    
    test('should handle missing counts for pending approval statuses', () => {
      const raw = {
        by_status: [
          { status: 'SECTION_ACCEPTED_PENDING_DEPT' }, // Missing count
          { status: 'DEPT_ACCEPTED_PENDING_ADMIN', count: 4 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.pending_approvals).toBe(4);
    });
  });

  describe('Action Items Extraction', () => {
    test('should extract active action items correctly', () => {
      const raw = {
        action_items: {
          total: 20,
          open: 12,
          completed: 5,
          overdue: 3,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.active_action_items).toBe(12);
    });
    
    test('should extract overdue items correctly', () => {
      const raw = {
        action_items: {
          total: 20,
          open: 12,
          completed: 5,
          overdue: 3,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.overdue_items).toBe(3);
    });
    
    test('should default to 0 when action_items is missing', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 5 },
        ],
      };
      const result = adaptKpiSummary(raw);
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });
    
    test('should default to 0 when open is missing', () => {
      const raw = {
        action_items: {
          total: 20,
          overdue: 3,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.active_action_items).toBe(0);
    });
    
    test('should default to 0 when overdue is missing', () => {
      const raw = {
        action_items: {
          total: 20,
          open: 12,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.overdue_items).toBe(0);
    });
    
    test('should handle action_items with null values', () => {
      const raw = {
        action_items: {
          open: null,
          overdue: null,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete backend response correctly', () => {
      const raw = {
        total_subcases: 50,
        by_status: [
          { status: 'SUBMITTED', count: 10 },
          { status: 'SECTION_ACCEPTED_PENDING_DEPT', count: 5 },
          { status: 'DEPT_ACCEPTED_PENDING_ADMIN', count: 3 },
          { status: 'PENDING_REVIEW', count: 7 },
          { status: 'ADMIN_APPROVED', count: 15 },
          { status: 'SECTION_DENIED', count: 8 },
          { status: 'FORCE_CLOSED', count: 2 },
        ],
        action_items: {
          total: 30,
          open: 18,
          completed: 10,
          overdue: 2,
        },
      };
      
      const result = adaptKpiSummary(raw);
      
      // open_subcases = SUBMITTED(10) + SECTION_ACCEPTED_PENDING_DEPT(5) + 
      //                 DEPT_ACCEPTED_PENDING_ADMIN(3) + PENDING_REVIEW(7) = 25
      expect(result.open_subcases).toBe(25);
      
      // pending_approvals = SECTION_ACCEPTED_PENDING_DEPT(5) + DEPT_ACCEPTED_PENDING_ADMIN(3) = 8
      expect(result.pending_approvals).toBe(8);
      
      // active_action_items = 18
      expect(result.active_action_items).toBe(18);
      
      // overdue_items = 2
      expect(result.overdue_items).toBe(2);
    });
    
    test('should handle response with only action items', () => {
      const raw = {
        action_items: {
          open: 5,
          overdue: 1,
        },
      };
      
      const result = adaptKpiSummary(raw);
      
      expect(result.open_subcases).toBe(0);
      expect(result.pending_approvals).toBe(0);
      expect(result.active_action_items).toBe(5);
      expect(result.overdue_items).toBe(1);
    });
    
    test('should handle response with only status data', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 10 },
          { status: 'SECTION_ACCEPTED_PENDING_DEPT', count: 5 },
        ],
      };
      
      const result = adaptKpiSummary(raw);
      
      expect(result.open_subcases).toBe(15);
      expect(result.pending_approvals).toBe(5);
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle by_status as non-array', () => {
      const raw = {
        by_status: 'invalid',
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(0);
    });
    
    test('should handle counts as strings', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: '5' },
        ],
        action_items: {
          open: '10',
          overdue: '2',
        },
      };
      const result = adaptKpiSummary(raw);
      // String '5' is falsy in logical OR, should use || 0
      // Actually, JavaScript will coerce '5' to 5 in arithmetic operations
      expect(result.open_subcases).toBe(5);
      expect(result.active_action_items).toBe(10);
    });
    
    test('should handle zero counts', () => {
      const raw = {
        by_status: [
          { status: 'SUBMITTED', count: 0 },
        ],
        action_items: {
          open: 0,
          overdue: 0,
        },
      };
      const result = adaptKpiSummary(raw);
      expect(result.open_subcases).toBe(0);
      expect(result.active_action_items).toBe(0);
      expect(result.overdue_items).toBe(0);
    });
  });
});

describe('insightApi - adaptDistribution', () => {
  describe('Null/Undefined/Invalid Handling', () => {
    test('should return empty array for null input', () => {
      const result = adaptDistribution(null);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for undefined input', () => {
      const result = adaptDistribution(undefined);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for non-array input', () => {
      const result = adaptDistribution('invalid');
      expect(result).toEqual([]);
    });
    
    test('should return empty array for object input', () => {
      const result = adaptDistribution({ key: 'test', count: 5 });
      expect(result).toEqual([]);
    });
    
    test('should return empty array for number input', () => {
      const result = adaptDistribution(123);
      expect(result).toEqual([]);
    });
    
    test('should handle empty array', () => {
      const result = adaptDistribution([]);
      expect(result).toEqual([]);
    });
  });

  describe('Basic Transformation', () => {
    test('should transform single item correctly', () => {
      const raw = [
        { key: 'submitted', count: 10 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'submitted', value: 10 },
      ]);
    });
    
    test('should transform multiple items correctly', () => {
      const raw = [
        { key: 'submitted', count: 10 },
        { key: 'pending_review', count: 5 },
        { key: 'approved', count: 15 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'submitted', value: 10 },
        { label: 'pending_review', value: 5 },
        { label: 'approved', value: 15 },
      ]);
    });
    
    test('should preserve order of items', () => {
      const raw = [
        { key: 'c', count: 3 },
        { key: 'a', count: 1 },
        { key: 'b', count: 2 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'c', value: 3 },
        { label: 'a', value: 1 },
        { label: 'b', value: 2 },
      ]);
    });
  });

  describe('Type Coercion', () => {
    test('should coerce key to string', () => {
      const raw = [
        { key: 123, count: 10 },
        { key: null, count: 5 },
        { key: undefined, count: 3 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: '123', value: 10 },
        { label: '', value: 5 },
        { label: '', value: 3 },
      ]);
    });
    
    test('should coerce count to number', () => {
      const raw = [
        { key: 'test1', count: '25' },
        { key: 'test2', count: '10.5' },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test1', value: 25 },
        { label: 'test2', value: 10.5 },
      ]);
    });
    
    test('should handle missing count field', () => {
      const raw = [
        { key: 'test1' },
        { key: 'test2', count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test1', value: 0 },
        { label: 'test2', value: 5 },
      ]);
    });
    
    test('should handle null count', () => {
      const raw = [
        { key: 'test', count: null },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: 0 },
      ]);
    });
    
    test('should handle undefined count', () => {
      const raw = [
        { key: 'test', count: undefined },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: 0 },
      ]);
    });
    
    test('should handle invalid count strings', () => {
      const raw = [
        { key: 'test1', count: 'abc' },
        { key: 'test2', count: 'NaN' },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test1', value: 0 },
        { label: 'test2', value: 0 },
      ]);
    });
  });

  describe('Null/Undefined Row Handling', () => {
    test('should skip null rows', () => {
      const raw = [
        { key: 'test1', count: 10 },
        null,
        { key: 'test2', count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test1', value: 10 },
        { label: 'test2', value: 5 },
      ]);
    });
    
    test('should skip undefined rows', () => {
      const raw = [
        { key: 'test1', count: 10 },
        undefined,
        { key: 'test2', count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test1', value: 10 },
        { label: 'test2', value: 5 },
      ]);
    });
    
    test('should handle array with only null values', () => {
      const raw = [null, null, null];
      const result = adaptDistribution(raw);
      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero count', () => {
      const raw = [
        { key: 'test', count: 0 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: 0 },
      ]);
    });
    
    test('should handle negative count', () => {
      const raw = [
        { key: 'test', count: -5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: -5 },
      ]);
    });
    
    test('should handle decimal count', () => {
      const raw = [
        { key: 'test', count: 10.75 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: 10.75 },
      ]);
    });
    
    test('should handle very large numbers', () => {
      const raw = [
        { key: 'test', count: 999999999 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'test', value: 999999999 },
      ]);
    });
    
    test('should handle empty string key', () => {
      const raw = [
        { key: '', count: 10 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: '', value: 10 },
      ]);
    });
    
    test('should handle special characters in key', () => {
      const raw = [
        { key: 'status_@#$%', count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'status_@#$%', value: 5 },
      ]);
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic backend response', () => {
      const raw = [
        { key: 'SUBMITTED', count: 25 },
        { key: 'PENDING_REVIEW', count: 10 },
        { key: 'ADMIN_APPROVED', count: 40 },
        { key: 'SECTION_DENIED', count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'SUBMITTED', value: 25 },
        { label: 'PENDING_REVIEW', value: 10 },
        { label: 'ADMIN_APPROVED', value: 40 },
        { label: 'SECTION_DENIED', value: 5 },
      ]);
    });
    
    test('should handle response with mixed valid and invalid data', () => {
      const raw = [
        { key: 'valid1', count: 10 },
        null,
        { key: 'valid2', count: '15' },
        undefined,
        { key: 'valid3' },
        { key: 123, count: 5 },
      ];
      const result = adaptDistribution(raw);
      expect(result).toEqual([
        { label: 'valid1', value: 10 },
        { label: 'valid2', value: 15 },
        { label: 'valid3', value: 0 },
        { label: '123', value: 5 },
      ]);
    });
  });
});

describe('insightApi - adaptTrend', () => {
  describe('Null/Undefined/Invalid Handling', () => {
    test('should return empty array for null input', () => {
      const result = adaptTrend(null);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for undefined input', () => {
      const result = adaptTrend(undefined);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for non-array input', () => {
      const result = adaptTrend('invalid');
      expect(result).toEqual([]);
    });
    
    test('should return empty array for object input', () => {
      const result = adaptTrend({ bucket: '2026-01', count: 5 });
      expect(result).toEqual([]);
    });
    
    test('should return empty array for number input', () => {
      const result = adaptTrend(123);
      expect(result).toEqual([]);
    });
    
    test('should handle empty array', () => {
      const result = adaptTrend([]);
      expect(result).toEqual([]);
    });
  });

  describe('Basic Transformation', () => {
    test('should transform single item correctly', () => {
      const raw = [
        { bucket: '2026-01', count: 25 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 25 },
      ]);
    });
    
    test('should transform multiple items correctly', () => {
      const raw = [
        { bucket: '2026-01', count: 25 },
        { bucket: '2026-02', count: 30 },
        { bucket: '2026-03', count: 28 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 25 },
        { period: '2026-02', count: 30 },
        { period: '2026-03', count: 28 },
      ]);
    });
    
    test('should preserve order of items', () => {
      const raw = [
        { bucket: '2026-03', count: 28 },
        { bucket: '2026-01', count: 25 },
        { bucket: '2026-02', count: 30 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-03', count: 28 },
        { period: '2026-01', count: 25 },
        { period: '2026-02', count: 30 },
      ]);
    });
  });

  describe('Type Coercion', () => {
    test('should coerce bucket to string', () => {
      const raw = [
        { bucket: 202601, count: 10 },
        { bucket: null, count: 5 },
        { bucket: undefined, count: 3 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '202601', count: 10 },
        { period: '', count: 5 },
        { period: '', count: 3 },
      ]);
    });
    
    test('should coerce count to number', () => {
      const raw = [
        { bucket: '2026-01', count: '25' },
        { bucket: '2026-02', count: '30.5' },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 25 },
        { period: '2026-02', count: 30.5 },
      ]);
    });
    
    test('should handle missing count field', () => {
      const raw = [
        { bucket: '2026-01' },
        { bucket: '2026-02', count: 5 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 0 },
        { period: '2026-02', count: 5 },
      ]);
    });
    
    test('should handle null count', () => {
      const raw = [
        { bucket: '2026-01', count: null },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 0 },
      ]);
    });
    
    test('should handle undefined count', () => {
      const raw = [
        { bucket: '2026-01', count: undefined },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 0 },
      ]);
    });
    
    test('should handle invalid count strings', () => {
      const raw = [
        { bucket: '2026-01', count: 'abc' },
        { bucket: '2026-02', count: 'NaN' },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 0 },
        { period: '2026-02', count: 0 },
      ]);
    });
  });

  describe('Null/Undefined Row Handling', () => {
    test('should skip null rows', () => {
      const raw = [
        { bucket: '2026-01', count: 10 },
        null,
        { bucket: '2026-02', count: 5 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 10 },
        { period: '2026-02', count: 5 },
      ]);
    });
    
    test('should skip undefined rows', () => {
      const raw = [
        { bucket: '2026-01', count: 10 },
        undefined,
        { bucket: '2026-02', count: 5 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 10 },
        { period: '2026-02', count: 5 },
      ]);
    });
    
    test('should handle array with only null values', () => {
      const raw = [null, null, null];
      const result = adaptTrend(raw);
      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero count', () => {
      const raw = [
        { bucket: '2026-01', count: 0 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 0 },
      ]);
    });
    
    test('should handle negative count', () => {
      const raw = [
        { bucket: '2026-01', count: -5 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: -5 },
      ]);
    });
    
    test('should handle decimal count', () => {
      const raw = [
        { bucket: '2026-01', count: 10.75 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 10.75 },
      ]);
    });
    
    test('should handle very large numbers', () => {
      const raw = [
        { bucket: '2026-01', count: 999999999 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 999999999 },
      ]);
    });
    
    test('should handle empty string bucket', () => {
      const raw = [
        { bucket: '', count: 10 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '', count: 10 },
      ]);
    });
    
    test('should NOT parse or reformat date strings', () => {
      const raw = [
        { bucket: '2026-01-15', count: 5 },
        { bucket: '01/15/2026', count: 3 },
        { bucket: 'January 2026', count: 8 },
      ];
      const result = adaptTrend(raw);
      // Should preserve exact bucket values as strings
      expect(result).toEqual([
        { period: '2026-01-15', count: 5 },
        { period: '01/15/2026', count: 3 },
        { period: 'January 2026', count: 8 },
      ]);
    });
    
    test('should handle week/month/year bucket formats', () => {
      const raw = [
        { bucket: 'W01-2026', count: 5 },
        { bucket: '2026-Q1', count: 10 },
        { bucket: '2026', count: 100 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: 'W01-2026', count: 5 },
        { period: '2026-Q1', count: 10 },
        { period: '2026', count: 100 },
      ]);
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic monthly backend response', () => {
      const raw = [
        { bucket: '2025-10', count: 15 },
        { bucket: '2025-11', count: 20 },
        { bucket: '2025-12', count: 25 },
        { bucket: '2026-01', count: 30 },
        { bucket: '2026-02', count: 28 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2025-10', count: 15 },
        { period: '2025-11', count: 20 },
        { period: '2025-12', count: 25 },
        { period: '2026-01', count: 30 },
        { period: '2026-02', count: 28 },
      ]);
    });
    
    test('should handle response with mixed valid and invalid data', () => {
      const raw = [
        { bucket: '2026-01', count: 10 },
        null,
        { bucket: '2026-02', count: '15' },
        undefined,
        { bucket: '2026-03' },
        { bucket: 202604, count: 5 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-01', count: 10 },
        { period: '2026-02', count: 15 },
        { period: '2026-03', count: 0 },
        { period: '202604', count: 5 },
      ]);
    });
    
    test('should handle daily granularity data', () => {
      const raw = [
        { bucket: '2026-02-01', count: 5 },
        { bucket: '2026-02-02', count: 8 },
        { bucket: '2026-02-03', count: 12 },
      ];
      const result = adaptTrend(raw);
      expect(result).toEqual([
        { period: '2026-02-01', count: 5 },
        { period: '2026-02-02', count: 8 },
        { period: '2026-02-03', count: 12 },
      ]);
    });
  });
});

describe('insightApi - adaptStuckCases', () => {
  describe('Null/Undefined/Invalid Handling', () => {
    test('should return empty array for null input', () => {
      const result = adaptStuckCases(null);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for undefined input', () => {
      const result = adaptStuckCases(undefined);
      expect(result).toEqual([]);
    });
    
    test('should return empty array for non-array input', () => {
      const result = adaptStuckCases('invalid');
      expect(result).toEqual([]);
    });
    
    test('should return empty array for object input', () => {
      const result = adaptStuckCases({ subcase_id: 123 });
      expect(result).toEqual([]);
    });
    
    test('should return empty array for number input', () => {
      const result = adaptStuckCases(123);
      expect(result).toEqual([]);
    });
    
    test('should handle empty array', () => {
      const result = adaptStuckCases([]);
      expect(result).toEqual([]);
    });
  });

  describe('Basic Transformation', () => {
    test('should transform single item correctly', () => {
      const raw = [
        {
          subcase_id: 123,
          target_org_unit_id: 5,
          updated_at: '2026-01-15T10:00:00',
          days_in_stage: 10,
          status: 'pending_review',
        },
      ];
      const result = adaptStuckCases(raw);
      expect(result).toEqual([
        {
          subcase_id: 123,
          target_org_unit_id: 5,
          updated_at: '2026-01-15T10:00:00',
          days_in_stage: 10,
          status: 'pending_review',
          stage: 'pending_review',
          assigned_level: '—',
        },
      ]);
    });
    
    test('should transform multiple items correctly', () => {
      const raw = [
        {
          subcase_id: 123,
          target_org_unit_id: 5,
          updated_at: '2026-01-15T10:00:00',
          days_in_stage: 10,
          status: 'pending_review',
        },
        {
          subcase_id: 456,
          target_org_unit_id: 3,
          updated_at: '2026-01-10T14:30:00',
          days_in_stage: 15,
          status: 'submitted',
        },
      ];
      const result = adaptStuckCases(raw);
      expect(result).toEqual([
        {
          subcase_id: 123,
          target_org_unit_id: 5,
          updated_at: '2026-01-15T10:00:00',
          days_in_stage: 10,
          status: 'pending_review',
          stage: 'pending_review',
          assigned_level: '—',
        },
        {
          subcase_id: 456,
          target_org_unit_id: 3,
          updated_at: '2026-01-10T14:30:00',
          days_in_stage: 15,
          status: 'submitted',
          stage: 'submitted',
          assigned_level: '—',
        },
      ]);
    });
    
    test('should preserve all backend fields', () => {
      const raw = [
        {
          subcase_id: 999,
          target_org_unit_id: 7,
          updated_at: '2026-02-01T09:00:00',
          days_in_stage: 5,
          status: 'escalated',
        },
      ];
      const result = adaptStuckCases(raw);
      
      // Check all fields are present
      expect(result[0]).toHaveProperty('subcase_id', 999);
      expect(result[0]).toHaveProperty('target_org_unit_id', 7);
      expect(result[0]).toHaveProperty('updated_at', '2026-02-01T09:00:00');
      expect(result[0]).toHaveProperty('days_in_stage', 5);
      expect(result[0]).toHaveProperty('status', 'escalated');
      expect(result[0]).toHaveProperty('stage', 'escalated');
      expect(result[0]).toHaveProperty('assigned_level', '—');
    });
  });

  describe('Derived Fields', () => {
    test('should set stage to equal status', () => {
      const raw = [
        { subcase_id: 1, status: 'pending_review', days_in_stage: 5 },
        { subcase_id: 2, status: 'submitted', days_in_stage: 3 },
        { subcase_id: 3, status: 'escalated', days_in_stage: 10 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].stage).toBe('pending_review');
      expect(result[1].stage).toBe('submitted');
      expect(result[2].stage).toBe('escalated');
    });
    
    test('should set assigned_level to placeholder', () => {
      const raw = [
        { subcase_id: 1, status: 'pending_review', days_in_stage: 5 },
        { subcase_id: 2, status: 'submitted', days_in_stage: 3 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].assigned_level).toBe('—');
      expect(result[1].assigned_level).toBe('—');
    });
    
    test('should handle undefined status', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: 5 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].status).toBeUndefined();
      expect(result[0].stage).toBeUndefined();
    });
    
    test('should handle null status', () => {
      const raw = [
        { subcase_id: 1, status: null, days_in_stage: 5 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].status).toBeNull();
      expect(result[0].stage).toBeNull();
    });
  });

  describe('Type Coercion', () => {
    test('should coerce days_in_stage to number', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: '10', status: 'pending' },
        { subcase_id: 2, days_in_stage: '15.5', status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(10);
      expect(result[1].days_in_stage).toBe(15.5);
    });
    
    test('should handle missing days_in_stage field', () => {
      const raw = [
        { subcase_id: 1, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(0);
    });
    
    test('should handle null days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: null, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(0);
    });
    
    test('should handle undefined days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: undefined, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(0);
    });
    
    test('should handle invalid days_in_stage strings', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: 'abc', status: 'pending' },
        { subcase_id: 2, days_in_stage: 'NaN', status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(0);
      expect(result[1].days_in_stage).toBe(0);
    });
  });

  describe('Null/Undefined Row Handling', () => {
    test('should skip null rows', () => {
      const raw = [
        { subcase_id: 1, status: 'pending', days_in_stage: 5 },
        null,
        { subcase_id: 2, status: 'submitted', days_in_stage: 3 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result).toHaveLength(2);
      expect(result[0].subcase_id).toBe(1);
      expect(result[1].subcase_id).toBe(2);
    });
    
    test('should skip undefined rows', () => {
      const raw = [
        { subcase_id: 1, status: 'pending', days_in_stage: 5 },
        undefined,
        { subcase_id: 2, status: 'submitted', days_in_stage: 3 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result).toHaveLength(2);
      expect(result[0].subcase_id).toBe(1);
      expect(result[1].subcase_id).toBe(2);
    });
    
    test('should handle array with only null values', () => {
      const raw = [null, null, null];
      const result = adaptStuckCases(raw);
      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: 0, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(0);
    });
    
    test('should handle negative days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: -5, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(-5);
    });
    
    test('should handle decimal days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: 7.5, status: 'pending' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(7.5);
    });
    
    test('should handle very large days_in_stage', () => {
      const raw = [
        { subcase_id: 1, days_in_stage: 999999, status: 'stuck' },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].days_in_stage).toBe(999999);
    });
    
    test('should handle empty string status', () => {
      const raw = [
        { subcase_id: 1, status: '', days_in_stage: 5 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].status).toBe('');
      expect(result[0].stage).toBe('');
    });
    
    test('should preserve datetime format in updated_at', () => {
      const raw = [
        { subcase_id: 1, updated_at: '2026-01-15T10:30:45.123Z', status: 'pending', days_in_stage: 5 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].updated_at).toBe('2026-01-15T10:30:45.123Z');
    });
    
    test('should handle missing optional fields', () => {
      const raw = [
        { subcase_id: 1 },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0].subcase_id).toBe(1);
      expect(result[0].target_org_unit_id).toBeUndefined();
      expect(result[0].updated_at).toBeUndefined();
      expect(result[0].days_in_stage).toBe(0);
      expect(result[0].status).toBeUndefined();
      expect(result[0].stage).toBeUndefined();
      expect(result[0].assigned_level).toBe('—');
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic backend response', () => {
      const raw = [
        {
          subcase_id: 123,
          target_org_unit_id: 5,
          updated_at: '2026-01-15T10:00:00',
          days_in_stage: 10,
          status: 'SECTION_ACCEPTED_PENDING_DEPT',
        },
        {
          subcase_id: 456,
          target_org_unit_id: 3,
          updated_at: '2026-01-10T14:30:00',
          days_in_stage: 15,
          status: 'DEPT_ACCEPTED_PENDING_ADMIN',
        },
        {
          subcase_id: 789,
          target_org_unit_id: 8,
          updated_at: '2026-01-05T09:15:00',
          days_in_stage: 20,
          status: 'SUBMITTED',
        },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        subcase_id: 123,
        target_org_unit_id: 5,
        updated_at: '2026-01-15T10:00:00',
        days_in_stage: 10,
        status: 'SECTION_ACCEPTED_PENDING_DEPT',
        stage: 'SECTION_ACCEPTED_PENDING_DEPT',
        assigned_level: '—',
      });
    });
    
    test('should handle response with mixed valid and invalid data', () => {
      const raw = [
        { subcase_id: 1, status: 'pending', days_in_stage: 10 },
        null,
        { subcase_id: 2, status: 'submitted', days_in_stage: '15' },
        undefined,
        { subcase_id: 3 },
        { subcase_id: 4, days_in_stage: 'invalid', status: null },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result).toHaveLength(4);
      expect(result[0].subcase_id).toBe(1);
      expect(result[1].subcase_id).toBe(2);
      expect(result[1].days_in_stage).toBe(15);
      expect(result[2].subcase_id).toBe(3);
      expect(result[2].days_in_stage).toBe(0);
      expect(result[3].subcase_id).toBe(4);
      expect(result[3].days_in_stage).toBe(0);
    });
    
    test('should handle complete records with all fields', () => {
      const raw = [
        {
          subcase_id: 999,
          target_org_unit_id: 42,
          updated_at: '2026-02-03T12:00:00Z',
          days_in_stage: 7,
          status: 'ESCALATED',
        },
      ];
      const result = adaptStuckCases(raw);
      
      expect(result[0]).toMatchObject({
        subcase_id: 999,
        target_org_unit_id: 42,
        updated_at: '2026-02-03T12:00:00Z',
        days_in_stage: 7,
        status: 'ESCALATED',
        stage: 'ESCALATED',
        assigned_level: '—',
      });
    });
  });
});

describe('insightApi - buildTrendRequest', () => {
  describe('Valid Request Building', () => {
    test('should map interval to bucket', () => {
      const params = {
        interval: 'month',
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'month' });
    });
    
    test('should ignore entity field', () => {
      const params = {
        entity: 'subcase',
        interval: 'week',
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'week' });
      expect(result).not.toHaveProperty('entity');
    });
    
    test('should ignore filter fields', () => {
      const params = {
        interval: 'day',
        org_unit_id: 5,
        status: 'pending',
        date_from: '2026-01-01',
        date_to: '2026-01-31',
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'day' });
      expect(result).not.toHaveProperty('org_unit_id');
      expect(result).not.toHaveProperty('status');
      expect(result).not.toHaveProperty('date_from');
      expect(result).not.toHaveProperty('date_to');
    });
    
    test('should ignore all extra fields', () => {
      const params = {
        interval: 'year',
        entity: 'incident',
        org_unit_id: 10,
        custom_field: 'value',
        another_filter: 123,
        nested: { field: 'test' },
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'year' });
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe('Interval Value Handling', () => {
    test('should handle interval as string', () => {
      const params = { interval: 'month' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('month');
    });
    
    test('should preserve interval value exactly', () => {
      const params = { interval: 'custom_interval' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('custom_interval');
    });
    
    test('should handle different interval values', () => {
      const intervals = ['day', 'week', 'month', 'quarter', 'year'];
      
      intervals.forEach(interval => {
        const params = { interval };
        const result = buildTrendRequest(params);
        expect(result.bucket).toBe(interval);
      });
    });
    
    test('should handle interval with special characters', () => {
      const params = { interval: 'week_of_year' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('week_of_year');
    });
    
    test('should handle empty string interval', () => {
      const params = { interval: '' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('');
    });
  });

  describe('Error Handling - Missing Interval', () => {
    test('should throw error when interval is missing', () => {
      const params = {
        entity: 'subcase',
        org_unit_id: 5,
      };
      
      expect(() => buildTrendRequest(params)).toThrow('interval required');
    });
    
    test('should throw error when interval is null', () => {
      const params = {
        interval: null,
      };
      
      expect(() => buildTrendRequest(params)).toThrow('interval required');
    });
    
    test('should throw error when interval is undefined', () => {
      const params = {
        interval: undefined,
      };
      
      expect(() => buildTrendRequest(params)).toThrow('interval required');
    });
    
    test('should throw error when params is null', () => {
      expect(() => buildTrendRequest(null)).toThrow('interval required');
    });
    
    test('should throw error when params is undefined', () => {
      expect(() => buildTrendRequest(undefined)).toThrow('interval required');
    });
    
    test('should throw error when params is empty object', () => {
      expect(() => buildTrendRequest({})).toThrow('interval required');
    });
  });

  describe('Edge Cases', () => {
    test('should handle numeric interval', () => {
      const params = { interval: 30 };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe(30);
    });
    
    test('should handle boolean interval', () => {
      const params = { interval: true };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe(true);
    });
    
    test('should NOT throw for falsy but defined interval values', () => {
      // Empty string is falsy but valid
      const params1 = { interval: '' };
      expect(() => buildTrendRequest(params1)).not.toThrow();
      
      // Zero is falsy but valid
      const params2 = { interval: 0 };
      expect(() => buildTrendRequest(params2)).not.toThrow();
      
      // False is falsy but valid
      const params3 = { interval: false };
      expect(() => buildTrendRequest(params3)).not.toThrow();
    });
    
    test('should handle interval with whitespace', () => {
      const params = { interval: '  month  ' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('  month  ');
    });
    
    test('should not mutate input params', () => {
      const params = {
        interval: 'month',
        entity: 'subcase',
        extra: 'field',
      };
      const paramsCopy = { ...params };
      
      buildTrendRequest(params);
      
      expect(params).toEqual(paramsCopy);
    });
    
    test('should handle uppercase interval', () => {
      const params = { interval: 'MONTH' };
      const result = buildTrendRequest(params);
      
      expect(result.bucket).toBe('MONTH');
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic frontend call with all filters', () => {
      const params = {
        entity: 'subcase',
        interval: 'month',
        org_unit_id: 5,
        status: 'pending_review',
        date_from: '2026-01-01',
        date_to: '2026-01-31',
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'month' });
    });
    
    test('should handle minimal valid request', () => {
      const params = { interval: 'week' };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'week' });
    });
    
    test('should handle request with many extra fields', () => {
      const params = {
        interval: 'day',
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        field5: 'value5',
      };
      const result = buildTrendRequest(params);
      
      expect(result).toEqual({ bucket: 'day' });
      expect(Object.keys(result)).toEqual(['bucket']);
    });
    
    test('should correctly map interval to bucket in various scenarios', () => {
      const testCases = [
        { interval: 'day', expected: 'day' },
        { interval: 'week', expected: 'week' },
        { interval: 'month', expected: 'month' },
        { interval: 'quarter', expected: 'quarter' },
        { interval: 'year', expected: 'year' },
      ];
      
      testCases.forEach(({ interval, expected }) => {
        const params = { interval };
        const result = buildTrendRequest(params);
        expect(result.bucket).toBe(expected);
      });
    });
  });
});

describe('insightApi - buildStuckQuery', () => {
  describe('Default Value Handling', () => {
    test('should return default days_threshold of 7 when no argument provided', () => {
      const result = buildStuckQuery();
      
      expect(result).toEqual({ days_threshold: 7 });
    });
    
    test('should return default days_threshold of 7 when undefined provided', () => {
      const result = buildStuckQuery(undefined);
      
      expect(result).toEqual({ days_threshold: 7 });
    });
    
    test('should return default days_threshold of 7 when null provided', () => {
      const result = buildStuckQuery(null);
      
      expect(result).toEqual({ days_threshold: 7 });
    });
  });

  describe('Valid Value Handling', () => {
    test('should use provided value when valid number given', () => {
      const result = buildStuckQuery(14);
      
      expect(result).toEqual({ days_threshold: 14 });
    });
    
    test('should accept zero as valid value', () => {
      const result = buildStuckQuery(0);
      
      expect(result).toEqual({ days_threshold: 0 });
    });
    
    test('should accept negative numbers', () => {
      const result = buildStuckQuery(-5);
      
      expect(result).toEqual({ days_threshold: -5 });
    });
    
    test('should accept decimal numbers', () => {
      const result = buildStuckQuery(7.5);
      
      expect(result).toEqual({ days_threshold: 7.5 });
    });
    
    test('should accept very large numbers', () => {
      const result = buildStuckQuery(999999);
      
      expect(result).toEqual({ days_threshold: 999999 });
    });
    
    test('should accept 1 as valid value', () => {
      const result = buildStuckQuery(1);
      
      expect(result).toEqual({ days_threshold: 1 });
    });
  });

  describe('Type Coercion Handling', () => {
    test('should accept string numbers', () => {
      const result = buildStuckQuery('14');
      
      expect(result).toEqual({ days_threshold: '14' });
    });
    
    test('should accept empty string (falsy but defined)', () => {
      const result = buildStuckQuery('');
      
      expect(result).toEqual({ days_threshold: '' });
    });
    
    test('should accept boolean false', () => {
      const result = buildStuckQuery(false);
      
      expect(result).toEqual({ days_threshold: false });
    });
    
    test('should accept boolean true', () => {
      const result = buildStuckQuery(true);
      
      expect(result).toEqual({ days_threshold: true });
    });
  });

  describe('Return Structure', () => {
    test('should return object with only days_threshold property', () => {
      const result = buildStuckQuery(10);
      
      expect(Object.keys(result)).toEqual(['days_threshold']);
    });
    
    test('should return new object each time (not cached)', () => {
      const result1 = buildStuckQuery(7);
      const result2 = buildStuckQuery(7);
      
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('Common Use Cases', () => {
    test('should handle default 7-day threshold', () => {
      const result = buildStuckQuery();
      
      expect(result.days_threshold).toBe(7);
    });
    
    test('should handle 14-day threshold', () => {
      const result = buildStuckQuery(14);
      
      expect(result.days_threshold).toBe(14);
    });
    
    test('should handle 30-day threshold', () => {
      const result = buildStuckQuery(30);
      
      expect(result.days_threshold).toBe(30);
    });
    
    test('should handle 3-day threshold', () => {
      const result = buildStuckQuery(3);
      
      expect(result.days_threshold).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle NaN', () => {
      const result = buildStuckQuery(NaN);
      
      expect(result.days_threshold).toBeNaN();
    });
    
    test('should handle Infinity', () => {
      const result = buildStuckQuery(Infinity);
      
      expect(result.days_threshold).toBe(Infinity);
    });
    
    test('should handle negative Infinity', () => {
      const result = buildStuckQuery(-Infinity);
      
      expect(result.days_threshold).toBe(-Infinity);
    });
    
    test('should handle object as input', () => {
      const result = buildStuckQuery({ days: 10 });
      
      expect(result.days_threshold).toEqual({ days: 10 });
    });
    
    test('should handle array as input', () => {
      const result = buildStuckQuery([7]);
      
      expect(result.days_threshold).toEqual([7]);
    });
  });

  describe('Integration Tests', () => {
    test('should work with realistic default scenario', () => {
      // Frontend calls without specifying days
      const result = buildStuckQuery();
      
      expect(result).toEqual({ days_threshold: 7 });
    });
    
    test('should work with user-specified threshold', () => {
      // User selects custom threshold from UI
      const userSelection = 21;
      const result = buildStuckQuery(userSelection);
      
      expect(result).toEqual({ days_threshold: 21 });
    });
    
    test('should handle various threshold scenarios', () => {
      const testCases = [
        { input: undefined, expected: 7 },
        { input: null, expected: 7 },
        { input: 3, expected: 3 },
        { input: 7, expected: 7 },
        { input: 14, expected: 14 },
        { input: 30, expected: 30 },
        { input: 60, expected: 60 },
        { input: 90, expected: 90 },
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = buildStuckQuery(input);
        expect(result.days_threshold).toBe(expected);
      });
    });
  });
});

describe('insightApi - buildDistributionRequest', () => {
  describe('Phase 4C Safe Mode - Filter Stripping', () => {
    test('should extract only dimension field', () => {
      const params = {
        dimension: 'status',
        entity: 'subcase',
        org_unit_id: 5,
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'status' });
      expect(Object.keys(result)).toEqual(['dimension']);
    });

    test('should strip all filter fields (org_unit_id, status, date_from, date_to)', () => {
      const params = {
        dimension: 'stage',
        org_unit_id: 10,
        status: 'DRAFT',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'stage' });
      expect(result.org_unit_id).toBeUndefined();
      expect(result.status).toBeUndefined();
      expect(result.date_from).toBeUndefined();
      expect(result.date_to).toBeUndefined();
    });

    test('should strip entity field', () => {
      const params = {
        dimension: 'assigned_level',
        entity: 'subcase',
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'assigned_level' });
      expect(result.entity).toBeUndefined();
    });

    test('should strip arbitrary extra fields', () => {
      const params = {
        dimension: 'status',
        extra_field_1: 'value1',
        extra_field_2: 'value2',
        filter_xyz: 'filter_value',
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'status' });
      expect(Object.keys(result)).toEqual(['dimension']);
    });
  });

  describe('Valid Dimension Handling', () => {
    test('should accept string dimension', () => {
      const params = { dimension: 'status' };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'status' });
    });

    test('should preserve dimension value exactly', () => {
      const params = { dimension: 'custom_dimension_123' };
      const result = buildDistributionRequest(params);
      
      expect(result.dimension).toBe('custom_dimension_123');
    });

    test('should handle different dimension values', () => {
      const testCases = ['status', 'stage', 'assigned_level', 'priority'];
      
      testCases.forEach(dimension => {
        const params = { dimension };
        const result = buildDistributionRequest(params);
        expect(result.dimension).toBe(dimension);
      });
    });
  });

  describe('Error Handling - Missing Dimension', () => {
    test('should throw error when dimension is missing', () => {
      const params = { entity: 'subcase' };
      
      expect(() => buildDistributionRequest(params)).toThrow('dimension required');
    });

    test('should throw error when dimension is null', () => {
      const params = { dimension: null };
      
      expect(() => buildDistributionRequest(params)).toThrow('dimension required');
    });

    test('should throw error when dimension is undefined', () => {
      const params = { dimension: undefined };
      
      expect(() => buildDistributionRequest(params)).toThrow('dimension required');
    });

    test('should throw error when params is null', () => {
      expect(() => buildDistributionRequest(null)).toThrow('dimension required');
    });

    test('should throw error when params is undefined', () => {
      expect(() => buildDistributionRequest(undefined)).toThrow('dimension required');
    });

    test('should throw error when params is empty object', () => {
      expect(() => buildDistributionRequest({})).toThrow('dimension required');
    });
  });

  describe('Edge Cases', () => {
    test('should accept empty string dimension', () => {
      const params = { dimension: '' };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: '' });
    });

    test('should accept numeric dimension', () => {
      const params = { dimension: 123 };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 123 });
    });

    test('should not mutate input params', () => {
      const params = {
        dimension: 'status',
        entity: 'subcase',
        extra: 'field',
      };
      const paramsCopy = { ...params };
      
      buildDistributionRequest(params);
      
      expect(params).toEqual(paramsCopy);
    });

    test('should handle dimension with special characters', () => {
      const params = { dimension: 'status-level_v2' };
      const result = buildDistributionRequest(params);
      
      expect(result.dimension).toBe('status-level_v2');
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic frontend call with all filters', () => {
      const params = {
        entity: 'subcase',
        dimension: 'status',
        org_unit_id: 5,
        status: 'DRAFT',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'status' });
    });

    test('should handle minimal valid request', () => {
      const params = { dimension: 'stage' };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'stage' });
    });

    test('should handle request with many extra fields', () => {
      const params = {
        dimension: 'assigned_level',
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        field5: 'value5',
      };
      const result = buildDistributionRequest(params);
      
      expect(result).toEqual({ dimension: 'assigned_level' });
      expect(Object.keys(result)).toEqual(['dimension']);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS - Exported API Functions
// ============================================================================

describe('insightApi - getInsightKpis (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Response', () => {
    test('should call API and return adapted KPI data', async () => {
      const mockResponse = {
        data: {
          total_subcases: 100,
          by_status: [
            { status: 'DRAFT', count: 30 },
            { status: 'SECTION_REVIEW', count: 20 },
            { status: 'ADMIN_APPROVED', count: 50 },
          ],
          action_items: {
            total: 25,
            open: 15,
            completed: 10,
            overdue: 5,
          },
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await getInsightKpis();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/kpi-summary');
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        open_subcases: 50, // 30 + 20 (excluding ADMIN_APPROVED)
        pending_approvals: 0,
        active_action_items: 15,
        overdue_items: 5,
      });
    });

    test('should handle empty backend response', async () => {
      apiClient.get.mockResolvedValue({ data: null });

      const result = await getInsightKpis();

      expect(result).toEqual({
        open_subcases: 0,
        pending_approvals: 0,
        active_action_items: 0,
        overdue_items: 0,
      });
    });

    test('should apply adaptKpiSummary transformation', async () => {
      const mockResponse = {
        data: {
          by_status: [
            { status: 'SECTION_ACCEPTED_PENDING_DEPT', count: '5' },
            { status: 'DEPT_ACCEPTED_PENDING_ADMIN', count: '3' },
          ],
          action_items: {
            open: '10',
            overdue: '2',
          },
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await getInsightKpis();

      expect(result.pending_approvals).toBe(8); // 5 + 3
      expect(result.active_action_items).toBe(10);
      expect(result.overdue_items).toBe(2);
    });
  });

  describe('Error Handling', () => {
    test('should throw error with backend detail message', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Unauthorized access to KPI data',
          },
        },
      };

      apiClient.get.mockRejectedValue(mockError);

      await expect(getInsightKpis()).rejects.toThrow('Unauthorized access to KPI data');
    });

    test('should throw default error message when no detail provided', async () => {
      const mockError = {
        response: {
          data: {},
        },
      };

      apiClient.get.mockRejectedValue(mockError);

      await expect(getInsightKpis()).rejects.toThrow('Failed to load KPI summary');
    });

    test('should handle network errors', async () => {
      apiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(getInsightKpis()).rejects.toThrow('Failed to load KPI summary');
    });
  });
});

describe('insightApi - getInsightDistribution (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Response', () => {
    test('should call API with normalized payload and return adapted data', async () => {
      const inputParams = {
        entity: 'subcase',
        dimension: 'status',
        org_unit_id: 5,
        date_from: '2024-01-01',
      };

      const mockResponse = {
        data: [
          { key: 'DRAFT', count: 30 },
          { key: 'IN_REVIEW', count: 20 },
          { key: 'APPROVED', count: 50 },
        ],
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await getInsightDistribution(inputParams);

      // Should send only dimension field
      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/insight/distribution', {
        dimension: 'status',
      });
      expect(apiClient.post).toHaveBeenCalledTimes(1);

      // Should return adapted data
      expect(result).toEqual([
        { label: 'DRAFT', value: 30 },
        { label: 'IN_REVIEW', value: 20 },
        { label: 'APPROVED', value: 50 },
      ]);
    });

    test('should handle empty array response', async () => {
      apiClient.post.mockResolvedValue({ data: [] });

      const result = await getInsightDistribution({ dimension: 'status' });

      expect(result).toEqual([]);
    });

    test('should apply adaptDistribution transformation', async () => {
      const mockResponse = {
        data: [
          { key: 'Status A', count: '10' },
          { key: 'Status B', count: 25 },
          null,
          { key: 'Status C', count: null },
        ],
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await getInsightDistribution({ dimension: 'status' });

      expect(result).toEqual([
        { label: 'Status A', value: 10 },
        { label: 'Status B', value: 25 },
        { label: 'Status C', value: 0 },
      ]);
    });
  });

  describe('Request Building', () => {
    test('should throw error when dimension is missing', async () => {
      // buildDistributionRequest will throw, which gets caught and re-wrapped
      await expect(
        getInsightDistribution({ entity: 'subcase' })
      ).rejects.toThrow('Failed to load distribution data');

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should extract only dimension field from params', async () => {
      apiClient.post.mockResolvedValue({ data: [] });

      await getInsightDistribution({
        dimension: 'stage',
        extra_field_1: 'value1',
        extra_field_2: 'value2',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/insight/distribution', {
        dimension: 'stage',
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error with backend detail message', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid dimension parameter',
          },
        },
      };

      apiClient.post.mockRejectedValue(mockError);

      await expect(
        getInsightDistribution({ dimension: 'status' })
      ).rejects.toThrow('Invalid dimension parameter');
    });

    test('should throw default error message when no detail provided', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(
        getInsightDistribution({ dimension: 'status' })
      ).rejects.toThrow('Failed to load distribution data');
    });
  });
});

describe('insightApi - getInsightTrend (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Response', () => {
    test('should call API with normalized payload and return adapted data', async () => {
      const inputParams = {
        entity: 'subcase',
        interval: 'month',
        org_unit_id: 5,
        status: 'DRAFT',
      };

      const mockResponse = {
        data: [
          { bucket: '2024-01', count: 10 },
          { bucket: '2024-02', count: 15 },
          { bucket: '2024-03', count: 20 },
        ],
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await getInsightTrend(inputParams);

      // Should send only bucket field (mapped from interval)
      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/insight/trend', {
        bucket: 'month',
      });
      expect(apiClient.post).toHaveBeenCalledTimes(1);

      // Should return adapted data
      expect(result).toEqual([
        { period: '2024-01', count: 10 },
        { period: '2024-02', count: 15 },
        { period: '2024-03', count: 20 },
      ]);
    });

    test('should handle empty array response', async () => {
      apiClient.post.mockResolvedValue({ data: [] });

      const result = await getInsightTrend({ interval: 'day' });

      expect(result).toEqual([]);
    });

    test('should apply adaptTrend transformation', async () => {
      const mockResponse = {
        data: [
          { bucket: '2024-W01', count: '5' },
          { bucket: '2024-W02', count: 10 },
          null,
          { bucket: '2024-W03', count: null },
        ],
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await getInsightTrend({ interval: 'week' });

      expect(result).toEqual([
        { period: '2024-W01', count: 5 },
        { period: '2024-W02', count: 10 },
        { period: '2024-W03', count: 0 },
      ]);
    });
  });

  describe('Request Building', () => {
    test('should throw error when interval is missing', async () => {
      // buildTrendRequest will throw, which gets caught and re-wrapped
      await expect(
        getInsightTrend({ entity: 'subcase' })
      ).rejects.toThrow('Failed to load trend data');

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should map interval to bucket', async () => {
      apiClient.post.mockResolvedValue({ data: [] });

      await getInsightTrend({ interval: 'quarter' });

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/insight/trend', {
        bucket: 'quarter',
      });
    });

    test('should extract only interval field from params', async () => {
      apiClient.post.mockResolvedValue({ data: [] });

      await getInsightTrend({
        interval: 'day',
        extra_field_1: 'value1',
        extra_field_2: 'value2',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/v2/insight/trend', {
        bucket: 'day',
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error with backend detail message', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid interval parameter',
          },
        },
      };

      apiClient.post.mockRejectedValue(mockError);

      await expect(
        getInsightTrend({ interval: 'month' })
      ).rejects.toThrow('Invalid interval parameter');
    });

    test('should throw default error message when no detail provided', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(
        getInsightTrend({ interval: 'month' })
      ).rejects.toThrow('Failed to load trend data');
    });
  });
});

describe('insightApi - getStuckCases (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Response', () => {
    test('should call API with default days_threshold and return adapted data', async () => {
      const mockResponse = {
        data: [
          {
            subcase_id: 1001,
            target_org_unit_id: 5,
            updated_at: '2024-01-15T10:30:00Z',
            days_in_stage: 10,
            status: 'SECTION_REVIEW',
          },
          {
            subcase_id: 1002,
            target_org_unit_id: 3,
            updated_at: '2024-01-10T08:00:00Z',
            days_in_stage: 15,
            status: 'DEPT_REVIEW',
          },
        ],
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await getStuckCases();

      // Should send default days_threshold of 7
      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 7 },
      });
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Should return adapted data with derived fields
      expect(result).toEqual([
        {
          subcase_id: 1001,
          target_org_unit_id: 5,
          updated_at: '2024-01-15T10:30:00Z',
          days_in_stage: 10,
          status: 'SECTION_REVIEW',
          stage: 'SECTION_REVIEW',
          assigned_level: '—',
        },
        {
          subcase_id: 1002,
          target_org_unit_id: 3,
          updated_at: '2024-01-10T08:00:00Z',
          days_in_stage: 15,
          status: 'DEPT_REVIEW',
          stage: 'DEPT_REVIEW',
          assigned_level: '—',
        },
      ]);
    });

    test('should call API with custom days_threshold', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases(14);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 14 },
      });
    });

    test('should handle empty array response', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getStuckCases();

      expect(result).toEqual([]);
    });

    test('should apply adaptStuckCases transformation', async () => {
      const mockResponse = {
        data: [
          {
            subcase_id: 2001,
            status: 'STUCK_STATUS',
            days_in_stage: '20',
          },
          null,
          {
            subcase_id: 2002,
            status: 'ANOTHER_STATUS',
            days_in_stage: null,
          },
        ],
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await getStuckCases(30);

      expect(result).toEqual([
        {
          subcase_id: 2001,
          target_org_unit_id: undefined,
          updated_at: undefined,
          days_in_stage: 20,
          status: 'STUCK_STATUS',
          stage: 'STUCK_STATUS',
          assigned_level: '—',
        },
        {
          subcase_id: 2002,
          target_org_unit_id: undefined,
          updated_at: undefined,
          days_in_stage: 0,
          status: 'ANOTHER_STATUS',
          stage: 'ANOTHER_STATUS',
          assigned_level: '—',
        },
      ]);
    });
  });

  describe('Query Building', () => {
    test('should use default 7 when no parameter provided', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 7 },
      });
    });

    test('should use default 7 when null provided', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases(null);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 7 },
      });
    });

    test('should use default 7 when undefined provided', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases(undefined);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 7 },
      });
    });

    test('should accept custom threshold values', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases(21);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 21 },
      });
    });

    test('should accept zero as valid threshold', async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      await getStuckCases(0);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/insight/stuck', {
        params: { days_threshold: 0 },
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error with backend detail message', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Unauthorized access to stuck cases',
          },
        },
      };

      apiClient.get.mockRejectedValue(mockError);

      await expect(getStuckCases()).rejects.toThrow('Unauthorized access to stuck cases');
    });

    test('should throw default error message when no detail provided', async () => {
      apiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(getStuckCases()).rejects.toThrow('Failed to load stuck cases');
    });
  });
});
