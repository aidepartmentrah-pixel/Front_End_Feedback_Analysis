// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import SeasonalReportsPage from "./pages/SeasonalReportsPage";
import SeasonalReportDetailPage from "./pages/SeasonalReportDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashBoard />} />
        <Route path="/dashBoard" element={<DashBoard />} />
        <Route path="/table-view" element={<TableView />} />
        <Route path="/insert" element={<InsertRecord />} />
        <Route path="/edit/:id" element={<EditRecord />} />
        <Route path="/edit-record/:id" element={<EditRecord />} />
        <Route path="/reporting" element={<ReportingPage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/department-feedback" element={<DepartmentFeedbackPage />} />
        <Route path="/critical-issues" element={<CriticalIssuesPage />} />
        <Route path="/trend-monitoring" element={<TrendMonitoringPage />} />
        <Route path="/follow-up" element={<FollowUpPage />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        <Route path="/seasonal-reports" element={<SeasonalReportsPage />} />
        <Route path="/seasonal-reports/:id" element={<SeasonalReportDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
