# Existing Pages Discovery

## InboxPage and InsightPage Status

NOT FOUND: Neither InboxPage.js nor InsightPage.js exist in the codebase.

## All Existing Pages

Located in: src/pages/

1. [CriticalIssuesPage.js](src/pages/CriticalIssuesPage.js)
2. [DashBoard.js](src/pages/DashBoard.js)
3. [DepartmentFeedbackPage.js](src/pages/DepartmentFeedbackPage.js)
4. [DoctorHistoryPage.js](src/pages/DoctorHistoryPage.js)
5. [EditRecord.js](src/pages/EditRecord.js)
6. [FollowUpPage.js](src/pages/FollowUpPage.js)
7. [HistoryPage.js](src/pages/HistoryPage.js)
8. [InsertRecord.js](src/pages/InsertRecord.js)
9. [InvestigationPage.js](src/pages/InvestigationPage.js)
10. [Login.js](src/pages/Login.js)
11. [NeverEventsPage.js](src/pages/NeverEventsPage.js)
12. [PatientHistoryPage.js](src/pages/PatientHistoryPage.js)
13. [RedFlagsPage.js](src/pages/RedFlagsPage.js)
14. [ReportingPage.js](src/pages/ReportingPage.js)
15. [SeasonalReportDetailPage.js](src/pages/SeasonalReportDetailPage.js)
16. [SeasonalReportsPage.js](src/pages/SeasonalReportsPage.js)
17. [SettingPage.js](src/pages/SettingPage.js)
18. [TableView.js](src/pages/TableView.js)
19. [TrendMonitoringPage.js](src/pages/TrendMonitoringPage.js)

## Closest Pages for Reuse

### For InboxPage (Task/Assignment Management)

Best candidates:

1. [FollowUpPage.js](src/pages/FollowUpPage.js) - 497 lines
   - Displays action items in calendar view
   - Filters by status, priority, department
   - Modal for action details
   - API integration for action items
   - Can be adapted for inbox-style task assignments

2. [DepartmentFeedbackPage.js](src/pages/DepartmentFeedbackPage.js) - 1751 lines
   - Displays records requiring explanation
   - Filters for pending items
   - Modal forms for submission
   - Could serve as inbox for department users

3. [TableView.js](src/pages/TableView.js) - 673 lines
   - Full data table with filters
   - Search functionality
   - Pagination
   - Export capabilities
   - Custom view management
   - Can be filtered to show assigned items only

### For InsightPage (Analytics/Reports)

Best candidates:

1. [TrendMonitoringPage.js](src/pages/TrendMonitoringPage.js) - 1007 lines
   - Multiple chart types (bar, pie, line, stacked)
   - Distribution analysis
   - Time-based filtering
   - Scope selection (hospital/admin/dept/section)
   - Tab-based layout
   - Most comprehensive analytics page

2. [InvestigationPage.js](src/pages/InvestigationPage.js) - 352 lines
   - Tree visualization
   - Hierarchical data exploration
   - Season filtering
   - Incident count analysis

3. [DashBoard.js](src/pages/DashBoard.js)
   - High-level metrics
   - Multiple stat cards
   - Hierarchy navigation
   - Global/admin/dept/section views

4. [ReportingPage.js](src/pages/ReportingPage.js)
   - Generates reports
   - Seasonal metrics
   - Filter capabilities
   - Export functionality

## Recommendations

### InboxPage Alternative
Use TableView.js as base:
- Add filter for assigned_to = current_user
- Add status badges (new, in-progress, pending)
- Keep existing search, pagination, export
- Add quick action buttons per row

OR use FollowUpPage.js:
- Already calendar-based for tasks
- Has status filtering
- Modal for details
- Just need to tie to user assignments

### InsightPage Alternative
Use TrendMonitoringPage.js as base:
- Already has multiple chart types
- Distribution operator implemented
- Time window controls
- Scope filtering
- Tab-based organization
- Can add new insight tabs easily
