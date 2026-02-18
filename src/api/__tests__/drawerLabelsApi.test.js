// PHASE G — G-F2 — Drawer Labels API Wrapper Tests
// src/api/__tests__/drawerLabelsApi.test.js

import {
  listDrawerLabels,
  createDrawerLabel,
  disableDrawerLabel,
} from "../drawerLabelsApi";
import apiClient from "../apiClient";

// Mock apiClient
jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Drawer Labels API - G-F2 Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs in tests
  });

  // ============================================================================
  // listDrawerLabels
  // ============================================================================

  describe("listDrawerLabels", () => {
    test("calls GET to correct endpoint", async () => {
      const mockResponse = {
        data: [
          { id: 1, label_name: "Urgent" },
          { id: 2, label_name: "Follow-up" },
        ],
      };
      apiClient.get.mockResolvedValue(mockResponse);

      await listDrawerLabels();

      expect(apiClient.get).toHaveBeenCalledWith("/api/v2/drawer-labels");
    });

    test("returns response data", async () => {
      const mockData = [
        { id: 1, label_name: "Urgent" },
        { id: 2, label_name: "Follow-up" },
        { id: 3, label_name: "Review" },
      ];
      apiClient.get.mockResolvedValue({ data: mockData });

      const result = await listDrawerLabels();

      expect(result).toEqual(mockData);
    });

    test("returns empty array when no labels exist", async () => {
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await listDrawerLabels();

      expect(result).toEqual([]);
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Network error");
      apiClient.get.mockRejectedValue(mockError);

      await expect(listDrawerLabels()).rejects.toThrow("Network error");
    });
  });

  // ============================================================================
  // createDrawerLabel
  // ============================================================================

  describe("createDrawerLabel", () => {
    test("posts correct body to endpoint", async () => {
      const mockResponse = { data: { id: 5, label_name: "New Label" } };
      apiClient.post.mockResolvedValue(mockResponse);

      await createDrawerLabel("New Label");

      expect(apiClient.post).toHaveBeenCalledWith("/api/v2/drawer-labels", {
        label_name: "New Label",
      });
    });

    test("returns response data", async () => {
      const mockData = { id: 10, label_name: "Important", is_active: true };
      apiClient.post.mockResolvedValue({ data: mockData });

      const result = await createDrawerLabel("Important");

      expect(result).toEqual(mockData);
    });

    test("handles label names with special characters", async () => {
      const labelName = "Review & Follow-up";
      const mockResponse = { data: { id: 7, label_name: labelName } };
      apiClient.post.mockResolvedValue(mockResponse);

      await createDrawerLabel(labelName);

      expect(apiClient.post).toHaveBeenCalledWith("/api/v2/drawer-labels", {
        label_name: labelName,
      });
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Validation error: label name too short");
      apiClient.post.mockRejectedValue(mockError);

      await expect(createDrawerLabel("A")).rejects.toThrow(
        "Validation error: label name too short"
      );
    });

    test("propagates errors when label name is duplicate", async () => {
      const mockError = new Error("Label already exists");
      apiClient.post.mockRejectedValue(mockError);

      await expect(createDrawerLabel("Duplicate")).rejects.toThrow(
        "Label already exists"
      );
    });
  });

  // ============================================================================
  // disableDrawerLabel
  // ============================================================================

  describe("disableDrawerLabel", () => {
    test("calls DELETE on correct endpoint with label ID", async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      await disableDrawerLabel(3);

      expect(apiClient.delete).toHaveBeenCalledWith("/api/v2/drawer-labels/3");
    });

    test("returns response data", async () => {
      const mockData = { success: true, disabled_id: 8 };
      apiClient.delete.mockResolvedValue({ data: mockData });

      const result = await disableDrawerLabel(8);

      expect(result).toEqual(mockData);
    });

    test("handles large label IDs", async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      await disableDrawerLabel(999999);

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/v2/drawer-labels/999999"
      );
    });

    test("propagates errors when API call fails", async () => {
      const mockError = new Error("Label not found");
      apiClient.delete.mockRejectedValue(mockError);

      await expect(disableDrawerLabel(999)).rejects.toThrow("Label not found");
    });

    test("propagates errors when label is in use", async () => {
      const mockError = new Error("Cannot disable label: in use by notes");
      apiClient.delete.mockRejectedValue(mockError);

      await expect(disableDrawerLabel(5)).rejects.toThrow(
        "Cannot disable label: in use by notes"
      );
    });
  });
});
