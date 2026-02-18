# Settings Page Backend Verification & Implementation Request

## 📋 Overview
Frontend Settings page has been updated and tested. The following backend endpoints need verification and potential implementation/fixes.

---

## ✅ Frontend Fixes Completed

1. **Added Variable Attributes Tab**
   - Imported VariableAttributes component
   - Added proper tab configuration with key `SETTINGS_TAB_KEYS.VARIABLE_ATTRIBUTES`
   - Tab now appears for SOFTWARE_ADMIN and COMPLAINT_SUPERVISOR roles
   - Renders the VariableAttributes component correctly

2. **Fixed Duplicate Tab Keys**
   - Removed duplicate USERS tab definition
   - Reorganized tab component numbers sequentially
   - Removed deprecated "Users & Sections (Testing)" tab from Settings page

3. **Tab Structure Now Correct**
   - Departments (component 0)
   - Doctors (component 1)
   - Patients (component 2)
   - Variable Attributes (component 3) ✨ NEW
   - Policy Configuration (component 4)
   - Training (component 5)
   - Users (Admin) (component 6)

---

## 🔍 Backend Endpoints to Verify

### Priority 1: System Settings API (Variable Attributes Tab)

**Endpoint Used:**
```
GET /api/system-settings/ComplaintDelayDays
PUT /api/system-settings/ComplaintDelayDays
```

**Frontend Implementation:**
- File: `src/api/systemSettings.js`
- Functions: `getComplaintDelayDays()`, `updateComplaintDelayDays()`

**Verification Needed:**
1. Does `GET /api/system-settings/ComplaintDelayDays` exist and return:
   ```json
   {
     "key": "ComplaintDelayDays",
     "value": "14",
     "parsed_value": 14,
     "updated_at": "...",
     "updated_by_user_id": 1
   }
   ```

2. Does `PUT /api/system-settings/ComplaintDelayDays` accept and work correctly:
   ```json
   {
     "value": "21",
     "updated_by_user_id": 1
   }
   ```

**Action Required:**
- ✅ If working: No action needed
- ❌ If missing/broken: Implement system settings CRUD endpoints
  - Support for getting single setting by key
  - Support for updating setting with audit trail
  - Return parsed_value (converted to appropriate type)

---

### Priority 2: Settings Users API

**Endpoints Used:**
```
GET /api/settings/users
POST /api/settings/users
PATCH /api/settings/users/:userId/identity
PATCH /api/settings/users/:userId/password
DELETE /api/settings/users/:userId
```

**Frontend Implementation:**
- File: `src/api/settingsUsersApi.js`
- Used in: `src/pages/settings/SettingsUsersTab.jsx`

**Verification Needed:**
1. Are all 5 endpoints implemented and working?
2. Do they follow the expected request/response formats?
3. Is role-based authorization enforced (SOFTWARE_ADMIN and COMPLAINT_SUPERVISOR only)?

**Action Required:**
- ✅ If all working: No action needed
- ❌ If any missing/broken: Refer to `settingsUsersApi.js` for expected contracts

---

### Priority 3: Training API

**Endpoints Used:**
```
GET /api/settings/training/grouped-status
GET /api/settings/training/progress
GET /api/settings/training/charts/db-growth
GET /api/settings/training/charts/performance-trends
GET /api/settings/training/charts/family-comparison
POST /api/settings/training/run
```

**Frontend Implementation:**
- File: `src/api/training.js`
- Used in: `src/components/settings/Training.js`

**Verification Needed:**
1. Are all 6 endpoints implemented?
2. Do they return proper chart/status data?
3. Does the training run endpoint work correctly?

**Action Required:**
- ✅ If working: No action needed
- ❌ If missing: Implement training status and chart endpoints
  - Real data if ML training is implemented
  - Mock/stub data if ML training not yet implemented

---

### Priority 4: Policy Configuration API

**Current Status:**
- File: `src/components/settings/PolicyConfiguration.js`
- Currently: Using **MOCK DATA** only - No API integration yet
- Has TODO comments for future API implementation

**Endpoint Expected (Future):**
```
GET /api/settings/policy/:departmentId
PUT /api/settings/policy/:departmentId
```

**Expected Data Structure:**
```json
{
  "severityLimits": {
    "low": 5,
    "medium": 3,
    "high": 10
  },
  "highSeverityPercentageLimits": {
    "clinical": 15,
    "management": 10,
    "relational": 12
  },
  "ruleActivation": {
    "lowSeverityEnabled": true,
    "mediumSeverityEnabled": true,
    "highSeverityEnabled": true,
    "highSeverityPercentageEnabled": true
  }
}
```

**Action Required:**
- ⏸️ **LOW PRIORITY** - Frontend works with mock data
- Implement API endpoints when policy configuration feature is needed
- No immediate action required

---

### Priority 5: Admin Users API (for Users Tab)

**Endpoints Used:**
```
GET /api/admin/user-inventory
POST /api/admin/create-section-with-admin
GET /api/admin/testing/user-credentials
DELETE /api/admin/users/:userId
POST /api/admin/sections/:sectionId/recreate-admin
GET /api/admin/testing/user-credentials-markdown
PUT /api/admin/users/:userId
```

