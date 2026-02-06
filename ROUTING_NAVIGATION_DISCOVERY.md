# Routing and Navigation Discovery

## Routing Setup

File: [src/App.js](src/App.js)

Configuration:
- Uses React Router v6 (BrowserRouter, Routes, Route)
- AuthProvider wraps all routes
- All routes except /login are protected with ProtectedRoute component

## All Routes

### Public Routes
- /login - Login page (no protection)

### Protected Routes
All wrapped with ProtectedRoute component:

- / - DashBoard
- /dashBoard - DashBoard (duplicate)
- /table-view - TableView
- /insert - InsertRecord
- /edit/:id - EditRecord (with ID param)
- /edit-record/:id - EditRecord (duplicate with ID param)
- /reporting - ReportingPage
- /settings - SettingPage
- /history - HistoryPage
- /department-feedback - DepartmentFeedbackPage
- /critical-issues - CriticalIssuesPage
- /trend-monitoring - TrendMonitoringPage
- /follow-up - FollowUpPage
- /investigation - InvestigationPage
- /seasonal-reports - SeasonalReportsPage
- /seasonal-reports/:id - SeasonalReportDetailPage (with ID param)

Total: 1 public route, 16 protected routes

## Navigation Menu Component

File: [src/components/common/Sidebar.js](src/components/common/Sidebar.js)

Menu items array:
```javascript
const pages = [
  { name: "📊 Dashboard", path: "/" },
  { name: "📈 Trend Monitoring", path: "/trend-monitoring" },
  { name: "🔍 Investigation", path: "/investigation" },
  { name: "➕ Insert Record", path: "/insert" },
  { name: "📋 Table View", path: "/table-view" },
  { name: "📊 Reporting", path: "/reporting" },
  { name: "📝 Explanations", path: "/department-feedback" },
  { name: "📋 History", path: "/history" },
  { name: "🚩 Critical Issues", path: "/critical-issues" },
  { name: "� Follow Up", path: "/follow-up" },
  { name: "⚙️ Settings", path: "/settings" }
];
```

Implementation:
- Fixed sidebar (280px width, full height)
- Links using React Router Link component
- Active route highlighted using useLocation hook
- Styled with gradient background
- Logo and branding at top

## Menu Visibility Logic

Current implementation: ALL menu items shown to ALL authenticated users

No role-based or permission-based hiding:
```javascript
{pages.map((page) => (
  <ListItemButton
    key={page.name}
    component={Link}
    to={page.path}
    selected={location.pathname === page.path}
  >
    <Typography>{page.name}</Typography>
  </ListItemButton>
))}
```

Selection logic:
- Uses location.pathname to match current route
- Applies selected styling when pathname matches page.path
- No conditional rendering based on user roles or permissions

## Top Bar Component

File: [src/components/TopBar.js](src/components/TopBar.js)

Features:
- Displays page title
- Shows username from auth context or localStorage
- Logout button with useAuth logout function
- Static quick action buttons (Add Record, Export)
- No dynamic menu visibility

## Summary

Navigation is static and visible to all authenticated users. No role-based access control on menu items. All protection happens at route level via ProtectedRoute component which only checks if user is authenticated, not their specific permissions.
