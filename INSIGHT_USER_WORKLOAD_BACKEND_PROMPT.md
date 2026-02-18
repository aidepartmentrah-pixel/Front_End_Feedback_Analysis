# Insight Page - User Workload Endpoint Specification

## Problem Statement

**Current Gap:** The Insight page (`/insight`) shows case-centric stuck cases, but WORKER and COMPLAINT_SUPERVISOR need a **person-centric view** to see which users have pending workload. This enables proactive follow-up (e.g., "Dr. Smith has 10 pending items, let's call them").

**UI Location:** Insight page (`/insight`) - will add new "User Workload Summary" section

---

## Backend Requirements

### New Endpoint Required

```
GET /api/v2/insight/user-workload
```

### Authorization
**Allowed Roles:**
- `SOFTWARE_ADMIN`
- `WORKER`
- `COMPLAINT_SUPERVISOR` (if they have access to Insight page)

All other roles → Return `403 Forbidden`

---

## Request Parameters (Query Params)

All parameters are **optional** (defaults to current active workload):

```
GET /api/v2/insight/user-workload?org_unit_id=123&role=SECTION_ADMIN&min_items=5
```

### Parameters:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `org_unit_id` | integer | Filter by organizational unit | All units |
| `role` | string | Filter by user role (SECTION_ADMIN, DEPARTMENT_ADMIN, etc.) | All roles |
| `min_items` | integer | Only show users with ≥ N pending items | 1 |
| `sort_by` | string | Sort by: `pending_count`, `oldest_item`, `user_name` | `pending_count` |
| `sort_order` | string | `asc` or `desc` | `desc` |

---

## Backend Processing Logic

### Step 1: Find All Open Subcases
```python
# Get all subcases NOT in terminal states
open_subcases = db.query(Subcase).filter(
    Subcase.status.in_([
        'SUBMITTED',
        'PENDING_SECTION_RESPONSE',
        'SECTION_RESPONDED',
        'SECTION_ACCEPTED_PENDING_DEPT',
        'DEPT_ACCEPTED_PENDING_ADMIN',
    ])
).all()
```

### Step 2: Group by Assigned User/Role
```python
# Logic depends on your workflow assignment model
# Example: Determine who "owns" each subcase based on status

workload_map = {}  # user_id → { pending_items: [], oldest_date: ... }

for subcase in open_subcases:
    # Determine who should act on this subcase
    assigned_user_id = determine_assigned_user(subcase)
    
    if assigned_user_id not in workload_map:
        workload_map[assigned_user_id] = {
            'pending_items': [],
            'oldest_date': None
        }
    
    workload_map[assigned_user_id]['pending_items'].append(subcase)
    
    # Track oldest item date
    if workload_map[assigned_user_id]['oldest_date'] is None:
        workload_map[assigned_user_id]['oldest_date'] = subcase.updated_at
    else:
        workload_map[assigned_user_id]['oldest_date'] = min(
            workload_map[assigned_user_id]['oldest_date'],
            subcase.updated_at
        )
```

### Step 3: Build Response
```python
result = []

for user_id, workload in workload_map.items():
    user = get_user_by_id(user_id)
    
    # Apply filters
    pending_count = len(workload['pending_items'])
    if min_items and pending_count < min_items:
        continue
    
    if role_filter and user.role != role_filter:
        continue
    
    if org_unit_filter:
        # Check if any of user's assigned units match filter
        user_org_units = get_user_org_units(user_id)
        if org_unit_filter not in user_org_units:
            continue
    
    # Calculate days since oldest item
    days_oldest = (datetime.now() - workload['oldest_date']).days
    
    result.append({
        'user_id': user_id,
        'user_name': user.full_name,
        'user_role': user.role,
        'primary_org_unit': user.primary_org_unit_name,
        'pending_count': pending_count,
        'oldest_item_days': days_oldest,
        'contact_info': {
            'email': user.email,
            'phone': user.phone,  # if available
        }
    })

# Sort
result.sort(key=lambda x: x[sort_by], reverse=(sort_order == 'desc'))

return result
```

