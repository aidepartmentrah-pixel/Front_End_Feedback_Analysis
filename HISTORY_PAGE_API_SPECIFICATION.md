# History Page - API Endpoint Specification

## Overview
This document specifies all API endpoints needed for the History Page, which contains two sub-pages:
1. **Patient History** - Currently using API (patientHistory.js - fully implemented in frontend)
2. **Doctor History** - Currently using mock data (needs both frontend and backend implementation)

---

## 🟢 Patient History API (Already Implemented in Frontend)

**Base URL:** `http://0.0.0.0:8000/api/patients`

**Frontend Status:** ✅ Fully implemented in `src/api/patientHistory.js`

**Backend Status:** ⚠️ Needs implementation

### 1. Search Patients
```
GET /api/patients/search
```

**Query Parameters:**
- `query` (optional) - Search text (patient name, ID, etc.)
- `mrn` (optional) - Medical Record Number
- `phone` (optional) - Phone number
- `limit` (optional, default: 50) - Max results

**Response:**
```json
{
  "success": true,
  "patients": [
    {
      "patient_id": "P12345",
      "name": "Ahmed Mohammed Ali",
      "mrn": "MRN-98765",
      "phone": "+966 50 123 4567",
      "age": 45,
      "gender": "Male"
    }
  ],
  "total": 1
}
```

**Frontend Usage:**
```javascript
import { searchPatients } from "../api/patientHistory";

const results = await searchPatients("Ahmed", {
  mrn: "MRN-98765",
  phone: "+966501234567",
  limit: 50
});
```

---

### 2. Get Patient Profile
```
GET /api/patients/{patient_id}/profile
```

**Path Parameters:**
- `patient_id` - Patient ID (e.g., "P12345")

**Response:**
```json
{
  "success": true,
  "profile": {
    "patient_id": "P12345",
    "name": "Ahmed Mohammed Ali",
    "age": 45,
    "gender": "Male",
    "phone": "+966 50 123 4567",
    "email": "ahmed.ali@email.com",
    "mrn": "MRN-98765",
    "total_incidents": 8,
    "profile_picture": null
  }
}
```

**Frontend Usage:**
```javascript
import { getPatientProfile } from "../api/patientHistory";

const profile = await getPatientProfile("P12345");
```

---

### 3. Get Patient Incidents (Feedback List)
```
GET /api/patients/{patient_id}/incidents
```

**Path Parameters:**
- `patient_id` - Patient ID

**Query Parameters:**
- `severity` (optional) - Filter by severity (HIGH, MEDIUM, LOW)
- `from_date` (optional) - Start date (YYYY-MM-DD)
- `to_date` (optional) - End date (YYYY-MM-DD)
- `department` (optional) - Filter by department
- `status` (optional) - Filter by status (OPEN, CLOSED, UNDER_REVIEW)
- `limit` (optional, default: 100) - Max results
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "incidents": [
    {
      "id": 1,
      "incident_id": "INC-2024-0123",
      "date": "2024-12-15",
      "department": "Cardiology",
      "category": "Delayed Treatment",
      "severity": "HIGH",
      "doctor_name": "Dr. Michael Chen",
      "status": "OPEN",
      "description": "Delay in emergency procedure"
    }
  ],
  "total": 8,
  "limit": 100,
  "offset": 0
}
```

**Frontend Usage:**
```javascript
import { getPatientIncidents } from "../api/patientHistory";

const incidents = await getPatientIncidents("P12345", {
  severity: "HIGH",
  from_date: "2024-01-01",
  to_date: "2024-12-31",
  department: "Cardiology",
  status: "OPEN",
  limit: 100,
  offset: 0
});
```

---

### 4. Get Incident Details
```
GET /api/patients/{patient_id}/incidents/{incident_id}
```

**Path Parameters:**
- `patient_id` - Patient ID
- `incident_id` - Incident ID (e.g., "INC-2024-0123")

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": 1,
    "incident_id": "INC-2024-0123",
    "date": "2024-12-15",
    "department": "Cardiology",
    "category": "Delayed Treatment",
    "severity": "HIGH",
    "doctor_name": "Dr. Michael Chen",
    "doctor_id": "DOC-2024-001",
    "status": "OPEN",
    "description": "Delay in emergency procedure",
    "actions_taken": "Investigation ongoing",
    "resolution_date": null
  }
}
```

**Frontend Usage:**
```javascript
import { getIncidentDetails } from "../api/patientHistory";

const details = await getIncidentDetails("P12345", "INC-2024-0123");
```

---

### 5. Get Patient Full History (RECOMMENDED - Most Efficient)
```
GET /api/patients/{patient_id}/full-history
```

