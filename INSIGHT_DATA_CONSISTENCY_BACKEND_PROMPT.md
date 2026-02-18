# 🔍 INSIGHT PAGE DATA CONSISTENCY - BACKEND TROUBLESHOOTING PROMPT

## 📋 Issue Description

The Insight page displays two different data sources:
1. **KPI Summary Cards** (top of page) - Shows counts like "Open Subcases", "Pending Approvals", etc.
2. **Workload Overview - Grouped by Section** (bottom of page) - Shows actual subcases grouped by section

**Problem:** The counts between these two sections may not match, indicating potential data inconsistency.

---

## 🎯 Expected Behavior

The following should be true:
- `KPI: Open Subcases` = Sum of all pending subcases across all sections in Grouped Inbox
- `KPI: Pending Approvals` = Count of subcases with specific pending approval statuses
- The total `pending_count` in grouped inbox should align with KPI counts

---

## 🔌 Backend Endpoints Involved

### 1. **GET /api/v2/insight/kpi-summary**
**Purpose:** Returns aggregate KPI metrics

**Expected Response:**
```json
{
  "total_subcases": 50,
  "by_status": [
    { "status": "SUBMITTED", "count": 15 },
    { "status": "SECTION_ACCEPTED_PENDING_DEPT", "count": 10 },
    { "status": "DEPT_ACCEPTED_PENDING_ADMIN", "count": 9 },
    { "status": "ADMIN_APPROVED", "count": 16 }
  ],
  "action_items": {
    "total": 25,
    "open": 11,
    "completed": 14,
    "overdue": 6
  }
}
```

**Frontend Transformation:** (in `adaptKpiSummary` function)
- `open_subcases` = All subcases EXCEPT terminal statuses (ADMIN_APPROVED, SECTION_DENIED, FORCE_CLOSED)
- `pending_approvals` = Subcases with status SECTION_ACCEPTED_PENDING_DEPT or DEPT_ACCEPTED_PENDING_ADMIN
- `active_action_items` = action_items.open
- `overdue_items` = action_items.overdue

---

### 2. **GET /api/v2/insight/grouped-inbox**
**Purpose:** Returns sections grouped with their pending subcases

**Expected Response:**
```json
[
  {
    "section_id": 1,
    "section_name": "Emergency Department",
    "org_type": "SECTION",
    "supervisor_name": "Dr. Smith",
    "pending_count": 12,
    "subcases": [
      {
        "subcase_id": 101,
        "case_type": "INCIDENT",
        "incident_id": 501,
        "seasonal_report_id": null,
        "case_description": "Patient fall",
        "patient_name": "John Doe",
        "severity": "HIGH",
        "severity_id": 3,
        "category": "Safety",
        "waiting_days": 5,
        "created_at": "2026-02-10T10:00:00Z",
        "status": "SUBMITTED"
      }
      // ... more subcases
    ]
  }
  // ... more sections
]
```

**Frontend Filtering:** (in `adaptGroupedInbox` function)
- Filters OUT sections where `pending_count = 0`
- Fallback: `severity = NEUTRAL` for null values
- Fallback: `supervisor_name = "Unassigned"` for null values

---

## 🧪 ROOT CAUSE INVESTIGATION

### Check #1: Verify Query Logic Consistency

**SQL Query for KPI Summary** should match **SQL Query for Grouped Inbox**

#### For KPI Summary (/api/v2/insight/kpi-summary):
```sql
-- Example query that might be used
SELECT 
  status,
  COUNT(*) as count
FROM workflow_subcases
WHERE status NOT IN ('ADMIN_APPROVED', 'SECTION_DENIED', 'FORCE_CLOSED')
GROUP BY status;
```

