# STEP 4.16 — Manual Role Walkthrough Testing Guide

## Overview

This is a **manual testing protocol** for Phase 4 workflow UI validation.

**Rules:**
- ✅ Execute tests manually in browser
- ✅ Record results in this document
- ✅ Identify failures by layer (API, Modal, Page, UX)
- ❌ Do NOT modify code during testing
- ❌ Do NOT refactor
- ❌ Do NOT create automated tests

---

## Prerequisites

### 1. Backend Running
Ensure backend API is running and accessible at the configured endpoint.

### 2. Test Users Available
You need access to users with these roles:
- `SOFTWARE_ADMIN`
- `ADMINISTRATION_ADMIN`
- `DEPARTMENT_ADMIN`
- `SECTION_ADMIN`
- `COMPLAINT_SUPERVISOR`
- `WORKER` (normal user)

### 3. Test Data Seeded
Database should contain:
- Subcases in various workflow stages (submitted, pending_review, approved, rejected, closed)
- Action items assigned to test users with different statuses
- At least one case per state for comprehensive testing

### 4. Browser Dev Tools Open
Keep Console and Network tabs open to monitor:
- API requests/responses
- Console errors
- Network failures

---

## Test Execution Log

**Tester:** _________________________  
**Date:** _________________________  
**Backend Version:** _________________________  
**Frontend Commit:** _________________________

---

## TEST BLOCK 1 — Inbox Visibility (RBAC)

### Test 1.1 — SOFTWARE_ADMIN Inbox Access
**Role:** SOFTWARE_ADMIN  
**Page:** `/inbox`  
**Action:** Login and navigate to Inbox  
**Expected:** 
- Page loads without error
- Can see all subcases (no scope restriction)
- Each item has `allowedActions` array
- Buttons render per `allowedActions`

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.2 — ADMINISTRATION_ADMIN Inbox Access
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Login and navigate to Inbox  
**Expected:** 
- Page loads without error
- Can see all subcases (no scope restriction)
- Each item has `allowedActions` array
- Buttons render per `allowedActions`

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.3 — DEPARTMENT_ADMIN Inbox Access
**Role:** DEPARTMENT_ADMIN  
**Page:** `/inbox`  
**Action:** Login and navigate to Inbox  
**Expected:** 
- Page loads without error
- Can see subcases in their department scope
- Each item has `allowedActions` array
- Buttons render per `allowedActions`

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.4 — SECTION_ADMIN Inbox Access
**Role:** SECTION_ADMIN  
**Page:** `/inbox`  
**Action:** Login and navigate to Inbox  
**Expected:** 
- Page loads without error
- Can see subcases in their section scope
- Each item has `allowedActions` array
- Buttons render per `allowedActions`

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.5 — COMPLAINT_SUPERVISOR Inbox Access
**Role:** COMPLAINT_SUPERVISOR  
**Page:** `/inbox`  
**Action:** Login and navigate to Inbox  
**Expected:** 
- Page loads without error
- Can see subcases in their scope
- Each item has `allowedActions` array
- Buttons render per `allowedActions`

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.6 — WORKER Inbox Access (Denied)
**Role:** WORKER  
**Page:** `/inbox`  
**Action:** Try to navigate to Inbox  
**Expected:** 
- Navigation item NOT visible in sidebar (role guard blocks)
- If direct URL access attempted → RoleProtectedRoute blocks access
- No crash, clean denial

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 1.7 — Empty Inbox State
**Role:** Any authorized role  
**Page:** `/inbox`  
**Action:** Login with user who has no assigned cases  
**Expected:** 
- Empty state message: "No cases assigned to you"
- Subtitle: "You have no pending workflow cases..."
- No errors, no empty table

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 2 — Action Button Rendering (allowedActions Driven)

### Test 2.1 — Button Visibility Matches allowedActions
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Open browser DevTools → Network → reload page → inspect response  
**Expected:** 
- For each inbox item, count buttons visible
- Match against `allowedActions` array in API response
- Example: If `allowedActions: ["accept", "reject"]`, only Accept and Reject buttons shown
- No extra buttons (no UI role guessing)

