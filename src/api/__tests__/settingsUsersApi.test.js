// src/api/__tests__/settingsUsersApi.test.js
import { listUsers, createUser, updateUserIdentity, updateUserPassword, deleteUser } from "../settingsUsersApi";
import apiClient from "../apiClient";

// Mock apiClient
jest.mock("../apiClient", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("settingsUsersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listUsers", () => {
    it("calls correct endpoint", async () => {
      const mockData = { users: [], total: 0 };
      apiClient.get.mockResolvedValue({ data: mockData });

      const result = await listUsers();

      expect(apiClient.get).toHaveBeenCalledWith("/api/settings/users");
      expect(result).toEqual(mockData);
    });
  });

  describe("createUser", () => {
    it("posts correct payload", async () => {
      const payload = {
        username: "testuser",
        password: "password123",
        display_name: "Test User",
        department_display_name: "Test Dept",
        role_id: "WORKER",
        org_unit_id: 1,
      };
      const mockResponse = { user: { id: 1, ...payload } };
      apiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await createUser(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/api/settings/users", payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateUserIdentity", () => {
    it("calls correct URL with userId", async () => {
      const userId = 5;
      const payload = { display_name: "Updated Name" };
      const mockResponse = { user: { id: userId, ...payload } };
      apiClient.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserIdentity(userId, payload);

      expect(apiClient.patch).toHaveBeenCalledWith("/api/settings/users/5/identity", payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateUserPassword", () => {
    it("calls correct URL with userId and password payload", async () => {
      const userId = 3;
      const payload = { new_password: "newpass123" };
      const mockResponse = { success: true };
      apiClient.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserPassword(userId, payload);

      expect(apiClient.patch).toHaveBeenCalledWith("/api/settings/users/3/password", payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteUser", () => {
    it("calls correct URL", async () => {
      const userId = 10;
      const mockResponse = { success: true };
      apiClient.delete.mockResolvedValue({ data: mockResponse });

      const result = await deleteUser(userId);

      expect(apiClient.delete).toHaveBeenCalledWith("/api/settings/users/10");
      expect(result).toEqual(mockResponse);
    });
  });
});