#### For Grouped Inbox (/api/v2/insight/grouped-inbox):
```sql
-- Example query that might be used
SELECT 
  s.section_id,
  s.section_name,
  s.org_type,
  u.display_name as supervisor_name,
  COUNT(wsc.subcase_id) as pending_count,
  -- ... subcase details
FROM organizational_units s
LEFT JOIN users u ON s.supervisor_user_id = u.user_id
LEFT JOIN workflow_subcases wsc ON wsc.target_org_unit_id = s.section_id
WHERE wsc.status NOT IN ('ADMIN_APPROVED', 'SECTION_DENIED', 'FORCE_CLOSED')
GROUP BY s.section_id;
```

**❗ CRITICAL:** Both queries MUST use the same status filtering logic!

---

### Check #2: Status Definition Alignment

Verify that "open subcases" means the same thing in both endpoints:

**Terminal Statuses (should NOT be counted as open):**
- `ADMIN_APPROVED`
- `SECTION_DENIED`
- `FORCE_CLOSED`

**Non-Terminal Statuses (SHOULD be counted as open):**
- `SUBMITTED`
- `SECTION_ACCEPTED_PENDING_DEPT`
- `DEPT_ACCEPTED_PENDING_ADMIN`
- `DEPT_REJECTED_BACK_TO_SECTION`
- `ADMIN_REJECTED_BACK_TO_DEPT`
- Any other active workflow status

---

### Check #3: Verify Data Freshness

**Question:** Are both endpoints reading from the same data at the same time?

Potential issues:
- ❌ One endpoint uses a cached view
- ❌ One endpoint uses a materialized view that's stale
- ❌ Transaction isolation issues (one query sees uncommitted changes)
- ❌ Different database replicas with replication lag

**Solution:** 
- Both endpoints should query the same `workflow_subcases` table
- No caching unless explicitly invalidated on subcase changes
- Use same database connection/replica

---

### Check #4: Scope and Filtering Differences

**Question:** Are both endpoints applying the same scope filters?

Potential issues:
- ❌ KPI includes ALL subcases across system
- ❌ Grouped inbox only shows subcases for current user's accessible sections
- ❌ Different date range filters
- ❌ Different org unit filters
- ❌ One includes archived/deleted subcases, other doesn't

---

### Check #5: Frontend Count Calculation

**Frontend Logic:**
```javascript
// Actual subcase count (sum of subcases array lengths)
const actualSubcaseCount = groupedInbox.reduce((total, section) => {
  return total + (section.subcases?.length || 0);
}, 0);

// Pending count (sum of pending_count fields)
const totalPendingCount = groupedInbox.reduce((total, section) => {
  return total + (section.pending_count || 0);
}, 0);
```

**Issue:** If `pending_count` from backend doesn't match `subcases.length`, this indicates:
- Backend is returning incorrect `pending_count` value
- Backend is not including all subcases in the `subcases` array (e.g., pagination, limit)

---

## 🛠️ Backend Action Items

### Step 1: Add Debug Logging

In both endpoints, log:
```python
# /api/v2/insight/kpi-summary
logger.info(f"[KPI-SUMMARY] Total subcases counted: {total_subcases}")
logger.info(f"[KPI-SUMMARY] Open subcases (non-terminal): {open_subcases}")
logger.info(f"[KPI-SUMMARY] Query: {sql_query}")

# /api/v2/insight/grouped-inbox
logger.info(f"[GROUPED-INBOX] Total sections: {len(sections)}")
logger.info(f"[GROUPED-INBOX] Total subcases across all sections: {sum(s.pending_count for s in sections)}")
logger.info(f"[GROUPED-INBOX] Query: {sql_query}")
```

### Step 2: Create Verification Endpoint

**New Endpoint:** `GET /api/v2/insight/verify-counts`

Returns both datasets side-by-side for comparison:
```json
{
  "kpi_data": {
    "open_subcases": 50,
    "pending_approvals": 19,
    "query_timestamp": "2026-02-12T14:30:00Z"
  },
  "grouped_inbox_data": {
    "total_sections": 5,
    "total_pending_count": 50,
    "total_actual_subcases": 50,
    "query_timestamp": "2026-02-12T14:30:00Z"
  },
  "consistency_check": {
    "counts_match": true,
    "discrepancy": 0
  }
}
```

