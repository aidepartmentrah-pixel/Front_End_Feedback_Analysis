# Seasonal Explanations Feature

## Overview
This feature allows departments to provide explanations when their seasonal performance metrics exceed defined thresholds. It is implemented as Tab 2 in the Explanations page (formerly Department Feedback page).

## User Flow

### For Departments
1. Navigate to **Explanations** page in sidebar
2. Click on **Tab 2: توضيح الأداء الفصلي (Seasonal Explanations)**
3. View list of seasonal violations where department exceeded thresholds
4. Click **Explain** button on pending violations
5. Fill in:
   - Root Cause Analysis (required)
   - Corrective Actions (required)
   - Expected Completion Date (optional)
   - Responsible Person (optional)
6. Click **Submit Explanation**
7. Status changes from "⏳ Pending" to "✅ Submitted"

## Database Schema

### Table: `seasonal_explanations`

```sql
CREATE TABLE seasonal_explanations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Violation Reference
    season VARCHAR(10) NOT NULL,              -- e.g., "2024-Q4"
    department_id INT NOT NULL,               -- FK to departments table
    metric_type VARCHAR(50) NOT NULL,         -- "HCAT_violations" or "avg_days_open"
    threshold_value DECIMAL(5,2) NOT NULL,    -- The threshold that was exceeded
    actual_value DECIMAL(5,2) NOT NULL,       -- The actual performance value
    
    -- Explanation Content
    root_cause_analysis TEXT NOT NULL,        -- Why did this happen?
    corrective_actions TEXT NOT NULL,         -- What will be done?
    expected_completion_date DATE,            -- When will corrective actions be completed?
    responsible_person VARCHAR(255),          -- Who is responsible?
    
    -- Status & Metadata
    status ENUM('PENDING', 'SUBMITTED', 'REVIEWED', 'APPROVED') DEFAULT 'PENDING',
    submitted_at DATETIME,
    submitted_by INT,                         -- FK to users table
    reviewed_by INT,                          -- FK to users table (for approval workflow)
    reviewed_at DATETIME,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

### Indexes
```sql
CREATE INDEX idx_season_dept ON seasonal_explanations(season, department_id);
CREATE INDEX idx_status ON seasonal_explanations(status);
CREATE INDEX idx_metric_type ON seasonal_explanations(metric_type);
```

## API Endpoints

### 1. Get Seasonal Violations
**GET** `/api/seasonal-violations`

**Query Parameters:**
- `season` (optional): Filter by specific season (e.g., "2024-Q4")
- `department_id` (optional): Filter by department
- `status` (optional): Filter by status (PENDING, SUBMITTED, etc.)

**Response:**
```json
{
  "violations": [
    {
      "id": "1",
      "season": "2024-Q4",
      "seasonLabel": "Q4 2024 (Oct-Dec)",
      "department_id": 5,
      "department": "Cardiac 1",
      "qism": "قسم القلب 1",
      "metricType": "HCAT_violations",
      "metricLabel": "HCAT Violations",
      "thresholdValue": 15.0,
      "actualValue": 18.5,
      "status": "PENDING",
      "totalRecords": 120,
      "violationCount": 22,
      "explanation_id": null
    }
  ]
}
```

**Logic:**
1. Calculate seasonal metrics per department
2. Compare against thresholds from settings
3. Return only violations (actual > threshold)
4. Join with seasonal_explanations to get submission status

### 2. Submit Seasonal Explanation
**POST** `/api/seasonal-explanations`

**Request Body:**
```json
{
  "season": "2024-Q4",
  "department_id": 5,
  "metric_type": "HCAT_violations",
  "threshold_value": 15.0,
  "actual_value": 18.5,
  "root_cause_analysis": "تحليل الأسباب الجذرية...",
  "corrective_actions": "الإجراءات التصحيحية...",
  "expected_completion_date": "2025-03-15",
  "responsible_person": "د. أحمد محمد"
}
```

**Response:**
```json
{
  "success": true,
  "explanation_id": 42,
  "message": "Seasonal explanation submitted successfully"
}
```

### 3. Get Seasonal Explanation Details
**GET** `/api/seasonal-explanations/:id`

**Response:**
```json
{
  "id": 42,
  "season": "2024-Q4",
  "department": "Cardiac 1",
  "metric_type": "HCAT_violations",
  "threshold_value": 15.0,
  "actual_value": 18.5,
  "root_cause_analysis": "...",
  "corrective_actions": "...",
  "expected_completion_date": "2025-03-15",
  "responsible_person": "د. أحمد محمد",
  "status": "SUBMITTED",
  "submitted_at": "2024-12-15T10:30:00Z",
  "submitted_by": {
    "id": 7,
    "name": "أحمد علي"
  }
}
```

## Metrics Supported

### 1. HCAT Violations Percentage
- **Calculation**: `(count of records with is_hcat = true) / (total records) * 100`
- **Threshold**: Typically 15%
- **Display**: `18.5%` (red) vs `15%` (green)

### 2. Average Days Open
- **Calculation**: `AVG(DATEDIFF(closed_at, created_at))` for records in season
- **Threshold**: Typically 14 days
- **Display**: `16.8 days` (red) vs `14 days` (green)

## Frontend Components

### Modified:
- **DepartmentFeedbackPage.js**: Added tab structure and seasonal violations table
  - Tab 1: Incident Explanations (existing)
  - Tab 2: Seasonal Explanations (new)

### New Components Needed (Future):
- `SeasonalViolationsTable.js`: Reusable table component for violations
- `SeasonalExplanationForm.js`: Form component for explanation details

## Mock Data Structure

```javascript
const mockSeasonalViolations = [
  {
    id: "1",
    season: "2024-Q4",
    seasonLabel: "Q4 2024 (Oct-Dec)",
    department: "Cardiac 1",
    qism: "قسم القلب 1",
    metricType: "HCAT_violations",
    metricLabel: "HCAT Violations",
    thresholdValue: 15,
    actualValue: 18.5,
    status: "PENDING",  // or "SUBMITTED"
    totalRecords: 120,
    violationCount: 22,
  }
];
```

## Integration with Reporting Page

The Seasonal Explanations feature integrates with the Reporting page:

1. **Reporting Page** shows seasonal metrics in table format
2. If a metric exceeds threshold, it's highlighted in red
3. Department users can click through to **Explanations > Seasonal Tab**
4. After submitting explanation, the reporting table shows "✅ Explained" badge

## Authorization

### Roles:
- **Department Users**: Can only submit explanations for their own department
- **Quality Team**: Can view all explanations and approve them
- **Admins**: Full access to all explanations

### Permissions:
```javascript
// Check if user can explain this violation
if (violation.department_id !== currentUser.department_id && !currentUser.isQuality) {
  throw new Error("Unauthorized");
}
```

## Workflow States

```
PENDING → SUBMITTED → REVIEWED → APPROVED
```

1. **PENDING**: Violation detected, no explanation yet
2. **SUBMITTED**: Department submitted explanation
3. **REVIEWED**: Quality team reviewed (optional step)
4. **APPROVED**: Explanation accepted

## Notification System (Future)

### When to Notify:
1. New violation detected → Notify department head
2. Deadline approaching (7 days before end of next quarter) → Reminder
3. Explanation submitted → Notify quality team
4. Explanation approved → Notify department

### Email Template:
```
Subject: Action Required: Seasonal Threshold Violation - Q4 2024

