# Force Close Case Feature - Backend Implementation Requirements

## Problem Statement

**Current Gap:** SOFTWARE_ADMIN, WORKER, and COMPLAINT_SUPERVISOR need the ability to administratively close cases that are stuck, duplicates, or need immediate closure. This must close:
1. The main incident/case record
2. ALL subcases (workflow items) related to that incident
3. Remove from all user inboxes
4. Prevent any further actions

**UI Location:** Table View page (`/table-view`) - where admins can see ALL cases with filters

---

## Backend Requirements Overview

### 3 Main Changes Required:

1. **New Endpoint:** Force Close Case + All Subcases
2. **Extended Response:** Add workflow status to complaints list
3. **State Machine Update:** Add FORCE_CLOSED terminal state and validation

---

## REQUIREMENT 1: Force Close Endpoint

### Endpoint Spec

```
POST /api/v2/workflow/case/{incident_id}/force-close
```

### Authorization
**Allowed Roles ONLY:**
- `SOFTWARE_ADMIN`
- `WORKER`
- `COMPLAINT_SUPERVISOR`

All other roles → Return `403 Forbidden`

### Request Body
```json
{
  "reason": "Duplicate case - merged with incident #12345"
}
```

**Validation:**
- `reason` is **required** (min 10 characters)
- `incident_id` must exist in database
- User must have one of the allowed roles

### Backend Processing Steps

1. **Validate Authorization**
   ```python
   if user_role not in ["SOFTWARE_ADMIN", "WORKER", "COMPLAINT_SUPERVISOR"]:
       raise HTTPException(status_code=403, detail="Insufficient permissions")
   ```

2. **Verify Incident Exists**
   ```python
   incident = get_incident_by_id(incident_id)
   if not incident:
       raise HTTPException(status_code=404, detail="Incident not found")
   ```

3. **Find ALL Subcases**
   ```python
   subcases = get_all_subcases_for_incident(incident_id)
   # This should return ALL subcases regardless of status
   # Include: SUBMITTED, PENDING_*, APPROVED, REJECTED, etc.
   ```

4. **Close Main Incident**
   ```python
   incident.status = "FORCE_CLOSED"  # or "CLOSED" with force_close_flag = True
   incident.force_closed_at = datetime.now()
   incident.force_closed_by_user_id = current_user.id
   incident.force_close_reason = reason
   db.commit()
   ```

5. **Close ALL Subcases**
   ```python
   for subcase in subcases:
       subcase.status = "FORCE_CLOSED"
       subcase.force_closed_at = datetime.now()
       subcase.force_closed_by_user_id = current_user.id
       subcase.force_close_reason = reason
       db.commit()
   ```

6. **Audit Log** (Recommended)
   ```python
   create_audit_log(
       action="FORCE_CLOSE",
       user_id=current_user.id,
       incident_id=incident_id,
       subcase_ids=[s.id for s in subcases],
       reason=reason,
       timestamp=datetime.now()
   )
   ```

### Response

```json
{
  "success": true,
  "incident_id": 123,
  "incident_status": "FORCE_CLOSED",
  "subcases_closed": [456, 457, 458],
  "total_subcases_closed": 3,
  "closed_at": "2026-02-10T15:30:00Z",
  "closed_by": "admin_user",
  "reason": "Duplicate case - merged with incident #12345"
}
```

### Error Responses

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions. Only SOFTWARE_ADMIN, WORKER, or COMPLAINT_SUPERVISOR can force close cases."
}
```

**404 Not Found:**
```json
{
  "detail": "Incident ID 123 not found."
}
```

**400 Bad Request:**
```json
{
  "detail": "Reason is required and must be at least 10 characters."
}
```

---

## REQUIREMENT 2: Workflow Status in Complaints List

### Update Existing Endpoint

```
GET /api/complaints
```

### Add New Field to Response

Each complaint record should include:

```json
{
  "FeedbackID": 123,
  "ComplaintTitle": "Patient fell in hallway",
  // ... existing fields ...
  "workflow_status": {
    "has_subcases": true,
    "open_subcase_count": 2,
    "force_closed": false,
    "subcases": [
      {
        "subcase_id": 456,
        "status": "PENDING_SECTION_RESPONSE",
        "target_org_unit": "Cardiology Section"
      },
      {
        "subcase_id": 457,
        "status": "DEPT_ACCEPTED_PENDING_ADMIN",
        "target_org_unit": "Medical Department"
      }
    ]
  }
}
```

**Notes:**
- If incident has NO subcases: `workflow_status: null` or `has_subcases: false`
- If force closed: `force_closed: true` and all subcases show `FORCE_CLOSED` status
- This allows frontend to show workflow status badge in table
- Frontend can check `workflow_status.open_subcase_count > 0` to show "Force Close" button

---

## REQUIREMENT 3: State Machine Updates

### Add FORCE_CLOSED State

**New Terminal State:**
```python
FORCE_CLOSED = "FORCE_CLOSED"  # Cannot transition out
```

### Workflow State Transitions

**Current States:**
```
SUBMITTED → PENDING_SECTION_RESPONSE → SECTION_RESPONDED → 
PENDING_DEPT_APPROVAL → DEPT_APPROVED → PENDING_ADMIN_APPROVAL → 
ADMIN_APPROVED → CLOSED
```

**Updated with Force Close:**
```
[Any State] → FORCE_CLOSED (terminal, no further transitions)
```

### Update allowedActions Logic

**When subcase status = FORCE_CLOSED:**
```python
def compute_allowed_actions(subcase, user_role):
    if subcase.status == "FORCE_CLOSED":
        return []  # No actions allowed on force-closed cases
    
    # ... existing logic for other states ...
