// src/utils/incidentCaseValidation.js
/**
 * Centralized validation utility for IncidentCase forms
 * Used by both Insert and Edit pages to enforce DB constraints
 * before submission
 */

/**
 * Check if a value is considered empty/invalid
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty/invalid
 */
const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};

/**
 * Validate IncidentCase form data against DB constraints
 * @param {Object} formData - Form data object containing all incident case fields
 * @returns {Object} Validation result with isValid flag and errors object
 * @returns {boolean} return.isValid - True if all required fields are valid
 * @returns {Object} return.errors - Object mapping field names to error messages
 */
export const validateIncidentCase = (formData) => {
  const errors = {};

  // Required field definitions (matching backend API requirements - 18 fields)
  const requiredFields = [
    // Text content (3 fields)
    { key: "complaint_text", label: "Complaint Text" },
    { key: "immediate_action", label: "Immediate Action" },
    { key: "taken_action", label: "Taken Action" },
    
    // Metadata (5 fields)
    { key: "feedback_received_date", label: "Feedback Received Date" },
    { key: "issuing_department_id", label: "Issuing Department" },
    { key: "source_id", label: "Source" },
    { key: "patient_name", label: "Patient Name" },
    
    // Classification hierarchy (4 fields)
    { key: "domain_id", label: "Domain" },
    { key: "category_id", label: "Category" },
    { key: "subcategory_id", label: "Subcategory" },
    { key: "classification_id", label: "Classification" },
    
    // Additional attributes (5 fields)
    { key: "severity_id", label: "Severity Level" },
    { key: "stage_id", label: "Stage" },
    { key: "harm_id", label: "Harm Level" },
    { key: "clinical_risk_type_id", label: "Clinical Risk Type" },
    { key: "feedback_intent_type_id", label: "Feedback Intent Type" },
  ];

  // Validate each required field
  requiredFields.forEach(({ key, label }) => {
    if (isEmpty(formData[key])) {
      errors[key] = `${label} is required`;
    }
  });

  // Special validation for boolean fields (must be true or false, not null)
  if (formData.is_inpatient !== true && formData.is_inpatient !== false) {
    errors.is_inpatient = "Patient Type (Inpatient/Outpatient) is required";
  }
  
  if (typeof formData.requires_explanation !== 'boolean') {
    errors.requires_explanation = "Requires Explanation (Yes/No) is required";
  }

  // Special validation for building (either building_id or building must be set)
  if (!formData.building && !formData.building_id) {
    errors.building = "Building (RAH/BIC) is required";
  }

  // Determine overall validity
  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
  };
};

/**
 * Get a user-friendly error message for a specific field
 * @param {Object} errors - Errors object from validateIncidentCase
 * @param {string} fieldName - Field name to get error for
 * @returns {string|null} Error message or null if no error
 */
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

/**
 * Check if form has any validation errors
 * @param {Object} errors - Errors object from validateIncidentCase
 * @returns {boolean} True if there are any errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get count of validation errors
 * @param {Object} errors - Errors object from validateIncidentCase
 * @returns {number} Number of errors
 */
export const getErrorCount = (errors) => {
  return Object.keys(errors).length;
};

/**
 * Get list of all error messages
 * @param {Object} errors - Errors object from validateIncidentCase
 * @returns {string[]} Array of error messages
 */
export const getErrorMessages = (errors) => {
  return Object.values(errors);
};
