// src/api/distribution.js
// API client for Distribution Operator analysis

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch distribution data for a given dimension and time configuration
 * @param {Object} requestBody - Request payload
 * @param {string} requestBody.dimension - Analysis dimension (domain, category, subcategory, classification, stage, severity, harm)
 * @param {string} requestBody.time_mode - Time mode: "single", "multi", or "binary_split"
 * @param {Object} [requestBody.time_window] - Single time window (for single mode)
 * @param {Array} [requestBody.time_windows] - Multiple time windows (for multi mode)
 * @param {string} [requestBody.split_date] - Split date in YYYY-MM-DD format (for binary_split mode)
 * @param {Object} [requestBody.filters] - Optional filters
 * @param {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @returns {Promise<Object>} Distribution analysis data
 */
export async function fetchDistributionData(requestBody, signal = null) {
  const url = `${API_BASE_URL}/api/operators/distribution`;
  
  console.log("📡 Posting distribution request to:", url);
  console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: signal, // Support request cancellation
    });

    // Try to parse response body
    let responseData;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ Non-JSON response:", text);
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }

    // Handle error responses with detailed messages
    if (!response.ok) {
      console.error("❌ API Error Response:", responseData);
      
      // Handle bad request (400)
      if (response.status === 400) {
        const errorMessage = responseData.detail || responseData.message || "Invalid request parameters";
        throw new Error(errorMessage);
      }
      
      // Handle validation errors (422) with field-specific details
      if (response.status === 422 && responseData.detail) {
        const validationErrors = Array.isArray(responseData.detail)
          ? responseData.detail.map(err => {
              const field = err.loc?.join('.') || 'unknown field';
              return `${field}: ${err.msg}`;
            }).join(', ')
          : JSON.stringify(responseData.detail);
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      // Handle server errors (500)
      if (response.status >= 500) {
        const errorMessage = responseData.detail || "Server error. Please try again later.";
        throw new Error(errorMessage);
      }
      
      // Generic error
      throw new Error(
        responseData.detail || 
        responseData.message || 
        `Request failed with status ${response.status}`
      );
    }

    console.log("✅ Distribution data received:", responseData);
    return responseData;

  } catch (error) {
    // Handle abort errors (request cancellation)
    if (error.name === 'AbortError') {
      console.log("🚫 Request cancelled");
      throw new Error("Request cancelled");
    }
    
    // Network errors or other exceptions
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error("❌ Network error:", error);
      throw new Error("Network error. Please check your connection.");
    }
    
    console.error("❌ Distribution fetch error:", error);
    throw error;
  }
}

/**
 * Helper function to build a time window object
 * @param {string} type - Window type: "year", "season", "month", "range"
 * @param {*} value - Window value (depends on type)
 * @returns {Object} Time window object
 */
export function buildTimeWindow(type, value) {
  return {
    type: type,
    value: value
  };
}

/**
 * Helper function to validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
export function isValidDateFormat(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

/**
 * Helper function to validate season format (YYYY-Q[1-4])
 * @param {string} seasonStr - Season string to validate
 * @returns {boolean} True if valid
 */
export function isValidSeasonFormat(seasonStr) {
  if (!seasonStr || typeof seasonStr !== 'string') return false;
  const regex = /^\d{4}-Q[1-4]$/;
  return regex.test(seasonStr);
}

/**
 * Helper function to validate month format (YYYY-MM)
 * @param {string} monthStr - Month string to validate
 * @returns {boolean} True if valid
 */
export function isValidMonthFormat(monthStr) {
  if (!monthStr || typeof monthStr !== 'string') return false;
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(monthStr);
}
