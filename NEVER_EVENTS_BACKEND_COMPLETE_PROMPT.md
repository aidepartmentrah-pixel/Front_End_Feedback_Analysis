# ⚠️ Never Events Backend API - Complete Implementation Guide

## 📋 Overview
The Never Events page requires complete backend integration to display critical incident data with full patient information, investigation details, and zero-tolerance tracking. Currently, the API returns empty data or simplified structures.

**Never Events Definition:** Critical patient safety incidents that should **NEVER** occur if proper safeguards are in place (e.g., wrong-site surgery, retained surgical items, medication errors causing death).

---

## ⚠️ CURRENT ISSUES

### Issue 1: No Data or Missing Patient Details ❌
**Problem:** API returns empty array or basic info without joining to complaints table  
**Impact:** Table shows no records or missing patient names, incident details  
**Fix Required:** JOIN never_events with complaints table in `/api/never-events` endpoint

### Issue 2: Wrong Statistics Structure ❌
**Problem:** API returns flat structure (`total`, `under_investigation`) instead of nested  
**Impact:** Statistics cards show zeros or undefined values  
**Fix Required:** Return nested structure with `by_severity`, `by_category`, `current_month` objects

### Issue 3: No Sorting or Investigation Tracking ❌
**Problem:** Records not sorted, missing investigation status details  
**Impact:** Can't prioritize critical incidents, no root cause tracking  
**Fix Required:** Add proper sorting and investigation workflow fields

### Issue 4: Missing Never Event Categories ⚠️
**Problem:** No categorization (Surgical, Medication, Patient Protection, Device)  
**Impact:** Can't group or analyze by event type  
**Fix Required:** Add never_event_type and never_event_category fields

---

## 🎯 Required Changes

### 1. **Never Events List Endpoint** - `/api/never-events`

#### Current Problem
Returns empty data or simplified structure:
```json
{
  "never_events": [],
  "total": 0,
  "limit": 100,
  "offset": 0
}
```

#### ✅ Required Response Structure
The endpoint should **JOIN with complaints/feedback table** to return full data:

```json
{
  "never_events": [
    {
      "id": 1,
      "record_id": "NE-2026-001",
      "case_id": "NE-2026-001",
      "never_event_id": "NE-2026-001",
      
      // Patient Information (from complaints table)
      "patient_full_name": "أحمد محمد علي",
      "patient_name": "أحمد محمد علي",
      "patient_id": "P123456",
      "is_in_patient": true,
      "patient_type": "Inpatient",
      
      // Date Information
      "incident_date": "2026-01-14",
      "reported_date": "2026-01-15",
      "feedback_received_date": "2026-01-15",
      "created_at": "2026-01-15T10:30:00",
      "date": "2026-01-15",
      
      // Department Information
      "department": "قسم الجراحة",
      "issuing_department": "قسم الجراحة",
      "target_department": "إدارة الجودة",
      "section": "جراحة عامة",
      "sub_section": "جراحة اليوم الواحد",
      "building": "المبنى الجراحي",
      
      // Never Event Classification
      "never_event_type": "Wrong Site Surgery",
      "never_event_type_ar": "جراحة في الموقع الخطأ",
      "never_event_category": "Surgical Events",
      "never_event_category_ar": "أحداث جراحية",
      "subcategory": "Site Confirmation Failure",
      
      // Severity & Status
      "severity": "CRITICAL",
      "harm_level": "Severe",
      "actual_harm": "Temporary Harm",
      "potential_harm": "Permanent Harm",
      "status": "UNDER_INVESTIGATION",
      "case_status": "Under Investigation",
      "investigation_status": "Root Cause Analysis In Progress",
      "stage": "Investigation",
      
      // Complaint Details
      "complaint_text": "تم إجراء الجراحة في الركبة اليسرى بدلاً من اليمنى...",
      "incident_description": "Patient underwent surgery on wrong knee due to marking error",
      "complaint_summary": "جراحة في الموقع الخطأ",
      
      // Immediate Response
      "immediate_action": "إيقاف العملية فوراً، إبلاغ المريض، بدء التحقيق الفوري",
      "immediate_action_taken": "Surgery stopped, patient informed, investigation initiated",
      "taken_action": "تم تشكيل لجنة تحقيق، مراجعة بروتوكولات التحقق",
      
      // Investigation Details
      "root_cause": "عدم اتباع بروتوكول Time Out، وجود علامات غير واضحة",
      "root_cause_analysis": "Failure to follow WHO Surgical Safety Checklist",
      "contributing_factors": "High workload, unclear marking protocol, communication gap",
      "corrective_actions": "تدريب إلزامي، تحديث البروتوكولات، إشراف إضافي",
      "preventive_actions": "نظام تحقق إلكتروني، تدقيق مزدوج، تدريب شهري",
      
      // Incident Tracking
      "incident_number": "INC-2026-001",
      "investigation_number": "INV-2026-001",
      "rca_completed": true,
      "rca_completion_date": "2026-01-20",
      "reported_to_authorities": true,
      "authority_report_date": "2026-01-16",
      
      // Resolution
      "resolution_date": null,
      "closure_date": null,
      "days_to_resolve": null,
      "resolved": false,
      
      // People Involved
      "reported_by": "Dr. Ahmed Hassan",
      "reported_by_id": 15,
      "assigned_to": "Quality Team Lead",
      "assigned_to_id": 5,
      "investigated_by": "RCA Committee",
      "created_by": "System Admin",
      "created_by_id": 1,
      
      // Additional Context
      "source": "Direct Report",
      "feedback_intent_type": "Critical Incident",
      "domain": "Clinical",
      "classification": "Never Event - Surgical",
      "category": "Patient Safety",
      
      // Risk Assessment
      "likelihood": "Rare",
      "consequence": "Catastrophic",
      "risk_score": 10,
      "residual_risk": "Medium"
    }
  ],
  "total": 45,
  "limit": 100,
  "offset": 0,
  "goal": 0,
  "message": "Target: Zero Never Events"
}
```