```

### Update Inbox Endpoint

**Filter Out Force-Closed Cases:**

```python
# In GET /api/v2/workflow/inbox
subcases = get_user_inbox_subcases(user_id, user_role)

# Filter out force-closed cases
subcases = [s for s in subcases if s.status != "FORCE_CLOSED"]

return {"items": [normalize_subcase(s) for s in subcases]}
```

**Critical:** This ensures force-closed cases disappear from EVERYONE's inbox immediately.

---

## REQUIREMENT 4: Prevent Actions on Force-Closed Cases

### Update Act Endpoint

```
POST /api/v2/workflow/case/{subcase_id}/act
```

**Add Validation:**
```python
def act_on_subcase(subcase_id, action, payload, current_user):
    subcase = get_subcase_by_id(subcase_id)
    
    # NEW: Check if force closed
    if subcase.status == "FORCE_CLOSED":
        raise HTTPException(
            status_code=400,
            detail="Cannot perform actions on force-closed cases. This case was administratively closed."
        )
    
    # NEW: Check if parent incident is force closed
    incident = get_incident_by_id(subcase.incident_id)
    if incident.status == "FORCE_CLOSED":
        raise HTTPException(
            status_code=400,
            detail="Cannot perform actions on force-closed cases. The parent incident was administratively closed."
        )
    
    # ... existing action logic ...
```

**This prevents:**
- Users trying to accept/reject force-closed cases
- Section admins submitting responses on force-closed cases
- Any workflow actions on closed cases

---

## Database Schema Changes (If Needed)

### Option 1: Use Existing Status Field
```sql
-- Just add "FORCE_CLOSED" as a new status enum value
ALTER TYPE subcase_status_enum ADD VALUE 'FORCE_CLOSED';
ALTER TYPE incident_status_enum ADD VALUE 'FORCE_CLOSED';
```

### Option 2: Add Dedicated Fields (Recommended for Audit)
```sql
-- Add force close tracking columns
ALTER TABLE subcases ADD COLUMN force_closed_at TIMESTAMP NULL;
ALTER TABLE subcases ADD COLUMN force_closed_by_user_id INT NULL;
ALTER TABLE subcases ADD COLUMN force_close_reason TEXT NULL;