**Path Parameters:**
- `patient_id` - Patient ID

**Response:**
```json
{
  "success": true,
  "profile": {
    "patient_id": "P12345",
    "name": "Ahmed Mohammed Ali",
    "age": 45,
    "gender": "Male",
    "phone": "+966 50 123 4567",
    "email": "ahmed.ali@email.com",
    "mrn": "MRN-98765",
    "total_incidents": 8
  },
  "incidents": [
    {
      "id": 1,
      "incident_id": "INC-2024-0123",
      "date": "2024-12-15",
      "department": "Cardiology",
      "category": "Delayed Treatment",
      "severity": "HIGH",
      "doctor_name": "Dr. Michael Chen",
      "status": "OPEN",
      "description": "Delay in emergency procedure"
    }
  ]
}
```

**Frontend Usage:**
```javascript
import { getPatientFullHistory } from "../api/patientHistory";

// ⚡ MOST EFFICIENT - Single call gets everything
const data = await getPatientFullHistory("P12345");
const profile = data.profile;
const incidents = data.incidents;
```

**Notes:**
- This endpoint combines profile + incidents in one call
- Used by `PatientHistoryPage.js` for efficient data loading
- Reduces frontend API calls from 2 to 1

---

### 6. Export Patient Data
```
GET /api/patients/{patient_id}/export
```

**Path Parameters:**
- `patient_id` - Patient ID

**Query Parameters:**
- `format` (required) - Export format: `csv` or `json`

**Response:**
- **For CSV:** Returns CSV file with `Content-Type: text/csv`
- **For JSON:** Returns JSON file with `Content-Type: application/json`

**CSV Format:**
```csv
Incident ID,Date,Department,Category,Severity,Doctor,Status,Description
INC-2024-0123,2024-12-15,Cardiology,Delayed Treatment,HIGH,Dr. Michael Chen,OPEN,Delay in emergency procedure
```

**JSON Format:**
```json
{
  "patient_id": "P12345",
  "patient_name": "Ahmed Mohammed Ali",
  "export_date": "2024-12-30",
  "incidents": [...]
}
```

**Frontend Usage:**
```javascript
import { downloadCSV, downloadJSON } from "../api/patientHistory";

// Download CSV
await downloadCSV("P12345");

// Download JSON
await downloadJSON("P12345");
```

**Notes:**
- Frontend handles file download automatically
- Files named: `patient_P12345_history.csv` or `patient_P12345_history.json`

---

## 🔴 Doctor History API (NOT IMPLEMENTED - NEEDS CREATION)

**Base URL:** `http://0.0.0.0:8000/api/doctors` (suggested)

**Frontend Status:** ❌ Using mock data only (no API integration)

**Backend Status:** ❌ Needs implementation

**Required Files:**
- Backend: Create all doctor endpoints
- Frontend: Create `src/api/doctorHistory.js` (similar to patientHistory.js)

---

### 1. Search Doctors
```
GET /api/doctors/search
```

**Query Parameters:**
- `query` (optional) - Search text (doctor name, employee ID, etc.)
- `employee_id` (optional) - Employee ID
- `department` (optional) - Filter by department
- `specialty` (optional) - Filter by specialty
- `status` (optional) - Filter by status (active, inactive)
- `limit` (optional, default: 50) - Max results

**Expected Response:**
```json
{
  "success": true,
  "doctors": [
    {
      "id": 1,
      "employee_id": "DOC-2024-001",
      "name_en": "Dr. Ahmed Mohamed",
      "name_ar": "د. أحمد محمد",
      "department": "Cardiology",
      "specialty": "Cardiologist",
      "hire_date": "2015-03-15",
      "status": "active"
    }
  ],
  "total": 1
}
```

**Frontend Mock Data Reference:**
```javascript
// From DoctorHistoryPage.js - lines 17-52
const mockDoctors = [
  {
    id: 1,
    employeeId: "DOC-2024-001",
    nameEn: "Dr. Ahmed Mohamed",
    nameAr: "د. أحمد محمد",
    department: "Cardiology",
    specialty: "Cardiologist",
    hireDate: "2015-03-15",
    status: "active",
  }
];
```

**Priority:** 🔥 HIGH - Required for basic doctor search functionality

---

### 2. Get Doctor Profile
```
GET /api/doctors/{doctor_id}/profile
```

**Path Parameters:**
- `doctor_id` - Doctor ID or Employee ID