#### Backend Implementation Notes:
```sql
-- Pseudo-SQL for reference
SELECT 
    ne.id,
    ne.never_event_id,
    ne.case_id,
    c.record_id,
    c.patient_full_name,
    c.patient_id,
    c.is_in_patient,
    
    -- Dates
    ne.incident_date,
    ne.reported_date,
    c.feedback_received_date,
    c.created_at,
    
    -- Department Info
    c.issuing_department as department,
    c.target_department,
    c.building,
    d.section,
    d.sub_section,
    
    -- Never Event Classification
    ne.never_event_type,
    ne.never_event_type_ar,
    ne.never_event_category,
    ne.never_event_category_ar,
    ne.subcategory,
    
    -- Severity & Status
    c.severity,
    c.harm_level,
    ne.actual_harm,
    ne.potential_harm,
    ne.investigation_status as status,
    c.case_status,
    c.stage,
    
    -- Incident Details
    c.complaint_text,
    ne.incident_description,
    c.complaint_summary,
    c.immediate_action,
    c.taken_action,
    
    -- Investigation Details
    ne.root_cause,
    ne.root_cause_analysis,
    ne.contributing_factors,
    ne.corrective_actions,
    ne.preventive_actions,
    
    -- Tracking
    ne.incident_number,
    ne.investigation_number,
    ne.rca_completed,
    ne.rca_completion_date,
    ne.reported_to_authorities,
    ne.authority_report_date,
    
    -- Resolution
    ne.resolution_date,
    ne.closure_date,
    DATEDIFF(ne.resolution_date, ne.incident_date) as days_to_resolve,
    CASE WHEN ne.resolution_date IS NOT NULL THEN true ELSE false END as resolved,
    
    -- People
    u1.full_name as reported_by,
    u2.full_name as assigned_to,
    ne.investigated_by,
    u3.full_name as created_by,
    
    -- Additional Fields
    c.source,
    c.feedback_intent_type,
    c.domain,
    c.classification,
    c.category,
    
    -- Risk Assessment
    ne.likelihood,
    ne.consequence,
    ne.risk_score,
    ne.residual_risk
    
FROM never_events ne
INNER JOIN complaints c ON ne.complaint_id = c.id
LEFT JOIN departments d ON c.issuing_department_id = d.id
LEFT JOIN users u1 ON ne.reported_by_id = u1.id
LEFT JOIN users u2 ON ne.assigned_to_id = u2.id
LEFT JOIN users u3 ON c.created_by_id = u3.id
WHERE c.is_never_event = true
ORDER BY ne.incident_date DESC, c.severity DESC
```