---

## Response Format

```json
[
  {
    "user_id": 456,
    "user_name": "Dr. John Smith",
    "user_role": "SECTION_ADMIN",
    "primary_org_unit": "Cardiology Section",
    "pending_count": 10,
    "oldest_item_days": 15,
    "contact_info": {
      "email": "john.smith@hospital.org",
      "phone": "+1-555-0100"
    }
  },
  {
    "user_id": 789,
    "user_name": "Jane Doe",
    "user_role": "DEPARTMENT_ADMIN",
    "primary_org_unit": "Medical Department",
    "pending_count": 5,
    "oldest_item_days": 8,
    "contact_info": {
      "email": "jane.doe@hospital.org",
      "phone": null
    }
  },
  {
    "user_id": 123,
    "user_name": "Admin User",
    "user_role": "ADMINISTRATION_ADMIN",
    "primary_org_unit": "Central Administration",
    "pending_count": 3,
    "oldest_item_days": 4,
    "contact_info": {
      "email": "admin@hospital.org",
      "phone": "+1-555-0200"
    }
  }
]
```

### Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | integer | Unique user identifier |
| `user_name` | string | Full display name |
| `user_role` | string | User's role (SECTION_ADMIN, DEPARTMENT_ADMIN, etc.) |
| `primary_org_unit` | string | User's primary organizational unit name |
| `pending_count` | integer | Number of open subcases assigned to this user |
| `oldest_item_days` | integer | Days since the oldest pending item was last updated |
| `contact_info.email` | string | User's email address |
| `contact_info.phone` | string\|null | User's phone number (if available) |

---

## Error Responses

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions. Only admins and workers can view user workload."
}
```

**400 Bad Request:**
```json
{
  "detail": "Invalid sort_by value. Must be one of: pending_count, oldest_item, user_name"
}
```

---

## Assignment Logic Clarification

**Critical Question for Backend Team:**

How do you determine which user "owns" a subcase in a given state?

### Option A: Based on Status
```python
def determine_assigned_user(subcase):
    if subcase.status == 'PENDING_SECTION_RESPONSE':
        return subcase.section_admin_user_id
    elif subcase.status == 'SECTION_ACCEPTED_PENDING_DEPT':
        return subcase.dept_admin_user_id
    elif subcase.status == 'DEPT_ACCEPTED_PENDING_ADMIN':
        return subcase.admin_admin_user_id
    # ... etc
```

### Option B: Based on Explicit Assignment Field
```python
def determine_assigned_user(subcase):
    return subcase.assigned_to_user_id  # If you have this field
```

### Option C: Based on Org Unit + Role
```python
def determine_assigned_user(subcase):
    # Get all users of the appropriate role for the target org unit
    if subcase.status == 'PENDING_SECTION_RESPONSE':
        role = 'SECTION_ADMIN'
    elif subcase.status == 'SECTION_ACCEPTED_PENDING_DEPT':
        role = 'DEPARTMENT_ADMIN'
    # ... etc
    
    # Return first user with role in target org unit
    users = get_users_by_role_and_org_unit(role, subcase.target_org_unit_id)
    return users[0].id if users else None
