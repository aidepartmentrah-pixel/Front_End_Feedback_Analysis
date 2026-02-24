// src/api/configApi.js
/**
 * Configuration API Client
 *
 * Communicates with the bootstrap config endpoints.
 * These endpoints use a static CONFIG_PASSWORD (via header),
 * NOT session-based authentication.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Helper to make config API requests with the password header.
 */
async function configFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  return response;
}

/**
 * Get system status (no password required).
 * @returns {{ bootstrap_mode: boolean, database: object, deployment_mode: string }}
 */
export async function getSystemStatus() {
  const res = await configFetch("/api/status");
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
}

/**
 * Verify the config password.
 * @param {string} password
 * @returns {{ valid: boolean }}
 */
export async function verifyPassword(password) {
  const res = await configFetch("/api/config/verify-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  if (res.status === 429) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }
  if (!res.ok) throw new Error("Failed to verify password");
  return res.json();
}

/**
 * Get current settings (passwords masked).
 * @param {string} password - Config password
 * @returns {object} - Settings object
 */
export async function getSettings(password) {
  const res = await configFetch("/api/config/settings", {
    headers: {
      "Content-Type": "application/json",
      "X-Config-Password": password,
    },
  });
  if (res.status === 401) throw new Error("Invalid configuration password");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

/**
 * Test a database connection with provided parameters.
 * @param {string} password - Config password
 * @param {object} dbParams - Database connection parameters
 * @returns {{ success: boolean, message: string, duration_ms: number }}
 */
export async function testConnection(password, dbParams) {
  const res = await configFetch("/api/config/test-connection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Config-Password": password,
    },
    body: JSON.stringify(dbParams),
  });
  if (res.status === 401) throw new Error("Invalid configuration password");
  if (!res.ok) throw new Error("Failed to test connection");
  return res.json();
}

/**
 * Save configuration settings.
 * @param {string} password - Config password
 * @param {object} settings - Partial or full settings to save
 * @returns {{ saved: boolean, message: string }}
 */
export async function saveSettings(password, settings) {
  const res = await configFetch("/api/config/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Config-Password": password,
    },
    body: JSON.stringify(settings),
  });
  if (res.status === 401) throw new Error("Invalid configuration password");
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

/**
 * Reload configuration and re-test database connection.
 * @param {string} password - Config password
 * @returns {{ reloaded: boolean, database_connected: boolean, bootstrap_mode: boolean }}
 */
export async function reloadConfig(password) {
  const res = await configFetch("/api/config/reload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Config-Password": password,
    },
  });
  if (res.status === 401) throw new Error("Invalid configuration password");
  if (!res.ok) throw new Error("Failed to reload configuration");
  return res.json();
}

/**
 * Get list of installed ODBC drivers.
 * @param {string} password - Config password
 * @returns {{ drivers: string[], sql_server_drivers: string[], recommended: string|null }}
 */
export async function getDrivers(password) {
  const res = await configFetch("/api/config/drivers", {
    headers: {
      "Content-Type": "application/json",
      "X-Config-Password": password,
    },
  });
  if (res.status === 401) throw new Error("Invalid configuration password");
  if (!res.ok) throw new Error("Failed to fetch drivers");
  return res.json();
}
