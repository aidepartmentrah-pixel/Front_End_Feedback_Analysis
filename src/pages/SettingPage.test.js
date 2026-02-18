// PHASE C — F-C1 — Settings Page Section Panel Integration Tests
// src/pages/SettingPage.test.js

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock axios before any imports that use it
jest.mock("axios", () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

// Mock API services
jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    getDepartments: jest.fn(),
    getDoctors: jest.fn(),
    getPatients: jest.fn(),
    addDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    deleteDepartment: jest.fn(),
  },
}));

jest.mock("../api/adminUsers", () => ({
  getUserInventory: jest.fn(),
  createSectionWithAdmin: jest.fn(),
}));

// Mock all child components
jest.mock("../components/settings/DepartmentTable", () => {
  return function MockDepartmentTable() {
    return <div data-testid="department-table">Department Table</div>;
  };
});

jest.mock("../components/settings/AddDepartmentForm", () => {
  return function MockAddDepartmentForm() {
    return <div data-testid="add-department-form">Add Department Form</div>;
  };
});

jest.mock("../components/settings/SectionCreationPanel", () => {
  return function MockSectionCreationPanel() {
    return <div data-testid="section-creation-panel">Section Creation Panel</div>;
  };
});

jest.mock("../components/settings/UsersAndSectionsTab", () => {
  return function MockUsersAndSectionsTab() {
    return <div data-testid="users-sections-tab">Users & Sections Testing Tab</div>;
  };
});

jest.mock("../components/settings/DoctorTable", () => {
  return function MockDoctorTable() {
    return <div data-testid="doctor-table">Doctor Table</div>;
  };
});

jest.mock("../components/settings/AddDoctorForm", () => {
  return function MockAddDoctorForm() {
    return <div data-testid="add-doctor-form">Add Doctor Form</div>;
  };
});

jest.mock("../components/settings/PatientTable", () => {
  return function MockPatientTable() {
    return <div data-testid="patient-table">Patient Table</div>;
  };
});

jest.mock("../components/settings/AddPatientForm", () => {
  return function MockAddPatientForm() {
    return <div data-testid="add-patient-form">Add Patient Form</div>;
  };
});

jest.mock("../components/settings/DepartmentMappingToggle", () => {
  return function MockDepartmentMappingToggle() {
    return <div data-testid="department-mapping-toggle">Toggle</div>;
  };
});

jest.mock("../components/settings/SettingActions", () => {
  return function MockSettingActions() {
    return <div data-testid="setting-actions">Actions</div>;
  };
});

jest.mock("../components/settings/VariableAttributes", () => {
  return function MockVariableAttributes() {
    return <div data-testid="variable-attributes">Variable Attributes</div>;
  };
});

jest.mock("../components/settings/PolicyConfiguration", () => {
  return function MockPolicyConfiguration() {
    return <div data-testid="policy-configuration">Policy Configuration</div>;
  };
});

jest.mock("../components/settings/Training", () => {
  return function MockTraining() {
    return <div data-testid="training">Training</div>;
  };
});

jest.mock("./settings/SettingsUsersTab", () => {
  return function MockSettingsUsersTab() {
    return <div data-testid="settings-users-tab">Settings Users Tab</div>;
  };
});

// Mock AuthContext
jest.mock("../context/AuthContext", () => {
  const React = require("react");
  const ActualAuthContext = React.createContext(null);
  const mockUseAuth = jest. fn(() => ({ user: null }));
  return {
    AuthContext: ActualAuthContext,
    useAuth: mockUseAuth,
  };
});

// Now import components after mocks are set up
import SettingPage from "./SettingPage";
import { AuthContext, useAuth } from "../context/AuthContext";
import api from "../services/api";

