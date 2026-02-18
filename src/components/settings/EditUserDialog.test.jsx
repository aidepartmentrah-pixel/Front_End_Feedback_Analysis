// src/components/settings/EditUserDialog.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditUserDialog from "./EditUserDialog";
import { updateUserIdentity, updateUserPassword } from "../../api/settingsUsersApi";

// Mock the API
jest.mock("../../api/settingsUsersApi", () => ({
  updateUserIdentity: jest.fn(),
  updateUserPassword: jest.fn(),
}));

describe("EditUserDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();

  const mockUser = {
    user_id: 1,
    username: "testuser",
    display_name: "Test User",
    department_display_name: "Test Department",
    role_id: "WORKER",
    org_unit_id: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prefills identity fields", () => {
    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    const departmentInput = screen.getByPlaceholderText(/emergency department/i);

    expect(displayNameInput).toHaveValue("Test User");
    expect(departmentInput).toHaveValue("Test Department");
  });

  it("identity change triggers identity API only", async () => {
    updateUserIdentity.mockResolvedValue({ success: true });

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Change display_name
    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    fireEvent.change(displayNameInput, { target: { value: "Updated Name" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateUserIdentity).toHaveBeenCalledWith(1, {
        display_name: "Updated Name",
        department_display_name: "Test Department",
      });
    });

    expect(updateUserPassword).not.toHaveBeenCalled();
    expect(mockOnSaved).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("password reset triggers password API", async () => {
    updateUserPassword.mockResolvedValue({ success: true });

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Enter new password + confirm
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

    fireEvent.change(newPasswordInput, { target: { value: "newpass123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newpass123" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateUserPassword).toHaveBeenCalledWith(1, {
        new_password: "newpass123",
      });
    });

    expect(mockOnSaved).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("password mismatch blocks submit", async () => {
    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Enter different passwords
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

    fireEvent.change(newPasswordInput, { target: { value: "password1" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password2" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(updateUserIdentity).not.toHaveBeenCalled();
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it("both identity and password changed", async () => {
    updateUserIdentity.mockResolvedValue({ success: true });
    updateUserPassword.mockResolvedValue({ success: true });

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Change identity
    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    fireEvent.change(displayNameInput, { target: { value: "New Name" } });

    // Change password
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    fireEvent.change(newPasswordInput, { target: { value: "newpass123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newpass123" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateUserIdentity).toHaveBeenCalledWith(1, {
        display_name: "New Name",
        department_display_name: "Test Department",
      });
      expect(updateUserPassword).toHaveBeenCalledWith(1, {
        new_password: "newpass123",
      });
    });

    expect(mockOnSaved).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("error handling shows message", async () => {
    const errorMessage = "Failed to update user";
    updateUserIdentity.mockRejectedValue({
      response: { data: { detail: errorMessage } },
    });

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Change display_name
    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    fireEvent.change(displayNameInput, { target: { value: "Updated Name" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSaved).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
