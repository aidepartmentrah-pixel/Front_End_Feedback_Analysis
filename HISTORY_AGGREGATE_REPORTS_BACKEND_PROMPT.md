# History Aggregate Reports - Backend Implementation Requirements

## Problem Statement

**Current Gap:** SOFTWARE_ADMIN and WORKER need the ability to generate seasonal reports for:
1. **ALL Doctors** - Combined report for all doctors in the system for a given season
2. **ALL Workers** - Combined report for all complaint department workers for a given season

**Current State:** Reports only work for individual selected doctor/worker

**UI Location:** History page (`/history`) - Doctor History and Worker History tabs with FAB (Floating Action Button)

---

## Backend Requirements Overview

### 2 New Endpoints Required:

1. **Aggregate Doctor Report:** Generate Word report for ALL doctors
2. **Aggregate Worker Report:** Generate Word report for ALL workers

---

## REQUIREMENT 1: Aggregate Doctor Seasonal Report

### Endpoint Spec

```
GET /api/person-reports/doctors/all-seasonal-word
```

### Query Parameters
```
season_start: YYYY-MM-DD (required)
season_end: YYYY-MM-DD (required)
```

### Example Request
```bash
GET /api/person-reports/doctors/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31
```

### Authorization
**Allowed Roles ONLY:**
- `SOFTWARE_ADMIN`
- `WORKER`
- `COMPLAINT_SUPERVISOR`

All other roles → Return `403 Forbidden`

### Backend Processing Steps

1. **Validate Authorization**
   ```python
   if user_role not in ["SOFTWARE_ADMIN", "WORKER", "COMPLAINT_SUPERVISOR"]:
       raise HTTPException(status_code=403, detail="Insufficient permissions")
   ```

2. **Validate Date Parameters**
   ```python
   if not season_start or not season_end:
       raise HTTPException(status_code=400, detail="season_start and season_end are required")
   
   start_date = datetime.strptime(season_start, "%Y-%m-%d")
   end_date = datetime.strptime(season_end, "%Y-%m-%d")
   
   if start_date >= end_date:
       raise HTTPException(status_code=400, detail="season_start must be before season_end")
   ```

3. **Fetch ALL Doctors**
   ```python
   doctors = db.query(Doctor).filter(
       Doctor.is_active == True  # Only active doctors
   ).all()
   
   if not doctors:
       raise HTTPException(status_code=404, detail="No doctors found in system")
   ```

4. **For Each Doctor, Gather Seasonal Data**
   ```python
   doctor_reports = []
   
   for doctor in doctors:
       # Get incidents in date range
       incidents = get_doctor_incidents(
           doctor.doctor_id, 
           season_start, 
           season_end
       )
       
       # Calculate metrics
       metrics = calculate_doctor_metrics(
           doctor.doctor_id,
           season_start,
           season_end
       )
       
       doctor_reports.append({
           "doctor_id": doctor.doctor_id,
           "full_name": doctor.full_name,
           "specialty": doctor.specialty,
           "department": doctor.department_name,
           "total_incidents": len(incidents),
           "metrics": metrics,
           "incidents": incidents
       })
   ```

