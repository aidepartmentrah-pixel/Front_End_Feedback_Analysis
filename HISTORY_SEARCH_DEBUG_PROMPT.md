# History Pages - Search Functionality Debugging & Fix

## Problem Statement

**Current Issue:** Users report that search functionality is not working in the History pages (Doctor History and Worker History tabs).

**Expected Behavior:**
- Users should be able to search for doctors and workers by name (English/Arabic) or ID
- Search should trigger when typing at least 2 characters
- Autocomplete should show matching results
- Selecting a result should load that person's profile and data

**Current Implementation:**
- Frontend: `SearchDoctor.js` and `SearchWorker.jsx` components
- API endpoints:
  - `GET /api/v2/doctors/search?q={query}&limit={limit}`
  - `GET /api/v2/workers/search?q={query}&limit={limit}`

---

## Diagnostic Steps Required

### 1. Network Request Verification

**Check if API endpoints are being called:**
- Open browser Developer Tools → Network tab
- Type in search field (at least 2 characters)
- Verify if GET requests are sent to `/api/v2/doctors/search` or `/api/v2/workers/search`

**Expected:** Requests should appear in Network tab
**If no requests:** Frontend issue (JavaScript error, event handler not triggering)
**If requests appear:** Continue to step 2

---

### 2. API Response Verification

**Check API response status and data:**

**Doctor Search:**
```bash
GET /api/v2/doctors/search?q=test&limit=20
```

**Expected Response:**
```json
{
  "success": true,
  "items": [
    {
      "doctor_id": "D12345",
      "employeeId": "E67890",
      "full_name": "Dr. Ahmed Mohammed",
      "nameEn": "Dr. Ahmed Mohammed",
      "name": "Dr. Ahmed Mohammed",
      "specialty": "Cardiology",
      "department": "Cardiac Care"
    }
  ],
  "total": 1
}
```

**Worker Search:**
```bash
GET /api/v2/workers/search?q=test&limit=20
```

**Expected Response:**
```json
{
  "success": true,
  "items": [
    {
      "employee_id": "E12345",
      "id": "E12345",
      "full_name": "Mohammed Ali",
      "name": "Mohammed Ali",
      "job_title": "Administrative Coordinator",
      "department_id": 5,
      "section_id": 12
    }
  ],
  "total": 1
}
```

**If response is 200 OK with data:** Backend is working, may be frontend mapping issue
**If response is 404/500:** Backend endpoint not implemented or error
**If response is empty array:** No matching data in database

---

### 3. Database Query Verification

**Check if search query is correctly searching database:**

**For Doctors:**
```sql
-- Backend should be running query similar to:
SELECT 
    doctor_id,
    full_name,
    name_en as nameEn,
    specialty,
    department_name as department
FROM doctors
WHERE 
    LOWER(full_name) LIKE LOWER('%query%')
    OR LOWER(name_en) LIKE LOWER('%query%')
    OR LOWER(doctor_id) LIKE LOWER('%query%')
    OR LOWER(employee_id) LIKE LOWER('%query%')
LIMIT 20;
```

**For Workers:**
```sql
-- Backend should be running query similar to:
SELECT 
    employee_id,
    full_name,
    job_title,
    department_id,
    section_id
FROM employees
WHERE 
    role IN ('WORKER', 'COMPLAINT_SUPERVISOR')  -- Only workers, not doctors
    AND (
        LOWER(full_name) LIKE LOWER('%query%')
        OR LOWER(employee_id) LIKE LOWER('%query%')
    )
LIMIT 20;
```

**Key Points:**
- Search should be **case-insensitive**
- Search should support **partial matching** (LIKE with %)
- Should search **multiple fields** (name, ID, etc.)
- For workers: Should **exclude doctors** (role filtering)

---

## Backend Requirements

### Requirement 1: Implement Doctor Search Endpoint

**Endpoint:** `GET /api/v2/doctors/search`

**Query Parameters:**
- `q` (required): Search query string (min 2 chars)
- `limit` (optional): Max results (default 20, max 100)

**Backend Logic:**
```python
@router.get("/api/v2/doctors/search")
async def search_doctors(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search doctors by name (English/Arabic) or ID
    Returns list of matching doctors with basic info
    """
    
    # Sanitize search query
    search_pattern = f"%{q.lower()}%"
    
    # Query doctors table
    doctors = db.query(Doctor).filter(
        or_(
            func.lower(Doctor.full_name).like(search_pattern),
            func.lower(Doctor.name_en).like(search_pattern),
            func.lower(Doctor.name_ar).like(search_pattern),
            func.lower(Doctor.doctor_id).like(search_pattern),
            func.lower(Doctor.employee_id).like(search_pattern)
        )
    ).limit(limit).all()
    
    # Map to response format
    items = [
        {
            "doctor_id": doc.doctor_id,
            "employeeId": doc.employee_id,
            "full_name": doc.full_name or doc.name_en,
            "nameEn": doc.name_en,
            "name": doc.full_name,
            "specialty": doc.specialty,
            "department": doc.department_name or f"Dept {doc.department_id}"
        }
        for doc in doctors
    ]
    
    return {
        "success": True,
        "items": items,
        "total": len(items)
    }
```

**Response Contract:**
```json
{
  "success": true,
  "items": [
    {
      "doctor_id": "string",
      "employeeId": "string",
      "full_name": "string",
      "nameEn": "string",
      "name": "string",
      "specialty": "string",
      "department": "string"
    }
  ],
  "total": number
}
```

---

### Requirement 2: Implement Worker Search Endpoint

**Endpoint:** `GET /api/v2/workers/search`

**Query Parameters:**
- `q` (required): Search query string (min 2 chars)
- `limit` (optional): Max results (default 20, max 100)

