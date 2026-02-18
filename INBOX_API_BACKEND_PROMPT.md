# Inbox API Backend Issues & Requirements

## Current Frontend Observations

### Issue Summary by Role:

1. **SOFTWARE_ADMIN**: 
   - ✅ Has data
   - ❌ View button was not working (FIXED in frontend)
   
2. **COMPLAINT_SUPERVISOR**: 
   - ✅ Has data
   - ❌ View button was not working (FIXED in frontend)
   
3. **WORKER**: 
   - ❌ **Network error — check your connection and try again**
   - Issue: `/api/v2/workflow/inbox` endpoint returns network error or 500
   
4. **SECTION_ADMIN**: 
   - ⚠️ Only View button showing
   - Missing: "Submit Response" button
   - Missing: Ability to add action items
   - ❌ View button was not working (FIXED in frontend)
   
5. **DEPARTMENT_ADMIN**: 
   - ⚠️ Only View button showing
   - Missing: Accept/Reject buttons for department-level review
   - ❌ View button was not working (FIXED in frontend)
   
6. **ADMINISTRATION_ADMIN**: 
   - ⚠️ Only View button showing
   - Missing: Accept/Reject buttons for admin-level review
   - ❌ View button was not working (FIXED in frontend)

---

## Frontend Fixes Applied

### View Button Navigation (COMPLETED)
- Now navigates to `/edit/{incidentId}` when clicking View
- Uses incident ID from inbox item
- Works for all roles that can see View button

### Submit Response Button (COMPLETED)
- Added support for `submit_response` action in `allowedActions`
- Maps to `SUBMIT_RESPONSE` action code
- Opens CaseActionModal for section admins to submit explanation + action items

---

## Backend Requirements

### Endpoint: `GET /api/v2/workflow/inbox`

**Critical Issues to Fix:**

### 1. Network Error for WORKER Role
**Problem:** Endpoint returns network error or crashes when WORKER user accesses it

**Expected Behavior:**
- WORKER role should NOT have inbox access at all
- Frontend role guard already blocks navigation
- If WORKER somehow accesses endpoint, return empty array or 403 Forbidden
- Do NOT crash or return network error

**Action Required:**
```python
# Backend should handle WORKER gracefully:
if user_role == "WORKER":
    return {"items": []}  # or raise 403 Forbidden
```

---

### 2. Missing `allowedActions` for Administrative Roles

The `allowedActions` array controls which buttons appear in the UI. Backend MUST compute this based on:
- User's role
- Current subcase status
- User's organizational scope
- Workflow state machine rules

#### Expected `allowedActions` by Role & Status:

| User Role | Subcase Status | Expected allowedActions |
|-----------|----------------|-------------------------|
| **SECTION_ADMIN** | PENDING_SECTION_RESPONSE | `["view", "submit_response"]` |
| **SECTION_ADMIN** | Other statuses | `["view"]` (read-only) |
| **DEPARTMENT_ADMIN** | PENDING_DEPT_APPROVAL | `["view", "accept", "reject"]` |
| **DEPARTMENT_ADMIN** | Other statuses | `["view"]` (read-only) |
| **ADMINISTRATION_ADMIN** | PENDING_ADMIN_APPROVAL | `["view", "accept", "reject"]` |
| **ADMINISTRATION_ADMIN** | Other statuses | `["view"]` (read-only) |
| **SOFTWARE_ADMIN** | Any status | `["view", "accept", "reject"]` (full control) |
| **COMPLAINT_SUPERVISOR** | Any status | `["view", "accept", "reject"]` (full control) |

---

### 3. Action Definitions

#### `view`
- **All roles** should always have this
- Allows user to see case details (read-only)
- Frontend navigates to `/edit/{incidentId}`

#### `submit_response`
- **SECTION_ADMIN only**
- Only when status = `PENDING_SECTION_RESPONSE`
- Opens modal to submit:
  - Explanation text
  - Action items (title, description, due_date)
- Maps to backend action: `SUBMIT_RESPONSE`

#### `accept`
- **DEPT_ADMIN, ADMIN_ADMIN, SOFTWARE_ADMIN, COMPLAINT_SUPERVISOR**
- Approves case at current level
- Advances workflow to next stage
- Maps to backend action: `APPROVE`

#### `reject`
- **DEPT_ADMIN, ADMIN_ADMIN, SOFTWARE_ADMIN, COMPLAINT_SUPERVISOR**
- Rejects case at current level
- Opens modal to enter rejection reason
- Maps to backend action: `REJECT`

---

## Backend Implementation Checklist

### Priority 1: Fix WORKER Network Error
- [ ] Handle WORKER role gracefully in `/api/v2/workflow/inbox`
- [ ] Return empty array or 403 instead of crashing
- [ ] Add role check at start of endpoint
- [ ] Test with WORKER user credentials

