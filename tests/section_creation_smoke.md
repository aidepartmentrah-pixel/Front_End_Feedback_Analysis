# PHASE C — Section Creation Frontend Smoke Tests

## Overview
Manual smoke test checklist for Section Creation Panel functionality. Execute these tests after deployment or significant changes to validate core user flows.

**Required Role:** SOFTWARE_ADMIN  
**Location:** Settings → Departments Tab  
**Component:** Section Creation Panel

---

## Pre-Test Setup

- [ ] Login as user with `SOFTWARE_ADMIN` role
- [ ] Navigate to Settings page
- [ ] Confirm Section Creation Panel is visible in Departments tab
- [ ] Open browser DevTools (F12) → Console tab (check for errors)
- [ ] Open Network tab (monitor API calls)

---

## CASE 1 — Create Section Under Department ✅

### Input
- **Section Name:** `Test Emergency Section`
- **Parent Type:** `DEPARTMENT` (radio button)
- **Parent Unit:** `Emergency Department` (from dropdown)

### Actions
1. Enter section name in "Section Name" field
2. Select "Department" radio button
3. Open parent dropdown and select "Emergency Department"
4. Click "Create Section + Admin User" button

### Expected Results
- [ ] No validation errors appear
- [ ] Loading state shows briefly
- [ ] Success snackbar appears: "Section and admin user created successfully!"
- [ ] Green success card displays with:
  - [ ] Section ID (numeric)
  - [ ] Username (format: `sec_<id>_admin`)
  - [ ] Password (temporary password)
  - [ ] Security warning message
- [ ] Form fields reset (section name cleared, dropdown reset)
- [ ] Section dropdown refreshes (background reload)
- [ ] **Network:** POST to `/api/admin/create-section-with-admin`
- [ ] **Payload:** `{ section_name: "Test Emergency Section", parent_department_id: <dept_id> }`

---

## CASE 2 — Create Section Under Administration ✅

### Input
- **Section Name:** `Test Admin Section`
- **Parent Type:** `ADMINISTRATION` (radio button)
- **Parent Unit:** `Main Administration` (from dropdown)

### Actions
1. Enter section name in "Section Name" field
2. Select "Administration" radio button (dropdown label changes)
3. Open parent dropdown and select "Main Administration"
4. Click "Create Section + Admin User" button

### Expected Results
- [ ] Dropdown label changes to "Select Administration"
- [ ] Dropdown shows only administration-type units
- [ ] No validation errors appear
- [ ] Success card displays with credentials
- [ ] Form resets correctly
- [ ] **Network:** POST with `parent_department_id` mapped from administration unit

---

## CASE 3 — Validation Blocks Invalid Input ❌

### Test 3.1: Empty Section Name
**Input:** *(leave section name empty)*  
**Action:** Click blur or submit  
**Expected:**
- [ ] Red error text: "Section name is required"
- [ ] Create button remains disabled
- [ ] No API call made

### Test 3.2: Section Name Too Short
**Input:** `A`  
**Action:** Blur from input field  
**Expected:**
- [ ] Red error text: "Section name must be at least 2 characters"
- [ ] Create button disabled

### Test 3.3: Section Name Too Long
**Input:** *(type 101 characters)*  
**Action:** Blur from input field  
**Expected:**
- [ ] Red error text: "Section name must not exceed 100 characters"
- [ ] Create button disabled

### Test 3.4: No Parent Selected
**Input:** Section name: `Valid Name`, Parent: *(not selected)*  
**Action:** Try to submit  
**Expected:**
- [ ] Create button disabled
- [ ] Cannot submit form

### Test 3.5: Whitespace Trimming
**Input:** `   Spaces Test   ` *(leading/trailing spaces)*  
**Action:** Submit form  
**Expected:**
- [ ] Spaces trimmed before submission
- [ ] **Network:** Payload shows `"Spaces Test"` (no spaces)

---

## CASE 4 — Permission Guard (Role-Based Visibility) 🔒

### Test 4.1: SOFTWARE_ADMIN Access
**Input:** Login as `SOFTWARE_ADMIN`  
**Action:** Navigate to Settings → Departments  
**Expected:**
- [ ] Section Creation Panel is visible
- [ ] All fields accessible and functional

### Test 4.2: Non-Admin User
**Input:** Login as `SECTION_ADMIN` or `STAFF`  
**Action:** Navigate to Settings → Departments  
**Expected:**
- [ ] Section Creation Panel **NOT** visible
- [ ] Component not in DOM (check with DevTools → Elements)
- [ ] No console errors related to access denial

### Test 4.3: Direct URL Access
**Input:** Login as non-admin, manually navigate to Settings tab  
**Action:** Inspect page  
**Expected:**
- [ ] Panel remains hidden even with direct access
- [ ] No way to bypass via URL manipulation

---

## CASE 5 — Error Handling from Backend 🚨