**Expected Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "employee_id": "DOC-2024-001",
    "name_en": "Dr. Ahmed Mohamed",
    "name_ar": "د. أحمد محمد",
    "department": "Cardiology",
    "specialty": "Cardiologist",
    "hire_date": "2015-03-15",
    "status": "active",
    "email": "ahmed.mohamed@hospital.com",
    "phone": "+966 50 987 6543"
  }
}
```

**Priority:** 🔥 HIGH - Required for doctor profile display

---

### 3. Get Doctor Statistics
```
GET /api/doctors/{doctor_id}/statistics
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Query Parameters:**
- `from_date` (optional) - Start date for statistics
- `to_date` (optional) - End date for statistics

**Expected Response:**
```json
{
  "success": true,
  "statistics": {
    "total_incidents": 12,
    "high_severity": 3,
    "medium_severity": 7,
    "low_severity": 2,
    "red_flags": 1,
    "open_cases": 2,
    "closed_cases": 10,
    "under_review": 0
  }
}
```

**Frontend Mock Data Reference:**
```javascript
// From DoctorHistoryPage.js - lines 61-67
statistics: {
  total: 12,
  high: 3,
  medium: 7,
  low: 2,
  redFlags: 1,
}
```

**Priority:** 🔥 HIGH - Required for statistics cards display

---

### 4. Get Doctor Category Breakdown
```
GET /api/doctors/{doctor_id}/category-breakdown
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Query Parameters:**
- `from_date` (optional) - Start date
- `to_date` (optional) - End date

**Expected Response:**
```json
{
  "success": true,
  "breakdown": [
    {
      "category": "Medication Errors",
      "count": 4
    },
    {
      "category": "Delayed Diagnosis",
      "count": 3
    },
    {
      "category": "Communication Issues",
      "count": 3
    },
    {
      "category": "Clinical Judgment",
      "count": 2
    }
  ]
}
```

**Frontend Mock Data Reference:**
```javascript
// From DoctorHistoryPage.js - lines 68-73
categoryBreakdown: [
  { name: "Medication Errors", count: 4 },
  { name: "Delayed Diagnosis", count: 3 },
  { name: "Communication Issues", count: 3 },
  { name: "Clinical Judgment", count: 2 },
]
```

**Priority:** 🟡 MEDIUM - Required for pie chart visualization

---

### 5. Get Doctor Monthly Trend
```
GET /api/doctors/{doctor_id}/monthly-trend
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Query Parameters:**
- `year` (optional) - Year for trend data (default: current year)

**Expected Response:**
```json
{
  "success": true,
  "trend": [
    { "month": "Jan", "count": 0 },
    { "month": "Feb", "count": 0 },
    { "month": "Mar", "count": 0 },
    { "month": "Apr", "count": 0 },
    { "month": "May", "count": 0 },
    { "month": "Jun", "count": 0 },
    { "month": "Jul", "count": 1 },
    { "month": "Aug", "count": 2 },
    { "month": "Sep", "count": 3 },
    { "month": "Oct", "count": 2 },
    { "month": "Nov", "count": 3 },
    { "month": "Dec", "count": 1 }
  ]
}
```

**Frontend Mock Data Reference:**
```javascript
// From DoctorHistoryPage.js - lines 74-80
monthlyTrend: [
  { month: "Jul", count: 1 },
  { month: "Aug", count: 2 },
  { month: "Sep", count: 3 },
  { month: "Oct", count: 2 },
  { month: "Nov", count: 3 },
  { month: "Dec", count: 1 },
]
```

**Priority:** 🟡 MEDIUM - Required for line chart visualization

---

