// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import DashBoard from "./pages/DashBoard";
import TableView from "./pages/TableView";
import InsertRecord from "./pages/InsertRecord";
import Login from "./pages/Login";
import EditRecord from "./pages/EditRecord";
import Export from "./pages/Export";
import Reporting from "./pages/Reporting";
import SettingPage from "./pages/SettingPage";
import PatientHistoryPage from "./pages/PatientHistoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/dashBoard" element={<DashBoard />} />
        <Route path="/table-view" element={<TableView />} />
        <Route path="/insert" element={<InsertRecord />} />
        <Route path="/edit/:id" element={<EditRecord />} />
        <Route path="/export" element={<Export />} />
        <Route path="/reporting" element={<Reporting />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/patient-history" element={<PatientHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