5. **Generate Combined Word Document**
   ```python
   from docx import Document
   from docx.shared import Inches, Pt, RGBColor
   
   doc = Document()
   
   # Title Page
   doc.add_heading('تقرير الأطباء الموسمي الشامل', 0)
   doc.add_heading('Comprehensive Doctor Seasonal Report', 0)
   doc.add_paragraph(f'Season: {season_start} to {season_end}')
   doc.add_paragraph(f'Total Doctors: {len(doctor_reports)}')
   doc.add_paragraph(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}')
   doc.add_page_break()
   
   # Summary Section
   doc.add_heading('1. Executive Summary', 1)
   total_incidents = sum(d["total_incidents"] for d in doctor_reports)
   doc.add_paragraph(f'Total incidents across all doctors: {total_incidents}')
   doc.add_paragraph(f'Average incidents per doctor: {total_incidents / len(doctor_reports):.2f}')
   doc.add_page_break()
   
   # Individual Doctor Sections
   doc.add_heading('2. Individual Doctor Reports', 1)
   
   for idx, report in enumerate(doctor_reports, 1):
       doc.add_heading(f'{idx}. {report["full_name"]} ({report["doctor_id"]})', 2)
       doc.add_paragraph(f'Specialty: {report["specialty"]}')
       doc.add_paragraph(f'Department: {report["department"]}')
       doc.add_paragraph(f'Total Incidents: {report["total_incidents"]}')
       
       # Metrics table
       if report["metrics"]:
           table = doc.add_table(rows=1, cols=2)
           table.style = 'Light Grid Accent 1'
           hdr_cells = table.rows[0].cells
           hdr_cells[0].text = 'Metric'
           hdr_cells[1].text = 'Value'
           
           for key, value in report["metrics"].items():
               row_cells = table.add_row().cells
               row_cells[0].text = key
               row_cells[1].text = str(value)
       
       # Incidents summary
       if report["incidents"]:
           doc.add_paragraph('Incident Summary:', style='Heading 3')
           for incident in report["incidents"][:5]:  # Show top 5
               doc.add_paragraph(
                   f'- {incident["date"]}: {incident["title"]} (Severity: {incident["severity"]})',
                   style='List Bullet'
               )
       
       doc.add_page_break()
   
   # Save to BytesIO
   import io
   buffer = io.BytesIO()
   doc.save(buffer)
   buffer.seek(0)
   
   return buffer
   ```

6. **Return as File Download**
   ```python
   from fastapi.responses import StreamingResponse
   
   filename = f"doctors_seasonal_report_{season_start}_to_{season_end}.docx"
   
   return StreamingResponse(
       buffer,
       media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
       headers={
           "Content-Disposition": f'attachment; filename="{filename}"'
       }
   )
   ```

### Response

**Content-Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**File Download:** Word (.docx) file with comprehensive report

**Filename Format:** `doctors_seasonal_report_YYYY-MM-DD_to_YYYY-MM-DD.docx`

