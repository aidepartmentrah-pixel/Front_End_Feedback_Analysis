// src/pages/InvestigationPage.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Select,
  Option,
  FormControl,
  FormLabel,
} from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import IncidentCountTree from "../components/investigation/IncidentCountTree";

const InvestigationPage = () => {
  const [selectedSeason, setSelectedSeason] = useState("q4");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTreeType, setSelectedTreeType] = useState("incident-count");

  // Season options
  const seasons = [
    { value: "q1", label: "Q1 (Jan-Mar)" },
    { value: "q2", label: "Q2 (Apr-Jun)" },
    { value: "q3", label: "Q3 (Jul-Sep)" },
    { value: "q4", label: "Q4 (Oct-Dec)" },
  ];

  // Year options
  const years = [
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
  ];

  // Tree type options
  const treeTypes = [
    { value: "incident-count", label: "Number of Incidents" },
    { value: "domain-count", label: "Domain Distribution (Numbers)" },
    { value: "domain-percentage", label: "Domain Distribution (Percentage)" },
    { value: "severity-count", label: "Severity Distribution (Numbers)" },
    { value: "severity-percentage", label: "Severity Distribution (Percentage)" },
    { value: "red-flag", label: "Red Flag Incident" },
    { value: "never-ever", label: "Never Ever Incident" },
  ];

  // Administration options
  const administrations = [
    { value: "", label: "All Administrations" },
    { value: "Nursing Administration", label: "Nursing Administration" },
    { value: "Medical Administration", label: "Medical Administration" },
    { value: "Support Services", label: "Support Services" },
  ];

  // Department options (filtered by selected administration)
  const getDepartments = () => {
    const deptsByAdmin = {
      "Nursing Administration": [
        { value: "", label: "All Departments" },
        { value: "Emergency Nursing", label: "Emergency Nursing" },
        { value: "ICU Nursing", label: "ICU Nursing" },
        { value: "Ward Nursing", label: "Ward Nursing" },
      ],
      "Medical Administration": [
        { value: "", label: "All Departments" },
        { value: "Surgery Department", label: "Surgery Department" },
        { value: "Internal Medicine", label: "Internal Medicine" },
        { value: "Pediatrics Department", label: "Pediatrics Department" },
      ],
      "Support Services": [
        { value: "", label: "All Departments" },
        { value: "Radiology Department", label: "Radiology Department" },
        { value: "Laboratory Department", label: "Laboratory Department" },
      ],
    };

    if (!selectedAdmin) {
      return [{ value: "", label: "Select Administration First" }];
    }

    return deptsByAdmin[selectedAdmin] || [{ value: "", label: "All Departments" }];
  };

  // Section options (filtered by selected department)
  const getSections = () => {
    const sectionsByDept = {
      "Emergency Nursing": [
        { value: "", label: "All Sections" },
        { value: "ER Triage", label: "ER Triage" },
        { value: "ER Treatment", label: "ER Treatment" },
      ],
      "ICU Nursing": [
        { value: "", label: "All Sections" },
        { value: "ICU Ward 1", label: "ICU Ward 1" },
        { value: "ICU Ward 2", label: "ICU Ward 2" },
      ],
      "Ward Nursing": [
        { value: "", label: "All Sections" },
        { value: "Ward A", label: "Ward A" },
        { value: "Ward B", label: "Ward B" },
        { value: "Ward C", label: "Ward C" },
      ],
      "Surgery Department": [
        { value: "", label: "All Sections" },
        { value: "General Surgery", label: "General Surgery" },
        { value: "Orthopedic Surgery", label: "Orthopedic Surgery" },
      ],
      "Internal Medicine": [
        { value: "", label: "All Sections" },
        { value: "Cardiology", label: "Cardiology" },
        { value: "Gastroenterology", label: "Gastroenterology" },
      ],
      "Pediatrics Department": [
        { value: "", label: "All Sections" },
        { value: "Pediatric Ward", label: "Pediatric Ward" },
        { value: "NICU", label: "NICU" },
      ],
      "Radiology Department": [
        { value: "", label: "All Sections" },
        { value: "X-Ray", label: "X-Ray" },
        { value: "CT Scan", label: "CT Scan" },
      ],
      "Laboratory Department": [
        { value: "", label: "All Sections" },
        { value: "Clinical Lab", label: "Clinical Lab" },
        { value: "Pathology", label: "Pathology" },
      ],
    };

    if (!selectedDept) {
      return [{ value: "", label: "Select Department First" }];
    }

    return sectionsByDept[selectedDept] || [{ value: "", label: "All Sections" }];
  };

  const handleAdminChange = (event, newValue) => {
    setSelectedAdmin(newValue);
    setSelectedDept("");
    setSelectedSection("");
  };

  const handleDeptChange = (event, newValue) => {
    setSelectedDept(newValue);
    setSelectedSection("");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            🔍 Root Cause Investigation
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Exploratory analysis tool to understand why departments crossed policy
            thresholds. Analyze incident patterns and concentrations across the organizational structure.
          </Typography>
        </Box>

        {/* Top Controls */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Investigation Scope
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Season Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>📅 Season</FormLabel>
              <Select
                value={selectedSeason}
                onChange={(e, newValue) => setSelectedSeason(newValue)}
                size="lg"
              >
                {seasons.map((season) => (
                  <Option key={season.value} value={season.value}>
                    {season.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Year Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>📆 Year</FormLabel>
              <Select
                value={selectedYear}
                onChange={(e, newValue) => setSelectedYear(newValue)}
                size="lg"
              >
                {years.map((year) => (
                  <Option key={year.value} value={year.value}>
                    {year.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Administration Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 Administration
              </FormLabel>
              <Select
                value={selectedAdmin}
                onChange={handleAdminChange}
                size="lg"
              >
                {administrations.map((admin) => (
                  <Option key={admin.value} value={admin.value}>
                    {admin.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 Department
              </FormLabel>
              <Select
                value={selectedDept}
                onChange={handleDeptChange}
                size="lg"
                disabled={!selectedAdmin}
              >
                {getDepartments().map((dept) => (
                  <Option key={dept.value} value={dept.value}>
                    {dept.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Section Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📍 Section
              </FormLabel>
              <Select
                value={selectedSection}
                onChange={(e, newValue) => setSelectedSection(newValue)}
                size="lg"
                disabled={!selectedDept}
              >
                {getSections().map((section) => (
                  <Option key={section.value} value={section.value}>
                    {section.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Tree Type Selector */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🌳 Visualization Type
          </Typography>
          <FormControl>
            <Select
              value={selectedTreeType}
              onChange={(e, newValue) => setSelectedTreeType(newValue)}
              size="lg"
            >
              {treeTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Card>

        {/* Investigation Tree */}
        <IncidentCountTree 
          selectedSeason={selectedSeason}
          selectedYear={selectedYear}
          selectedAdmin={selectedAdmin} 
          selectedDept={selectedDept}
          selectedSection={selectedSection}
          treeType={selectedTreeType}
        />

        {/* Footer Note */}
        <Card variant="soft" sx={{ mt: 4, p: 3, bgcolor: "#fef3c7" }}>
          <Typography level="body-sm" sx={{ color: "#92400e", textAlign: "center" }}>
            💡 <strong>Note:</strong> This page is for exploratory analysis only.
            For acceptance decisions and formal reporting, please refer to the
            Seasonal Reports page.
          </Typography>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default InvestigationPage;