#### Sorting Requirements:
- **Default**: Sort by `incident_date` DESC, then `severity` DESC (CRITICAL first)
- Support parameters:
  - `?sort_by=incident_date&sort_order=desc`
  - `?sort_by=severity&sort_order=desc` (CRITICAL → HIGH → MEDIUM → LOW)
  - `?sort_by=status&sort_order=asc`
  - `?sort_by=category&sort_order=asc`
  - `?sort_by=department&sort_order=asc`

**Investigation Status Sort Order:**
```
OPEN (1) → UNDER_INVESTIGATION (2) → RCA_IN_PROGRESS (3) → 
PENDING_REVIEW (4) → RESOLVED (5) → CLOSED (6)
```

---

### 2. **Statistics Endpoint** - `/api/never-events/statistics`

#### Current Problem
Returns wrong structure:
```json
{
  "total": 0,
  "under_investigation": 0,
  "resolved": 0,
  "surgical_events": 0,
  "medication_events": 0
}
```

#### ✅ Required Response Structure
```json
{
  "total_never_events": 45,
  "goal": 0,
  "variance": 45,
  "ytd_total": 45,
  
  "unfinished_count": 30,
  "finished_count": 15,
  
  "by_status": {
    "OPEN": 5,
    "UNDER_INVESTIGATION": 15,
    "RCA_IN_PROGRESS": 10,
    "PENDING_REVIEW": 5,
    "RESOLVED": 8,
    "CLOSED": 2
  },
  
  "by_severity": {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 5,
    "LOW": 0
  },
  
  "by_category": {
    "Surgical Events": {
      "count": 15,
      "percentage": 33.3,
      "subcategories": {
        "Wrong Site Surgery": 6,
        "Wrong Procedure": 4,
        "Wrong Patient": 3,
        "Retained Foreign Object": 2
      }
    },
    "Medication Events": {
      "count": 12,
      "percentage": 26.7,
      "subcategories": {
        "Wrong Medication": 5,
        "Wrong Dose": 4,
        "Wrong Route": 3
      }
    },
    "Patient Protection Events": {
      "count": 10,
      "percentage": 22.2,
      "subcategories": {
        "Patient Falls": 6,
        "Elopement": 4
      }
    },
    "Device/Product Events": {
      "count": 8,
      "percentage": 17.8,
      "subcategories": {
        "Device Failure": 5,
        "Contaminated Device": 3
      }
    }
  },
  
  "by_harm_level": {
    "Death": 2,
    "Severe": 8,
    "Moderate": 15,
    "Temporary": 20
  },
  
  "current_month": {
    "count": 3,
    "month": "February 2026",
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "goal": 0,
    "status": "CRITICAL"
  },
  
  "previous_month": {
    "count": 5,
    "month": "January 2026",
    "comparison": "-40%"
  },
  
  "quarterly_trend": [
    {"quarter": "Q4 2025", "count": 12},
    {"quarter": "Q1 2026", "count": 8}
  ],
  
  "rca_statistics": {
    "completed": 35,
    "in_progress": 8,
    "pending": 2,
    "completion_rate": 77.8,
    "avg_days_to_complete": 12
  },
  
  "reporting_statistics": {
    "reported_to_authorities": 40,
    "pending_report": 5,
    "avg_reporting_time_days": 2
  },
  
  "performance_indicators": {
    "time_to_investigation_avg_hours": 4,
    "time_to_resolution_avg_days": 21,
    "recurrence_rate": 8.9
  },
  
  "period": {
    "from_date": "2025-01-01",
    "to_date": "2026-02-11"
  }
}
```