### Error Responses

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions. Only SOFTWARE_ADMIN, WORKER, or COMPLAINT_SUPERVISOR can generate aggregate reports."
}
```

**400 Bad Request:**
```json
{
  "detail": "season_start and season_end query parameters are required"
}
```

**404 Not Found:**
```json
{
  "detail": "No doctors found in system"
}
```

---

## REQUIREMENT 2: Aggregate Worker Seasonal Report

### Endpoint Spec

```
GET /api/person-reports/workers/all-seasonal-word
```

### Query Parameters
```
season_start: YYYY-MM-DD (required)
season_end: YYYY-MM-DD (required)
```

### Example Request
```bash
GET /api/person-reports/workers/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31
```

### Authorization
**Same as Doctor Report:** SOFTWARE_ADMIN, WORKER, COMPLAINT_SUPERVISOR only

### Backend Processing Steps

1. **Validate Authorization and Dates** (same as doctor report)

2. **Fetch ALL Workers**
   ```python
   # Only complaint department workers (not doctors)
   workers = db.query(Employee).filter(
       Employee.role.in_(['WORKER', 'COMPLAINT_SUPERVISOR']),
       Employee.is_active == True
   ).all()
   
   if not workers:
       raise HTTPException(status_code=404, detail="No workers found in system")
   ```

3. **For Each Worker, Gather Seasonal Data**
   ```python
   worker_reports = []
   
   for worker in workers:
       # Get action items in date range
       action_items = get_worker_action_items(
           worker.employee_id,
           season_start,
           season_end
       )
       
       # Get incidents worker handled
       incidents = get_worker_incidents(
           worker.employee_id,
           season_start,
           season_end
       )
       
       # Calculate metrics
       metrics = calculate_worker_metrics(
           worker.employee_id,
           season_start,
           season_end
       )
       
       worker_reports.append({
           "employee_id": worker.employee_id,
           "full_name": worker.full_name,
           "job_title": worker.job_title,
           "department_name": worker.department_name,
           "total_action_items": len(action_items),
           "total_incidents": len(incidents),
           "metrics": metrics,
           "action_items": action_items
       })
   ```

4. **Generate Combined Word Document**
   ```python
   doc = Document()
   
   # Title Page
   doc.add_heading('تقرير الموظفين الموسمي الشامل', 0)
   doc.add_heading('Comprehensive Worker Seasonal Report', 0)
   doc.add_paragraph(f'Season: {season_start} to {season_end}')
   doc.add_paragraph(f'Total Workers: {len(worker_reports)}')
   doc.add_paragraph(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}')
   doc.add_page_break()
   
   # Summary Section
   doc.add_heading('1. Executive Summary', 1)
   total_actions = sum(w["total_action_items"] for w in worker_reports)
   total_incidents = sum(w["total_incidents"] for w in worker_reports)
   doc.add_paragraph(f'Total action items across all workers: {total_actions}')
   doc.add_paragraph(f'Total incidents handled: {total_incidents}')
   doc.add_paragraph(f'Average actions per worker: {total_actions / len(worker_reports):.2f}')
   doc.add_page_break()
   
   # Individual Worker Sections
   doc.add_heading('2. Individual Worker Reports', 1)
   
   for idx, report in enumerate(worker_reports, 1):
       doc.add_heading(f'{idx}. {report["full_name"]} ({report["employee_id"]})', 2)
       doc.add_paragraph(f'Job Title: {report["job_title"]}')
       doc.add_paragraph(f'Department: {report["department_name"]}')
       doc.add_paragraph(f'Total Action Items: {report["total_action_items"]}')
       doc.add_paragraph(f'Total Incidents: {report["total_incidents"]}')
       
       # Metrics table
       if report["metrics"]:
           table = doc.add_table(rows=1, cols=2)
           table.style = 'Light Grid Accent 1'
           hdr_cells = table.rows[0].cells
           hdr_cells[0].text = 'Metric'
           hdr_cells[1].text = 'Value'
           
           for key, value in report["metrics"].items():
               row_cells = table.add_row().cells
               row_cells[0].text = key
               row_cells[1].text = str(value)
       
       # Action items summary
       if report["action_items"]:
           doc.add_paragraph('Action Items Summary:', style='Heading 3')
           completed = sum(1 for a in report["action_items"] if a["status"] == "completed")
           doc.add_paragraph(f'Completed: {completed}/{len(report["action_items"])}')
           doc.add_paragraph(f'Completion Rate: {(completed/len(report["action_items"])*100):.1f}%')
       
       doc.add_page_break()
   
   # Save and return
   buffer = io.BytesIO()
   doc.save(buffer)
   buffer.seek(0)
   return buffer
   ```

5. **Return as File Download** (same pattern as doctor report)

### Response

**Content-Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Filename Format:** `workers_seasonal_report_YYYY-MM-DD_to_YYYY-MM-DD.docx`

---

## Document Structure Requirements

### Doctor Report Should Include:

**Title Page:**
- Report title (Arabic & English)
- Season date range
- Total number of doctors
- Generation timestamp

**Executive Summary:**
- Total incidents across all doctors
- Average incidents per doctor
- Top categories breakdown
- Top severity levels

**Individual Doctor Sections (for each doctor):**
- Name, ID, specialty, department
- Total incidents count
- Metrics table:
  - Incidents by severity (High, Medium, Low)
  - Incidents by category (top 5)
  - Monthly trend
  - Resolution time average
- Top 5 incidents (date, title, severity, status)
- Charts/graphs (if possible): Category breakdown, monthly trend

---

### Worker Report Should Include:

**Title Page:**
- Report title (Arabic & English)
- Season date range
- Total number of workers
- Generation timestamp

**Executive Summary:**
- Total action items across all workers
- Total incidents handled
- Average actions per worker
- Overall completion rate

**Individual Worker Sections (for each worker):**
- Name, ID, job title, department
- Total action items count
- Total incidents handled
- Metrics table:
  - Completed action items
  - Overdue action items
  - On-time completion rate
  - Average completion time
- Action items summary (completed vs pending)
- Top 5 action items (title, status, due date)

---

## Performance Considerations

### Optimization Strategies:

1. **Pagination/Chunking:**
   ```python
   # If > 100 doctors/workers, process in batches
   if len(doctors) > 100:
       # Consider limiting to active doctors with incidents only
       doctors = [d for d in doctors if has_incidents_in_range(d, start, end)]
   ```

2. **Caching:**
   ```python
   # Cache season data per doctor/worker to avoid repeated queries
   @lru_cache(maxsize=500)
   def get_doctor_seasonal_data(doctor_id, season_start, season_end):
       # ...
   ```

3. **Async Processing (Future Enhancement):**
   ```python
   # For large datasets, consider background job
   if len(doctors) > 200:
       job_id = create_background_job(
           "generate_all_doctors_report",
           season_start,
           season_end
       )
       return {"job_id": job_id, "status": "processing"}
   ```

4. **Database Query Optimization:**
   ```python
   # Use JOIN to fetch all related data in one query
   doctors_with_incidents = db.query(Doctor).join(Incident).filter(
       Incident.date >= season_start,
       Incident.date <= season_end
   ).options(
       joinedload(Doctor.incidents)
   ).all()
   ```

---

## Testing Checklist

### Test 1: Generate Report for ALL Doctors
**Setup:**
- Database has 10 active doctors
- Each doctor has 2-5 incidents in date range

**Test:**
1. Login as SOFTWARE_ADMIN
2. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31`
3. Verify response is Word file download
4. Open Word file and verify:
   - Title page exists
   - Executive summary shows correct totals
   - 10 individual doctor sections present
   - Each section has metrics table
   - File size reasonable (< 5MB for 10 doctors)

