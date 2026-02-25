// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { 
  canAccessMigration,
  canViewInsight,
  canViewPersonReporting,
  canAccessDrawerNotes,
  canViewReporting,
  canViewInvestigation,
  canViewTableView,
  canViewInsertRecord,
  canViewSettings,
  canViewInbox
} from "./utils/roleGuards";

// Dev Helpers (DEV-ONLY)
import AuthDebugPanel from "./dev/AuthDebugPanel";
import VisibilityTestPage from "./dev/VisibilityTestPage";

// Pages
import DashBoard from "./pages/DashBoard";
import TableView from "./pages/TableView";
import InsertRecord from "./pages/InsertRecord";
import Login from "./pages/Login";
import EditRecord from "./pages/EditRecord";
import ReportingPage from "./pages/ReportingPage";
import SettingPage from "./pages/SettingPage";
import DepartmentFeedbackPage from "./pages/DepartmentFeedbackPage";
import FollowUpPage from "./pages/FollowUpPage";
import TrendMonitoringPage from "./pages/TrendMonitoringPage";
import HistoryPage from "./pages/HistoryPage";
import CriticalIssuesPage from "./pages/CriticalIssuesPage";
import InvestigationPage from "./pages/InvestigationPage";
import InsightPage from "./pages/InsightPage";
import WorkflowInboxPage from "./pages/WorkflowInboxPage";
import SeasonalReportsPage from "./pages/SeasonalReportsPage";
import SeasonalReportDetailPage from "./pages/SeasonalReportDetailPage";
import DrawerNotesPage from "./pages/DrawerNotesPage";
import MigrationMainPage from "./pages/MigrationMainPage";
import MigrationViewPage from "./pages/MigrationViewPage";
import MigrationFormPage from "./pages/MigrationFormPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ConfigPage from "./pages/ConfigPage";

function App() {
  const shouldShowAuthDebugPanel =
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_SHOW_AUTH_DEBUG_PANEL === "true";

  return (
    <Router>
      <AuthProvider>
        {/* DEV-ONLY: Auth Debug Panel */}
        {shouldShowAuthDebugPanel && <AuthDebugPanel />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* DEV-ONLY: Phase J-9 Visibility Test Page */}
          {process.env.NODE_ENV === "development" && (
            <Route path="/test-visibility" element={<VisibilityTestPage />} />
          )}

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashBoard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/table-view"
            element={
              <RoleProtectedRoute canAccess={canViewTableView} routeName="Table View">
                <TableView />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/insert"
            element={
              <RoleProtectedRoute canAccess={canViewInsertRecord} routeName="Insert Record">
                <InsertRecord />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-record/:id"
            element={
              <ProtectedRoute>
                <EditRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reporting"
            element={
              <RoleProtectedRoute canAccess={canViewReporting} routeName="Reporting">
                <ReportingPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleProtectedRoute canAccess={canViewSettings} routeName="Settings">
                <SettingPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <RoleProtectedRoute canAccess={canViewPersonReporting} routeName="History">
                <HistoryPage />
              </RoleProtectedRoute>
            }
          />
          {/* HIDDEN: Department Feedback page - moved to Reporting page */}
          {/* <Route
            path="/department-feedback"
            element={
              <ProtectedRoute>
                <DepartmentFeedbackPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/critical-issues"
            element={
              <ProtectedRoute>
                <CriticalIssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trend-monitoring"
            element={
              <ProtectedRoute>
                <TrendMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/follow-up"
            element={
              <ProtectedRoute>
                <FollowUpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investigation"
            element={
              <RoleProtectedRoute canAccess={canViewInvestigation} routeName="Investigation">
                <InvestigationPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <RoleProtectedRoute canAccess={canViewInbox} routeName="Inbox">
                <WorkflowInboxPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/insight"
            element={
              <RoleProtectedRoute canAccess={canViewInsight} routeName="Insight">
                <InsightPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/drawer-notes"
            element={
              <RoleProtectedRoute canAccess={canAccessDrawerNotes} routeName="Drawer Notes">
                <DrawerNotesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/migration"
            element={
              <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration">
                <MigrationMainPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/migration/view/:legacyId"
            element={
              <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration View">
                <MigrationViewPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/migration/migrate/:legacyId"
            element={
              <RoleProtectedRoute canAccess={canAccessMigration} routeName="Migration Form">
                <MigrationFormPage />
              </RoleProtectedRoute>
            }
          />
          {/* HIDDEN: Seasonal Reports pages - reports generated through /reporting page */}
          {/* <Route
            path="/seasonal-reports"
            element={
              <ProtectedRoute>
                <SeasonalReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seasonal-reports/:id"
            element={
              <ProtectedRoute>
                <SeasonalReportDetailPage />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
