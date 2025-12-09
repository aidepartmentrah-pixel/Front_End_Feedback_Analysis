// src/pages/TableView.js
import MainLayout from "../components/common/MainLayout";
import React, { useState } from "react";
import { Box, Typography, Card } from "@mui/joy";
import SearchFilters from "../components/SearchFilters";
import RecordsTable from "../components/RecordsTable";
import ExportSection from "../components/TableView/ExportSection";

// COMPLETE MOCK DATA: 10 example records
const exampleRecords = [
  {
    feedback_received_date: "2025-11-27",
    record_id: "INC0001",
    patient_full_name: "Patient 1",
    issuing_department: "ER",
    target_department: "Ward 1",
    source_1: "Phone",
    feedback_type: "Complaint",
    domain: "Clinical",
    category: "Safety",
    sub_category: "Neglect -General",
    classification_ar: "تصنيف 1",
    complaint_text: "This is a sample complaint text for record 1.",
    immediate_action: "Action 1",
    taken_action: "Taken Action 1",
    severity_level: "High",
    stage: "Admission",
    harm_level: "Low",
    status: "In Progress",
    improvement_opportunity_type: "Yes"
  },
  {
    feedback_received_date: "2025-11-26",
    record_id: "INC0002",
    patient_full_name: "Patient 2",
    issuing_department: "ICU",
    target_department: "Ward 2",
    source_1: "Walk-in",
    feedback_type: "Suggestion",
    domain: "Management",
    category: "Quality",
    sub_category: "Absent Communication",
    classification_ar: "تصنيف 2",
    complaint_text: "This is a sample complaint text for record 2.",
    immediate_action: "Action 2",
    taken_action: "Taken Action 2",
    severity_level: "Medium",
    stage: "Care",
    harm_level: "Medium",
    status: "Closed",
    improvement_opportunity_type: "No"
  },
  {
    feedback_received_date: "2025-11-25",
    record_id: "INC0003",
    patient_full_name: "Patient 3",
    issuing_department: "Ward 1",
    target_department: "ER",
    source_1: "Email",
    feedback_type: "Complaint",
    domain: "Relational",
    category: "Environment",
    sub_category: "Accomodation",
    classification_ar: "تصنيف 3",
    complaint_text: "This is a sample complaint text for record 3.",
    immediate_action: "Action 3",
    taken_action: "Taken Action 3",
    severity_level: "Low",
    stage: "Discharge",
    harm_level: "High",
    status: "In Progress",
    improvement_opportunity_type: "Yes"
  },
  {
    feedback_received_date: "2025-11-24",
    record_id: "INC0004",
    patient_full_name: "Patient 4",
    issuing_department: "Radiology",
    target_department: "Ward 1",
    source_1: "Phone",
    feedback_type: "Suggestion",
    domain: "Clinical",
    category: "Safety",
    sub_category: "Bureaucracy",
    classification_ar: "تصنيف 4",
    complaint_text: "This is a sample complaint text for record 4.",
    immediate_action: "Action 4",
    taken_action: "Taken Action 4",
    severity_level: "High",
    stage: "Care",
    harm_level: "Medium",
    status: "Closed",
    improvement_opportunity_type: "No"
  },
  {
    feedback_received_date: "2025-11-23",
    record_id: "INC0005",
    patient_full_name: "Patient 5",
    issuing_department: "Cardiology",
    target_department: "ER",
    source_1: "Walk-in",
    feedback_type: "Complaint",
    domain: "Management",
    category: "Quality",
    sub_category: "Clinician -Errors",
    classification_ar: "تصنيف 5",
    complaint_text: "This is a sample complaint text for record 5.",
    immediate_action: "Action 5",
    taken_action: "Taken Action 5",
    severity_level: "Medium",
    stage: "Admission",
    harm_level: "Low",
    status: "In Progress",
    improvement_opportunity_type: "Yes"
  },
  {
    feedback_received_date: "2025-11-22",
    record_id: "INC0006",
    patient_full_name: "Patient 6",
    issuing_department: "Admin",
    target_department: "ICU",
    source_1: "Email",
    feedback_type: "Suggestion",
    domain: "Relational",
    category: "Environment",
    sub_category: "Delay -Access",
    classification_ar: "تصنيف 6",
    complaint_text: "This is a sample complaint text for record 6.",
    immediate_action: "Action 6",
    taken_action: "Taken Action 6",
    severity_level: "Low",
    stage: "Discharge",
    harm_level: "High",
    status: "Closed",
    improvement_opportunity_type: "No"
  },
  {
    feedback_received_date: "2025-11-21",
    record_id: "INC0007",
    patient_full_name: "Patient 7",
    issuing_department: "ER",
    target_department: "Cardiology",
    source_1: "Phone",
    feedback_type: "Complaint",
    domain: "Clinical",
    category: "Safety",
    sub_category: "Delay -General",
    classification_ar: "تصنيف 7",
    complaint_text: "This is a sample complaint text for record 7.",
    immediate_action: "Action 7",
    taken_action: "Taken Action 7",
    severity_level: "High",
    stage: "Care",
    harm_level: "Medium",
    status: "In Progress",
    improvement_opportunity_type: "Yes"
  },
  {
    feedback_received_date: "2025-11-20",
    record_id: "INC0008",
    patient_full_name: "Patient 8",
    issuing_department: "Ward 2",
    target_department: "Radiology",
    source_1: "Walk-in",
    feedback_type: "Suggestion",
    domain: "Management",
    category: "Quality",
    sub_category: "Delayed Communication",
    classification_ar: "تصنيف 8",
    complaint_text: "This is a sample complaint text for record 8.",
    immediate_action: "Action 8",
    taken_action: "Taken Action 8",
    severity_level: "Medium",
    stage: "Admission",
    harm_level: "Low",
    status: "Closed",
    improvement_opportunity_type: "No"
  },
  {
    feedback_received_date: "2025-11-19",
    record_id: "INC0009",
    patient_full_name: "Patient 9",
    issuing_department: "ICU",
    target_department: "Admin",
    source_1: "Email",
    feedback_type: "Complaint",
    domain: "Relational",
    category: "Environment",
    sub_category: "Dimissing Patients",
    classification_ar: "تصنيف 9",
    complaint_text: "This is a sample complaint text for record 9.",
    immediate_action: "Action 9",
    taken_action: "Taken Action 9",
    severity_level: "Low",
    stage: "Discharge",
    harm_level: "High",
    status: "In Progress",
    improvement_opportunity_type: "Yes"
  },
  {
    feedback_received_date: "2025-11-18",
    record_id: "INC0010",
    patient_full_name: "Patient 10",
    issuing_department: "Radiology",
    target_department: "Ward 2",
    source_1: "Phone",
    feedback_type: "Suggestion",
    domain: "Clinical",
    category: "Safety",
    sub_category: "Disrespect",
    classification_ar: "تصنيف 10",
    complaint_text: "This is a sample complaint text for record 10.",
    immediate_action: "Action 10",
    taken_action: "Taken Action 10",
    severity_level: "High",
    stage: "Care",
    harm_level: "Medium",
    status: "Closed",
    improvement_opportunity_type: "No"
  }
];

