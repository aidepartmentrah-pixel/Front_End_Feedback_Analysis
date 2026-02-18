// src/components/settings/OrgUnitSelectorAdapter.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrgUnitSelectorAdapter from "./OrgUnitSelectorAdapter";
import { getUserInventory } from "../../api/adminUsers";

// Mock the API
jest.mock("../../api/adminUsers", () => ({
  getUserInventory: jest.fn(),
}));

describe("OrgUnitSelectorAdapter", () => {
  const mockOrgUnits = {
    org_units: [
      { ID: 1, NameEn: "Emergency Department", Type: "DEPARTMENT" },
      { ID: 2, NameEn: "Surgery Department", Type: "DEPARTMENT" },
      { ID: 5, NameEn: "Nursing Administration", Type: "ADMINISTRATION" },
    ],
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    getUserInventory.mockResolvedValue(mockOrgUnits);
  });

  it("renders without crashing", async () => {
    render(
      <OrgUnitSelectorAdapter value={null} onChange={mockOnChange} />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Check that select is rendered
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("passes value to inner selector", async () => {
    render(
      <OrgUnitSelectorAdapter value={2} onChange={mockOnChange} />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Check that the component has the correct value by opening dropdown and checking selected option
    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);
    });

    await waitFor(() => {
      // Find the Surgery Department option and verify it's marked as selected
      const surgeryOption = screen.getByText(/Surgery Department/);
      expect(surgeryOption).toBeInTheDocument();
      // The selected option should have aria-selected="true"
      expect(surgeryOption.closest('[role="option"]')).toHaveAttribute('aria-selected', 'true');
    });
  });

  it("change propagation", async () => {
    render(
      <OrgUnitSelectorAdapter value={null} onChange={mockOnChange} />
    );

    // Wait for API call and data to load
    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Open dropdown
    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // Wait for options to appear and click on Emergency Department (ID: 1)
    await waitFor(() => {
      expect(screen.getByText(/Emergency Department/)).toBeInTheDocument();
    });

    const emergencyOption = screen.getByText(/Emergency Department/);
    fireEvent.click(emergencyOption);

    // Check onChange was called with numeric ID 1
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(1);
    });
  });

  it("disabled prop pass-through", async () => {
    render(
      <OrgUnitSelectorAdapter
        value={null}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    // Wait for loading
    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Check that select is disabled
    await waitFor(() => {
      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });
  });

  it("handles API error gracefully", async () => {
    getUserInventory.mockRejectedValue(new Error("API Error"));

    render(
      <OrgUnitSelectorAdapter value={null} onChange={mockOnChange} />
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load organizational units/i)).toBeInTheDocument();
    });
  });
});