### Step 3: Unify Query Logic

Create a shared SQL function/view:
```sql
-- Create a view for "open subcases" logic
CREATE OR REPLACE VIEW vw_open_subcases AS
SELECT *
FROM workflow_subcases
WHERE status NOT IN ('ADMIN_APPROVED', 'SECTION_DENIED', 'FORCE_CLOSED')
  AND deleted_at IS NULL;  -- Ensure consistency on soft-deletes

-- Use this view in BOTH endpoints
```

### Step 4: Test Cases

Run these queries directly on the database:

```sql
-- 1. Total open subcases (should match KPI)
SELECT COUNT(*) 
FROM workflow_subcases
WHERE status NOT IN ('ADMIN_APPROVED', 'SECTION_DENIED', 'FORCE_CLOSED');

-- 2. Open subcases grouped by section (should match grouped inbox)
SELECT 
  target_org_unit_id,
  COUNT(*) as pending_count
FROM workflow_subcases
WHERE status NOT IN ('ADMIN_APPROVED', 'SECTION_DENIED', 'FORCE_CLOSED')
GROUP BY target_org_unit_id;

-- 3. Verify pending approval counts
SELECT COUNT(*)
FROM workflow_subcases
WHERE status IN ('SECTION_ACCEPTED_PENDING_DEPT', 'DEPT_ACCEPTED_PENDING_ADMIN');
```

### Step 5: Add Automated Tests

```python
def test_insight_data_consistency():
    """Test that KPI counts match grouped inbox totals"""
    # Call both endpoints
    kpi_response = client.get('/api/v2/insight/kpi-summary')
    inbox_response = client.get('/api/v2/insight/grouped-inbox')
    
    # Extract counts
    open_subcases_kpi = calculate_open_subcases_from_kpi(kpi_response.json())
    open_subcases_inbox = sum(section['pending_count'] for section in inbox_response.json())
    
    # Assert they match
    assert open_subcases_kpi == open_subcases_inbox, \
        f"KPI shows {open_subcases_kpi} but inbox shows {open_subcases_inbox}"
```

---

## 📊 Expected Fix Results

After fixing backend inconsistencies:

✅ **KPI: Open Subcases** = **Sum(section.pending_count for all sections)**  
✅ **KPI: Pending Approvals** = **Count of subcases with pending statuses**  
✅ **Frontend warning disappears** (no more "Data Inconsistency Detected" alert)

---

## 🚨 Common Pitfalls

1. **Different Status Lists:** One uses hardcoded statuses, the other uses a config variable
2. **Timezone Issues:** Created/updated timestamps interpreted differently
3. **Soft Deletes:** One query filters `deleted_at IS NULL`, the other doesn't
4. **Access Control:** KPI shows all data, grouped inbox respects org unit permissions
5. **Pagination:** Grouped inbox may paginate subcases but `pending_count` shows total

---

## 📝 Backend Developer Checklist

- [ ] Verify both endpoints use identical status filtering logic
- [ ] Check for caching or stale views
- [ ] Add debug logging to both endpoints
- [ ] Create database queries to verify counts manually
- [ ] Test with various user roles (section admin, dept admin, system admin)
- [ ] Ensure both endpoints read from same database/replica
- [ ] Add automated integration tests
- [ ] Document the "open subcase" definition clearly
- [ ] Create shared SQL view/function for consistency

---

## 🔗 Related Files

**Frontend:**
- `/src/pages/InsightPage.jsx` - Main page
- `/src/api/insightApi.js` - API adapters (`adaptKpiSummary`, `adaptGroupedInbox`)

**Backend (Expected):**
- `/api/v2/insight/kpi-summary` endpoint
- `/api/v2/insight/grouped-inbox` endpoint

---

**Last Updated:** February 12, 2026  
**Priority:** HIGH - Data integrity issue affecting administrative decision-making
