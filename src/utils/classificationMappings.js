// Reverse mappings: Text label -> Database ID
// Used to convert AI model predictions to database IDs

export const DOMAIN_MAP = {
  1: "CLINICAL",
  2: "MANAGEMENT",
  3: "RELATIONAL",
};

export const REVERSE_DOMAIN_MAP = {
  "CLINICAL": 1,
  "MANAGEMENT": 2,
  "RELATIONAL": 3,
};

export const CATEGORY_MAP = {
  1: "Communication",
  2: "Environement",
  3: "Institutional Processes",
  4: "Listening",
  5: "Quality of Care",
  6: "Respect & Patient Rights",
  7: "Safety",
};

export const REVERSE_CATEGORY_MAP = {
  "Communication": 1,
  "Environement": 2,
  "Institutional Processes": 3,
  "Listening": 4,
  "Quality of Care": 5,
  "Respect & Patient Rights": 6,
  "Safety": 7,
};

export const SUBCATEGORY_MAP = {
  1: "Neglect - General",
  2: "Absent Communication",
  3: "Accomodation",
  4: "Bureaucracy",
  5: "Clinician - Errors",
  6: "Delay - Access",
  8: "Delay - General",
  9: "Delay - Procedure",
  10: "Delayed Communication",
  11: "Dismissing Patients",
  12: "Disrespect",
  13: "Documentation",
  14: "Equipment",
  15: "Error - Diagnosis",
  16: "Error - General",
  18: "Error - Medication",
  19: "Examination & Monitoring",
  21: "Failure to Provide",
  22: "Failure to Respond",
  23: "Ignoring Patients",
  24: "Incorrect Communication",
  26: "Neglect - Hygiene & Personal Care",
  27: "Rights",
  28: "Security",
  29: "Teamwork",
  30: "Visiting",
  31: "Ward Cleanliness",
};

export const REVERSE_SUBCATEGORY_MAP = {
  "Neglect - General": 1,
  "Absent Communication": 2,
  "Accomodation": 3,
  "Bureaucracy": 4,
  "Clinician - Errors": 5,
  "Delay - Access": 6,
  "Delay - General": 8,
  "Delay - Procedure": 9,
  "Delayed Communication": 10,
  "Dismissing Patients": 11,
  "Disrespect": 12,
  "Documentation": 13,
  "Equipment": 14,
  "Error - Diagnosis": 15,
  "Error - General": 16,
  "Error - Medication": 18,
  "Examination & Monitoring": 19,
  "Failure to Provide": 21,
  "Failure to Respond": 22,
  "Ignoring Patients": 23,
  "Incorrect Communication": 24,
  "Neglect - Hygiene & Personal Care": 26,
  "Rights": 27,
  "Security": 28,
  "Teamwork": 29,
  "Visiting": 30,
  "Ward Cleanliness": 31,
};

export const SEVERITY_MAP = {
  1: "HIGH",
  2: "LOW",
  3: "MEDIUM",
  6: "Moderate",
};

export const REVERSE_SEVERITY_MAP = {
  "HIGH": 1,
  "LOW": 2,
  "MEDIUM": 3,
  "Moderate": 6,
};

export const STAGE_MAP = {
  1: "Examination & Diagnosis",
  2: "Admissions",
  4: "Care on the Ward",
  6: "Discharge/Transfer",
  8: "Operation/Procedure",
  9: "Unspecified",
};

export const REVERSE_STAGE_MAP = {
  "Examination & Diagnosis": 1,
  "Admissions": 2,
  "Care on the Ward": 4,
  "Discharge/Transfer": 6,
  "Operation/Procedure": 8,
  "Unspecified": 9,
};

export const HARM_MAP = {
  1: "Severe Harm",
  2: "Death",
  3: "High Severe",
  4: "Minor Harm",
  5: "Moderate Harm",
  6: "No Harm",
};

export const REVERSE_HARM_MAP = {
  "Severe Harm": 1,
  "Death": 2,
  "High Severe": 3,
  "Minor Harm": 4,
  "Moderate Harm": 5,
  "No Harm": 6,
};

// Feedback Intent Type Mappings (these come as text from AI, need to convert to IDs)
export const FEEDBACK_INTENT_TYPE_MAP = {
  "Improvement Opportunity": 1,
  "Notice": 2,
  "Critique / Suggestion": 3,
  "Critique/Suggestion": 3,
  "Other": 4,
};

