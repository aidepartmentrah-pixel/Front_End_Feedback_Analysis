// PHASE C — F-C9 — Section Creation Panel Smoke Tests
// Automated smoke tests validating critical user flows end-to-end

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SectionCreationPanel from "./SectionCreationPanel";
import * as adminUsersApi from "../../api/adminUsers";

// Mock API module
jest.mock("../../api/adminUsers", () => ({
  getUserInventory: jest.fn(),
  createSection: jest.fn(),
}));

describe("PHASE C — F-C9 — Section Creation Smoke Tests", () => {
  const mockOrgUnits = {
    org_units: [
      { ID: 1, Name: "Main Administration", Type: "ADMINISTRATION", ParentID: null },
      { ID: 2, Name: "Emergency Department", Type: "DEPARTMENT", ParentID: 1 },
      { ID: 3, Name: "Surgery Department", Type: "DEPARTMENT", ParentID: 1 },
      { ID: 4, Name: "Finance Administration", Type: "ADMINISTRATION", ParentID: 1 },
    ],
  };

  const mockSuccessResponse = {
    section_id: 101,
    username: "sec_101_admin",
    password: "TEMP_HASH_Hospital2026!",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adminUsersApi.getUserInventory.mockResolvedValue(mockOrgUnits);
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  describe("SMOKE: Critical Path - Create Section Under Department", () => {
    test("end-to-end: user can create section under department successfully", async () => {
      adminUsersApi.createSection.mockResolvedValue(mockSuccessResponse);

      render(<SectionCreationPanel />);

      // STEP 1: Wait for org units to load
      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // STEP 2: Enter section name
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Test Emergency Section" } });
      fireEvent.blur(sectionInput);

      // STEP 3: Select Department parent type (default)
      const departmentRadio = screen.getByRole("radio", { name: /Department/i });
      expect(departmentRadio).toBeChecked();

      // STEP 4: Select parent from dropdown
      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      // STEP 5: Submit form
      const createButton = screen.getByRole("button", { name: /Create Section/i });
      expect(createButton).not.toBeDisabled();
      fireEvent.click(createButton);

      // STEP 6: Verify API call
      await waitFor(() => {
        expect(adminUsersApi.createSection).toHaveBeenCalledWith({
          section_name: "Test Emergency Section",
          parent_unit_id: 2,
        });
      });

      // STEP 7: Verify success card displays
      await waitFor(() => {
        expect(screen.getByText(/Section Created Successfully/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue("101")).toBeInTheDocument();
        expect(screen.getByDisplayValue("sec_101_admin")).toBeInTheDocument();
        expect(screen.getByDisplayValue("TEMP_HASH_Hospital2026!")).toBeInTheDocument();
      });

      // STEP 8: Verify form reset
      expect(sectionInput.value).toBe("");
    });
  });

  describe("SMOKE: Critical Path - Create Section Under Administration", () => {
    test("end-to-end: user can create section under administration successfully", async () => {
      adminUsersApi.createSection.mockResolvedValue(mockSuccessResponse);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Enter section name
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Test Admin Section" } });
      fireEvent.blur(sectionInput);

      // Switch to Administration parent type
      const adminRadio = screen.getByRole("radio", { name: /Administration/i });
      fireEvent.click(adminRadio);

      // Verify dropdown label changes by checking combobox
      await waitFor(() => {
        const combobox = screen.getByRole("combobox");
        expect(combobox).toHaveAccessibleName(/Select Administration/i);
      });

      // Select administration parent
      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Main Administration");
        fireEvent.click(option);
      });

      // Submit
      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      // Verify API call with administration parent
      await waitFor(() => {
        expect(adminUsersApi.createSection).toHaveBeenCalledWith({
          section_name: "Test Admin Section",
          parent_unit_id: 1,
        });
      });

      // Verify success
      await waitFor(() => {
        expect(screen.getByText(/Section Created Successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe("SMOKE: Validation Guards", () => {
    test("validation blocks empty section name", async () => {
      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      const sectionInput = screen.getByPlaceholderText("Enter section name");
      
      // Trigger blur with empty input
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        expect(screen.getByText("Section name is required")).toBeInTheDocument();
      });

      // Button should be disabled
      const createButton = screen.getByRole("button", { name: /Create Section/i });
      expect(createButton).toBeDisabled();

      // No API call should be made
      expect(adminUsersApi.createSection).not.toHaveBeenCalled();
    });

    test("validation blocks section name too short", async () => {
      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "A" } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    test("validation blocks section name too long", async () => {
      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      const longName = "A".repeat(101);
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: longName } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        expect(screen.getByText(/must not exceed 100 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("SMOKE: Error Handling", () => {
    test("displays 400 business rule error clearly", async () => {
      const businessError = {
        response: {
          data: {
            detail: "Section name already exists in this parent unit",
          },
        },
      };
      adminUsersApi.createSection.mockRejectedValue(businessError);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Fill form
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Duplicate Section" } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      // Submit
      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      // Verify clear error message
      await waitFor(() => {
        expect(screen.getByText("Section name already exists in this parent unit")).toBeInTheDocument();
      });
    });

    test("error clears on retry", async () => {
      const businessError = {
        response: {
          data: {
            detail: "Section name already exists",
          },
        },
      };
      adminUsersApi.createSection.mockRejectedValueOnce(businessError);
      adminUsersApi.createSection.mockResolvedValueOnce(mockSuccessResponse);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Fill and submit (will fail)
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Test Section" } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      // Error appears
      await waitFor(() => {
        expect(screen.getByText("Section name already exists")).toBeInTheDocument();
      });

      // Retry with different name
      fireEvent.change(sectionInput, { target: { value: "Test Section 2" } });
      fireEvent.blur(sectionInput);
      fireEvent.click(createButton);

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText("Section name already exists")).not.toBeInTheDocument();
      });

      // Success should show
      await waitFor(() => {
        expect(screen.getByText(/Section Created Successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe("SMOKE: Credential Copy Functionality", () => {
    test("all three copy buttons work correctly", async () => {
      adminUsersApi.createSection.mockResolvedValue(mockSuccessResponse);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Create section successfully
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Test Section" } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Section Created Successfully/i)).toBeInTheDocument();
      });

      // Get all icon buttons (copy buttons are IconButtons, create/reset are regular buttons)
      const allButtons = screen.getAllByRole("button");
      // Filter for icon buttons (they have empty accessible names)
      const iconButtons = allButtons.filter(btn => btn.getAttribute('aria-label') === null && !btn.textContent);
      expect(iconButtons.length).toBeGreaterThanOrEqual(3);

      // Click the first 3 icon buttons (copy buttons)
      for (let i = 0; i < 3; i++) {
        fireEvent.click(iconButtons[i]);
      }

      // Verify clipboard.writeText was called 3 times
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(3);
      });

      // Verify correct values were copied (section_id is a number from API)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(101);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("sec_101_admin");
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("TEMP_HASH_Hospital2026!");
    });
  });

  describe("SMOKE: Form Reset After Success", () => {
    test("Create Another Section button resets form", async () => {
      adminUsersApi.createSection.mockResolvedValue(mockSuccessResponse);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Create section
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "Test Section" } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      // Success card shows
      await waitFor(() => {
        expect(screen.getByText(/Section Created Successfully/i)).toBeInTheDocument();
      });

      // Click "Create Another Section"
      const resetButton = screen.getByRole("button", { name: /Create Another Section/i });
      fireEvent.click(resetButton);

      // Success card should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Section Created Successfully/i)).not.toBeInTheDocument();
      });

      // Form should be ready for new entry
      expect(sectionInput.value).toBe("");
    });
  });

  describe("SMOKE: Data Integrity", () => {
    test("section name is trimmed before submission", async () => {
      adminUsersApi.createSection.mockResolvedValue(mockSuccessResponse);

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(adminUsersApi.getUserInventory).toHaveBeenCalled();
      });

      // Enter section name with leading/trailing spaces
      const sectionInput = screen.getByPlaceholderText("Enter section name");
      fireEvent.change(sectionInput, { target: { value: "   Spaces Test   " } });
      fireEvent.blur(sectionInput);

      await waitFor(() => {
        const parentSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(parentSelect);
      });

      await waitFor(() => {
        const option = screen.getByText("Emergency Department");
        fireEvent.click(option);
      });

      const createButton = screen.getByRole("button", { name: /Create Section/i });
      fireEvent.click(createButton);

      // Verify trimmed value sent to API
      await waitFor(() => {
        expect(adminUsersApi.createSection).toHaveBeenCalledWith({
          section_name: "Spaces Test", // No leading/trailing spaces
          parent_unit_id: 2,
        });
      });
    });
  });

  describe("SMOKE: Component Stability", () => {
    test("component renders without crashing", () => {
      const { container } = render(<SectionCreationPanel />);
      expect(container).toBeInTheDocument();
    });

    test("handles org units loading failure gracefully", async () => {
      adminUsersApi.getUserInventory.mockRejectedValue(new Error("Network error"));

      render(<SectionCreationPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });

      // Component should not crash
      expect(screen.getByText("🏗️ Create Section")).toBeInTheDocument();
    });
  });
});
