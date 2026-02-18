// src/components/settings/CreateUserDialog.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateUserDialog from "./CreateUserDialog";
import { createUser } from "../../api/settingsUsersApi";

// Mock the API
jest.mock("../../api/settingsUsersApi", () => ({
  createUser: jest.fn(),
}));

describe("CreateUserDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all fields when open", () => {
    render(
      <CreateUserDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/emergency department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization unit id/i)).toBeInTheDocument();
  });

  it("prevents empty submit with validation", async () => {
    render(
      <CreateUserDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    const submitButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUser).not.toHaveBeenCalled();
    });

    // Check for validation errors
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/role is required/i)).toBeInTheDocument();
  });

  it("successfully submits with valid data", async () => {
    const mockNewUser = {
      user_id: 1,
      username: "testuser",
      display_name: "Test User",
      role_id: "WORKER",
    };

    createUser.mockResolvedValue(mockNewUser);

    render(
      <CreateUserDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    // Fill in the form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const displayNameInput = screen.getByPlaceholderText(/john doe/i);
    const orgUnitInput = screen.getByLabelText(/organization unit id/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });
    fireEvent.change(orgUnitInput, { target: { value: "1" } });

    // Select role by opening dropdown and clicking option
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    fireEvent.mouseDown(roleSelect);
    
    await waitFor(() => {
      expect(screen.getByText("Worker")).toBeInTheDocument();
    });
    
    const workerOption = screen.getByText("Worker");
    fireEvent.click(workerOption);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
        display_name: "Test User",
        department_display_name: "",
        role_id: "WORKER",
        org_unit_id: "1",
      });
    });

    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalledWith(mockNewUser);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows error message on API failure", async () => {
    const errorMessage = "Username already exists";
    createUser.mockRejectedValue({
      response: { data: { detail: errorMessage } },
    });

    render(
      <CreateUserDialog
        open={true}
        onClose={mockOnClose}
        onCreated={mockOnCreated}
      />
    );

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/organization unit id/i), {
      target: { value: "1" },
    });

    // Select role
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    fireEvent.mouseDown(roleSelect);
    
    await waitFor(() => {
      expect(screen.getByText("Worker")).toBeInTheDocument();
    });
    
    const workerOption = screen.getByText("Worker");
    fireEvent.click(workerOption);

    // Submit
    const submitButton = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
