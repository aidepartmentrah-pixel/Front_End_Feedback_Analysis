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
import PatientHistoryPage from "./pages/PatientHistoryPage";
import DepartmentFeedbackPage from "./pages/DepartmentFeedbackPage";
import RedFlagsPage from "./pages/RedFlagsPage";
import DoctorHistoryPage from "./pages/DoctorHistoryPage";

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
        <Route path="/reporting" element={<ReportingPage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/patient-history" element={<PatientHistoryPage />} />
        <Route path="/doctor-history" element={<DoctorHistoryPage />} />
        <Route path="/department-feedback" element={<DepartmentFeedbackPage />} />
        <Route path="/redflags" element={<RedFlagsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