### Priority 2: Fix allowedActions Computation
- [ ] Create function to compute `allowedActions` based on role + status
- [ ] Ensure SECTION_ADMIN sees `submit_response` when appropriate
- [ ] Ensure DEPT_ADMIN sees `accept`/`reject` when appropriate
- [ ] Ensure ADMIN_ADMIN sees `accept`/`reject` when appropriate
- [ ] Ensure SOFTWARE_ADMIN always has full access
- [ ] Ensure COMPLAINT_SUPERVISOR always has full access

### Priority 3: Test Each Role
- [ ] SOFTWARE_ADMIN: Can see accept/reject buttons
- [ ] COMPLAINT_SUPERVISOR: Can see accept/reject buttons
- [ ] SECTION_ADMIN: Can see submit_response button when status = PENDING_SECTION_RESPONSE
- [ ] DEPARTMENT_ADMIN: Can see accept/reject buttons when status = PENDING_DEPT_APPROVAL
- [ ] ADMINISTRATION_ADMIN: Can see accept/reject buttons when status = PENDING_ADMIN_APPROVAL
- [ ] WORKER: Gets empty array or 403 (no crash)

---

## Example Backend Response

### For SECTION_ADMIN with pending case:
```json
{
  "items": [
    {
      "subcase_id": 123,
      "case_type": "INCIDENT",
      "incident_id": 456,
      "seasonal_report_id": null,
      "target_org_unit_id": 789,
      "status": "PENDING_SECTION_RESPONSE",
      "created_at": "2026-02-10T10:00:00Z",
      "allowed_actions": ["view", "submit_response"]
    }
  ]
}
```

### For DEPARTMENT_ADMIN with dept-level case:
```json
{
  "items": [
    {
      "subcase_id": 124,
      "case_type": "INCIDENT",
      "incident_id": 457,
      "seasonal_report_id": null,
      "target_org_unit_id": 790,
      "status": "PENDING_DEPT_APPROVAL",
      "created_at": "2026-02-10T10:00:00Z",
      "allowed_actions": ["view", "accept", "reject"]
    }
  ]
}
```

### For ADMINISTRATION_ADMIN with admin-level case:
```json
{
  "items": [
    {
      "subcase_id": 125,
      "case_type": "INCIDENT",
      "incident_id": 458,
      "seasonal_report_id": null,
      "target_org_unit_id": 791,
      "status": "PENDING_ADMIN_APPROVAL",
      "created_at": "2026-02-10T10:00:00Z",
      "allowed_actions": ["view", "accept", "reject"]
    }
  ]
}
```

---

## Workflow State Machine Reference

Make sure your `allowedActions` logic aligns with the workflow state machine:

```
SUBMITTED → PENDING_SECTION_RESPONSE (Section admin: submit_response)
         ↓
    SECTION_RESPONDED → PENDING_DEPT_APPROVAL (Dept admin: accept/reject)
         ↓
    DEPT_APPROVED → PENDING_ADMIN_APPROVAL (Admin admin: accept/reject)
         ↓
    ADMIN_APPROVED → CLOSED

[Reject at any level → REJECTED → CLOSED]
```

---

## Testing Frontend (After Backend Fix)

Once backend is fixed, test in frontend:

1. **Login as SOFTWARE_ADMIN**
   - Should see data in inbox
   - Should see View, Accept, Reject buttons
   - View button should navigate to `/edit/{incidentId}`
   - Accept/Reject should open modal

2. **Login as COMPLAINT_SUPERVISOR**
   - Same as SOFTWARE_ADMIN

3. **Login as SECTION_ADMIN**
   - Should see inbox items assigned to their section
   - Should see "Submit Response" button for PENDING_SECTION_RESPONSE cases
   - Should see only "View" for other status cases
   - View button should navigate to case detail

4. **Login as DEPARTMENT_ADMIN**
   - Should see "Accept" and "Reject" buttons for PENDING_DEPT_APPROVAL cases
   - Should see only "View" for other status cases

5. **Login as ADMINISTRATION_ADMIN**
   - Should see "Accept" and "Reject" buttons for PENDING_ADMIN_APPROVAL cases
   - Should see only "View" for other status cases

6. **Login as WORKER**
   - Inbox navigation should be hidden (role guard blocks)
   - If direct URL access, should show 403 or empty state (no crash)

---

## Summary

**Frontend Status:** ✅ All fixes complete
- View button now navigates to incident detail
- Submit Response button added
- Accept/Reject buttons already present

**Backend Required:**
1. Fix WORKER network error (Priority 1)
2. Implement `allowedActions` computation for all roles (Priority 2)
3. Test each role thoroughly (Priority 3)

The frontend is **ready and waiting** for backend to return correct `allowedActions` arrays.
