// src/pages/PatientHistoryPage.js
import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import SearchPatient from "../components/patientHistory/SearchPatient";
import PatientInfoCard from "../components/patientHistory/PatientInfoCard";
import PatientFeedbackTable from "../components/patientHistory/PatientFeedbackTable";
// import PatientHistoryCharts from "../components/patientHistory/PatientHistoryCharts"; // Removed - charts not needed
import PatientActions from "../components/patientHistory/PatientActions";

// Mock data for initial display
const mockPatient = {
  id: "P12345",
  name: "Ahmed Mohammed Ali",
  age: 45,
  gender: "Male",
  phone: "+966 50 123 4567",
  email: "ahmed.ali@email.com",
  totalIncidents: 8,
  profilePicture: null,
};

const mockFeedbacks = [
  {
    id: 1,
    date: "2024-12-01",
    department: "Emergency",
    category: "Treatment Delay",
    severity: "High",
    doctorName: "Dr. Sarah Johnson",
    status: "Closed",
    description: "Long waiting time in emergency room",
  },
  {
    id: 2,
    date: "2024-11-15",
    department: "Cardiology",
    category: "Medical Care",
    severity: "Medium",
    doctorName: "Dr. Michael Chen",
    status: "In Progress",
    description: "Follow-up appointment concerns",
  },
  {
    id: 3,
    date: "2024-10-20",
    department: "Radiology",
    category: "Communication",
    severity: "Low",
    doctorName: "Dr. Emily Davis",
    status: "Closed",
    description: "Unclear instructions for procedure",
  },
  {
    id: 4,
    date: "2024-09-10",
    department: "Emergency",
    category: "Staff Behavior",
    severity: "High",
    doctorName: "Dr. Sarah Johnson",
    status: "Closed",
    description: "Unprofessional staff behavior",
  },
  {
    id: 5,
    date: "2024-08-05",
    department: "Pediatrics",
    category: "Facility Issues",
    severity: "Medium",
    doctorName: "Dr. John Smith",
    status: "Closed",
    description: "Cleanliness concerns in waiting area",
  },
  {
    id: 6,
    date: "2024-07-12",
    department: "Cardiology",
    category: "Treatment Delay",
    severity: "Medium",
    doctorName: "Dr. Michael Chen",
    status: "Closed",
    description: "Delayed medication administration",
  },
  {
    id: 7,
    date: "2024-06-18",
    department: "Emergency",
    category: "Medical Care",
    severity: "High",
    doctorName: "Dr. Sarah Johnson",
    status: "Closed",
    description: "Misdiagnosis concern",
  },
  {
    id: 8,
    date: "2024-05-22",
    department: "Radiology",
    category: "Communication",
    severity: "Low",
    doctorName: "Dr. Emily Davis",
    status: "Closed",
  },
];

// Removed chart mock data - not needed for simplified view
// const mockChartsData = { ... };

const PatientHistoryPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(mockPatient);
  const [feedbackList, setFeedbackList] = useState(mockFeedbacks);
  // const [chartsData, setChartsData] = useState(mockChartsData); // Removed - charts not needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch patient data (simulate API call)
  const fetchPatientData = async (patientId) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls
      // const patient = await api.getPatient(patientId);
      // const feedbacks = await api.getPatientFeedbacks(patientId);
      // Note: Removed chart metrics API call - not needed

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSelectedPatient(mockPatient);
      setFeedbackList(mockFeedbacks);
      // Removed: setChartsData(mockChartsData);
    } catch (err) {
      setError("Failed to load patient data. Please try again.");
      console.error("Error fetching patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientData(patient.id);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.id);
      setSuccess("Patient data refreshed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Handle export
  const handleExport = (format) => {
    if (!selectedPatient) return;

    if (format === "csv") {
      const csv = [
        ["Date", "Department", "Category", "Severity", "Doctor", "Status", "Description"],
        ...feedbackList.map((fb) => [
          fb.date,
          fb.department,
          fb.category,
          fb.severity,
          fb.doctorName,
          fb.status,
          fb.description,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient_${selectedPatient.id}_history.csv`;
      link.click();
    } else if (format === "json") {
      const data = {
        patient: selectedPatient,
        feedbacks: feedbackList,
        // Removed: charts: chartsData
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient_${selectedPatient.id}_history.json`;
      link.click();
    }

    setSuccess(`Patient history exported as ${format.toUpperCase()}!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Load initial data on mount
  useEffect(() => {
    fetchPatientData(mockPatient.id);
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Alerts */}
        {error && (
          <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Search Patient */}
        <Box sx={{ mb: 3 }}>
          <SearchPatient onSelectPatient={handleSelectPatient} />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size="lg" />
          </Box>
        ) : selectedPatient ? (
          <>
            {/* Patient Info Card */}
            <Box sx={{ mb: 3 }}>
              <PatientInfoCard patient={selectedPatient} />
            </Box>

            {/* Actions Row */}
            <Box sx={{ mb: 3 }}>
              <PatientActions
                patient={selectedPatient}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
            </Box>

            {/* Feedback Table */}
            <Box sx={{ mb: 3 }}>
              <PatientFeedbackTable feedbacks={feedbackList} />
            </Box>

            {/* Charts - Removed to focus on factual patient history only */}
            {/* <Box sx={{ mb: 3 }}>
              <PatientHistoryCharts data={chartsData} />
            </Box> */}
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              p: 6,
              border: "2px dashed rgba(102, 126, 234, 0.3)",
              borderRadius: "8px",
            }}
          >
            <Typography level="h4" sx={{ color: "#999", mb: 1 }}>
              No Patient Selected
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              Use the search above to find and select a patient
            </Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default PatientHistoryPage;
