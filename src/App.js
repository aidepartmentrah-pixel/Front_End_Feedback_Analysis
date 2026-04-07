// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getSystemStatus } from "./api/configApi";

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
  const [systemStatus, setSystemStatus] = useState(null);

  // Check system status on mount (before auth)
  useEffect(() => {
    getSystemStatus()
      .then((status) => setSystemStatus(status))
      .catch((err) => {
        console.error("[App] Failed to get system status:", err);
        // Treat backend unreachable as bootstrap mode
        setSystemStatus({ bootstrap_mode: true, error: true });
      });
  }, []);

  const shouldShowAuthDebugPanel =
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_SHOW_AUTH_DEBUG_PANEL === "true";

  // Loading state while checking system status
  if (systemStatus === null) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "4px solid #e0e0e0",
            borderTop: "4px solid #1976d2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#666", margin: 0 }}>Checking system status...</p>
        </div>
      </div>
    );
  }

  // Bootstrap mode: DB not configured - show only config/login routes
  if (systemStatus.bootstrap_mode) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="*" element={<Navigate to="/config" replace />} />
        </Routes>
      </Router>
    );
  }

  // Normal mode: full application
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
