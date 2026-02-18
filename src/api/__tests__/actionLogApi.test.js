// PHASE F — F-F1 — Action Log Export API Wrapper Tests
// src/api/__tests__/actionLogApi.test.js

import { exportActionLog } from "../actionLogApi";
import apiClient from "../apiClient";

// Mock apiClient
jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe("Action Log API - F-F1 Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs in tests
  });

  describe("exportActionLog", () => {
    test("calls correct endpoint with season_id param and blob responseType", async () => {
      const fakeBlob = new Blob(["fake docx content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      apiClient.get.mockResolvedValue({ data: fakeBlob });

      await exportActionLog(5);

      expect(apiClient.get).toHaveBeenCalledWith("/api/v2/action-log/export", {
        params: { season_id: 5 },
        responseType: "blob",
      });
    });

    test("returns blob data from response", async () => {
      const fakeBlob = new Blob(["fake docx content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      apiClient.get.mockResolvedValue({ data: fakeBlob });

      const result = await exportActionLog(5);

      expect(result).toBe(fakeBlob);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Network error");
      apiClient.get.mockRejectedValue(mockError);

      await expect(exportActionLog(5)).rejects.toThrow("Network error");
    });

    test("works with string season_id", async () => {
      const fakeBlob = new Blob(["fake docx content"]);
      apiClient.get.mockResolvedValue({ data: fakeBlob });

      await exportActionLog("10");

      expect(apiClient.get).toHaveBeenCalledWith("/api/v2/action-log/export", {
        params: { season_id: "10" },
        responseType: "blob",
      });
    });
  });
});