### 6. Get Doctor Incidents (Full List)
```
GET /api/doctors/{doctor_id}/incidents
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Query Parameters:**
- `severity` (optional) - Filter by severity (HIGH, MEDIUM, LOW)
- `from_date` (optional) - Start date (YYYY-MM-DD)
- `to_date` (optional) - End date (YYYY-MM-DD)
- `status` (optional) - Filter by status (OPEN, CLOSED, UNDER_REVIEW)
- `is_red_flag` (optional) - Filter red flags (true/false)
- `category` (optional) - Filter by category
- `limit` (optional, default: 100) - Max results
- `offset` (optional, default: 0) - Pagination offset

**Expected Response:**
```json
{
  "success": true,
  "incidents": [
    {
      "id": 1,
      "date": "2024-12-05",
      "incident_id": "INC-2024-0089",
      "patient_id": "P-12345",
      "category": "Medication Error",
      "category_ar": "خطأ في الدواء",
      "severity": "HIGH",
      "status": "UNDER_REVIEW",
      "is_red_flag": true
    }
  ],
  "total": 12,
  "limit": 100,
  "offset": 0
}
```

**Frontend Mock Data Reference:**
```javascript
// From DoctorHistoryPage.js - lines 81-218 (12 incidents)
incidents: [
  {
    id: 1,
    date: "2024-12-05",
    incidentId: "INC-2024-0089",
    patientId: "P-12345",
    category: "Medication Error",
    categoryAr: "خطأ في الدواء",
    severity: "HIGH",
    status: "UNDER_REVIEW",
    isRedFlag: true,
  }
]
```

**Priority:** 🔥 HIGH - Required for incidents table display

---

### 7. Get Doctor Full Data (RECOMMENDED - Most Efficient)
```
GET /api/doctors/{doctor_id}/full-data
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Expected Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "employee_id": "DOC-2024-001",
    "name_en": "Dr. Ahmed Mohamed",
    "name_ar": "د. أحمد محمد",
    "department": "Cardiology",
    "specialty": "Cardiologist",
    "hire_date": "2015-03-15",
    "status": "active"
  },
  "statistics": {
    "total_incidents": 12,
    "high_severity": 3,
    "medium_severity": 7,
    "low_severity": 2,
    "red_flags": 1
  },
  "category_breakdown": [
    { "category": "Medication Errors", "count": 4 }
  ],
  "monthly_trend": [
    { "month": "Jul", "count": 1 }
  ],
  "incidents": [
    {
      "id": 1,
      "date": "2024-12-05",
      "incident_id": "INC-2024-0089",
      "patient_id": "P-12345",
      "category": "Medication Error",
      "severity": "HIGH",
      "status": "UNDER_REVIEW",
      "is_red_flag": true
    }
  ]
}
```

**Benefits:**
- Single API call instead of 5 separate calls
- Reduces frontend complexity
- Improves page load performance
- Mirrors Patient History pattern (full-history endpoint)

**Priority:** 🔥 HIGH - RECOMMENDED for efficient data loading

---

### 8. Export Doctor Data
```
GET /api/doctors/{doctor_id}/export
```

**Path Parameters:**
- `doctor_id` - Doctor ID

**Query Parameters:**
- `format` (required) - Export format: `csv` or `json`

**Expected Response:**
- **For CSV:** Returns CSV file with `Content-Type: text/csv`
- **For JSON:** Returns JSON file with `Content-Type: application/json`

**CSV Format:**
```csv
Incident ID,Date,Patient ID,Category,Severity,Status,Red Flag
INC-2024-0089,2024-12-05,P-12345,Medication Error,HIGH,UNDER_REVIEW,Yes
```

**JSON Format:**
```json
{
  "doctor_id": 1,
  "doctor_name": "Dr. Ahmed Mohamed",
  "export_date": "2024-12-30",
  "statistics": {...},
  "incidents": [...]
}
```

**Priority:** 🟢 LOW - Nice to have, not critical for MVP

---

## 📊 Data Structure Comparison

### Patient History vs Doctor History

| Feature | Patient History | Doctor History |
|---------|----------------|----------------|
| **Search** | ✅ By name, MRN, phone | ✅ By name, employee ID, department |
| **Profile** | ✅ Basic demographics | ✅ Employee details, department, specialty |
| **Incidents List** | ✅ All incidents for patient | ✅ All incidents involving doctor |
| **Statistics** | ❌ Not shown | ✅ Counts by severity, red flags |
| **Charts** | ❌ Not shown | ✅ Category breakdown, monthly trend |
| **Export** | ✅ CSV/JSON | ✅ CSV/JSON (needed) |
| **Full Data Endpoint** | ✅ `/full-history` | ⚠️ Recommended: `/full-data` |

**Key Differences:**
- Doctor History includes **statistics** and **charts** (Patient does not)
- Doctor History shows **performance analysis** (category breakdown, trends)
- Doctor History UI is more complex (5+ components vs 3 components)

---

## 🚀 Implementation Priority

### Phase 1: Critical (MVP) ⚡
**Backend:**
1. `GET /api/patients/{patient_id}/full-history` - Most used by frontend
2. `GET /api/patients/search` - Required for patient search
3. `GET /api/doctors/search` - Required for doctor search
4. `GET /api/doctors/{doctor_id}/full-data` - Efficient doctor data loading

**Frontend:**
1. Create `src/api/doctorHistory.js` file
2. Wire `DoctorHistoryPage.js` to use real API instead of mock data

### Phase 2: Important 🔥
**Backend:**
5. `GET /api/patients/{patient_id}/incidents` - For filtered incident queries
6. `GET /api/doctors/{doctor_id}/incidents` - For filtered incident queries
7. `GET /api/doctors/{doctor_id}/statistics` - For statistics cards

### Phase 3: Enhanced Features 🟡
**Backend:**
8. `GET /api/patients/{patient_id}/export?format=csv|json`
9. `GET /api/doctors/{doctor_id}/export?format=csv|json`
10. Individual endpoints (profile, category-breakdown, monthly-trend) if needed

---

## 📝 Implementation Notes

### For Backend Developer:

1. **Base URLs:**
   - Patients: `http://0.0.0.0:8000/api/patients`
   - Doctors: `http://0.0.0.0:8000/api/doctors`

