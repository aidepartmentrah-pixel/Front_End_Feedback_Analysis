// src/components/settings/UsersTable.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UsersTable from "./UsersTable";

const mockUsers = [
  {
    user_id: 1,
    username: "admin",
    display_name: "Administrator",
    department_display_name: "IT Department",
    role_name: "SOFTWARE_ADMIN",
    org_unit_name: "Hospital",
    is_active: true,
  },
  {
    user_id: 2,
    username: "john.doe",
    display_name: "John Doe",
    department_display_name: "Emergency",
    role_name: "SECTION_ADMIN",
    org_unit_name: "Emergency Section",
    is_active: true,
  },
];

describe("UsersTable", () => {
  const mockOnCreateClick = jest.fn();
  const mockOnEditClick = jest.fn();
  const mockOnDeleteClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders column headers", () => {
    render(
      <UsersTable
        users={mockUsers}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Display Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Org Unit")).toBeInTheDocument();
  });

  it("renders user rows", () => {
    render(
      <UsersTable
        users={mockUsers}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("john.doe")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows empty state when no users", () => {
    render(
      <UsersTable
        users={[]}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("calls onCreateClick when Create User button is clicked", () => {
    render(
      <UsersTable
        users={mockUsers}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    const createButton = screen.getByText("Create User");
    fireEvent.click(createButton);

    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it("calls onEditClick with user object when Edit button is clicked", () => {
    render(
      <UsersTable
        users={mockUsers}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /edit user/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
    expect(mockOnEditClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("calls onDeleteClick with user object when Delete button is clicked", () => {
    render(
      <UsersTable
        users={mockUsers}
        onCreateClick={mockOnCreateClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete user/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteClick).toHaveBeenCalledWith(mockUsers[0]);
  });
});