Department: Cardiac 1
Metric: HCAT Violations
Threshold: 15% | Actual: 18.5%

Your department exceeded the performance threshold for Q4 2024.
Please provide an explanation by [deadline date].

Click here to submit: [Link to Explanations Page]
```

## Testing Checklist

- [ ] Violations calculated correctly for both metrics
- [ ] Tab switching works smoothly
- [ ] Form validation works (required fields)
- [ ] Status updates after submission
- [ ] Cannot explain already-submitted violations
- [ ] Submitted violations show "View" instead of "Explain"
- [ ] Arabic text displays correctly (RTL)
- [ ] Modal closes properly
- [ ] Data persists after refresh (when backend integrated)

## Future Enhancements

1. **Approval Workflow**: Quality team can approve/reject explanations
2. **Email Notifications**: Auto-notify departments of violations
3. **Deadline Tracking**: Show days remaining to submit explanation
4. **Historical View**: Compare explanations across multiple seasons
5. **Export to PDF**: Download explanation for records
6. **Attachment Support**: Upload supporting documents (charts, reports)
7. **Comments**: Quality team can request clarifications
8. **Analytics**: Track submission rates, common root causes

## Related Files

- `src/pages/DepartmentFeedbackPage.js` - Main page with tabs
- `src/pages/ReportingPage.js` - Shows seasonal metrics
- `src/components/common/Sidebar.js` - Updated menu item
- `PATIENT_HISTORY_README.md` - Similar feature documentation