**Backend Logic:**
```python
@router.get("/api/v2/workers/search")
async def search_workers(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search workers (non-doctor employees) by name or ID
    Returns list of matching workers with basic info
    """
    
    # Sanitize search query
    search_pattern = f"%{q.lower()}%"
    
    # Query employees table - exclude doctors
    workers = db.query(Employee).filter(
        and_(
            # Only workers (not doctors)
            Employee.role.in_(['WORKER', 'COMPLAINT_SUPERVISOR', 'SOFTWARE_ADMIN']),
            # Search conditions
            or_(
                func.lower(Employee.full_name).like(search_pattern),
                func.lower(Employee.employee_id).like(search_pattern)
            )
        )
    ).limit(limit).all()
    
    # Map to response format
    items = [
        {
            "employee_id": emp.employee_id,
            "id": emp.employee_id,
            "full_name": emp.full_name,
            "name": emp.full_name,
            "job_title": emp.job_title,
            "department_id": emp.department_id,
            "section_id": emp.section_id
        }
        for emp in workers
    ]
    
    return {
        "success": True,
        "items": items,
        "total": len(items)
    }
```

**Response Contract:**
```json
{
  "success": true,
  "items": [
    {
      "employee_id": "string",
      "id": "string",
      "full_name": "string",
      "name": "string",
      "job_title": "string",
      "department_id": number,
      "section_id": number
    }
  ],
  "total": number
}
```

---

## Testing Checklist

### Test 1: Doctor Search - Name (English)
**Request:**
```bash
GET /api/v2/doctors/search?q=ahmed&limit=20
```

**Expected:**
- Status: 200 OK
- Response contains doctors with "ahmed" in name (case-insensitive)
- Each doctor object has all required fields

---

### Test 2: Doctor Search - Name (Arabic)
**Request:**
```bash
GET /api/v2/doctors/search?q=أحمد&limit=20
```

**Expected:**
- Status: 200 OK
- Response contains doctors with "أحمد" in Arabic name
- Arabic character search works correctly

---

### Test 3: Doctor Search - ID
**Request:**
```bash
GET /api/v2/doctors/search?q=D123&limit=20
```

**Expected:**
- Status: 200 OK
- Response contains doctors with doctor_id or employeeId containing "D123"

---

### Test 4: Worker Search - Name
**Request:**
```bash
GET /api/v2/workers/search?q=mohammed&limit=20
```

**Expected:**
- Status: 200 OK
- Response contains workers (not doctors) with "mohammed" in name
- No doctors in results (role filtering working)

---

### Test 5: Worker Search - Employee ID
**Request:**
```bash
GET /api/v2/workers/search?q=E456&limit=20
```

**Expected:**
- Status: 200 OK
- Response contains workers with employee_id containing "E456"

---

### Test 6: Short Query (< 2 chars)
**Request:**
```bash
GET /api/v2/doctors/search?q=a&limit=20
```

**Expected:**
- Status: 400 Bad Request
- Error message: "Query must be at least 2 characters"

---

### Test 7: No Results
**Request:**
```bash
GET /api/v2/doctors/search?q=xyznonexistent&limit=20
```

**Expected:**
- Status: 200 OK
- Response: `{ "success": true, "items": [], "total": 0 }`

---

## Frontend Integration

**Frontend expects these exact field names in response:**

### Doctor Search Response Fields:
- `doctor_id` or `employeeId` or `id` (at least one required)
- `full_name` or `nameEn` or `name` (at least one required)
- `specialty` (optional, shown in dropdown)
- `department` (optional, shown in dropdown)

### Worker Search Response Fields:
- `employee_id` or `id` (at least one required)
- `full_name` or `name` (at least one required)
- `job_title` (optional, shown in dropdown)
- `department_id` (optional)
- `section_id` (optional)

**If backend uses different field names, update frontend mapping or backend response.**

---

## Error Handling

### Backend Should Return:

**400 Bad Request - Invalid Query:**
```json
{
  "detail": "Search query must be at least 2 characters long"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Database connection error"
}
```

**Frontend Should Handle:**
- Empty results → Show "No results found" message
- Network errors → Show "Failed to fetch search results"
- Loading state → Show spinner in autocomplete
- Clear previous results when query changes

---

## Common Issues & Solutions

### Issue 1: Search returns empty array but data exists
**Cause:** Database query too restrictive or wrong field names
**Solution:** Check column names in database schema, ensure LIKE query uses correct fields

### Issue 2: Arabic search not working
**Cause:** Database collation or encoding issue
**Solution:** Ensure database uses UTF-8 encoding, test Arabic queries directly in SQL

### Issue 3: Search returns doctors in worker search
**Cause:** Missing role filtering
**Solution:** Add `WHERE role IN ('WORKER', 'COMPLAINT_SUPERVISOR')` to worker query

### Issue 4: Query validation fails
**Cause:** Frontend not enforcing 2-char minimum before API call
**Solution:** Already implemented in frontend (line 18-21 in SearchDoctor.js)

### Issue 5: CORS errors
**Cause:** Backend not allowing frontend origin
**Solution:** Add CORS headers to API responses

---

## Deliverables

- [ ] Implement `/api/v2/doctors/search` endpoint
- [ ] Implement `/api/v2/workers/search` endpoint
- [ ] All 7 tests passing
- [ ] Search works with English names
- [ ] Search works with Arabic names
- [ ] Search works with IDs
- [ ] Role filtering prevents doctors in worker search
- [ ] Empty results handled gracefully
- [ ] Performance: Queries return in < 500ms

---

**Once backend is implemented, frontend search will work automatically (no frontend changes needed).**