```

**Please clarify which approach your system uses, or if it's a hybrid.**

---

## Testing Checklist

### Test 1: Basic Workload Retrieval
**Setup:**
- User A (Section Admin) has 10 pending subcases
- User B (Dept Admin) has 5 pending subcases
- User C (Admin Admin) has 3 pending subcases

**Test:**
1. GET `/api/v2/insight/user-workload`
2. Verify response includes all 3 users
3. Verify `pending_count` matches expected values
4. Verify sorted by `pending_count` DESC (default)

**Expected:** ✅ Returns sorted list with correct counts

---

### Test 2: Min Items Filter
**Setup:** Same as Test 1

**Test:**
1. GET `/api/v2/insight/user-workload?min_items=5`
2. Verify response includes only User A (10) and User B (5)
3. Verify User C (3) is excluded

**Expected:** ✅ Only users with ≥5 items returned

---

### Test 3: Role Filter
**Setup:** Same as Test 1

**Test:**
1. GET `/api/v2/insight/user-workload?role=SECTION_ADMIN`
2. Verify response includes only User A
3. Verify Users B and C excluded

**Expected:** ✅ Only Section Admins returned

---

### Test 4: Org Unit Filter
**Setup:**
- User A belongs to "Cardiology Section"
- User B belongs to "Surgery Department"

**Test:**
1. GET `/api/v2/insight/user-workload?org_unit_id=<cardiology_id>`
2. Verify response includes only User A
3. Verify User B excluded

**Expected:** ✅ Only users in specified org unit returned

---

### Test 5: Sorting
**Setup:** Same as Test 1

**Test:**
1. GET `/api/v2/insight/user-workload?sort_by=user_name&sort_order=asc`
2. Verify response sorted alphabetically by user name
3. GET `/api/v2/insight/user-workload?sort_by=oldest_item&sort_order=desc`
4. Verify response sorted by oldest item (descending)

**Expected:** ✅ Sorting works for all fields

---

### Test 6: Empty Result Set
**Setup:**
- All subcases are in terminal states (ADMIN_APPROVED, FORCE_CLOSED, etc.)

**Test:**
1. GET `/api/v2/insight/user-workload`
2. Verify response = `[]` (empty array)

**Expected:** ✅ Empty array returned, no errors

---

### Test 7: Authorization
**Test:**
1. Login as SECTION_ADMIN (NOT authorized to view insights)
2. GET `/api/v2/insight/user-workload`
3. Verify response = 403 Forbidden

**Expected:** ✅ Only authorized roles can access

**Repeat for:**
- DEPARTMENT_ADMIN → 403
- ADMINISTRATION_ADMIN → 403
- SOFTWARE_ADMIN → 200 (allowed)
- WORKER → 200 (allowed)
- COMPLAINT_SUPERVISOR → 200 (if they have insight access)

---

## Performance Considerations

### Optimization Strategies:

1. **Index on subcase.status**
   ```sql
   CREATE INDEX idx_subcase_status ON subcases(status);
   ```

2. **Index on subcase.updated_at**
   ```sql
   CREATE INDEX idx_subcase_updated_at ON subcases(updated_at);
   ```

3. **Cache Results** (if workload doesn't change frequently)
   - Cache for 5-10 minutes
   - Invalidate on subcase status change

4. **Pagination** (if user count is very high)
   - Add `?limit=50&offset=0` parameters
   - Return total count in response header

---

## Frontend Integration

The frontend will call this endpoint from `src/api/insightApi.js`:

```javascript
export async function getUserWorkload(filters = {}) {
  try {
    const params = {};
    if (filters.orgUnitId) params.org_unit_id = filters.orgUnitId;
    if (filters.role) params.role = filters.role;
    if (filters.minItems) params.min_items = filters.minItems;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.sortOrder) params.sort_order = filters.sortOrder;
    
    const res = await apiClient.get('/api/v2/insight/user-workload', { params });
    return res.data;  // Return array directly
  } catch (err) {
    const message = err.response?.data?.detail || 'Failed to load user workload';
    throw new Error(message);
  }
}
```

---

## Summary

### Deliverables:

1. ✅ New endpoint: `GET /api/v2/insight/user-workload`
2. ✅ Support for filters: org_unit_id, role, min_items
3. ✅ Support for sorting: pending_count, oldest_item, user_name
4. ✅ Authorization checks (3 allowed roles)
5. ✅ All 7 tests passing
6. ✅ Performance optimization (indexes, caching)

### Questions for Backend Team:

1. **Assignment Logic:** How do you determine which user "owns" a subcase? (See "Assignment Logic Clarification" section)
2. **Contact Info:** Do you have phone numbers in user table?
3. **Pagination:** Should we implement pagination if user count is high?
4. **Caching:** Is 5-minute cache acceptable for this data?

**Please implement and confirm when ready for frontend integration.**
