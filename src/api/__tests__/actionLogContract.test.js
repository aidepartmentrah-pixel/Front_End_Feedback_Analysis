// PHASE F — F-I1 — Frontend Contract Verification Test
// src/api/__tests__/actionLogContract.test.js

/**
 * Phase F contract certification test.
 * 
 * Verifies that the frontend exportActionLog wrapper correctly matches
 * the backend API v2 export endpoint contract:
 * - Correct endpoint path
 * - Correct query parameter naming
 * - Correct response type configuration
 * - No response transformation
 */

import apiClient from '../apiClient';
import { exportActionLog } from '../actionLogApi';

// Mock apiClient
jest.mock('../apiClient');

describe('Action Log API Contract Verification (F-I1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // TEST 1 — Uses correct path
  // ==========================================
  test('calls correct API v2 endpoint path', async () => {
    const mockBlob = new Blob(['fake docx'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    apiClient.get.mockResolvedValue({
      data: mockBlob,
      status: 200,
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'content-disposition': 'attachment; filename="action_log.docx"',
      },
    });

    await exportActionLog(1);

    // Verify endpoint path matches backend contract
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v2/action-log/export',
      expect.any(Object)
    );
  });

  // ==========================================
  // TEST 2 — Uses correct query param
  // ==========================================
  test('uses correct query parameter name (season_id)', async () => {
    const mockBlob = new Blob(['fake docx']);

    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    const testSeasonId = 42;
    await exportActionLog(testSeasonId);

    // Verify query param name matches backend contract
    const callArgs = apiClient.get.mock.calls[0];
    const config = callArgs[1];

    expect(config.params).toBeDefined();
    expect(config.params.season_id).toBe(testSeasonId);
  });

  // ==========================================
  // TEST 3 — Uses blob responseType
  // ==========================================
  test('configures blob responseType for binary document', async () => {
    const mockBlob = new Blob(['fake docx']);

    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    await exportActionLog(1);

    // Verify responseType configured for binary content
    const callArgs = apiClient.get.mock.calls[0];
    const config = callArgs[1];

    expect(config.responseType).toBe('blob');
  });

  // ==========================================
  // TEST 4 — Does not transform response
  // ==========================================
  test('returns raw response.data without transformation', async () => {
    const mockBlob = new Blob(['fake docx content'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    apiClient.get.mockResolvedValue({
      data: mockBlob,
      status: 200,
    });

    const result = await exportActionLog(1);

    // Verify returned value is exactly response.data (no transformation)
    expect(result).toBe(mockBlob);
    expect(result).toBeInstanceOf(Blob);
  });

  // ==========================================
  // TEST 5 — No JSON parsing attempted
  // ==========================================
  test('does not attempt JSON parsing on blob response', async () => {
    const mockBlob = new Blob(['binary docx content'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // If JSON parsing were attempted on blob, it would fail
    // This test verifies wrapper returns blob directly
    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    const result = await exportActionLog(1);

    // Should return blob directly, not attempt to parse as JSON
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Blob should not be a plain object (which would indicate JSON parsing)
    expect(result.constructor.name).toBe('Blob');
    expect(Array.isArray(result)).toBe(false);
  });

  // ==========================================
  // TEST 6 — Accepts numeric and string season IDs
  // ==========================================
  test('accepts both numeric and string season IDs', async () => {
    const mockBlob = new Blob(['fake docx']);

    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    // Test numeric ID
    await exportActionLog(123);
    expect(apiClient.get.mock.calls[0][1].params.season_id).toBe(123);

    // Test string ID
    await exportActionLog('456');
    expect(apiClient.get.mock.calls[1][1].params.season_id).toBe('456');
  });

  // ==========================================
  // TEST 7 — Complete contract verification
  // ==========================================
  test('complete contract verification (path + params + responseType)', async () => {
    const mockBlob = new Blob(['complete test'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    apiClient.get.mockResolvedValue({
      data: mockBlob,
      status: 200,
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'content-disposition': 'attachment; filename="action_log.docx"',
      },
    });

    const seasonId = 99;
    const result = await exportActionLog(seasonId);

    // Verify all contract requirements in one test
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v2/action-log/export',
      {
        params: { season_id: seasonId },
        responseType: 'blob',
      }
    );

    expect(result).toBe(mockBlob);
    expect(result).toBeInstanceOf(Blob);
  });

  // ==========================================
  // TEST 8 — Error propagation
  // ==========================================
  test('propagates API errors without transformation', async () => {
    const mockError = new Error('Backend error');
    mockError.response = {
      status: 500,
      data: { error: 'Internal server error' },
    };

    apiClient.get.mockRejectedValue(mockError);

    // Verify error is propagated without modification
    await expect(exportActionLog(1)).rejects.toThrow('Backend error');
  });

  // ==========================================
  // TEST 9 — No additional headers injected
  // ==========================================
  test('does not inject additional headers beyond apiClient defaults', async () => {
    const mockBlob = new Blob(['fake docx']);

    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    await exportActionLog(1);

    const callArgs = apiClient.get.mock.calls[0];
    const config = callArgs[1];

    // Should only have params and responseType, no custom headers
    expect(Object.keys(config)).toEqual(['params', 'responseType']);
  });

  // ==========================================
  // TEST 10 — Blob MIME type verification
  // ==========================================
  test('preserves Word document MIME type in returned blob', async () => {
    const correctMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const mockBlob = new Blob(['docx content'], { type: correctMimeType });

    apiClient.get.mockResolvedValue({
      data: mockBlob,
    });

    const result = await exportActionLog(1);

    // Verify MIME type is preserved for Word document
    expect(result.type).toBe(correctMimeType);
  });
});
