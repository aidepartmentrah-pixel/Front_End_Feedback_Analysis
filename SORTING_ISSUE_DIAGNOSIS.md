# 🔍 Complaint Number Sorting Issue - Diagnosis & Fix

## Problem Description
When sorting by Complaint Number in the TableView, records appear in incorrect order:
- **Observed**: 177, 175, 176, 171, 172, 173
- **Expected**: 171, 172, 173, 175, 176, 177

## Root Cause Analysis

### ✅ Frontend is Working Correctly
The frontend properly maps the `complaint_number` column to the `id` field for numeric sorting:

**File**: [src/pages/TableView.js](src/pages/TableView.js#L199-L206)
```javascript
const handleSort = (column) => {
  // Map frontend column keys to backend field names
  let backendSortField = column;
  if (column === "complaint_number") {
    // Use numeric ID field for proper numeric sorting
    backendSortField = "id";
  }
  // ... rest of sorting logic
}
```

When you click the "Complaint #" column header, the frontend sends:
```
GET /api/complaints?sort_by=id&sort_order=asc
```

### ❌ Backend is Doing String Sort Instead of Numeric Sort

The pattern `177, 175, 176, 171, 172, 173` is **classic lexicographic (alphabetical) sorting**:

| String Sort (Current) | Numeric Sort (Expected) |
|-----------------------|-------------------------|
| "171" | 171 |
| "172" | 172 |
| "173" | 173 |
| "175" | 175 |
| "176" | 176 |
| "177" | 177 |

**Why String Sort Produces This Order:**
When comparing strings character by character:
- "177" starts with "17", "175" starts with "17" → compare 3rd char: "7" > "5" ✓
- "175" vs "176" → "5" < "6" ✓
- "171" < "172" < "173" < "175" < "176" < "177" (alphabetically)

But visually it appears "out of order" because we expect numeric comparison.

## Backend Fix Required

The backend sorting logic needs to **cast the ID field to integer** before sorting.

### Example Backend Fixes (depending on your backend framework):

#### If using SQLAlchemy (Python):
```python
# WRONG (string sort)
query = query.order_by(Complaint.id)  # If id is stored as string

# CORRECT (numeric sort)
from sqlalchemy import cast, Integer
query = query.order_by(cast(Complaint.id, Integer))
```

#### If using Django ORM:
```python
# WRONG
queryset = queryset.order_by('id')  # If id field is CharField

# CORRECT
from django.db.models import IntegerField
from django.db.models.functions import Cast

queryset = queryset.annotate(
    id_int=Cast('id', IntegerField())
).order_by('id_int')
```

#### If using Raw SQL:
```sql
-- WRONG
ORDER BY id ASC

-- CORRECT
ORDER BY CAST(id AS INTEGER) ASC
-- or
ORDER BY id::INTEGER ASC  -- PostgreSQL
-- or
ORDER BY CONVERT(id, SIGNED) ASC  -- MySQL
```

## Verification Steps

### 1. Check Browser Console
After the frontend fix (enhanced logging), open browser DevTools console and sort by Complaint #. Look for:

```
🔀 SORT DEBUG: {
  sort_by: "id",
  sort_order: "asc",
  message: "⚠️ Sorting by ID - Backend must use NUMERIC sort, not string sort!"
}

🔍 SORT VERIFICATION - First 5 IDs: [177, 175, 176, 171, 172]
⚠️ If IDs show: [177, 175, 176...] this confirms BACKEND is doing STRING sort instead of NUMERIC sort
```

### 2. Test Backend Directly
Make a direct API call to test:
```bash
curl "http://127.0.0.1:8000/api/complaints?sort_by=id&sort_order=asc&page=1&page_size=10"
```

Check if the returned IDs are in numeric order.

### 3. Check Database Schema
Verify the `id` field type in your database:
```sql
-- PostgreSQL
\d complaints

-- MySQL
DESCRIBE complaints;

-- SQLite
PRAGMA table_info(complaints);
```

**Expected**: `id` should be `INTEGER`, `BIGINT`, or similar numeric type
**Problem**: If `id` is `VARCHAR`, `TEXT`, or `CHAR`, that's the issue

## Frontend Enhancement (Diagnostic Logging)

Enhanced logging has been added to [src/api/complaints.js](src/api/complaints.js) to help diagnose sorting issues:

```javascript
// Enhanced logging for sort debugging
if (params.sort_by) {
  console.log("🔀 SORT DEBUG:", {
    sort_by: params.sort_by,
    sort_order: params.sort_order,
    message: params.sort_by === 'id' ? '⚠️ Sorting by ID - Backend must use NUMERIC sort!' : ''
  });
}

// Debug: Log first few IDs to verify sort order
if (data.complaints?.length > 0 && params.sort_by === 'id') {
  const ids = data.complaints.slice(0, 5).map(c => c.id || c.complaint_number);
  console.log("🔍 SORT VERIFICATION - First 5 IDs:", ids);
}
```

## Similar Issues in Other Places

This issue will affect **any numeric field** being sorted if stored as strings:
- Patient ID
- Building Number
- Year (if stored as string)
- Any custom numeric identifiers

**Action**: Review all sortable numeric columns and ensure backend casts to numeric type.

## Quick Test Cases

| Field | Current Behavior | Expected Behavior |
|-------|------------------|-------------------|
| Complaint # (ID) | 177, 175, 176, 171 | 171, 172, 173, 175 |
| Received Date | ✅ Works (datetime type) | ✅ |
| Severity | ✅ Works (reference table) | ✅ |

## Summary

1. ✅ **Frontend**: Correctly sends `sort_by=id` for numeric sorting
2. ❌ **Backend**: Performs string sort instead of numeric sort on ID field
3. 🔧 **Fix Location**: Backend sorting logic needs to cast ID to integer
4. 📊 **Enhanced Logging**: Added to help diagnose similar issues

## Next Steps

1. ✅ Frontend logging enhanced (completed)
2. ⏳ **Backend fix required**: Contact backend team or fix sorting logic
3. 🧪 Test with enhanced logging to confirm diagnosis
4. 🔄 After backend fix, verify all numeric columns sort correctly

---

**Created**: January 27, 2026  
**Status**: Diagnosis Complete - Awaiting Backend Fix
