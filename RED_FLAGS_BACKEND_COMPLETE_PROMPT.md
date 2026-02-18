# 🚩 Red Flags Backend API - Complete Implementation Guide

## 📋 Overview
The Red Flags page needs proper backend integration to display complaint data with patient information, proper sorting, and accurate statistics. Currently, the API returns simplified data without complaint details.

---

## ⚠️ CURRENT ISSUES

### Issue 1: Missing Patient & Complaint Data ❌
**Problem:** API returns only basic red flag info without joining to complaints table  
**Impact:** Table shows no patient names, no complaint text, missing risk types  
**Fix Required:** JOIN red_flags with complaints table in `/api/red-flags` endpoint

### Issue 2: Wrong Statistics Structure ❌
**Problem:** API returns flat structure (`total`, `open`, `high_severity`) instead of nested  
**Impact:** Statistics cards above table show no data (undefined values)  
**Fix Required:** Return nested structure with `by_severity`, `current_month` objects

### Issue 3: No Sorting ❌
**Problem:** Records not sorted by date (appear random order)  
**Impact:** Newest red flags don't appear first  
**Fix Required:** Add `ORDER BY feedback_received_date DESC` default sort

### Issue 4: Inconsistent Severity Values ⚠️
**Problem:** API returns "High", "Medium", "Low" (mixed case)  
**Impact:** Color coding breaks, filtering doesn't work properly  
**Fix Required:** Standardize to uppercase: "CRITICAL", "HIGH", "MEDIUM", "LOW"

---

## 🎯 Required Changes

### 1. **Red Flags List Endpoint** - `/api/red-flags`

#### Current Problem
Returns simplified data without patient info or full complaint details:
```json
{
  "id": 175,
  "case_id": "RF-2026-175",
  "title": "Red Flag",
  "description": "Wednesday test 5",
  "severity": "Low",
  "status": "In Progress"
}
```

#### ✅ Required Response Structure
The endpoint should **JOIN with complaints/feedback table** to return full data:

```json
{
  "red_flags": [
    {
      "id": 175,
      "record_id": "RF-2026-001",
      "case_id": "RF-2026-001",
      
      // Patient Information (from complaints table)
      "patient_full_name": "أحمد محمد علي",
      "patient_name": "أحمد محمد علي",
      "is_in_patient": true,
      
      // Date Information
      "feedback_received_date": "2026-01-15",
      "created_at": "2026-01-15T10:30:00",
      "date": "2026-01-15",
      
      // Department Information
      "issuing_department": "قسم الطوارئ",
      "department": "قسم الطوارئ",
      "target_department": "قسم الجراحة",
      "building": "المبنى الرئيسي",
      "domain": "Clinical",
      
      // Classification & Risk
      "classification": "Patient Safety",
      "category": "Patient Safety",
      "sub_category": "Falls",
      "clinical_risk_type": "High Risk Fall",
      "feedback_intent_type": "Complaint",
      
      // Severity & Status
      "severity": "High",
      "harm_level": "Moderate",
      "stage": "Investigation",
      "case_status": "In Progress",
      "status": "In Progress",
      
      // Never Event Flag
      "is_never_event": true,
      
      // Complaint Details
      "complaint_text": "المريض سقط من السرير أثناء الليل...",
      "complaint_summary": "سقوط مريض",
      "immediate_action": "تم نقل المريض للأشعة فوراً",
      "taken_action": "تم تركيب حاجز جانبي للسرير",
      
      // Source & Assignment
      "source": "Direct",
      "created_by": "Dr. Ahmed",
      "assigned_to": 5,
      "assigned_to_name": "محمد السعيد"
    }
  ],
  "total": 245,
  "limit": 100,
  "offset": 0
}
```

#### Backend Implementation Notes:
```sql
-- Pseudo-SQL for reference
SELECT 
    rf.id,
    rf.case_id,
    c.record_id,
    c.patient_full_name,
    c.feedback_received_date,
    c.issuing_department,
    c.target_department,
    c.classification,
    c.category,
    c.sub_category,
    c.clinical_risk_type,
    c.severity,
    c.harm_level,
    c.case_status,
    c.complaint_text,
    c.immediate_action,
    c.taken_action,
    c.is_in_patient,
    c.building,
    c.domain,
    c.feedback_intent_type,
    c.source,
    rf.is_never_event,
    u.full_name as assigned_to_name
FROM red_flags rf
LEFT JOIN complaints c ON rf.complaint_id = c.id
LEFT JOIN users u ON rf.assigned_to = u.id
ORDER BY c.feedback_received_date DESC
```

#### Sorting Requirements:
- **Default**: Sort by `feedback_received_date` DESC (newest first)
- Support query parameters: 
  - `?sort_by=date&sort_order=desc`
  - `?sort_by=severity&sort_order=desc` (CRITICAL → HIGH → MEDIUM → LOW)
  - `?sort_by=department&sort_order=asc`
  - `?sort_by=status&sort_order=asc`
  - `?sort_by=created_at&sort_order=desc`

**Severity Sort Order:**
```
CRITICAL (1) → HIGH (2) → MEDIUM (3) → LOW (4)
```

**Status Sort Order:**
```
OPEN (1) → IN_PROGRESS (2) → UNDER_REVIEW (3) → RESOLVED (4) → CLOSED (5)
```

---

### 2. **Statistics Endpoint** - `/api/red-flags/statistics`

#### Current Problem
Returns wrong field structure:
```json
{
  "total": 8,
  "open": 0,
  "in_progress": 0,
  "resolved": 0,
  "high_severity": 0,
  "medium_severity": 0,
  "low_severity": 0
}
```