#### Backend Logic:
```python
# Pseudo-code for statistics calculation

def calculate_never_events_statistics(from_date=None, to_date=None):
    # Get all never events in period
    query = db.query(NeverEvent).join(Complaint)
    
    if from_date:
        query = query.filter(NeverEvent.incident_date >= from_date)
    if to_date:
        query = query.filter(NeverEvent.incident_date <= to_date)
    
    events = query.all()
    total = len(events)
    
    # Status breakdown
    unfinished = count where status NOT IN ('RESOLVED', 'CLOSED')
    finished = count where status IN ('RESOLVED', 'CLOSED')
    
    # Category breakdown with subcategories
    by_category = {}
    for event in events:
        category = event.never_event_category
        if category not in by_category:
            by_category[category] = {
                'count': 0,
                'subcategories': {}
            }
        by_category[category]['count'] += 1
        
        subcat = event.subcategory
        if subcat:
            by_category[category]['subcategories'][subcat] = \
                by_category[category]['subcategories'].get(subcat, 0) + 1
    
    # Calculate percentages
    for category in by_category:
        by_category[category]['percentage'] = \
            (by_category[category]['count'] / total * 100) if total > 0 else 0
    
    # Current month calculation
    current_month_start = get_first_day_of_current_month()
    current_month_end = get_last_day_of_current_month()
    current_month_count = count where incident_date BETWEEN current_month_start AND current_month_end
    
    # RCA statistics
    rca_completed = count where rca_completed = true
    rca_in_progress = count where rca_completed = false AND status = 'RCA_IN_PROGRESS'
    
    return statistics_dict
```

---

### 3. **Category Breakdown Endpoint** - `/api/never-events/category-breakdown`

#### Required Response:
```json
{
  "total": 45,
  "period": "2025-01-01 to 2026-02-11",
  "breakdown": [
    {
      "category": "Surgical Events",
      "category_ar": "أحداث جراحية",
      "count": 15,
      "percentage": 33.3,
      "severity_distribution": {
        "CRITICAL": 10,
        "HIGH": 5
      },
      "subcategories": [
        {
          "name": "Wrong Site Surgery",
          "name_ar": "جراحة في الموقع الخطأ",
          "count": 6
        },
        {
          "name": "Wrong Procedure",
          "name_ar": "إجراء خاطئ",
          "count": 4
        },
        {
          "name": "Wrong Patient",
          "name_ar": "مريض خاطئ",
          "count": 3
        },
        {
          "name": "Retained Foreign Object",
          "name_ar": "جسم غريب متبقي",
          "count": 2
        }
      ]
    },
    {
      "category": "Medication Events",
      "category_ar": "أحداث دوائية",
      "count": 12,
      "percentage": 26.7,
      "severity_distribution": {
        "CRITICAL": 8,
        "HIGH": 4
      }
    }
  ]
}
```

---

### 4. **Timeline Comparison Endpoint** - `/api/never-events/timeline-comparison`

#### Query Parameters:
- `period` = "month" | "quarter" | "year"

#### Required Response:
```json
{
  "comparison_type": "month",
  "current": {
    "period": "February 2026",
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "count": 3,
    "goal": 0,
    "by_category": {
      "Surgical Events": 1,
      "Medication Events": 1,
      "Patient Protection Events": 1
    }
  },
  "previous": {
    "period": "January 2026",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "count": 5,
    "by_category": {
      "Surgical Events": 2,
      "Medication Events": 2,
      "Patient Protection Events": 1
    }
  },
  "comparison": {
    "change": -2,
    "change_percentage": -40.0,
    "trend": "IMPROVING",
    "message": "انخفاض بنسبة 40% مقارنة بالشهر السابق"
  },
  "target": 0,
  "target_message": "الهدف: صفر أحداث"
}
```

---

### 5. **Trends Endpoint** - `/api/never-events/trends`

#### Query Parameters:
- `from_date`, `to_date`
- `granularity` = "daily" | "weekly" | "monthly" | "quarterly"
- `group_by` = "category" | "severity" | "department" | "none"

#### Required Response:
```json
{
  "granularity": "monthly",
  "group_by": "category",
  "period": {
    "from_date": "2025-01-01",
    "to_date": "2026-02-11"
  },
  "data": [
    {
      "period": "Jan 2025",
      "date": "2025-01-01",
      "total": 4,
      "Surgical Events": 2,
      "Medication Events": 1,
      "Patient Protection Events": 1,
      "Device/Product Events": 0
    },
    {
      "period": "Feb 2025",
      "date": "2025-02-01",
      "total": 3,
      "Surgical Events": 1,
      "Medication Events": 2,
      "Patient Protection Events": 0,
      "Device/Product Events": 0
    }
  ],
  "summary": {
    "total_events": 45,
    "avg_per_period": 3.5,
    "highest_month": "December 2025",
    "highest_count": 6,
    "trend": "STABLE"
  }
}
```

---

### 6. **Never Event Details Endpoint** - `/api/never-events/{id}`