### Test 5.1: 422 Validation Error (Array Detail)
**Simulate:** Backend returns array of validation errors  
**Expected:**
- [ ] Red alert appears at top of panel
- [ ] Error message joins all errors: "Section name is required, Parent unit ID is required"
- [ ] No success card shown
- [ ] Form remains filled (user can retry)

### Test 5.2: 400 Business Rule Error (String Detail)
**Simulate:** Section name already exists  
**Expected:**
- [ ] Red alert with error: "Section name already exists in this parent unit"
- [ ] Form remains filled for editing

### Test 5.3: 403 Permission Error
**Simulate:** User loses permission mid-session  
**Expected:**
- [ ] Red alert: "Insufficient permissions to create section"
- [ ] Clear message (no generic error)

### Test 5.4: Generic Network Error
**Simulate:** Backend unavailable or network failure  
**Expected:**
- [ ] Red alert: "Section creation failed"
- [ ] Fallback message displayed

### Test 5.5: Error Clearing on Retry
**Input:** After seeing error, fix issue and resubmit  
**Action:** Click Create button again  
**Expected:**
- [ ] Previous error alert disappears
- [ ] New attempt processed fresh

---

## CASE 6 — Credential Copy Buttons 📋

### Prerequisites
- Successfully create a section (credentials card visible)

### Test 6.1: Copy Section ID
**Action:** Click "Copy" button next to Section ID  
**Expected:**
- [ ] Snackbar: "Section ID copied to clipboard"
- [ ] Section ID numeric value copied to clipboard
- [ ] Can paste into text editor to verify

### Test 6.2: Copy Username
**Action:** Click "Copy" button next to Username  
**Expected:**
- [ ] Snackbar: "Username copied to clipboard"
- [ ] Username (format `sec_<id>_admin`) copied correctly

### Test 6.3: Copy Password
**Action:** Click "Copy" button next to Password  
**Expected:**
- [ ] Snackbar: "Password copied to clipboard"
- [ ] Temporary password copied correctly
- [ ] Security warning visible: "⚠️ Credentials are shown once. Save them immediately."

### Test 6.4: Credential Fields Read-Only
**Action:** Try to edit credentials in success card inputs  
**Expected:**
- [ ] All three fields are read-only
- [ ] Cannot modify Section ID, Username, or Password

---

## CASE 7 — Form Reset After Success ♻️

### Test 7.1: "Create Another Section" Button
**Prerequisites:** Successfully created a section (success card visible)  
**Action:** Click "Create Another Section" button  
**Expected:**
- [ ] Success card disappears
- [ ] Section name field cleared
- [ ] Parent dropdown reset to placeholder
- [ ] Parent type remains on last selection (or defaults to DEPARTMENT)
- [ ] No errors visible
- [ ] Form ready for new entry

### Test 7.2: Automatic Reset on Submit
**Action:** Create section successfully  
**Expected:**
- [ ] Section name automatically cleared
- [ ] Parent selection reset
- [ ] Validation errors cleared
- [ ] Ready for immediate re-use

---

## Network Validation Checklist 🌐

Open DevTools → Network tab during tests:

- [ ] **Endpoint:** POST `/api/admin/create-section-with-admin`
- [ ] **Payload Structure:**
  ```json
  {
    "section_name": "string (trimmed)",
    "parent_department_id": number
  }
  ```
- [ ] **Success Response (200):**
  ```json
  {
    "section_id": number,
    "username": "string",
    "password": "string"
  }
  ```
- [ ] **Error Response (422/400/403):**
  ```json
  {
    "detail": "string" | [{"msg": "string"}]
  }
  ```
- [ ] **Headers:** Contains authentication token
- [ ] **Org Hierarchy Refresh:** GET `/api/admin/users-inventory` called after success

---

## Console Error Check ❌

Throughout all tests, verify:
- [ ] No console errors (red messages)
- [ ] No React warnings (except expected test warnings)
- [ ] No network errors (except intentional error tests)
- [ ] No CORS issues
- [ ] No authentication errors

---

## Post-Test Verification ✅

After completing smoke tests:
1. [ ] Verify new sections appear in dropdown for next creation
2. [ ] Verify sections visible in hierarchy/admin panels
3. [ ] Verify created admin users can login (optional, depends on backend)
4. [ ] Clear test data (delete test sections if needed)

---

## Test Sign-Off

**Tester Name:** _________________  
**Date:** _________________  
**Environment:** [ ] Local [ ] Staging [ ] Production  
**Overall Result:** [ ] PASS [ ] FAIL  

**Failed Cases (if any):**
- 

**Additional Notes:**
- 

---

## Quick Reference: Pass Criteria Summary

✅ **All Must Pass:**
1. Create under DEPARTMENT works
2. Create under ADMINISTRATION works
3. All validation rules block bad input
4. Role guard hides panel for non-admins
5. Errors display clearly and clear on retry
6. Copy buttons work for all three credentials
7. Form resets properly after success
8. No console errors during normal operation
9. Network calls match expected API contract
10. Credentials displayed once and saved correctly