#### ✅ Required Response Structure
```json
{
  "total_red_flags": 245,
  "unfinished": 180,
  "finished": 65,
  
  "by_severity": {
    "CRITICAL": 45,
    "HIGH": 120,
    "MEDIUM": 60,
    "LOW": 20
  },
  
  "by_status": {
    "OPEN": 45,
    "IN_PROGRESS": 135,
    "RESOLVED": 55,
    "CLOSED": 10
  },
  
  "current_month": {
    "count": 23,
    "month": "February 2026",
    "start_date": "2026-02-01",
    "end_date": "2026-02-28"
  },
  
  "previous_month": {
    "count": 18,
    "month": "January 2026"
  },
  
  "never_event_overlap": {
    "total_never_events": 45,
    "red_flags_also_never_events": 30,
    "never_events_only": 15,
    "red_flags_only": 215
  },
  
  "average_resolution_days": 12.5,
  
  "period": {
    "from_date": "2025-01-01",
    "to_date": "2026-02-11"
  }
}
```

#### Backend Logic:
- `unfinished` = count where status IN ('OPEN', 'IN_PROGRESS')
- `finished` = count where status IN ('RESOLVED', 'CLOSED', 'FINISHED')
- `by_severity` should be nested object (not flat)
- Calculate `current_month` count separately
- Calculate overlap between red_flags and never_events

---

### 3. **Severity Standardization**

#### ⚠️ Important: Use Consistent Severity Values

The system should use **uppercase** severity values consistently:

```
"CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
```

**NOT:**
```
"High" | "Medium" | "Low"  ❌
```

This ensures consistency across:
- Red Flags page
- Never Events page  
- Table View page
- Reporting pages

---

### 4. **Status Standardization**

Use consistent status values:

```
"OPEN" | "IN_PROGRESS" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED" | "FINISHED"
```

Mapping:
- `OPEN` = newly created, not assigned
- `IN_PROGRESS` = actively being worked on
- `UNDER_REVIEW` = pending review
- `RESOLVED` = completed
- `CLOSED` = closed/archived
- `FINISHED` = completed and verified

---

## 📊 Field Mapping Reference

### Display vs Database Fields

| Display (Arabic) | Frontend Field | Backend/DB Field |
|---|---|---|
| معرف السجل | `record_id` | `complaints.record_id` |
| اسم المريض | `patient_full_name` | `complaints.patient_full_name` |
| تاريخ الاستلام | `feedback_received_date` | `complaints.feedback_received_date` |
| القسم | `issuing_department` | `complaints.issuing_department` |
| التصنيف | `classification` | `complaints.classification` |
| الفئة | `category` | `complaints.category` |
| الفئة الفرعية | `sub_category` | `complaints.sub_category` |
| الخطورة | `severity` | `complaints.severity` |
| الحالة | `case_status` | `complaints.case_status` |
| نوع المخاطر | `clinical_risk_type` | `complaints.clinical_risk_type` |
| مستوى الضرر | `harm_level` | `complaints.harm_level` |
| المرحلة | `stage` | `complaints.stage` |
| نص الشكوى | `complaint_text` | `complaints.complaint_text` |
| الإجراء الفوري | `immediate_action` | `complaints.immediate_action` |
| الإجراء المتخذ | `taken_action` | `complaints.taken_action` |
| حدث لا يجب | `is_never_event` | `red_flags.is_never_event` |
| المصدر | `source` | `complaints.source` |

---

## 🔍 Testing the Changes

### Test 1: Red Flags List
```bash
curl http://localhost:8000/api/red-flags?limit=5
```

**Expected:** Should return red flags WITH patient names, complaint text, and all classification fields

### Test 2: Statistics
```bash
curl http://localhost:8000/api/red-flags/statistics
```

**Expected:** Should return nested structure with `by_severity`, `current_month`, etc.

### Test 3: Sorting
```bash
curl http://localhost:8000/api/red-flags?sort_by=severity&sort_order=desc
```

**Expected:** Should return red flags sorted by severity (CRITICAL first)

---

## 🚀 Priority Order

1. **HIGH PRIORITY** - Fix `/api/red-flags` to JOIN with complaints table
2. **HIGH PRIORITY** - Standardize severity values to uppercase
3. **MEDIUM PRIORITY** - Fix `/api/red-flags/statistics` structure
4. **MEDIUM PRIORITY** - Implement sorting
5. **LOW PRIORITY** - Add never_event_overlap calculation

---

## 📝 Frontend Changes Needed After Backend Update

Once backend is updated, the frontend will need minor adjustments:
1. Revert RedFlagsTable.js to use correct field names (record_id, patient_full_name, etc.)
2. Update severity color mapping to handle uppercase values
3. Remove debug logging

---

## ❓ Questions for Backend Team

1. **Q:** Is there a relationship between `red_flags` table and `complaints` table?
   **A:** If yes, use complaint_id to join. If no, we need to create this relationship.

2. **Q:** What determines if something is a "red flag"?
   **A:** Is it a flag in complaints table, or separate red_flags table?

3. **Q:** Should severity be stored as "High" or "HIGH"?
   **A:** Recommend uppercase for consistency.

---

## 🎯 Expected Result

After implementation, the Red Flags page should:
- ✅ Show patient names in table
- ✅ Show full complaint text
- ✅ Display proper classification and risk types
- ✅ Sort by date (newest first)
- ✅ Show accurate statistics in cards
- ✅ Display current month count correctly
- ✅ Show never events overlap data

---

**Need help?** Contact frontend team for field name clarification or UI mockups.