const TableView = () => {
  const [filters, setFilters] = useState({
    searchText: "",
    issuingDept: "All",
    targetDept: "All",
    source: "All"
  });

  // Calculate filtered records count
  const filteredRecords = exampleRecords.filter((record) => {
    const matchesSearch =
      record.record_id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      record.patient_full_name.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesIssuing =
      filters.issuingDept === "All" || record.issuing_department === filters.issuingDept;
    const matchesTarget =
      filters.targetDept === "All" || record.target_department === filters.targetDept;
    const matchesSource =
      filters.source === "All" || record.source_1 === filters.source;
    return matchesSearch && matchesIssuing && matchesTarget && matchesSource;
  });

  return (
    <MainLayout>
      <Box sx={{ maxWidth: "100%", mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography level="h2" sx={{ fontWeight: 800, color: "#1a1e3f", mb: 1 }}>
            Records Table
          </Typography>
          <Typography level="body-sm" sx={{ color: "#667eea" }}>
            Search, filter, and manage all feedback records
          </Typography>
        </Box>

        <Card
          sx={{
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
            p: 2,
          }}
        >
          <SearchFilters filters={filters} setFilters={setFilters} />
          <Box sx={{ mt: 2, overflow: "auto" }}>
            <RecordsTable records={exampleRecords} filters={filters} />
          </Box>
        </Card>

        {/* Export Section */}
        <ExportSection filteredRecordCount={filteredRecords.length} allRecords={filteredRecords} />
      </Box>
    </MainLayout>
  );
};

export default TableView;
