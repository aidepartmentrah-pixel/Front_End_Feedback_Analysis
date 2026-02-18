// src/pages/settings/__tests__/phase_b_users_smoke.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsUsersTab from "../SettingsUsersTab";
import AuthContext from "../../../context/AuthContext";
import {
  listUsers,
  createUser,
  updateUserIdentity,
  updateUserPassword,
  deleteUser,
} from "../../../api/settingsUsersApi";
import { getUserInventory } from "../../../api/adminUsers";

// Mock the APIs
jest.mock("../../../api/settingsUsersApi", () => ({
  listUsers: jest.fn(),
  createUser: jest.fn(),
  updateUserIdentity: jest.fn(),
  updateUserPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("../../../api/adminUsers", () => ({
  getUserInventory: jest.fn(),
}));

// Mock AuthContext dependencies
jest.mock("../../../api/apiClient");

describe("Phase B - Users Admin Tooling Smoke Test", () => {
  const adminUser = {
    userId: 1,
    username: "admin",
    roles: ["SOFTWARE_ADMIN"],
  };

  const mockOrgUnits = {
    org_units: [
      { ID: 1, NameEn: "Emergency Department", Type: "DEPARTMENT" },
      { ID: 2, NameEn: "Surgery Department", Type: "DEPARTMENT" },
    ],
  };

  const renderWithAuth = () => {
    const mockAuthContext = {
      user: adminUser,
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
    getUserInventory.mockResolvedValue(mockOrgUnits);
    // Set up mock to return no dialog warnings
    window.confirm = jest.fn(() => true);
  });

  it("complete users admin smoke flow", async () => {
    // Step 1: Initial listUsers returns 1 user
    const initialUsers = {
      users: [
        {
          user_id: 1,
          username: "testuser1",
          display_name: "Test User 1",
          department_display_name: "Test Dept",
          role_id: "WORKER",
          org_unit_id: 1,
        },
      ],
    };

    // Mock new user that will be created
    const newUser = {
      user_id: 2,
      username: "newuser",
      display_name: "",
      role_id: "WORKER",
      org_unit_id: 1,
    };

    // Updated users list after creation
    const updatedUsersList = {
      users: [initialUsers.users[0], newUser],
    };

    // Set up sequential mock responses
    listUsers.mockResolvedValueOnce(initialUsers); // First call on mount
    listUsers.mockResolvedValueOnce(updatedUsersList); // After create
    listUsers.mockResolvedValue(updatedUsersList); // Subsequent calls

    createUser.mockResolvedValue(newUser);

    // Step 2: Render SettingsUsersTab
    renderWithAuth();

    // Wait for initial load
    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(1);
    });

    // Verify user appears in table
    await waitFor(() => {
      expect(screen.getByText("testuser1")).toBeInTheDocument();
      expect(screen.getByText("Test User 1")).toBeInTheDocument();
    });

    // Step 3: Click "Create User" button
    const createButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(createButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    // Fill minimal fields - use label text to get inputs
    const usernameInput = screen.getByLabelText(/^username/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const orgUnitInput = screen.getByLabelText(/organization unit id/i);

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(orgUnitInput, { target: { value: "1" } });

    // Select role
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    fireEvent.mouseDown(roleSelect);

    await waitFor(() => {
      expect(screen.getByText("Worker")).toBeInTheDocument();
    });

    const workerOption = screen.getByText("Worker");
    fireEvent.click(workerOption);

    // Submit create form
    const submitButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(submitButton);

    // Step 4: Verify createUser was called
    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        username: "newuser",
        password: "password123",
        display_name: "",
        department_display_name: "",
        role_id: "WORKER",
        org_unit_id: "1",
      });
    });

    // Verify listUsers called again to refresh
    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(2);
    });

    // Verify both users appear in table
    await waitFor(() => {
      expect(screen.getByText("newuser")).toBeInTheDocument();
      expect(screen.getByText("testuser1")).toBeInTheDocument();
    });

    // Step 5: Click "Edit" on testuser1 (should be second in sorted list since "newuser" comes first alphabetically)
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    // testuser1 should be at index 1 (after newuser)
    fireEvent.click(editButtons[1]);

    // Wait for edit dialog to open
    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    // Verify username is read-only
    await waitFor(() => {
      const usernameField = screen.getByDisplayValue("testuser1");
      expect(usernameField).toBeDisabled();
    });

    // Change display_name
    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    fireEvent.change(displayNameInput, { target: { value: "Updated Name" } });

    // Mock updateUserIdentity success
    updateUserIdentity.mockResolvedValue({ success: true });
    listUsers.mockResolvedValue(updatedUsersList);

    // Submit edit form
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Step 6: Verify updateUserIdentity was called
    await waitFor(() => {
      expect(updateUserIdentity).toHaveBeenCalledWith(1, {
        display_name: "Updated Name",
        department_display_name: "Test Dept",
      });
    });

    // Wait for dialog to close and list to refresh
    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(3);
    });

    // Step 7: Test password update - open edit dialog again for testuser1
    const editButtons2 = screen.getAllByRole("button", { name: /edit/i });
    // Click on testuser1  again (index 1)
    fireEvent.click(editButtons2[1]);

    // Wait for edit dialog
    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    // Enter new password and confirmation
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

    fireEvent.change(newPasswordInput, { target: { value: "newpass123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newpass123" } });

    // Mock updateUserPassword success
    updateUserPassword.mockResolvedValue({ success: true });

    // Submit with password change
    const saveButton2 = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton2);

    // Step 8: Verify updateUserPassword was called
    await waitFor(() => {
      expect(updateUserPassword).toHaveBeenCalledWith(1, {
        new_password: "newpass123",
      });
    });

    // Wait for list to refresh
    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(4);
    });

    // Step 9: Click "Delete" on testuser1 (second in sorted list)
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    
    // Mock deleteUser success
    deleteUser.mockResolvedValue({ success: true });
    
    // Update listUsers to return only newuser after deletion of testuser1
    listUsers.mockResolvedValue({
      users: [newUser],
    });

    // Click delete on testuser1 (index 1)
    fireEvent.click(deleteButtons[1]);

    // Step 10: Verify deleteUser was called
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(1);
    });

    // Verify listUsers called again
    await waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(5);
    });

    // Verify deleted user is no longer in table
    await waitFor(() => {
      expect(screen.queryByText("testuser1")).not.toBeInTheDocument();
      expect(screen.getByText("newuser")).toBeInTheDocument();
    });
  });

  it("shows error when create user fails", async () => {
    listUsers.mockResolvedValue({ users: [] });
    
    renderWithAuth();

    // Wait for  component to finish loading
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Open create dialog
    const createButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    // Fill form - use label text to get inputs
    const usernameInput = screen.getByLabelText(/^username/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const orgUnitInput = screen.getByLabelText(/organization unit id/i);

    fireEvent.change(usernameInput, { target: { value: "failuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(orgUnitInput, { target: { value: "1" } });

    // Select role
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    fireEvent.mouseDown(roleSelect);
    await waitFor(() => {
      expect(screen.getByText("Worker")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Worker"));

    // Mock API failure
    createUser.mockRejectedValue({
      response: { data: { detail: "Username already exists" } },
    });

    // Submit
    const submitButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(submitButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });

    // Verify listUsers not called again (form didn't succeed)
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it("shows error when delete fails", async () => {
    const mockUser = {
      users: [
        {
          user_id: 1,
          username: "testuser",
          display_name: "Test User",
          role_id: "WORKER",
        },
      ],
    };

    listUsers.mockResolvedValue(mockUser);
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    // Mock delete failure
    deleteUser.mockRejectedValue({
      response: { data: { detail: "Cannot delete user" } },
    });

    // Click delete
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    // Wait for error (it should appear somewhere in the component)
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(1);
    });

    // User should still be in table
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });
});
