// src/components/settings/RoleSelector.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoleSelector from "./RoleSelector";

describe("RoleSelector", () => {
  const mockRoles = [
    { role_id: 1, role_name: "SOFTWARE_ADMIN" },
    { role_id: 2, role_name: "SECTION_ADMIN" },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and placeholder", () => {
    render(
      <RoleSelector
        roles={mockRoles}
        value={null}
        onChange={mockOnChange}
        label="Role"
      />
    );

    // Check label
    expect(screen.getByText("Role")).toBeInTheDocument();

    // Check that select combobox exists
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    
    // Placeholder text should be visible in the button
    expect(select).toHaveTextContent("Select role");
  });

  it("renders role options", () => {
    render(
      <RoleSelector
        roles={mockRoles}
        value={null}
        onChange={mockOnChange}
      />
    );

    // Open the dropdown
    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // Check that both role options are visible
    expect(screen.getByText("SOFTWARE_ADMIN")).toBeInTheDocument();
    expect(screen.getByText("SECTION_ADMIN")).toBeInTheDocument();
  });

  it("selected value binding", () => {
    render(
      <RoleSelector
        roles={mockRoles}
        value={2}
        onChange={mockOnChange}
      />
    );

    // The select button should show SECTION_ADMIN as selected
    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent("SECTION_ADMIN");
  });

  it("change event emits role_id number", () => {
    render(
      <RoleSelector
        roles={mockRoles}
        value={null}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // Click SOFTWARE_ADMIN option
    const softwareAdminOption = screen.getByText("SOFTWARE_ADMIN");
    fireEvent.click(softwareAdminOption);

    // Check onChange was called with number 1
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it("disabled state", () => {
    render(
      <RoleSelector
        roles={mockRoles}
        value={null}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    // Check that select is disabled
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });
});