**Observed:**  
Item 1: allowedActions = _______________, buttons shown = _______________  
Item 2: allowedActions = _______________, buttons shown = _______________  
Item 3: allowedActions = _______________, buttons shown = _______________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 2.2 — No Buttons When allowedActions Empty
**Role:** Any role  
**Page:** `/inbox`  
**Action:** Find item with `allowedActions: []`  
**Expected:** 
- Only "View Details" button shown
- No action buttons (Accept/Reject) visible
- No crash

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 3 — Modal Opening and Rendering

### Test 3.1 — APPROVE Action Modal
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Click "Accept" button on item with `allowedActions: ["accept"]`  
**Expected:** 
- Modal opens
- Title: "Approve Case"
- No input fields (APPROVE requires empty payload)
- Submit button visible
- Cancel button visible

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 3.2 — REJECT Action Modal
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Click "Reject" button on item with `allowedActions: ["reject"]`  
**Expected:** 
- Modal opens
- Title: "Reject Case"
- Textarea for rejection text (required)
- Submit button visible
- Cancel button visible

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 3.3 — SUBMIT_RESPONSE Action Modal
**Role:** DEPARTMENT_ADMIN  
**Page:** `/inbox`  
**Action:** Click action button that triggers SUBMIT_RESPONSE  
**Expected:** 
- Modal opens
- Title: "Submit Response"
- Explanation textarea (required)
- Action Items section with add/remove buttons
- Due date input per action item
- Submit button visible

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 3.4 — OVERRIDE Action Modal
**Role:** SOFTWARE_ADMIN  
**Page:** `/inbox`  
**Action:** Trigger OVERRIDE action if available  
**Expected:** 
- Modal opens
- Title: "Override Decision"
- Explanation textarea (required)
- Action Items section
- Due date inputs
- Submit button visible

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 3.5 — FORCE_CLOSE Action Modal
**Role:** SOFTWARE_ADMIN  
**Page:** `/inbox`  
**Action:** Trigger FORCE_CLOSE action if available  
**Expected:** 
- Modal opens
- Title: "Force Close Case"
- Reason textarea (required)
- Submit button visible

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 4 — Modal Validation

### Test 4.1 — REJECT Validation
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Open Reject modal → leave rejection text empty → click Submit  
**Expected:** 
- Error message: "Rejection text is required"
- Modal stays open
- Submit blocked
- No API call made (check Network tab)

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 4.2 — SUBMIT_RESPONSE Validation
**Role:** DEPARTMENT_ADMIN  
**Page:** `/inbox`  
**Action:** Open SUBMIT_RESPONSE modal → leave explanation empty → click Submit  
**Expected:** 
- Error message: "Explanation text is required"
- Modal stays open
- Submit blocked

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 4.3 — FORCE_CLOSE Validation
**Role:** SOFTWARE_ADMIN  
**Page:** `/inbox`  
**Action:** Open FORCE_CLOSE modal → leave reason empty → click Submit  
**Expected:** 
- Error message: "Reason is required"
- Modal stays open
- Submit blocked

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 5 — Success Action Flow

### Test 5.1 — Successful APPROVE
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Click Accept → Submit (APPROVE action)  
**Expected:** 
- Modal closes
- Inbox reloads automatically
- Item disappears from inbox (moved to next stage)
- No duplicate rows
- No stale data
- Check Network: POST request successful, then GET request to reload

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 5.2 — Successful REJECT
**Role:** ADMINISTRATION_ADMIN  
**Page:** `/inbox`  
**Action:** Click Reject → Enter rejection text → Submit  
**Expected:** 
- Modal closes
- Inbox reloads
- Item disappears or changes state
- No errors in console

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 5.3 — Successful SUBMIT_RESPONSE with Action Items
**Role:** DEPARTMENT_ADMIN  
**Page:** `/inbox`  
**Action:** 
1. Open SUBMIT_RESPONSE modal
2. Enter explanation text
3. Add 2 action items with titles, descriptions, due dates
4. Submit

**Expected:** 
- Modal closes
- Inbox reloads
- Item moves to next stage
- Check backend: action items created and assigned

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 6 — Denied Action Test (Concurrent Modification)

### Test 6.1 — Simultaneous Action Attempt
**Role:** ADMINISTRATION_ADMIN (User A and User B)  
**Page:** `/inbox`  
**Action:** 
1. User A opens case X → opens modal
2. User B opens case X → opens modal
3. User A submits action → succeeds
4. User B submits action → should fail