**Expected:** ✅ Word file downloads with all 10 doctors

---

### Test 2: Generate Report for ALL Workers
**Setup:**
- Database has 5 active workers
- Each worker has 3-8 action items in date range

**Test:**
1. Login as WORKER
2. GET `/api/person-reports/workers/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31`
3. Verify response is Word file download
4. Open Word file and verify:
   - Title page exists
   - Executive summary shows correct totals
   - 5 individual worker sections present
   - Metrics include completion rates
   - File downloads successfully

**Expected:** ✅ Word file downloads with all 5 workers

---

### Test 3: Authorization Checks
**Test:**
1. Login as SECTION_ADMIN (NOT authorized)
2. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31`
3. Verify response = 403 Forbidden

**Expected:** ✅ Unauthorized roles cannot generate aggregate reports

**Repeat for:**
- DEPARTMENT_ADMIN → 403
- ADMINISTRATION_ADMIN → 403
- SOFTWARE_ADMIN → 200 (allowed)
- WORKER → 200 (allowed)
- COMPLAINT_SUPERVISOR → 200 (allowed)

---

### Test 4: Empty Date Range
**Setup:**
- Choose date range with no incidents/actions

**Test:**
1. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2025-01-01&season_end=2025-01-31`
2. Verify report still generates
3. Verify doctor sections show "0 incidents" gracefully
4. Verify no crash or error

**Expected:** ✅ Report generates with zeros, no error

---

### Test 5: Large Dataset (Performance)
**Setup:**
- Database has 100+ doctors

**Test:**
1. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31`
2. Measure response time
3. Verify file size
4. Verify memory usage doesn't spike

**Expected:** ✅ Report generates in < 30 seconds, file size < 20MB

---

### Test 6: Invalid Date Parameters
**Test:**
1. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2026-03-31&season_end=2026-01-01`
   - (start after end)
2. Verify response = 400 Bad Request
3. GET `/api/person-reports/doctors/all-seasonal-word?season_start=invalid-date&season_end=2026-03-31`
4. Verify response = 400 Bad Request

**Expected:** ✅ Date validation works correctly

---

### Test 7: No Doctors/Workers in System
**Setup:**
- Empty database (no doctors/workers)

**Test:**
1. GET `/api/person-reports/doctors/all-seasonal-word?season_start=2026-01-01&season_end=2026-03-31`
2. Verify response = 404 Not Found with clear message

**Expected:** ✅ Clear error when no data exists

---

## Frontend Integration

### Frontend Will Call (via FAB):

