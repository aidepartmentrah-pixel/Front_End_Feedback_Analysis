// src/dev/loginVerificationChecklist.js

/**
 * DEV-ONLY: Checklist for manual login verification testing
 * Use this as a reference when testing authentication flows
 */
export const loginVerificationChecklist = [
  "Login with software_admin",
  "Login with section_admin",
  "Wrong password rejected",
  "Unknown user rejected",
  "Refresh page keeps session",
  "Logout redirects to login",
  "Protected route blocked when logged out",
  "Software-admin page blocked for section_admin",
];