**Expected (User B):**
- API returns 409 Conflict or 403 Forbidden
- Modal stays open
- Error message: "This case is no longer in a valid state for this action"
- No crash
- User can close modal and see updated inbox

**Observed:**  
_________________________  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 6.2 — Unauthorized Action Attempt
**Role:** SECTION_ADMIN  
**Page:** `/inbox`  
**Action:** 
1. Use browser DevTools → Network tab
2. Intercept an action request
3. Modify subcaseId to a case outside their scope
4. Replay request

**Expected:**
- Backend returns 403 Forbidden
- Modal shows error: "You are not allowed to perform this action"
- Modal stays open
- No crash

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 7 — Follow-Up Page Actions

### Test 7.1 — Follow-Up Page Load
**Role:** Any user with assigned action items  
**Page:** `/follow-up`  
**Action:** Navigate to Follow-Up page  
**Expected:** 
- Page loads without error
- Action items displayed in table
- Sorted by due date ascending (null last)
- Status chips show correct state (Not Started, In Progress, Completed, Overdue)

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.2 — Start Action Button (Timestamp Rule)
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Find item with `startedAt === null`  
**Expected:** 
- "Start" button visible
- "Complete" and "Delay" buttons NOT visible (or disabled)
- Click Start → API call → row reloads
- Start button disappears, Complete/Delay buttons appear

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.3 — Complete Action Button (Timestamp Rule)
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Find item with `startedAt !== null && completedAt === null`  
**Expected:** 
- "Complete" button visible
- "Start" button NOT visible
- Click Complete → API call → row reloads
- Item shows "Completed" status

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.4 — Delay Action Button (Timestamp Rule)
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Find item with `completedAt === null`  
**Expected:** 
- "Delay" button visible
- Click Delay → API call → row reloads
- Due date extends (check backend for new date)

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.5 — No Action Buttons When Completed
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Find item with `completedAt !== null`  
**Expected:** 
- No action buttons visible (Start/Complete/Delay all hidden)
- Status shows "Completed"

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.6 — Follow-Up Action Error Handling
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** 
1. Two users open same action item
2. User A clicks Start
3. User B clicks Start

**Expected (User B):**
- API returns 409 Conflict
- ErrorPanel appears above table
- Message: "This action has already been started"
- Row reloads showing updated state

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 7.7 — Follow-Up Empty State
**Role:** User with no assigned action items  
**Page:** `/follow-up`  
**Action:** Navigate to Follow-Up page  
**Expected:** 
- Empty state message: "✅ No follow-up action items assigned"
- Subtitle: "You have no pending action items requiring your attention."

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 8 — Network Failure Simulation

### Test 8.1 — Inbox Network Failure
**Role:** Any authorized user  
**Page:** `/inbox`  
**Action:** 
1. Open Chrome DevTools → Network tab → Set to "Offline"
2. Refresh page

**Expected:** 
- ErrorPanel appears
- Message: "Network error — check your connection"
- Retry button visible
- Re-enable network → click Retry → page loads

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 8.2 — Follow-Up Network Failure
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Same as Test 8.1  
**Expected:** 
- ErrorPanel appears
- Network error message
- Retry button works after reconnect

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 8.3 — Modal Action Network Failure
**Role:** Any user  
**Page:** `/inbox`  
**Action:** 
1. Open modal
2. Set network to Offline (DevTools)
3. Submit action

**Expected:** 
- Modal shows error: "Network error — check your connection"
- Modal stays open
- Re-enable network → user can retry submission

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 9 — Error UX Consistency

### Test 9.1 — No Raw Stack Traces
**Role:** Any user  
**Page:** All workflow pages  
**Action:** Trigger various errors (network, 403, 409, validation)  
**Expected:** 
- All errors show user-friendly messages
- No stack traces visible in UI
- No JSON dumps visible
- Consistent ErrorPanel styling

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 9.2 — Empty State Consistency
**Role:** Various roles  
**Page:** `/inbox` and `/follow-up`  
**Action:** View pages with no data  
**Expected:** 
- Consistent empty state styling
- Icon or emoji
- Clear message
- Helpful subtitle
- No "No data" raw text

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 10 — Insight Page

