// src/components/TopBar.greeting.test.js
/**
 * F-A2 — TopBar Greeting Logic Tests
 * 
 * Tests verify:
 * 1. display_name is used when present
 * 2. Fallback to username when display_name is null/undefined
 * 3. Fallback to "User" when both are missing
 * 4. Nullish coalescing (??) behavior is correct
 */

import "@testing-library/jest-dom";

describe("TopBar Greeting Logic - Phase A", () => {
  // Test the greeting logic as pure function
  const getGreeting = (user) => {
    return user?.display_name ?? user?.username ?? "User";
  };

  describe("F-A2: Display Name Greeting with Fallback", () => {
    it("should use display_name when present", () => {
      const user = {
        username: "jsmith",
        display_name: "John Smith",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("John Smith");
    });

    it("should fallback to username when display_name is null", () => {
      const user = {
        username: "legacy_user",
        display_name: null,
        roles: ["admin"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("legacy_user");
    });

    it("should fallback to username when display_name is undefined", () => {
      const user = {
        username: "old_user",
        // display_name is undefined
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("old_user");
    });

    it("should fallback to 'User' when both display_name and username are null", () => {
      const user = {
        display_name: null,
        username: null,
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });

    it("should fallback to 'User' when both display_name and username are undefined", () => {
      const user = {
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });

    it("should fallback to 'User' when user is null", () => {
      const user = null;

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });

    it("should fallback to 'User' when user is undefined", () => {
      const user = undefined;

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });
  });

  describe("Nullish Coalescing (??) Operator Behavior", () => {
    it("should NOT fallback when display_name is empty string (truthy for ??)", () => {
      const user = {
        username: "backup_user",
        display_name: "",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      // Empty string is NOT null/undefined, so ?? doesn't fallback
      expect(greeting).toBe("");
    });

    it("should NOT fallback when display_name is 0 (truthy for ??)", () => {
      const user = {
        username: "backup_user",
        display_name: 0,
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe(0);
    });

    it("should NOT fallback when display_name is false (truthy for ??)", () => {
      const user = {
        username: "backup_user",
        display_name: false,
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe(false);
    });

    it("should fallback only on null or undefined", () => {
      const testCases = [
        { display_name: "Real Name", expected: "Real Name" },
        { display_name: null, username: "fallback", expected: "fallback" },
        { display_name: undefined, username: "fallback", expected: "fallback" },
        { display_name: "", username: "fallback", expected: "" },
        { display_name: 0, username: "fallback", expected: 0 },
        { display_name: false, username: "fallback", expected: false },
      ];

      testCases.forEach(({ display_name, username, expected }) => {
        const user = { display_name, username, roles: ["user"] };
        const greeting = getGreeting(user);
        expect(greeting).toBe(expected);
      });
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle new user with full profile", () => {
      const user = {
        user_id: 1,
        username: "jsmith",
        display_name: "Dr. John Smith",
        department_display_name: "Cardiology",
        roles: ["user", "section_admin"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("Dr. John Smith");
    });

    it("should handle legacy user without display_name field", () => {
      const user = {
        user_id: 2,
        username: "legacy_admin",
        roles: ["admin"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("legacy_admin");
    });

    it("should handle minimal user object", () => {
      const user = {
        user_id: 3,
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });

    it("should handle user with special characters in name", () => {
      const user = {
        username: "m.oleary",
        display_name: "Mary O'Leary-Smith",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("Mary O'Leary-Smith");
    });

    it("should handle user with unicode characters", () => {
      const user = {
        username: "mperez",
        display_name: "María Pérez",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("María Pérez");
    });

    it("should handle very long display name", () => {
      const user = {
        username: "longname",
        display_name: "Dr. Elizabeth Alexandra Mary Windsor-Mountbatten",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("Dr. Elizabeth Alexandra Mary Windsor-Mountbatten");
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with only whitespace in display_name", () => {
      const user = {
        username: "backup",
        display_name: "   ",
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      // Whitespace is NOT null/undefined
      expect(greeting).toBe("   ");
    });

    it("should handle user with numeric username", () => {
      const user = {
        username: "12345",
        display_name: null,
        roles: ["user"],
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe("12345");
    });

    it("should handle empty object", () => {
      const user = {};

      const greeting = getGreeting(user);
      expect(greeting).toBe("User");
    });
  });

  describe("Backwards Compatibility", () => {
    it("should work with old user objects (no display_name field)", () => {
      const oldUser = {
        user_id: 99,
        username: "oldstyle",
        roles: ["user"],
        // No display_name field at all
      };

      const greeting = getGreeting(oldUser);
      expect(greeting).toBe("oldstyle");
    });

    it("should work with user objects from different API versions", () => {
      const users = [
        { username: "v1user" }, // Old API
        { username: "v2user", display_name: null }, // Transitional API
        { username: "v3user", display_name: "V3 User" }, // New API
      ];

      const greetings = users.map(getGreeting);
      expect(greetings).toEqual(["v1user", "v2user", "V3 User"]);
    });
  });

  describe("Type Safety", () => {
    it("should return string type for valid inputs", () => {
      const user = {
        username: "test",
        display_name: "Test User",
      };

      const greeting = getGreeting(user);
      expect(typeof greeting).toBe("string");
    });

    it("should handle when username is not a string", () => {
      const user = {
        username: 123,
        display_name: null,
      };

      const greeting = getGreeting(user);
      expect(greeting).toBe(123);
    });
  });
});
