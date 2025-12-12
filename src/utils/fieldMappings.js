// src/utils/fieldMappings.js
// Backend ID mappings for all classification fields

export const SOURCE_MAP = {
  "جولات": 1,
  "حضور": 2,
  "خط ساخن": 3,
  "صندوق": 4,
  "مشرف": 5,
  "موظف": 6,
  "واتساب مكتب": 7,
  "وسائل التواصل": 8,
};

export const DOMAIN_MAP = {
  "CLINICAL": 1,
  "MANAGEMENT": 2,
  "RELATIONAL": 3,
};

export const CATEGORY_MAP = {
  "Communication": 1,
  "Environement": 2,
  "Institutional Processes": 3,
  "Listening": 4,
  "Quality of Care": 5,
  "Respect & Patient Rights": 6,
  "Safety": 7,
};

export const SUBCATEGORY_MAP = {
  "Absent Communication": 2,
  "Accommodation": 3,
  "Bureaucracy": 4,
  "Clinician -Errors": 5,
  "Delay -Access": 6,
  "Delay -General": 8,
  "Delay -Procedure": 9,
  "Delayed Communication": 10,
  "Dismissing Patients": 11,
  "Disrespect": 12,
  "Documentation": 13,
  "Equipment": 14,
  "Error - Diagnosis": 15,
  "Error -General": 16,
  "Error -Medication": 18,
  "Examination & Monitoring": 19,
  "Failure to Provide": 21,
  "Failure to Respond": 22,
  "Ignoring Patients": 23,
  "Incorrect Communication": 24,
  "Neglect -General": 1,
  "Neglect -Hygiene & Personal Care": 26,
  "Rights": 27,
  "Security": 28,
  "Teamwork": 29,
  "Visiting": 30,
  "Ward Cleanliness": 31
};

export const CLASSIFICATION_EN_MAP = {
  "Neglect -General (Basic Care,Medical Care,Safe Environment,Physiological Support..)": 1,
  "Phone Calls Not Anwered": 2,
  "Scheduling Error": 3,
  "Surgical Procedures Delayed": 4,
  "Technical skills of Staff(that compromise Safety)": 5,
  "Absent Communication": 6,
  "Accomodation Problems(Air Conditioning..)": 7,
  "accomodation Problems(area problem..)": 8,
  "Accomodation Problems(Devices,Beds..)": 9,
  "Accomodation Problems(Tissue,Basket...)": 10,
  "Bed Sore Problems": 11,
  "Bed Unavailablity": 12,
  "Complex Procedures/Approvals/Costs": 13,
  "Complications(Surgical Complication)": 14,
  "Coordination Failure(Team,Other Departements..)": 15,
  "Coordination Problem(Team,Other Departements..)": 16,
  "Daily Doctor Visits(Attending Physician,Consulting Physician)": 17,
  "Delay -General(Delay to Respond..)": 18,
  "Delay Access(Clinic Appointment)": 19,
  "Delay Access(Imaging Appointment)": 20,
  "Delay Access(Waiting for Consultation..)": 21,
  "Delay Cleaning": 22,
  "Delay Medical Pocedure": 23,
  "Delay Procedure(Medical Attendance..)": 24,
  "Delay Procedure(Waiting for Imaging,LAB.Tests..)": 25,
  "Delay Transfer(room..)": 26,
  "Delayed Communication": 27,
  "Delayed Nurse call": 28,
  "Delayed Procedure(Imaging Reports..)": 29,
  "Delayed Test Results": 30,
  "Dimissing Patients": 31,
  "Disagreement Protocol(ER..)": 32,
  "Disagreement Protocol(Lab..)": 33,
  "Discharge Delay Problem": 34,
  "Disrespect": 35,
  "Documentation Problem(Devices,Discharge..)": 36,
  "Equipement & Supplies Problems(OR,Echo..)": 37,
  "Error - Diagnosis": 38,
  "Error -Medication": 39,
  "Error in Monitoring": 40,
  "Error Procedure(Lab,X-Ray..)": 41,
  "Examination/Monitoring Problems": 42,
  "Failure to Agree(Treatment Plan,Discharge Decision..)": 43,
  "Failure to Provide(Assistant Visit Issue..)": 44,
  "Failure to Provide(Information,Treatment..)": 45,
  "Failure to Respond(Nurse call unfunctional)": 46,
  "First Class Services": 47,
  "Hygene Problem(Room..)": 48,
  "Ignoring Patients": 49,
  "Imaging Procedure Error": 50,
  "Incorrect Communication": 51,
  "IT Problems": 52,
  "IV Problem(IV Insertion Error..)": 53,
  "IV Problem(Nursing Skills..)": 54,
  "Medical Protocol": 55,
  "Nasocomial Infection Problem": 56,
  "Noise(Accompagnant,Patients..)": 57,
  "Noise(Devices,Doors..)": 58,
  "Noise(Employee..)": 59,
  "Noise(Workshop..)": 60,
  "Nursing Care Problems(Diapper,bath..)": 61,
  "Nutritional Problem(Cold Food,Insufficient..)": 62,
  "Patient Case Coordination": 63,
  "Patient Cases not Organized": 64,
  "Problem Procedure(Foley..)": 65,
  "Problems in ihe facilities(pillows, covers..)": 66,
  "Respect for beliefs": 67,
  "Security Problem(Lost ..)": 68,
  "Teamwork Problem(Doctors,Nursing..)": 69,
  "Technician Skills Deficiency(Tests..)": 70,
  "Unsafe Environment": 71,
  "Unsafe Packaging for Food": 72,
  "Visiting Process": 73
};