**For ALL Doctors:**
```javascript
// In personApiV2.js

export const downloadAllDoctorsSeasonalWordV2 = async (season_start, season_end) => {
  try {
    console.log("📄 Downloading ALL doctors seasonal report (V2)");
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/doctors/all-seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ ALL doctors seasonal report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading ALL doctors seasonal report (V2):", error);
    throw error;
  }
};
```

**For ALL Workers:**
```javascript
export const downloadAllWorkersSeasonalWordV2 = async (season_start, season_end) => {
  try {
    console.log("📄 Downloading ALL workers seasonal report (V2)");
    
    const params = new URLSearchParams({
      season_start,
      season_end
    });
    
    const response = await apiClient.get(
      `/api/person-reports/workers/all-seasonal-word?${params.toString()}`,
      { responseType: 'blob' }
    );
    
    console.log("✅ ALL workers seasonal report downloaded (V2)");
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading ALL workers seasonal report (V2):", error);
    throw error;
  }
};
```

### Frontend Usage (in DoctorHistoryPage/WorkerHistoryPage):

```javascript
// When user clicks "Generate Report for ALL" in FAB
const handleGenerateSeasonalReport = async () => {
  if (!selectedSeason?.season_start || !selectedSeason?.season_end) {
    return;
  }

  try {
    setGeneratingReport(true);
    setReportError(null);

    let blob;
    let filename;

    if (reportScope === 'all') {
      // ALL doctors/workers
      blob = await downloadAllDoctorsSeasonalWordV2(
        selectedSeason.season_start,
        selectedSeason.season_end
      );
      filename = `all_doctors_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
    } else {
      // Single doctor/worker (existing logic)
      blob = await downloadDoctorSeasonalWordV2(
        selectedDoctor.doctor_id,
        selectedSeason.season_start,
        selectedSeason.season_end
      );
      filename = `doctor_${selectedDoctor.doctor_id}_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
    }

    // Trigger download
    downloadBlobFile(blob, filename);

    console.log("✅ Report downloaded:", filename);
  } catch (err) {
    console.error("❌ Error generating report:", err);
    setReportError(err.message || "Failed to generate report. Please try again.");
  } finally {
    setGeneratingReport(false);
  }
};
```

---

## Summary

### Backend Changes Needed:

✅ **New Endpoint:** `GET /api/person-reports/doctors/all-seasonal-word`
- Accepts season_start and season_end
- Requires authorization (3 roles only)
- Returns Word document with ALL doctors
- Includes summary and individual sections

✅ **New Endpoint:** `GET /api/person-reports/workers/all-seasonal-word`
- Accepts season_start and season_end
- Requires authorization (3 roles only)
- Returns Word document with ALL workers
- Includes summary and individual sections

✅ **Performance:** Handle up to 200 doctors/workers efficiently (< 30s)

✅ **Document Quality:** Professional formatting, tables, summaries

✅ **Error Handling:** Graceful handling of edge cases (no data, invalid dates)

---

### Testing Required:

- [ ] Generate report for ALL doctors (10 doctors)
- [ ] Generate report for ALL workers (5 workers)
- [ ] Authorization checks (6 roles)
- [ ] Empty date range (no incidents/actions)
- [ ] Large dataset (100+ doctors)
- [ ] Invalid date parameters
- [ ] No doctors/workers in system

---

### Deliverables:

1. Implemented `/api/person-reports/doctors/all-seasonal-word` endpoint
2. Implemented `/api/person-reports/workers/all-seasonal-word` endpoint
3. All 7 tests passing
4. Document generation with proper structure
5. Performance optimized for large datasets
6. Clear error messages for edge cases

---

## Questions for Backend Team:

1. **Document Format:** Should we include charts/graphs or plain tables only?
2. **Language:** Arabic-first or English-first? Or bilingual side-by-side?
3. **Data Limit:** Should there be a max number of doctors/workers (e.g., 500)?
4. **Async Processing:** Should large reports (> 200 people) be background jobs?
5. **Caching:** Should generated reports be cached for repeated requests with same parameters?

---

**Please implement both endpoints and run all 7 tests. Confirm when ready for frontend integration.**
