// src/context/AuthContext.unit.test.js
import "@testing-library/jest-dom";

describe("AuthContext - Phase A User Normalization Logic (Unit Tests)", () => {
  // Test the normalization logic as a standalone function
  const normalizeUser = (rawUser) => {
    return {
      ...rawUser,
      display_name: rawUser.display_name ?? rawUser.username ?? null,
      department_display_name: rawUser.department_display_name ?? null,
    };
  };

  describe("F-A1: User Shape Normalization - Pure Logic", () => {
    it("should preserve user with all identity fields present", () => {
      const mockUser = {
        user_id: 1,
        username: "jsmith",
        display_name: "John Smith",
        department_display_name: "Cardiology",
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized).toEqual(mockUser);
      expect(normalized.display_name).toBe("John Smith");
      expect(normalized.department_display_name).toBe("Cardiology");
    });

    it("should fallback display_name to username when missing", () => {
      const mockUser = {
        user_id: 2,
        username: "legacy_user",
        department_display_name: "Surgery",
        roles: ["admin"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("legacy_user");
      expect(normalized.department_display_name).toBe("Surgery");
      expect(normalized.username).toBe("legacy_user");
    });

    it("should set display_name to null when both display_name and username are missing", () => {
      const mockUser = {
        user_id: 3,
        department_display_name: "Emergency",
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe(null);
      expect(normalized.department_display_name).toBe("Emergency");
    });

    it("should set department_display_name to null when missing", () => {
      const mockUser = {
        user_id: 4,
        username: "admin_user",
        display_name: "Admin User",
        roles: ["software_admin"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("Admin User");
      expect(normalized.department_display_name).toBe(null);
    });

    it("should handle null values explicitly set in backend response", () => {
      const mockUser = {
        user_id: 5,
        username: "test_user",
        display_name: null,
        department_display_name: null,
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("test_user"); // Falls back to username
      expect(normalized.department_display_name).toBe(null);
    });

    it("should preserve all other user fields during normalization", () => {
      const mockUser = {
        user_id: 6,
        username: "full_user",
        display_name: "Full User",
        department_display_name: "Radiology",
        roles: ["user", "section_admin"],
        email: "full@example.com",
        customField: "custom_value",
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized).toEqual(mockUser);
      expect(normalized.email).toBe("full@example.com");
      expect(normalized.customField).toBe("custom_value");
    });

    it("should handle undefined display_name", () => {
      const mockUser = {
        user_id: 7,
        username: "undefined_test",
        display_name: undefined,
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("undefined_test");
      expect(normalized.department_display_name).toBe(null);
    });

    it("should handle undefined department_display_name", () => {
      const mockUser = {
        user_id: 8,
        username: "dept_test",
        display_name: "Department Test",
        department_display_name: undefined,
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("Department Test");
      expect(normalized.department_display_name).toBe(null);
    });

    it("should handle empty string display_name as truthy value", () => {
      const mockUser = {
        user_id: 9,
        username: "empty_test",
        display_name: "",
        roles: ["user"],
      };

      const normalized = normalizeUser(mockUser);

      // Empty string is a valid value for ?? operator (not null/undefined)
      expect(normalized.display_name).toBe("");
    });

    it("should handle empty object", () => {
      const mockUser = {};

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe(null);
      expect(normalized.department_display_name).toBe(null);
    });

    it("should handle roles array preservation", () => {
      const mockUser = {
        user_id: 10,
        username: "role_user",
        display_name: "Role User",
        department_display_name: "Lab",
        roles: ["user", "section_admin", "admin"],
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.roles).toEqual(["user", "section_admin", "admin"]);
      expect(normalized.roles.length).toBe(3);
    });

    it("should handle missing roles array", () => {
      const mockUser = {
        user_id: 11,
        username: "no_roles",
        display_name: "No Roles",
        department_display_name: "Pharmacy",
      };

      const normalized = normalizeUser(mockUser);

      expect(normalized.display_name).toBe("No Roles");
      expect(normalized.department_display_name).toBe("Pharmacy");
      expect(normalized.roles).toBeUndefined();
    });
  });

  describe("F-A3: Defensive Fallback Patterns", () => {
    it("should handle null user object", () => {
      const mockUser = null;

      // The normalization function should handle this gracefully
      const safeNormalize = (user) => {
        if (!user) return null;
        return normalizeUser(user);
      };

      const normalized = safeNormalize(mockUser);
      expect(normalized).toBe(null);
    });

    it("should handle undefined user object", () => {
      const mockUser = undefined;

      const safeNormalize = (user) => {
        if (!user) return null;
        return normalizeUser(user);
      };

      const normalized = safeNormalize(mockUser);
      expect(normalized).toBe(null);
    });
  });

  describe("Nullish Coalescing Operator (??) Behavior", () => {
    it("should use ?? correctly (only null/undefined, not empty string)", () => {
      const testCases = [
        { input: "value", username: "backup", expected: "value" },
        { input: null, username: "backup", expected: "backup" },
        { input: undefined, username: "backup", expected: "backup" },
        { input: "", username: "backup", expected: "" }, // Empty string IS defined, so ?? won't fallback
        { input: 0, username: "backup", expected: 0 }, // 0 is defined
      ];

      testCases.forEach(({ input, username, expected }) => {
        const user = {
          display_name: input,
          username: username,
        };
        const result = normalizeUser(user);
        
        expect(result.display_name).toBe(expected);
      });
    });
  });
});