#### Required Response:
```json
{
  "id": 1,
  "never_event_id": "NE-2026-001",
  "record_id": "NE-2026-001",
  
  // All fields from list endpoint plus:
  
  "timeline": [
    {
      "date": "2026-01-14T14:30:00",
      "event": "Incident Occurred",
      "description": "Wrong site surgery identified",
      "recorded_by": "Dr. Ahmed"
    },
    {
      "date": "2026-01-14T15:00:00",
      "event": "Reported",
      "description": "Incident reported to quality team",
      "recorded_by": "Dr. Ahmed"
    },
    {
      "date": "2026-01-15T09:00:00",
      "event": "Investigation Started",
      "description": "RCA committee formed",
      "recorded_by": "Quality Manager"
    },
    {
      "date": "2026-01-20T16:00:00",
      "event": "RCA Completed",
      "description": "Root cause analysis report finalized",
      "recorded_by": "RCA Committee"
    }
  ],
  
  "attachments": [
    {
      "id": 1,
      "filename": "rca_report.pdf",
      "type": "RCA Report",
      "uploaded_date": "2026-01-20",
      "uploaded_by": "Quality Manager"
    },
    {
      "id": 2,
      "filename": "corrective_action_plan.docx",
      "type": "Action Plan",
      "uploaded_date": "2026-01-22",
      "uploaded_by": "Quality Manager"
    }
  ],
  
  "related_incidents": [
    {
      "id": 45,
      "incident_number": "INC-2025-312",
      "type": "Near Miss",
      "date": "2025-12-10",
      "similarity": "Same procedure verification issue"
    }
  ],
  
  "audit_trail": [
    {
      "timestamp": "2026-01-15T10:30:00",
      "user": "System Admin",
      "action": "Created Record",
      "details": "Never event record created"
    },
    {
      "timestamp": "2026-01-16T09:00:00",
      "user": "Quality Manager",
      "action": "Status Updated",
      "details": "Changed status to UNDER_INVESTIGATION"
    }
  ]
}
```

---

## 📊 Never Event Categories Reference

### Standard Never Event Categories (WHO/JCI Based):

#### 1. **Surgical Events** (أحداث جراحية)
- Wrong Site Surgery (جراحة في الموقع الخطأ)
- Wrong Procedure (إجراء خاطئ)
- Wrong Patient Surgery (جراحة للمريض الخطأ)
- Retained Foreign Object (جسم غريب متبقي)
- Unintended Retention of Foreign Object (احتباس غير مقصود)

#### 2. **Medication Events** (أحداث دوائية)
- Wrong Medication (دواء خاطئ)
- Wrong Dose (جرعة خاطئة)
- Wrong Route (طريق إعطاء خاطئ)
- Wrong Patient (مريض خاطئ)
- Medication Error Resulting in Death (خطأ دوائي مميت)

#### 3. **Patient Protection Events** (أحداث حماية المريض)
- Patient Falls Resulting in Serious Injury (سقوط مريض مع إصابة خطيرة)
- Patient Elopement (هروب مريض)
- Patient Suicide (انتحار مريض)
- Infant Abduction (اختطاف رضيع)

#### 4. **Device/Product Events** (أحداث الأجهزة/المنتجات)
- Device Failure Leading to Harm (فشل جهاز أدى لضرر)
- Contaminated Drugs/Devices (أدوية/أجهزة ملوثة)
- Intravascular Air Embolism (انصمام هوائي)

#### 5. **Care Management Events** (أحداث إدارة الرعاية)
- Maternal Death (وفاة أم)
- Kernicterus (يرقان نووي)
- Stage 3-4 Pressure Ulcers (قرح فراش درجة 3-4)

---

## 🔍 Testing & Validation

### Test Suite 1: Basic Functionality

#### Test 1.1: List Never Events
```bash
curl http://localhost:8000/api/never-events?limit=5
```
**Expected:**
- Returns array of never events
- Each event has patient_full_name, incident_date, never_event_type
- Sorted by incident_date DESC

#### Test 1.2: Statistics
```bash
curl http://localhost:8000/api/never-events/statistics
```
**Expected:**
- Returns nested structure with by_category, by_severity
- current_month has count and goal (0)
- RCA statistics included