2. **Response Format:**
   - Always return `{"success": true, ...}` for successful responses
   - Use `{"success": false, "error": {...}}` for errors
   - Include proper HTTP status codes

3. **Date Formats:**
   - Use `YYYY-MM-DD` for all dates (ISO 8601)
   - Example: `"2024-12-15"`

4. **Pagination:**
   - Support `limit` and `offset` query parameters
   - Return `total` count in response for pagination UI

5. **Severity Enum:**
   - Use uppercase: `HIGH`, `MEDIUM`, `LOW`

6. **Status Enum:**
   - Use uppercase: `OPEN`, `CLOSED`, `UNDER_REVIEW`

7. **Error Handling:**
   ```json
   {
     "success": false,
     "error": {
       "code": "PATIENT_NOT_FOUND",
       "message": "Patient with ID P12345 not found"
     }
   }
   ```

8. **Performance:**
   - Prioritize `/full-history` and `/full-data` endpoints (most efficient)
   - Add database indexes on: patient_id, doctor_id, date, severity, status

### For Frontend Developer:

1. **Create `src/api/doctorHistory.js`:**
   - Mirror structure of `patientHistory.js`
   - Implement all 8 doctor endpoints
   - Use same error handling pattern

2. **Update `DoctorHistoryPage.js`:**
   - Remove mock data (lines 17-218)
   - Import functions from `doctorHistory.js`
   - Add loading/error states
   - Wire to API calls

3. **Components to Update:**
   - `SearchDoctor.js` - Add API call for search
   - `DoctorProfileCard.js` - Display API data
   - `DoctorStatisticsCards.js` - Display API statistics
   - `DoctorCharts.js` - Display API chart data
   - `DoctorIncidentsTable.js` - Display API incidents
   - `DoctorReportActions.js` - Wire export buttons to API

---

## 🔗 Related Files

**Frontend Files:**
- [src/pages/PatientHistoryPage.js](src/pages/PatientHistoryPage.js) - Patient History UI (uses API)
- [src/pages/DoctorHistoryPage.js](src/pages/DoctorHistoryPage.js) - Doctor History UI (uses mock data)
- [src/api/patientHistory.js](src/api/patientHistory.js) - Patient API client (complete)
- `src/api/doctorHistory.js` - ⚠️ **NEEDS TO BE CREATED**

**Backend Files:**
- Patient endpoints: ⚠️ Need implementation under `/api/patients`
- Doctor endpoints: ⚠️ Need implementation under `/api/doctors`

---

## ✅ Checklist for Backend Implementation

### Patient History Endpoints:
- [ ] `GET /api/patients/search`
- [ ] `GET /api/patients/{patient_id}/profile`
- [ ] `GET /api/patients/{patient_id}/incidents`
- [ ] `GET /api/patients/{patient_id}/incidents/{incident_id}`
- [ ] `GET /api/patients/{patient_id}/full-history` (Priority 1)
- [ ] `GET /api/patients/{patient_id}/export?format=csv|json`

### Doctor History Endpoints:
- [ ] `GET /api/doctors/search` (Priority 1)
- [ ] `GET /api/doctors/{doctor_id}/profile`
- [ ] `GET /api/doctors/{doctor_id}/statistics` (Priority 2)
- [ ] `GET /api/doctors/{doctor_id}/category-breakdown`
- [ ] `GET /api/doctors/{doctor_id}/monthly-trend`
- [ ] `GET /api/doctors/{doctor_id}/incidents` (Priority 2)
- [ ] `GET /api/doctors/{doctor_id}/full-data` (Priority 1 - Recommended)
- [ ] `GET /api/doctors/{doctor_id}/export?format=csv|json`

---

## 📞 Support

If you need clarification on any endpoint or data structure, please refer to:
- Frontend mock data in `DoctorHistoryPage.js` (lines 17-218)
- Working patient API implementation in `patientHistory.js`
- UI components in `src/components/patientHistory/` and `src/components/doctorHistory/`

**Questions?** Check the frontend code for expected data structures and behavior.
