// src/pages/settings/SettingsUsersGuards.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsUsersTab from "./SettingsUsersTab";
import AuthContext from "../../context/AuthContext";
import { listUsers } from "../../api/settingsUsersApi";
import { isSoftwareAdmin } from "../../utils/roleGuards";

// Mock the API
jest.mock("../../api/settingsUsersApi", () => ({
  listUsers: jest.fn(),
}));

// Mock AuthContext dependencies
jest.mock("../../api/apiClient");

describe("Settings Users Guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to render with AuthContext
  const renderWithAuth = (user) => {
    const mockAuthContext = {
      user,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    };

    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <SettingsUsersTab />
      </AuthContext.Provider>
    );
  };

  describe("isSoftwareAdmin guard function", () => {
    it("returns true for SOFTWARE_ADMIN role", () => {
      const adminUser = { userId: 1, username: "admin", roles: ["SOFTWARE_ADMIN"] };
      expect(isSoftwareAdmin(adminUser)).toBe(true);
    });

    it("returns false for non-admin roles", () => {
      const workerUser = { userId: 1, username: "worker", roles: ["WORKER"] };
      expect(isSoftwareAdmin(workerUser)).toBe(false);
    });

    it("returns false for null user", () => {
      expect(isSoftwareAdmin(null)).toBe(false);
    });

    it("returns false for user with no roles", () => {
      const noRolesUser = { userId: 1, username: "noroles", roles: [] };
      expect(isSoftwareAdmin(noRolesUser)).toBe(false);
    });
  });

  describe("Non-admin user restrictions", () => {
    it("direct render SettingsUsersTab shows Not authorized", async () => {
      const nonAdminUser = {
        userId: 1,
        username: "worker",
        roles: ["WORKER"],
      };

      renderWithAuth(nonAdminUser);

      // Wait for component to settle
      await waitFor(() => {
        expect(screen.getByText(/Not authorized/i)).toBeInTheDocument();
      });

      // Verify listUsers API was NOT called
      expect(listUsers).not.toHaveBeenCalled();
    });

    it("direct render SettingsUsersTab with null user shows Not authorized", async () => {
      renderWithAuth(null);

      await waitFor(() => {
        expect(screen.getByText(/Not authorized/i)).toBeInTheDocument();
      });

      expect(listUsers).not.toHaveBeenCalled();
    });

    it("direct render SettingsUsersTab with no roles shows Not authorized", async () => {
      const noRolesUser = {
        userId: 1,
        username: "noroles",
        roles: [],
      };

      renderWithAuth(noRolesUser);

      await waitFor(() => {
        expect(screen.getByText(/Not authorized/i)).toBeInTheDocument();
      });

      expect(listUsers).not.toHaveBeenCalled();
    });
  });

  describe("Admin user access", () => {
    it("SettingsUsersTab calls listUsers for SOFTWARE_ADMIN", async () => {
      const adminUser = {
        userId: 1,
        username: "admin",
        roles: ["SOFTWARE_ADMIN"],
      };

      const mockUsersData = {
        users: [
          { user_id: 1, username: "user1", role_id: "WORKER" },
          { user_id: 2, username: "user2", role_id: "SECTION_ADMIN" },
        ],
      };

      listUsers.mockResolvedValue(mockUsersData);

      renderWithAuth(adminUser);

      // Wait for API call
      await waitFor(() => {
        expect(listUsers).toHaveBeenCalledTimes(1);
      });

      // Check that user count is displayed
      await waitFor(() => {
        expect(screen.getByText(/Users loaded: 2/i)).toBeInTheDocument();
      });
    });

    it("SettingsUsersTab handles API errors gracefully for admin", async () => {
      const adminUser = {
        userId: 1,
        username: "admin",
        roles: ["SOFTWARE_ADMIN"],
      };

      listUsers.mockRejectedValue(new Error("API Error"));

      renderWithAuth(adminUser);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      });

      expect(listUsers).toHaveBeenCalled();
    });
  });
});