export const REVERSE_FEEDBACK_INTENT_MAP = {
  1: "Improvement Opportunity",
  2: "Notice",
  3: "Critique / Suggestion",
  4: "Other",
};

// Clinical Risk Type Mappings (these come as text from AI, need to convert to IDs)
export const CLINICAL_RISK_TYPE_MAP = {
  "Ordinary": 1,
  "Ordinary Complaint": 1,
  "Red Flag": 2,
  "Never Event": 3,
};

export const REVERSE_CLINICAL_RISK_MAP = {
  1: "Ordinary",
  2: "Red Flag",
  3: "Never Event",
};

/**
 * Convert classification text values to database IDs
 * Handles both text labels (from model) and already-IDs (from API)
 */
export const normalizeClassifications = (classificationResponse) => {
  const result = {
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,
    severity_id: null,
    stage_id: null,
    harm_id: null,
    feedback_intent_type_id: null,
    clinical_risk_type_id: null,
  };

  // Map directly from API response using correct field names
  if (classificationResponse.domain_id) {
    result.domain_id = Number(classificationResponse.domain_id);
  } else if (classificationResponse.domain) {
    result.domain_id = REVERSE_DOMAIN_MAP[classificationResponse.domain];
  }

  if (classificationResponse.category_id) {
    result.category_id = Number(classificationResponse.category_id);
  } else if (classificationResponse.category) {
    result.category_id = REVERSE_CATEGORY_MAP[classificationResponse.category];
  }

  // Handle both subcategory_id and sub_category_id (API returns both formats)
  if (classificationResponse.subcategory_id) {
    result.subcategory_id = Number(classificationResponse.subcategory_id);
  } else if (classificationResponse.sub_category_id) {
    result.subcategory_id = Number(classificationResponse.sub_category_id);
  } else if (classificationResponse.sub_category) {
    result.subcategory_id = REVERSE_SUBCATEGORY_MAP[classificationResponse.sub_category];
  }

  if (classificationResponse.classification_id) {
    result.classification_id = Number(classificationResponse.classification_id);
  }

  // Map severity_level_id to severity_id (form field name)
  if (classificationResponse.severity_level_id) {
    result.severity_id = Number(classificationResponse.severity_level_id);
  } else if (classificationResponse.severity_id) {
    result.severity_id = Number(classificationResponse.severity_id);
  } else if (classificationResponse.severity_level) {
    result.severity_id = REVERSE_SEVERITY_MAP[classificationResponse.severity_level];
  }

  if (classificationResponse.stage_id) {
    result.stage_id = Number(classificationResponse.stage_id);
  } else if (classificationResponse.stage) {
    result.stage_id = REVERSE_STAGE_MAP[classificationResponse.stage];
  }

  // Map harm_level_id to harm_id (form field name)
  if (classificationResponse.harm_level_id) {
    result.harm_id = Number(classificationResponse.harm_level_id);
  } else if (classificationResponse.harm_id) {
    result.harm_id = Number(classificationResponse.harm_id);
  } else if (classificationResponse.harm_level) {
    result.harm_id = REVERSE_HARM_MAP[classificationResponse.harm_level];
  }

  // Map feedback_type_id to feedback_intent_type_id (form field name)
  if (classificationResponse.feedback_type_id) {
    const val = classificationResponse.feedback_type_id;
    // If it's already a number, use it; if it's text, map it
    result.feedback_intent_type_id = typeof val === 'number' ? val : FEEDBACK_INTENT_TYPE_MAP[val];
    console.log("✅ Mapped feedback_type_id:", val, "→ feedback_intent_type_id:", result.feedback_intent_type_id);
  } else {
    console.warn("⚠️ feedback_type_id not found in response:", classificationResponse);
  }

  // Map improvement_opportunity_type_id to clinical_risk_type_id (form field name)
  if (classificationResponse.improvement_opportunity_type_id) {
    const val = classificationResponse.improvement_opportunity_type_id;
    // If it's already a number, use it; if it's text, map it
    result.clinical_risk_type_id = typeof val === 'number' ? val : CLINICAL_RISK_TYPE_MAP[val];
    console.log("✅ Mapped improvement_opportunity_type_id:", val, "→ clinical_risk_type_id:", result.clinical_risk_type_id);
  } else {
    console.warn("⚠️ improvement_opportunity_type_id not found in response:", classificationResponse);
  }

  console.log("📊 Final normalized result:", result);
  return result;
};
