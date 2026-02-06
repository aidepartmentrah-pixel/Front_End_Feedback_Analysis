// src/dev/testAccounts.js

/**
 * DEV-ONLY: Reference list of test accounts for manual testing
 * 
 * ⚠️ WARNING:
 * - For reference only
 * - Do NOT use for auto-login
 * - Do NOT use for autofill
 * - Backend should provide actual test accounts via API
 */
export const testAccounts = [
  {
    role: "SOFTWARE_ADMIN",
    username: "software_admin",
    password: "admin123",
    description: "Full system administrator",
  },
  {
    role: "SECTION_ADMIN",
    username: "sec_10_admin",
    password: "Hospital2026!",
    description: "Section 10 administrator",
  },
];
