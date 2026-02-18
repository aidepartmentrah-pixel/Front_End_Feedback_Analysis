import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ParentOrgUnitSelector from "./ParentOrgUnitSelector";
import { getUserInventory } from "../../api/adminUsers";

// Mock API
jest.mock("../../api/adminUsers", () => ({
  getUserInventory: jest.fn(),
}));

describe("ParentOrgUnitSelector - F-C4 Tests", () => {
  const mockOrgInventory = {
    org_units: [
      {
        ID: 1,
        Name: "Admin 1",
        Children: [
          { ID: 101, Name: "Dept 1-1" },
          { ID: 102, Name: "Dept 1-2" },
        ],
      },
      {
        ID: 2,
        Name: "Admin 2",
        Children: [{ ID: 201, Name: "Dept 2-1" }],
      },
    ],
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    getUserInventory.mockResolvedValue(mockOrgInventory);
  });

  it("renders parent type selector and dropdown", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    // Verify radio buttons exist
    expect(screen.getByLabelText("Department")).toBeInTheDocument();
    expect(screen.getByLabelText("Administration")).toBeInTheDocument();

    // Verify dropdown exists
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("loads organizational hierarchy on mount", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalledTimes(1);
    });
  });

  it("shows departments when parent type is DEPARTMENT", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Verify dropdown label
    expect(screen.getByLabelText("Select Department")).toBeInTheDocument();

    // Verify department options are rendered (may not be visible but in DOM)
    await waitFor(() => {
      expect(screen.getByText("Dept 1-1")).toBeInTheDocument();
      expect(screen.getByText("Dept 1-2")).toBeInTheDocument();
      expect(screen.getByText("Dept 2-1")).toBeInTheDocument();
    });
  });

  it("shows administrations when parent type is ADMINISTRATION", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="ADMINISTRATION"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Verify label changes using getByLabelText to avoid duplicate text
    expect(screen.getByLabelText("Select Administration")).toBeInTheDocument();

    // Verify administration options are rendered (may not be visible but in DOM)
    await waitFor(() => {
      expect(screen.getByText("Admin 1")).toBeInTheDocument();
      expect(screen.getByText("Admin 2")).toBeInTheDocument();
    });
  });

  it("calls onChange with correct values when parent type changes", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId="101"
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Switch to ADMINISTRATION
    const adminRadio = screen.getByLabelText("Administration");
    fireEvent.click(adminRadio);

    // Verify onChange called with reset parentId and new type
    expect(mockOnChange).toHaveBeenCalledWith("", "ADMINISTRATION");
  });

  it("calls onChange with correct values when parent selection changes", async () => {
    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Find the option element and click it
    await waitFor(() => {
      const deptOption = screen.getByText("Dept 1-1");
      expect(deptOption).toBeInTheDocument();
    });

    const deptOption = screen.getByText("Dept 1-1");
    fireEvent.click(deptOption);

    // Verify onChange called with selected ID and current type
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(101, "DEPARTMENT");
    });
  });

  it("shows error alert when hierarchy load fails", async () => {
    getUserInventory.mockRejectedValue(new Error("Network error"));

    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load organizational hierarchy")
      ).toBeInTheDocument();
    });
  });

  it("disables dropdown while loading", () => {
    // Mock slow API response
    getUserInventory.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockOrgInventory), 1000))
    );

    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    // Verify dropdown is disabled during load
    const dropdown = screen.getByRole("combobox");
    expect(dropdown).toBeDisabled();
  });

  it("changes dropdown label when parent type switches", async () => {
    const { rerender } = render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Verify initial label
    expect(screen.getByLabelText("Select Department")).toBeInTheDocument();

    // Rerender with ADMINISTRATION type
    rerender(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="ADMINISTRATION"
        onChange={mockOnChange}
      />
    );

    // Verify label changed
    expect(screen.getByLabelText("Select Administration")).toBeInTheDocument();
  });

  it("filters options correctly when switching between parent types", async () => {
    const { rerender } = render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // Verify departments are shown
    expect(screen.getByText("Dept 1-1")).toBeInTheDocument();
    expect(screen.getByText("Dept 1-2")).toBeInTheDocument();

    // Switch to ADMINISTRATION
    rerender(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="ADMINISTRATION"
        onChange={mockOnChange}
      />
    );

    // Verify administrations appear instead
    await waitFor(() => {
      expect(screen.getByText("Admin 1")).toBeInTheDocument();
      expect(screen.getByText("Admin 2")).toBeInTheDocument();
    });
  });

  it("handles empty org hierarchy gracefully", async () => {
    getUserInventory.mockResolvedValue({ org_units: [] });

    render(
      <ParentOrgUnitSelector
        valueParentId=""
        valueParentType="DEPARTMENT"
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(getUserInventory).toHaveBeenCalled();
    });

    // No department options should be rendered
    expect(screen.queryByText("Dept 1-1")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin 1")).not.toBeInTheDocument();
  });
});