#### Test 1.3: Category Breakdown
```bash
curl http://localhost:8000/api/never-events/category-breakdown
```
**Expected:**
- Returns breakdown array with subcategories
- Each category has count, percentage
- Severity distribution included

#### Test 1.4: Timeline Comparison
```bash
curl http://localhost:8000/api/never-events/timeline-comparison?period=month
```
**Expected:**
- Returns current and previous period comparison
- Shows change percentage and trend
- Target is 0

#### Test 1.5: Never Event Details
```bash
curl http://localhost:8000/api/never-events/1
```
**Expected:**
- Returns full details including timeline
- Investigation details present
- RCA information included

---

### Test Suite 2: Data Integrity

#### Test 2.1: Patient Data Present
```bash
# Check if patient names are included
curl http://localhost:8000/api/never-events?limit=1 | jq '.never_events[0].patient_full_name'
```
**Expected:** Should return actual patient name, not null

#### Test 2.2: Investigation Fields
```bash
# Check investigation tracking
curl http://localhost:8000/api/never-events?limit=1 | jq '.never_events[0] | {status, rca_completed, root_cause}'
```
**Expected:** Should have investigation_status, rca_completed, root_cause fields

#### Test 2.3: Category Classification
```bash
# Verify category structure
curl http://localhost:8000/api/never-events/category-breakdown | jq '.breakdown[0].subcategories'
```
**Expected:** Should show subcategories array with counts

---

### Test Suite 3: Filtering & Sorting

#### Test 3.1: Filter by Category
```bash
curl "http://localhost:8000/api/never-events?category=Surgical Events"
```
**Expected:** Returns only surgical never events

#### Test 3.2: Filter by Status
```bash
curl "http://localhost:8000/api/never-events?status=UNDER_INVESTIGATION"
```
**Expected:** Returns only events under investigation

#### Test 3.3: Sort by Severity
```bash
curl "http://localhost:8000/api/never-events?sort_by=severity&sort_order=desc"
```
**Expected:** CRITICAL events first, then HIGH, etc.

#### Test 3.4: Date Range Filter
```bash
curl "http://localhost:8000/api/never-events?from_date=2026-01-01&to_date=2026-01-31"
```
**Expected:** Returns only January 2026 events

---

### Test Suite 4: Edge Cases

#### Test 4.1: No Data
```bash
curl "http://localhost:8000/api/never-events?from_date=2030-01-01"
```
**Expected:** 
```json
{
  "never_events": [],
  "total": 0,
  "goal": 0,
  "message": "No never events found"
}
```

#### Test 4.2: Invalid ID
```bash
curl http://localhost:8000/api/never-events/99999
```
**Expected:** 404 error with message

#### Test 4.3: Invalid Parameters
```bash
curl "http://localhost:8000/api/never-events?sort_by=invalid_field"
```
**Expected:** 400 error or default to valid sorting

---

### Test Suite 5: Performance

#### Test 5.1: Pagination
```bash
# Test large dataset pagination
curl "http://localhost:8000/api/never-events?limit=100&offset=0"
curl "http://localhost:8000/api/never-events?limit=100&offset=100"
```
**Expected:** Returns within 2 seconds, correct offset

#### Test 5.2: Statistics Calculation Time
```bash
# Measure statistics endpoint performance
time curl http://localhost:8000/api/never-events/statistics
```
**Expected:** Returns within 1 second

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality (Days 1-2)
1. ✅ Create never_events table structure
2. ✅ Implement JOIN with complaints table
3. ✅ Basic list endpoint with patient data
4. ✅ Details endpoint with full information
5. ✅ Test with sample data

### Phase 2: Statistics & Analytics (Days 3-4)
1. ✅ Statistics endpoint with nested structure
2. ✅ Category breakdown with subcategories
3. ✅ Timeline comparison
4. ✅ Trends endpoint

### Phase 3: Investigation Workflow (Days 5-6)
1. ✅ RCA tracking fields
2. ✅ Investigation status workflow
3. ✅ Timeline/audit trail
4. ✅ Attachments support

### Phase 4: Advanced Features (Days 7+)
1. ✅ Sorting and filtering
2. ✅ Related incidents linking
3. ✅ Performance optimization
4. ✅ Reporting to authorities tracking

---

## 📝 Database Schema Reference

### Suggested Never Events Table Structure:

