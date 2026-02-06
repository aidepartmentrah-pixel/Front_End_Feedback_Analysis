// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Dev Helpers (DEV-ONLY)
import AuthDebugPanel from "./dev/AuthDebugPanel";

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

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* DEV-ONLY: Auth Debug Panel */}
        {process.env.NODE_ENV === "development" && <AuthDebugPanel />}

        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

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
              <ProtectedRoute>
                <TableView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insert"
            element={
              <ProtectedRoute>
                <InsertRecord />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <ReportingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <InvestigationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <WorkflowInboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insight"
            element={
              <ProtectedRoute>
                <InsightPage />
              </ProtectedRoute>
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
