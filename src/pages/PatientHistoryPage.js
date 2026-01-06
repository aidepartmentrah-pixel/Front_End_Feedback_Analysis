// src/pages/PatientHistoryPage.js
import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import SearchPatient from "../components/patientHistory/SearchPatient";
import PatientInfoCard from "../components/patientHistory/PatientInfoCard";
import PatientFeedbackTable from "../components/patientHistory/PatientFeedbackTable";
import PatientActions from "../components/patientHistory/PatientActions";

// API imports
import {
  searchPatients,
  getPatientFullHistory,
  downloadCSV,
  downloadJSON,
} from "../api/patientHistory";

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

const PatientHistoryPage = ({ embedded = false }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch patient full history (profile + incidents)
  const fetchPatientData = async (patientId) => {
    try {
      setLoading(true);
      setError(null);

      // Use full-history endpoint for efficiency
      const data = await getPatientFullHistory(patientId);
      
      // Extract profile and incidents
      const profile = data.profile || data;
      const incidents = data.incidents?.incidents || data.incidents || [];
      
      setPatientProfile(profile);
      setFeedbackList(incidents);
      
      console.log("Patient data loaded successfully");
    } catch (err) {
      setError(err.message || "Failed to load patient data. Please try again.");
      console.error("Error fetching patient data:", err);
      setPatientProfile(null);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection from search
  const handleSelectPatient = (patient) => {
    // Patient object from search contains: patient_id, mrn, full_name, etc.
    setSelectedPatient(patient);
    fetchPatientData(patient.patient_id);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.patient_id);
      setSuccess("Patient data refreshed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Handle export
  const handleExport = (format) => {
    if (!selectedPatient) return;

    try {
      if (format === "csv") {
        downloadCSV(selectedPatient.patient_id, selectedPatient.full_name || "patient");
      } else if (format === "json") {
        downloadJSON(selectedPatient.patient_id, selectedPatient.full_name || "patient");
      }

      setSuccess(`Patient history exported as ${format.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to export as ${format.toUpperCase()}: ${err.message}`);
    }
  };

  // Load initial data on mount - no default patient
  useEffect(() => {
    // Don't load any data initially - wait for user to search
  }, []);

  const content = (
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
        ) : selectedPatient && patientProfile ? (
          <>
            {/* Patient Info Card */}
            <Box sx={{ mb: 3 }}>
              <PatientInfoCard patient={patientProfile} />
            </Box>

            {/* Actions Row */}
            <Box sx={{ mb: 3 }}>
              <PatientActions
                patient={patientProfile}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
            </Box>

            {/* Feedback Table */}
            <Box sx={{ mb: 3 }}>
              <PatientFeedbackTable feedbacks={feedbackList} />
            </Box>
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
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default PatientHistoryPage;