export const SEVERITY_MAP = {
  "HIGH": 1,
  "LOW": 2,
  "MEDIUM": 3,
  "MODERATE": 6,
};

export const STAGE_MAP = {
  "Examination &Diagnosis": 1,
  "Admissions": 2,
  "Care on the Ward": 4,
  "Discharge/Transfer": 6,
  "Operation/Procedure": 8,
  "Unspecified": 9,
};

export const HARM_MAP = {
  "Severe Harm": 1,
  "Death": 2,
  "High Severe": 3,
  "Minor Harm": 4,
  "Moderate Harm": 5,
  "No Harm": 6,
};

export const STATUS_MAP = {
  "Closed": 1,
  "In Progress": 3,
  "Red Flag": 4,
};

// Convert maps to UI-friendly options arrays
export const SOURCE_OPTIONS = Object.entries(SOURCE_MAP).map(
  ([label, id]) => ({ id, label })
);

export const DOMAIN_OPTIONS = Object.entries(DOMAIN_MAP).map(
  ([label, id]) => ({ id, label })
);

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP).map(
  ([label, id]) => ({ id, label })
);

export const SUBCATEGORY_OPTIONS = Object.entries(SUBCATEGORY_MAP).map(
  ([label, id]) => ({ id, label })
);

export const CLASSIFICATION_OPTIONS = Object.entries(CLASSIFICATION_EN_MAP).map(
  ([label, id]) => ({ id, label })
);

export const SEVERITY_OPTIONS = Object.entries(SEVERITY_MAP).map(
  ([label, id]) => ({ id, label })
);

export const STAGE_OPTIONS = Object.entries(STAGE_MAP).map(
  ([label, id]) => ({ id, label })
);

export const HARM_OPTIONS = Object.entries(HARM_MAP).map(
  ([label, id]) => ({ id, label })
);

export const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(
  ([label, id]) => ({ id, label })
);

// Helper function to get label by ID
export const getLabelById = (map, id) => {
  const entry = Object.entries(map).find(([_, value]) => value === id);
  return entry ? entry[0] : "";
};

// Helper function to get ID by label
export const getIdByLabel = (map, label) => {
  return map[label] || null;
};