ALTER TABLE incidents ADD COLUMN force_closed_at TIMESTAMP NULL;
ALTER TABLE incidents ADD COLUMN force_closed_by_user_id INT NULL;
ALTER TABLE incidents ADD COLUMN force_close_reason TEXT NULL;
```

**Benefit:** Clear audit trail showing:
- Who force-closed it
- When they closed it
- Why they closed it
- Separate from normal workflow closure

---

## Testing Checklist

### Test 1: Force Close with Subcases
**Setup:**
- Create incident with 3 open subcases in different states:
  - Subcase 1: PENDING_SECTION_RESPONSE
  - Subcase 2: PENDING_DEPT_APPROVAL
  - Subcase 3: ADMIN_APPROVED

**Test:**
1. Login as SOFTWARE_ADMIN
2. POST to `/api/v2/workflow/case/{incident_id}/force-close`
3. Verify response shows all 3 subcases closed
4. Query GET `/api/v2/workflow/inbox` for section admin → should NOT see Subcase 1
5. Query GET `/api/v2/workflow/inbox` for dept admin → should NOT see Subcase 2
6. Query GET `/api/v2/workflow/inbox` for admin admin → should NOT see Subcase 3
7. Verify incident status = FORCE_CLOSED
8. Verify all subcase statuses = FORCE_CLOSED

**Expected:** ✅ All subcases closed, removed from all inboxes

---

### Test 2: Force Close with No Subcases
**Setup:**
- Create incident with NO subcases

**Test:**
1. Login as WORKER
2. POST to `/api/v2/workflow/case/{incident_id}/force-close`
3. Verify response shows success with 0 subcases closed
4. Verify incident status = FORCE_CLOSED

**Expected:** ✅ Incident closed successfully even without subcases

---

### Test 3: Authorization Checks
**Test:**
1. Login as SECTION_ADMIN (NOT authorized)
2. POST to `/api/v2/workflow/case/{incident_id}/force-close`
3. Verify response = 403 Forbidden

**Expected:** ✅ Unauthorized roles cannot force close

**Repeat for:**
- DEPARTMENT_ADMIN → 403
- ADMINISTRATION_ADMIN → 403
- SOFTWARE_ADMIN → 200 (allowed)
- WORKER → 200 (allowed)
- COMPLAINT_SUPERVISOR → 200 (allowed)

---

### Test 4: Prevent Actions on Force-Closed Cases
**Setup:**
- Force close an incident with subcase in PENDING_SECTION_RESPONSE

**Test:**
1. Login as SECTION_ADMIN
2. Try to POST to `/api/v2/workflow/case/{subcase_id}/act` with action "SUBMIT_RESPONSE"
3. Verify response = 400 Bad Request with message about force-closed
4. Try to accept/reject from DEPT_ADMIN → same error
5. GET `/api/v2/workflow/inbox` → verify force-closed case NOT in inbox

**Expected:** ✅ No actions possible on force-closed cases, clear error message

---

### Test 5: Workflow Status in Complaints List
**Setup:**
- Create 3 incidents:
  - Incident A: No subcases
  - Incident B: 2 open subcases
  - Incident C: 1 force-closed subcase

**Test:**
1. GET `/api/complaints`
2. Verify Incident A: `workflow_status.has_subcases = false` or `null`
3. Verify Incident B: `workflow_status.open_subcase_count = 2`
4. Verify Incident C: `workflow_status.force_closed = true`

**Expected:** ✅ Workflow status correctly reflects subcase state

---

### Test 6: Reason Validation
**Test:**
1. POST to force-close endpoint with empty reason: `{"reason": ""}`
2. Verify response = 400 Bad Request
3. POST with short reason: `{"reason": "test"}`
4. Verify response = 400 Bad Request (less than 10 chars)
5. POST with valid reason: `{"reason": "Administrative closure due to duplication"}`
6. Verify response = 200 Success

**Expected:** ✅ Reason validation works correctly

---

### Test 7: Force Close Already Closed Case
**Setup:**
- Force close an incident (status = FORCE_CLOSED)

**Test:**
1. Try to force close same incident again
2. Verify response is graceful (either success with 0 changes, or clear message)

**Expected:** ✅ No error, idempotent operation

---

## Frontend Integration Points

### Frontend Will Call:

1. **Force Close:**
   ```javascript
   // In workflowApi.js
   export const forceCloseCase = async (incidentId, reason) => {
     const response = await apiClient.post(
       `/api/v2/workflow/case/${incidentId}/force-close`,
       { reason }
     );
     return response.data;
   };
   ```

2. **Check Workflow Status:**
   ```javascript
   // Already in complaints response
   complaint.workflow_status.open_subcase_count > 0
   // Show "Force Close" button if > 0 and user has permission
   ```

### Frontend Will Display:

- **Force Close Button** (Table View, Actions column)
  - Only visible to SOFTWARE_ADMIN, WORKER, COMPLAINT_SUPERVISOR
  - Only enabled if `workflow_status.open_subcase_count > 0`

- **Force Close Modal:**
  - Show incident details
  - List all open subcases with statuses
  - Text area for reason (required, min 10 chars)
  - Warning: "This will PERMANENTLY close this case and all {count} subcases"
  - Confirm button

- **Success Feedback:**
  - Alert: "✅ Successfully closed incident #{id} and {count} subcases"
  - Refresh table to remove from view (if filtering for open cases)

---

## Summary

### Backend Changes Needed:

✅ **New Endpoint:** `POST /api/v2/workflow/case/{incident_id}/force-close`
- Closes incident + all subcases
- Requires authorization (3 roles only)
- Returns detailed response
- Audit logging

✅ **Extended Response:** Add `workflow_status` to `GET /api/complaints`
- Shows subcase count and statuses
- Enables frontend to show Force Close button

✅ **State Machine:** Add `FORCE_CLOSED` terminal state
- Update allowedActions to return `[]` for force-closed
- Filter force-closed cases from inbox endpoint
- Prevent actions on force-closed cases in act endpoint

✅ **Database:** Add force_close tracking fields (optional but recommended)
- Audit trail: who, when, why

### Testing Required:

- [ ] Force close with multiple subcases
- [ ] Force close with no subcases
- [ ] Authorization checks (6 roles)
- [ ] Prevent actions on force-closed cases
- [ ] Workflow status in complaints list
- [ ] Reason validation
- [ ] Idempotency (close already closed)

### Deliverables:

1. Implemented force-close endpoint
2. Updated complaints endpoint with workflow_status
3. Updated inbox endpoint to filter force-closed
4. Updated act endpoint to block force-closed
5. All 7 tests passing
6. Database migration (if adding new columns)

---

## Questions for Backend Team:

1. **Status Field:** Use existing status enum or add dedicated force_close columns?
2. **Reopen Feature:** Should we plan for "reopen" functionality? (Not in scope now, but affects design)
3. **Cascade Delete:** Should force-close also delete related data (action items, explanations)? Or just mark as closed?
4. **Notification:** Should users with subcases in their inbox be notified when admin force-closes? (Future enhancement)

---

**Please implement all requirements and run all 7 tests. Confirm when ready for frontend integration.**
