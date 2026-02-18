// PHASE C — F-C2 — Section API Wrapper Tests
// src/api/__tests__/adminUsers.test.js

import {
  getUserInventory,
  createSectionWithAdmin,
  createSection,
  getUserCredentials,
  deleteUser,
  recreateSectionAdmin,
} from "../adminUsers";
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

describe("Admin Users API - F-C2 Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress error logs in tests
  });

  describe("createSection (PHASE C - F-C2)", () => {
    const mockPayload = {
      section_name: "Emergency Section A",
      parent_unit_id: 42,
    };

    const mockSuccessResponse = {
      data: {
        section_id: 101,
        username: "sec_101_admin",
        password: "TEMP_HASH_Hospital2026!",
      },
    };

    test("calls correct POST endpoint with payload", async () => {
      apiClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await createSection(mockPayload);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/create-section-with-admin",
        {
          section_name: "Emergency Section A",
          parent_department_id: 42, // Maps parent_unit_id to parent_department_id
        }
      );
      expect(result).toEqual(mockSuccessResponse.data);
    });

    test("returns response data with section credentials", async () => {
      apiClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await createSection(mockPayload);

      expect(result).toHaveProperty("section_id", 101);
      expect(result).toHaveProperty("username", "sec_101_admin");
      expect(result).toHaveProperty("password");
    });

    test("accepts generic parent_unit_id field name", async () => {
      apiClient.post.mockResolvedValue(mockSuccessResponse);

      await createSection({
        section_name: "Test Section",
        parent_unit_id: 99,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/create-section-with-admin",
        expect.objectContaining({
          section_name: "Test Section",
          parent_department_id: 99, // Maps to backend field name
        })
      );
    });

    test("propagates errors to caller", async () => {
      const mockError = {
        response: {
          data: { detail: "Parent unit not found" },
          status: 404,
        },
      };

      apiClient.post.mockRejectedValue(mockError);

      await expect(createSection(mockPayload)).rejects.toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith(
        "Error creating section:",
        mockError
      );
    });

    test("handles validation errors", async () => {
      const validationError = {
        response: {
          data: {
            detail: [
              { loc: ["body", "section_name"], msg: "field required" },
            ],
          },
          status: 422,
        },
      };

      apiClient.post.mockRejectedValue(validationError);

      await expect(createSection({})).rejects.toEqual(validationError);
    });

    test("handles network errors", async () => {
      const networkError = new Error("Network request failed");
      apiClient.post.mockRejectedValue(networkError);

      await expect(createSection(mockPayload)).rejects.toThrow(
        "Network request failed"
      );
    });

    test("does NOT hardcode base URL", async () => {
      apiClient.post.mockResolvedValue(mockSuccessResponse);

      await createSection(mockPayload);

      const callArgs = apiClient.post.mock.calls[0];
      expect(callArgs[0]).toBe("/api/admin/create-section-with-admin");
      expect(callArgs[0]).not.toContain("http://");
      expect(callArgs[0]).not.toContain("https://");
    });

    test("does NOT manually set headers (relies on interceptor)", async () => {
      apiClient.post.mockResolvedValue(mockSuccessResponse);

      await createSection(mockPayload);

      // Verify only endpoint and payload are passed (no config object with headers)
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
      expect(apiClient.post).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ headers: expect.anything() })
      );
    });

    test("handles duplicate section name errors", async () => {
      const duplicateError = {
        response: {
          data: { detail: "Section with this name already exists" },
          status: 400,
        },
      };

      apiClient.post.mockRejectedValue(duplicateError);

      await expect(
        createSection({
          section_name: "Duplicate Section",
          parent_unit_id: 42,
        })
      ).rejects.toEqual(duplicateError);
    });

    test("returns all expected response fields", async () => {
      const fullResponse = {
        data: {
          section_id: 123,
          username: "sec_123_admin",
          password: "TestPassword123!",
          org_unit_name: "Test Section",
          parent_unit_id: 42,
        },
      };

      apiClient.post.mockResolvedValue(fullResponse);

      const result = await createSection(mockPayload);

      expect(result).toEqual(fullResponse.data);
    });
  });

  describe("createSectionWithAdmin (Legacy)", () => {
    test("maintains backward compatibility with old signature", async () => {
      const mockResponse = {
        data: {
          section_id: 101,
          username: "sec_101_admin",
          password: "TEMP_HASH_Hospital2026!",
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await createSectionWithAdmin("Test Section", 42);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/create-section-with-admin",
        {
          section_name: "Test Section",
          parent_department_id: 42,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getUserInventory", () => {
    test("fetches org units hierarchy", async () => {
      const mockOrgData = {
        data: {
          org_units: [
            { ID: 1, Name: "Main Administration", Type: "ADMINISTRATION" },
            { ID: 2, Name: "Emergency Dept", Type: "DEPARTMENT", ParentID: 1 },
          ],
        },
      };

      apiClient.get.mockResolvedValue(mockOrgData);

      const result = await getUserInventory();

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/user-inventory");
      expect(result).toEqual(mockOrgData.data);
    });

    test("handles errors", async () => {
      const error = new Error("Failed to fetch");
      apiClient.get.mockRejectedValue(error);

      await expect(getUserInventory()).rejects.toThrow("Failed to fetch");
    });
  });

  describe("getUserCredentials", () => {
    test("fetches user credentials for testing", async () => {
      const mockCredentials = {
        data: {
          users: [
            {
              user_id: 1,
              username: "test_admin",
              role: "SOFTWARE_ADMIN",
              password: "TestPass123!",
            },
          ],
        },
      };

      apiClient.get.mockResolvedValue(mockCredentials);

      const result = await getUserCredentials();

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/admin/testing/user-credentials"
      );
      expect(result).toEqual(mockCredentials.data);
    });
  });

  describe("deleteUser", () => {
    test("deletes user by ID", async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteUser(123);

      expect(apiClient.delete).toHaveBeenCalledWith("/api/admin/users/123");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("recreateSectionAdmin", () => {
    test("recreates admin for section", async () => {
      const mockResponse = {
        data: {
          username: "sec_42_admin_v2",
          password: "NewPass123!",
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await recreateSectionAdmin(42);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/sections/42/recreate-admin"
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
