// src/pages/settings/SettingsUsersTab.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { listUsers } from "../../api/settingsUsersApi";
import SettingsUsersTab from "./SettingsUsersTab";
import AuthContext from "../../context/AuthContext";

// Mock the API
jest.mock("../../api/settingsUsersApi", () => ({
  listUsers: jest.fn(),
}));

// Mock AuthContext dependencies
jest.mock("../../api/apiClient");

describe("SettingsUsersTab", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders placeholder title", async () => {
    const adminUser = { userId: 1, username: "admin", roles: ["SOFTWARE_ADMIN"] };
    listUsers.mockResolvedValue({ users: [] });

    renderWithAuth(adminUser);

    await waitFor(() => {
      expect(screen.getByText(/Production Users Management — Phase B/i)).toBeInTheDocument();
    });
  });

  it("calls listUsers on mount", async () => {
    const adminUser = { userId: 1, username: "admin", roles: ["SOFTWARE_ADMIN"] };
    listUsers.mockResolvedValue({ users: [] });

    renderWithAuth(adminUser);

    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("displays user count after load", async () => {
    const adminUser = { userId: 1, username: "admin", roles: ["SOFTWARE_ADMIN"] };
    const mockUsers = [
      { id: 1, username: "user1" },
      { id: 2, username: "user2" },
      { id: 3, username: "user3" },
    ];
    listUsers.mockResolvedValue({ users: mockUsers });

    renderWithAuth(adminUser);

    await waitFor(() => {
      expect(screen.getByText(/Users loaded: 3/i)).toBeInTheDocument();
    });
  });

  it("shows error state when API fails", async () => {
    const adminUser = { userId: 1, username: "admin", roles: ["SOFTWARE_ADMIN"] };
    const errorMessage = "Network error";
    listUsers.mockRejectedValue(new Error(errorMessage));

    renderWithAuth(adminUser);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