```sql
CREATE TABLE never_events (
    id SERIAL PRIMARY KEY,
    never_event_id VARCHAR(50) UNIQUE NOT NULL,
    case_id VARCHAR(50),
    complaint_id INTEGER REFERENCES complaints(id),
    
    -- Classification
    never_event_type VARCHAR(100),
    never_event_type_ar VARCHAR(100),
    never_event_category VARCHAR(100),
    never_event_category_ar VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Dates
    incident_date DATE NOT NULL,
    reported_date DATE,
    
    -- Investigation
    investigation_status VARCHAR(50),
    investigation_number VARCHAR(50),
    rca_completed BOOLEAN DEFAULT FALSE,
    rca_completion_date DATE,
    root_cause TEXT,
    root_cause_analysis TEXT,
    contributing_factors TEXT,
    
    -- Actions
    corrective_actions TEXT,
    preventive_actions TEXT,
    
    -- Tracking
    incident_number VARCHAR(50),
    reported_to_authorities BOOLEAN DEFAULT FALSE,
    authority_report_date DATE,
    
    -- Harm Assessment
    actual_harm VARCHAR(50),
    potential_harm VARCHAR(50),
    
    -- Risk Assessment
    likelihood VARCHAR(20),
    consequence VARCHAR(20),
    risk_score INTEGER,
    residual_risk VARCHAR(20),
    
    -- Resolution
    resolution_date DATE,
    closure_date DATE,
    resolved BOOLEAN DEFAULT FALSE,
    
    -- People
    reported_by_id INTEGER REFERENCES users(id),
    assigned_to_id INTEGER REFERENCES users(id),
    investigated_by VARCHAR(200),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    
    INDEX idx_incident_date (incident_date),
    INDEX idx_category (never_event_category),
    INDEX idx_status (investigation_status),
    INDEX idx_complaint (complaint_id)
);
```

---

## ❓ Questions for Backend Team

### Question 1: Database Relationship
**Q:** How are never events linked to complaints?  
**Options:**
- A) Separate `never_events` table with `complaint_id` foreign key ✅ Recommended
- B) Flag in complaints table (`is_never_event = true`)
- C) Both A and B

**Recommendation:** Use option A (separate table) for proper tracking of investigation details.

---

### Question 2: Never Event Types
**Q:** Do we have a predefined list of never event types?  
**Recommendation:** Use WHO/JCI standard categories (see Categories Reference above)

---

### Question 3: Investigation Workflow
**Q:** What are the investigation status values?  
**Recommendation:**
```
OPEN → UNDER_INVESTIGATION → RCA_IN_PROGRESS → 
PENDING_REVIEW → RESOLVED → CLOSED
```

---

### Question 4: RCA (Root Cause Analysis)
**Q:** Should we store RCA documents separately?  
**Recommendation:** Store RCA summary in database, link to document attachments

---

### Question 5: Authority Reporting
**Q:** Which authorities need to be notified?  
**Examples:** MOH, CBAHI, Hospital Board, Insurance

---

## 🎯 Success Criteria

After implementation, the Never Events page should:

### Functional Requirements:
- ✅ Display list of never events with full patient information
- ✅ Show investigation status and progress
- ✅ Track RCA completion and corrective actions
- ✅ Display statistics with category breakdown
- ✅ Show current month vs previous month comparison
- ✅ Support filtering by category, status, date range
- ✅ Sort by incident date, severity, status
- ✅ Provide detailed view with timeline

### Data Quality:
- ✅ No null patient names
- ✅ All dates properly formatted
- ✅ Investigation fields populated
- ✅ Category classification accurate

### Performance:
- ✅ List endpoint responds < 2 seconds
- ✅ Statistics calculated < 1 second
- ✅ Pagination works smoothly

### User Experience:
- ✅ Goal of ZERO clearly displayed
- ✅ Critical events highlighted
- ✅ Investigation progress visible
- ✅ Timeline shows incident progression

---

## 📞 Support & Questions

**Frontend Team Contact:** [Your contact info]  
**Documentation:** See `NEVER_EVENTS_BACKEND_COMPLETE_PROMPT.md`  
**Related:** See `RED_FLAGS_BACKEND_COMPLETE_PROMPT.md` for similar implementation

---

**Last Updated:** February 11, 2026  
**Version:** 1.0  
**Status:** Ready for Implementation