**Frontend Implementation:**
- File: `src/api/adminUsers.js`
- Used in: Users (Admin) tab via SettingsUsersTab

**Known Issue from Previous Documentation:**
- Markdown export exists but Word export is preferred
- See: `SETTINGS_BACKEND_CHECK_AND_FIX.md` and `SETTINGS_BACKEND_FIXES_PROMPT.md`

**Verification Needed:**
1. Verify all endpoints exist and work correctly
2. Check if Word export endpoint implemented: `GET /api/admin/testing/user-credentials-word`

**Action Required:**
- If Word export needed: Implement as per `SETTINGS_BACKEND_FIXES_PROMPT.md` Issue 1
- Verify data structure matches frontend expectations (see previous docs)

---

## 🧪 Testing Checklist

After backend verification/implementation:

### 1. Variable Attributes Tab
```bash
# Test getting delay days
curl -X GET http://localhost:8000/api/system-settings/ComplaintDelayDays

# Test updating delay days
curl -X PUT http://localhost:8000/api/system-settings/ComplaintDelayDays \
  -H "Content-Type: application/json" \
  -d '{"value": "21", "updated_by_user_id": 1}'
```

### 2. Settings Users Tab
```bash
# List all users
curl -X GET http://localhost:8000/api/settings/users

# Create new user
curl -X POST http://localhost:8000/api/settings/users \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123", "role": "WORKER", ...}'
```

### 3. Training Tab
```bash
# Get grouped status
curl -X GET http://localhost:8000/api/settings/training/grouped-status

# Get progress
curl -X GET http://localhost:8000/api/settings/training/progress
```

### 4. Test in Browser
1. Login as SOFTWARE_ADMIN
2. Navigate to Settings page
3. Verify all 7 tabs appear:
   - 🏥 Departments
   - 👨‍⚕️ Doctors
   - 🧑‍🤝‍🧑 Patients
   - ⚙️ Variable Attributes ✨
   - 📋 Policy Configuration
   - 🚦 Training
   - 👤 Users (Admin)
4. Test each tab loads without errors
5. Test Variable Attributes tab:
   - Should load current delay days value
   - Should allow updating value
   - Should show success/error messages

---

## 📚 Related Documentation

- **SETTINGS_BACKEND_CHECK_AND_FIX.md** - Previous status check workflow
- **SETTINGS_BACKEND_FIXES_PROMPT.md** - Detailed implementation specs for known issues
- **Frontend API Files:**
  - `src/api/systemSettings.js` - System settings API
  - `src/api/settingsUsersApi.js` - Settings users API
  - `src/api/training.js` - Training API
  - `src/api/adminUsers.js` - Admin users API

---

## 🎯 Next Steps

### For Backend Developer:

1. **Run Verification (30 minutes)**
   - Test each endpoint listed above
   - Document which ones exist vs missing
   - Document any data structure mismatches

2. **Report Status**
   - Use template below to report findings

3. **Implement/Fix Missing Endpoints**
   - Prioritize by Priority number above
   - Reference frontend API files for expected contracts

4. **Test with Frontend**
   - Coordinate with frontend to test all tabs
   - Verify no console errors

### Status Report Template:

```
BACKEND ENDPOINT STATUS REPORT
==============================

Priority 1 - System Settings:
[ ] GET /api/system-settings/ComplaintDelayDays - [EXISTS/MISSING/BROKEN]
[ ] PUT /api/system-settings/ComplaintDelayDays - [EXISTS/MISSING/BROKEN]
Notes: 

Priority 2 - Settings Users:
[ ] GET /api/settings/users - [EXISTS/MISSING/BROKEN]
[ ] POST /api/settings/users - [EXISTS/MISSING/BROKEN]
[ ] PATCH /api/settings/users/:userId/identity - [EXISTS/MISSING/BROKEN]
[ ] PATCH /api/settings/users/:userId/password - [EXISTS/MISSING/BROKEN]
[ ] DELETE /api/settings/users/:userId - [EXISTS/MISSING/BROKEN]
Notes:

Priority 3 - Training:
[ ] All 6 training endpoints - [EXISTS/MISSING/BROKEN]
Notes:

Priority 4 - Policy Configuration:
[ ] Policy endpoints (TBD based on component code) - [EXISTS/MISSING/BROKEN]
Notes:

Priority 5 - Admin Users:
[ ] All 7 admin endpoints - [EXISTS/MISSING/BROKEN]
[ ] Word export - [EXISTS/MISSING/BROKEN]
Notes:

ISSUES FOUND:
=============
1. [Issue description]
2. [Issue description]

IMPLEMENTATION NEEDED:
======================
1. [What needs to be implemented]
2. [What needs to be implemented]

ESTIMATED TIME:
===============
[X hours/days for implementation]
```

---

## ✅ Summary

**Frontend Status:** ✅ Ready
- Variable Attributes tab added
- All tabs properly configured
- No frontend errors

**Backend Status:** ⏳ Needs Verification
- Please verify all endpoints listed in Priority 1-5
- Report findings using template above
- Implement missing endpoints as needed

**Goal:** All Settings tabs functional with proper backend API support