### Test 10.1 — Insight Page Skeleton
**Role:** SOFTWARE_ADMIN or ADMINISTRATION_ADMIN  
**Page:** `/insight`  
**Action:** Navigate to Insight page  
**Expected:** 
- Page loads without error
- KPI cards show "--" placeholders
- Chart placeholders render
- Table skeleton with dummy row
- No API calls made (check Network tab)
- No console errors

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 10.2 — Insight Page Access Control
**Role:** WORKER  
**Page:** `/insight`  
**Action:** Try to navigate to Insight  
**Expected:** 
- Navigation item NOT visible in sidebar
- Direct URL access blocked by RoleProtectedRoute

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 11 — Double Click Protection

### Test 11.1 — Inbox Action Button Double Click
**Role:** Any user  
**Page:** `/inbox`  
**Action:** Rapidly click Accept button multiple times  
**Expected:** 
- Only one API request sent (check Network tab)
- Button becomes disabled after first click
- Loading spinner appears
- No duplicate actions

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 11.2 — Follow-Up Action Double Click
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Rapidly click Start button multiple times  
**Expected:** 
- Only one API request sent
- Button disabled during processing
- Loading state shows
- No duplicate requests

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 11.3 — Modal Submit Double Click
**Role:** Any user  
**Page:** `/inbox`  
**Action:** Open modal → rapidly click Submit multiple times  
**Expected:** 
- Only one API request sent
- Submit button disabled after first click
- Form inputs disabled during submission
- No duplicate actions

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 12 — Date Display

### Test 12.1 — Date Formatting
**Role:** Any user  
**Page:** `/inbox` and `/follow-up`  
**Action:** Review all date columns  
**Expected:** 
- Dates display in locale format (e.g., "2/2/2026")
- Times display when appropriate
- No "Invalid Date" errors
- Null dates show "—" or empty cell (not "null" string)

**Observed:**  
Inbox dates: _________________________  
Follow-Up dates: _________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 12.2 — Due Date Display in Follow-Up
**Role:** Any user  
**Page:** `/follow-up`  
**Action:** Check due date column  
**Expected:** 
- Items with null due dates show "—"
- Items with past due dates show in Overdue status
- Dates sort correctly (null last)

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## TEST BLOCK 13 — Refresh Behavior

### Test 13.1 — Inbox Refresh Button
**Role:** Any user  
**Page:** `/inbox`  
**Action:** Click Refresh button  
**Expected:** 
- Inbox reloads (GET request in Network tab)
- Loading state briefly shows
- Data updates if backend changed
- Refresh button disabled during load

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

### Test 13.2 — Modal Open Disables Refresh
**Role:** Any user  
**Page:** `/inbox`  
**Action:** Open modal → try to click Refresh button  
**Expected:** 
- Refresh button disabled while modal open
- Action buttons also disabled
- Prevents concurrent operations

**Observed:**  
_________________________  
_________________________

**Pass/Fail:** [ ] PASS [ ] FAIL  
**Notes:**  
_________________________

---

## Summary Report

### Overall Results

**Total Tests:** _______________  
**Passed:** _______________  
**Failed:** _______________  
**Blocked:** _______________

---

### Critical Failures

List any test failures that block production deployment:

1. _________________________  
2. _________________________  
3. _________________________

---

### Minor Issues

List any minor issues that can be addressed post-deployment:

1. _________________________  
2. _________________________  
3. _________________________

---

### Failure Analysis by Layer

If failures occurred, categorize by layer:

**API Layer:**  
_________________________

**Modal Component:**  
_________________________

**Page Component:**  
_________________________

**Mapping/Normalization:**  
_________________________

**UX/Styling:**  
_________________________

---

### Recommendations

Based on test results:

1. _________________________  
2. _________________________  
3. _________________________

---

## Sign-Off

**Tester Signature:** _________________________  
**Date:** _________________________  
**Status:** [ ] APPROVED FOR PRODUCTION [ ] REQUIRES FIXES

---

## Next Steps

After completing this testing:

1. **If all tests pass:**
   - Document final Phase 4 completion
   - Prepare for production deployment
   - Update stakeholders

2. **If failures found:**
   - DO NOT patch randomly
   - Identify root cause by layer
   - Create targeted fixes
   - Re-run failed tests only
   - Full regression if major changes

3. **Documentation:**
   - Save this completed test log
   - Update CHANGELOG or release notes
   - Notify backend team of any API issues found

---

**STEP 4.16 Testing Complete**
