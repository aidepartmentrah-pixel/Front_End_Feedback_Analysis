// PHASE C — F-C2 — Integration Test for Section API Wrapper
// src/api/__tests__/adminUsers.integration.test.js

import { createSection } from "../adminUsers";
import apiClient from "../apiClient";

// Mock apiClient at the module level
jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe("Admin Users API - F-C2 Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe("Network Request Verification", () => {
    test("sends correct POST request with JSON body", async () => {
      const mockResponse = {
        data: {
          section_id: 101,
          username: "sec_101_admin",
          password: "TEMP_HASH_Hospital2026!",
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const payload = {
        section_name: "Emergency Section A",
        parent_unit_id: 42,
      };

      await createSection(payload);

      // Verify endpoint
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/create-section-with-admin",
        expect.any(Object)
      );

      // Verify JSON body structure
      const [endpoint, body] = apiClient.post.mock.calls[0];
      expect(endpoint).toBe("/api/admin/create-section-with-admin");
      expect(body).toEqual({
        section_name: "Emergency Section A",
        parent_department_id: 42, // Field mapping applied
      });
    });

    test("returns response data to caller", async () => {
      const expectedResponse = {
        section_id: 123,
        username: "sec_123_admin",
        password: "TestPassword!",
      };

      apiClient.post.mockResolvedValue({ data: expectedResponse });

      const result = await createSection({
        section_name: "Test Section",
        parent_unit_id: 99,
      });

      expect(result).toEqual(expectedResponse);
      expect(result.section_id).toBe(123);
      expect(result.username).toBe("sec_123_admin");
      expect(result.password).toBe("TestPassword!");
    });

    test("auth headers are handled by interceptor (not manually set)", async () => {
      const mockResponse = {
        data: { section_id: 1, username: "test", password: "test" },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      await createSection({
        section_name: "Test",
        parent_unit_id: 1,
      });

      // Verify no headers config is passed
      const callArgs = apiClient.post.mock.calls[0];
      expect(callArgs.length).toBe(2); // Only endpoint and body
      expect(callArgs[2]).toBeUndefined(); // No third config argument
    });
  });

  describe("Error Path Tests", () => {
    test("invalid payload - missing section_name", async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ["body", "section_name"],
                msg: "field required",
                type: "value_error.missing",
              },
            ],
          },
        },
      };

      apiClient.post.mockRejectedValue(validationError);

      await expect(
        createSection({
          parent_unit_id: 42,
          // section_name missing
        })
      ).rejects.toEqual(validationError);
    });

    test("invalid payload - missing parent_unit_id", async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ["body", "parent_department_id"],
                msg: "field required",
                type: "value_error.missing",
              },
            ],
          },
        },
      };

      apiClient.post.mockRejectedValue(validationError);

      await expect(
        createSection({
          section_name: "Test Section",
          // parent_unit_id missing
        })
      ).rejects.toEqual(validationError);
    });

    test("invalid payload - parent unit not found (404)", async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            detail: "Parent organization unit with ID 999 not found",
          },
        },
      };

      apiClient.post.mockRejectedValue(notFoundError);

      await expect(
        createSection({
          section_name: "Test Section",
          parent_unit_id: 999,
        })
      ).rejects.toEqual(notFoundError);

      // Verify error is logged
      expect(console.error).toHaveBeenCalledWith(
        "Error creating section:",
        notFoundError
      );
    });

    test("network error propagates to caller catch block", async () => {
      const networkError = new Error("Network request failed");
      apiClient.post.mockRejectedValue(networkError);

      let caughtError;
      try {
        await createSection({
          section_name: "Test",
          parent_unit_id: 1,
        });
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeDefined();
      expect(caughtError.message).toBe("Network request failed");
    });

    test("unauthorized error (401)", async () => {
      const authError = {
        response: {
          status: 401,
          data: {
            detail: "Not authenticated",
          },
        },
      };

      apiClient.post.mockRejectedValue(authError);

      await expect(
        createSection({
          section_name: "Test",
          parent_unit_id: 1,
        })
      ).rejects.toEqual(authError);
    });

    test("permission denied error (403)", async () => {
      const permissionError = {
        response: {
          status: 403,
          data: {
            detail: "User does not have permission to create sections",
          },
        },
      };

      apiClient.post.mockRejectedValue(permissionError);

      await expect(
        createSection({
          section_name: "Test",
          parent_unit_id: 1,
        })
      ).rejects.toEqual(permissionError);
    });
  });

  describe("Payload Contract Verification", () => {
    test("field mapping: parent_unit_id → parent_department_id", async () => {
      apiClient.post.mockResolvedValue({
        data: { section_id: 1, username: "test", password: "test" },
      });

      await createSection({
        section_name: "Emergency Unit",
        parent_unit_id: 42,
      });

      const [, body] = apiClient.post.mock.calls[0];
      expect(body).toHaveProperty("parent_department_id", 42);
      expect(body).not.toHaveProperty("parent_unit_id");
    });

    test("preserves section_name as-is", async () => {
      apiClient.post.mockResolvedValue({
        data: { section_id: 1, username: "test", password: "test" },
      });

      const sectionName = "Special Characters: Ñoño's Section #1";
      await createSection({
        section_name: sectionName,
        parent_unit_id: 1,
      });

      const [, body] = apiClient.post.mock.calls[0];
      expect(body.section_name).toBe(sectionName);
    });

    test("handles numeric parent_unit_id correctly", async () => {
      apiClient.post.mockResolvedValue({
        data: { section_id: 1, username: "test", password: "test" },
      });

      await createSection({
        section_name: "Test",
        parent_unit_id: 12345,
      });

      const [, body] = apiClient.post.mock.calls[0];
      expect(body.parent_department_id).toBe(12345);
      expect(typeof body.parent_department_id).toBe("number");
    });
  });
});
