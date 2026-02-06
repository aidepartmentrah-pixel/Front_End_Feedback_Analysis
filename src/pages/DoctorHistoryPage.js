// src/pages/DoctorHistoryPage.js
import React, { useState } from "react";
import { Box, Typography, Alert } from "@mui/joy";
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import SearchDoctor from "../components/doctorHistory/SearchDoctor";
import DoctorProfileCard from "../components/doctorHistory/DoctorProfileCard";
import DoctorStatisticsCards from "../components/doctorHistory/DoctorStatisticsCards";
import DoctorCharts from "../components/doctorHistory/DoctorCharts";
import DoctorIncidentsTable from "../components/doctorHistory/DoctorIncidentsTable";
import DoctorReportActions from "../components/doctorHistory/DoctorReportActions";

const DoctorHistoryPage = ({ embedded = false }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Mock doctors data
  const mockDoctors = [
    {
      id: 1,
      employeeId: "DOC-2024-001",
      nameEn: "Dr. Ahmed Mohamed",
      nameAr: "د. أحمد محمد",
      department: "Cardiology",
      specialty: "Cardiologist",
      hireDate: "2020-01-15",
      status: "active",
    },
    {
      id: 2,
      employeeId: "DOC-2024-002",
      nameEn: "Dr. Fatima Ali",
      nameAr: "د. فاطمة علي",
      department: "Emergency",
      specialty: "Emergency Medicine",
      hireDate: "2019-06-20",
      status: "active",
    },
    {
      id: 3,
      employeeId: "DOC-2024-003",
      nameEn: "Dr. Khaled Hassan",
      nameAr: "د. خالد حسن",
      department: "ICU",
      specialty: "Intensive Care",
      hireDate: "2021-03-10",
      status: "active",
    },
    {
      id: 4,
      employeeId: "DOC-2024-004",
      nameEn: "Dr. Sara Ibrahim",
      nameAr: "د. سارة إبراهيم",
      department: "Pediatrics",
      specialty: "Pediatrician",
      hireDate: "2018-09-05",
      status: "active",
    },
  ];

  // Mock doctor incidents data
  const mockDoctorIncidents = {
    1: { // Dr. Ahmed Mohamed
      statistics: {
        total: 12,
        high: 3,
        medium: 7,
        low: 2,
        redFlags: 1,
      },
      categoryBreakdown: [
        { name: "Medication Errors", count: 4 },
        { name: "Delayed Diagnosis", count: 3 },
        { name: "Communication Issues", count: 3 },
        { name: "Clinical Judgment", count: 2 },
      ],
      monthlyTrend: [
        { month: "Jul", count: 1 },
        { month: "Aug", count: 2 },
        { month: "Sep", count: 3 },
        { month: "Oct", count: 2 },
        { month: "Nov", count: 3 },
        { month: "Dec", count: 1 },
      ],
      incidents: [
        {
          id: 1,
          date: "2024-12-05",
          incidentId: "INC-2024-0089",
          patientId: "P-12345",
          category: "Medication Error",
          categoryAr: "خطأ في الدواء",
          severity: "HIGH",
          status: "UNDER_REVIEW",
          isRedFlag: true,
        },
        {
          id: 2,
          date: "2024-11-22",
          incidentId: "INC-2024-0078",
          patientId: "P-12346",
          category: "Delayed Diagnosis",
          categoryAr: "تأخر في التشخيص",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 3,
          date: "2024-11-15",
          incidentId: "INC-2024-0070",
          patientId: "P-12347",
          category: "Communication",
          categoryAr: "مشاكل التواصل",
          severity: "LOW",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 4,
          date: "2024-10-30",
          incidentId: "INC-2024-0062",
          patientId: "P-12348",
          category: "Medication Error",
          categoryAr: "خطأ في الدواء",
          severity: "HIGH",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 5,
          date: "2024-10-18",
          incidentId: "INC-2024-0055",
          patientId: "P-12349",
          category: "Clinical Judgment",
          categoryAr: "حكم سريري",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 6,
          date: "2024-09-25",
          incidentId: "INC-2024-0048",
          patientId: "P-12350",
          category: "Delayed Diagnosis",
          categoryAr: "تأخر في التشخيص",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 7,
          date: "2024-09-12",
          incidentId: "INC-2024-0042",
          patientId: "P-12351",
          category: "Communication",
          categoryAr: "مشاكل التواصل",
          severity: "LOW",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 8,
          date: "2024-08-28",
          incidentId: "INC-2024-0035",
          patientId: "P-12352",
          category: "Medication Error",
          categoryAr: "خطأ في الدواء",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 9,
          date: "2024-08-15",
          incidentId: "INC-2024-0030",
          patientId: "P-12353",
          category: "Clinical Judgment",
          categoryAr: "حكم سريري",
          severity: "HIGH",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 10,
          date: "2024-07-20",
          incidentId: "INC-2024-0022",
          patientId: "P-12354",
          category: "Delayed Diagnosis",
          categoryAr: "تأخر في التشخيص",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
        {
          id: 11,
          date: "2024-11-08",
          incidentId: "INC-2024-0065",
          patientId: "P-12355",
          category: "Communication",
          categoryAr: "مشاكل التواصل",
          severity: "MEDIUM",
          status: "OPEN",
          isRedFlag: false,
        },
        {
          id: 12,
          date: "2024-09-05",
          incidentId: "INC-2024-0040",
          patientId: "P-12356",
          category: "Medication Error",
          categoryAr: "خطأ في الدواء",
          severity: "MEDIUM",
          status: "CLOSED",
          isRedFlag: false,
        },
      ],
    },
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const doctorData = selectedDoctor ? mockDoctorIncidents[selectedDoctor.id] : null;

  const content = (
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: theme.gradients.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            👨‍⚕️ Doctor History & Performance Analysis
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Search for any doctor to view their incident history, statistics, and performance trends
          </Typography>
        </Box>

        {/* Search Component */}
        <SearchDoctor onDoctorSelect={handleDoctorSelect} doctors={mockDoctors} />

        {/* Doctor Data Display */}
        {selectedDoctor && doctorData ? (
          <>
            {/* Doctor Profile Card */}
            <DoctorProfileCard doctor={selectedDoctor} />

            {/* Statistics Cards */}
            <DoctorStatisticsCards statistics={doctorData.statistics} />

            {/* Charts */}
            <DoctorCharts
              categoryBreakdown={doctorData.categoryBreakdown}
              monthlyTrend={doctorData.monthlyTrend}
            />

            {/* Incidents Table */}
            <DoctorIncidentsTable incidents={doctorData.incidents} />

            {/* Report Actions */}
            <DoctorReportActions doctorName={selectedDoctor.nameEn} />
          </>
        ) : (
          <Alert
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              borderColor: "rgba(102, 126, 234, 0.3)",
              color: theme.colors.primary,
            }}
          >
            👆 Please search and select a doctor to view their history and performance data
          </Alert>
        )}

        {/* Info Footer */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 1 }}>
            💡 Development Mode
          </Typography>
          <Typography level="body-xs" sx={{ color: "#666" }}>
            Currently using <strong>mock data</strong>. Once the database is ready, this page will connect to real incident records linked to doctors.
          </Typography>
        </Box>
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default DoctorHistoryPage;