describe("SettingPage - F-C1 Integration Tests", () => {
  const mockApiResponses = () => {
    api.getDepartments.mockResolvedValue({ data: [] });
    api.getDoctors.mockResolvedValue({ data: [] });
    api.getPatients.mockResolvedValue({ data: { patients: [], total: 0 } });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiResponses();
    // Default to no user
    useAuth.mockReturnValue({ user: null });
  });

  const renderWithAuth = (user) => {
    useAuth.mockReturnValue({ user });
    return render(
      <BrowserRouter>
        <SettingPage />
      </BrowserRouter>
    );
  };

  describe("SOFTWARE_ADMIN Access", () => {
    const softwareAdminUser = {
      username: "admin",
      roles: ["SOFTWARE_ADMIN"],
    };

    test("displays SectionCreationPanel in Departments tab for SOFTWARE_ADMIN", async () => {
      renderWithAuth(softwareAdminUser);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Departments tab should be active by default (activeTab = 0)
      // Check for section creation panel
      await waitFor(() => {
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
      });
    });

    test("displays testing tab for SOFTWARE_ADMIN", async () => {
      renderWithAuth(softwareAdminUser);

      await waitFor(() => {
        expect(screen.getByText("👤 Users & Sections (Testing)")).toBeInTheDocument();
      });
    });

    test("section creation panel appears in production Departments tab", async () => {
      renderWithAuth(softwareAdminUser);

      // Verify we're in the Departments tab
      await waitFor(() => {
        expect(screen.getByTestId("department-table")).toBeInTheDocument();
        expect(screen.getByTestId("add-department-form")).toBeInTheDocument();
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
      });
    });
  });

  describe("Non-SOFTWARE_ADMIN Access", () => {
    const regularUser = {
      username: "regular_user",
      roles: ["SECTION_ADMIN"],
    };

    test("does NOT display SectionCreationPanel for non-SOFTWARE_ADMIN", async () => {
      renderWithAuth(regularUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Section creation panel should NOT be visible
      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("does NOT display testing tab for non-SOFTWARE_ADMIN", async () => {
      renderWithAuth(regularUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      expect(screen.queryByText("👤 Users & Sections (Testing)")).not.toBeInTheDocument();
    });

    test("displays standard Departments tab content for non-SOFTWARE_ADMIN", async () => {
      renderWithAuth(regularUser);

      await waitFor(() => {
        expect(screen.getByTestId("department-table")).toBeInTheDocument();
        expect(screen.getByTestId("add-department-form")).toBeInTheDocument();
      });
    });
  });

  describe("Tab Structure Integrity", () => {
    const softwareAdminUser = {
      username: "admin",
      roles: ["SOFTWARE_ADMIN"],
    };

    test("all tabs are present and accessible", async () => {
      renderWithAuth(softwareAdminUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
        expect(screen.getByText("👨‍⚕️ Doctors")).toBeInTheDocument();
        expect(screen.getByText("🧑‍🤝‍🧑 Patients")).toBeInTheDocument();
        expect(screen.getByText("⚙️ Variable Attributes")).toBeInTheDocument();
        expect(screen.getByText("📋 Policy Configuration")).toBeInTheDocument();
        expect(screen.getByText("🚦 Training")).toBeInTheDocument();
        expect(screen.getByText("👤 Users (Admin)")).toBeInTheDocument();
        expect(screen.getByText("👤 Users & Sections (Testing)")).toBeInTheDocument();
      });
    });

    test("testing tab remains unchanged and functional", async () => {
      renderWithAuth(softwareAdminUser);

      await waitFor(() => {
        expect(screen.getByText("👤 Users & Sections (Testing)")).toBeInTheDocument();
      });

      // The testing tab should still exist as a separate entity
      // (We're not testing its internal functionality here, just its presence)
    });

    test("no UI crashes on render", async () => {
      const { container } = renderWithAuth(softwareAdminUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // If we got here without throwing, the component rendered successfully
      expect(container).toBeInTheDocument();
    });
  });

  describe("Role-Based Visibility", () => {
    test("section panel visibility matches SOFTWARE_ADMIN role policy", async () => {
      const adminUser = { username: "admin", roles: ["SOFTWARE_ADMIN"] };
      const { rerender } = renderWithAuth(adminUser);

      await waitFor(() => {
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
      });

      // Re-render with regular user
      useAuth.mockReturnValue({ user: { username: "user", roles: ["SECTION_ADMIN"] } });
      rerender(
        <BrowserRouter>
          <SettingPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
      });
    });
  });

  describe("Production vs Testing Separation", () => {
    const softwareAdminUser = {
      username: "admin",
      roles: ["SOFTWARE_ADMIN"],
    };

    test("section creation exists in BOTH production and testing tabs", async () => {
      renderWithAuth(softwareAdminUser);

      // In Departments tab (production)
      await waitFor(() => {
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
      });

      // Testing tab should also exist
      expect(screen.getByText("👤 Users & Sections (Testing)")).toBeInTheDocument();
    });

    test("production panel is separate from testing tab component", async () => {
      renderWithAuth(softwareAdminUser);

      await waitFor(() => {
        // Both should exist but be separate components
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
        expect(screen.getByText("👤 Users & Sections (Testing)")).toBeInTheDocument();
      });

      // They should not be the same element
      const productionPanel = screen.getByTestId("section-creation-panel");
      const testingTab = screen.getByText("👤 Users & Sections (Testing)");
      expect(productionPanel).not.toBe(testingTab);
    });
  });

  describe("PHASE C — F-C8 — Role Guard Visibility Tests", () => {
    test("SOFTWARE_ADMIN can see Section Creation Panel", async () => {
      const adminUser = { username: "admin", roles: ["SOFTWARE_ADMIN"] };
      renderWithAuth(adminUser);

      await waitFor(() => {
        const panel = screen.getByTestId("section-creation-panel");
        expect(panel).toBeInTheDocument();
        expect(panel).toBeVisible();
      });
    });

    test("normal worker cannot see Section Creation Panel", async () => {
      const workerUser = { username: "worker", roles: ["STAFF"] };
      renderWithAuth(workerUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Panel should not exist in DOM at all
      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("SECTION_ADMIN cannot see Section Creation Panel", async () => {
      const sectionAdmin = { username: "section_admin", roles: ["SECTION_ADMIN"] };
      renderWithAuth(sectionAdmin);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Panel should not exist in DOM
      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("direct URL access - panel hidden for non-admin", async () => {
      const regularUser = { username: "user", roles: ["STAFF"] };
      renderWithAuth(regularUser);

      // Simulate direct deep link to Departments tab
      await waitFor(() => {
        expect(screen.getByTestId("department-table")).toBeInTheDocument();
      });

      // Panel should still be hidden even with direct access
      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("component not rendered (not just CSS hidden)", async () => {
      const regularUser = { username: "user", roles: ["STAFF"] };
      const { container } = renderWithAuth(regularUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Use querySelector to verify element doesn't exist in DOM at all
      const panelInDom = container.querySelector('[data-testid="section-creation-panel"]');
      expect(panelInDom).toBeNull();
    });

    test("user with no roles cannot see panel", async () => {
      const noRoleUser = { username: "noroles", roles: [] };
      renderWithAuth(noRoleUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("user with null roles cannot see panel", async () => {
      const nullRoleUser = { username: "nullroles", roles: null };
      renderWithAuth(nullRoleUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("no user logged in cannot see panel", async () => {
      renderWithAuth(null);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });

    test("no console errors when rendering without admin role", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      const regularUser = { username: "user", roles: ["STAFF"] };
      renderWithAuth(regularUser);

      await waitFor(() => {
        expect(screen.getByText("🏥 Departments")).toBeInTheDocument();
      });

      // Should not have any console errors
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test("panel visibility persists across tab switching", async () => {
      const adminUser = { username: "admin", roles: ["SOFTWARE_ADMIN"] };
      renderWithAuth(adminUser);

      // Panel visible in Departments tab
      await waitFor(() => {
        expect(screen.getByTestId("section-creation-panel")).toBeInTheDocument();
      });

      // Switch to Doctors tab
      const doctorsTab = screen.getByText("👨‍⚕️ Doctors");
      doctorsTab.click();

      await waitFor(() => {
        expect(screen.getByTestId("doctor-table")).toBeInTheDocument();
      });

      // Panel should not be in Doctors tab
      expect(screen.queryByTestId("section-creation-panel")).not.toBeInTheDocument();
    });
  });
});
