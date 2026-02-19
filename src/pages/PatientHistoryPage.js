// src/pages/PatientHistoryPage.js
// Phase D — Patient history mapped to V2 unified profile contract
// Phase 2 — FAB for export actions
// Phase R-P — Normalized field names, V2 export endpoints, removed fallback chaos
// Phase 7 — Patient Feedback Seasonal Report widget integrated
import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography, Button, Card, Select, Option } from "@mui/joy";
import DescriptionIcon from '@mui/icons-material/Description';
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import SearchPatient from "../components/patientHistory/SearchPatient";
import PatientInfoCard from "../components/patientHistory/PatientInfoCard";
import PatientFeedbackTable from "../components/patientHistory/PatientFeedbackTable";
import PatientActions from "../components/patientHistory/PatientActions";
import SeasonSelector from "../components/personReporting/SeasonSelector";

// API imports
import { getPatientFullHistoryV2, exportPatientCsvV2, exportPatientJsonV2, exportPatientWordV2, downloadPatientFeedbackSeasonalWordV2, downloadBlobFile } from "../api/personApiV2";
import { useAuth } from "../context/AuthContext";
import { canViewPersonReporting } from "../utils/roleGuards";

const PatientHistoryPage = ({ embedded = false }) => {
  // Phase D — standardized loading and empty states
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // FAB state
  const [fabExpanded, setFabExpanded] = useState(false);
  const [exportFormat, setExportFormat] = useState('word');
  const [exporting, setExporting] = useState(false);
  
  // Phase 7 — Patient Feedback Seasonal Report state
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  
  // Role guard for reporting
  const canViewReporting = canViewPersonReporting(user);

  // Fetch patient full history (profile + items + metrics)
  const fetchPatientData = async (patientId) => {
    try {
      setLoading(true);
      setError(null);

      // Use V2 full-history endpoint with unified contract
      const data = await getPatientFullHistoryV2(patientId);
      
      // Extract V2 contract fields: profile, metrics, items, meta
      const profile = data.profile || null;
      const items = data.items || [];
      const metrics = data.metrics || {};
      
      setPatientProfile(profile);
      setFeedbackList(items);
      
      console.log("Patient data loaded successfully (V2)", { profile, itemsCount: items.length, metrics });
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

  // Handle export using V2 API
  const handleExport = async (format) => {
    if (!selectedPatient) return;

    try {
      setExporting(true);
      let blob;
      let fileExtension = format;
      
      if (format === "csv") {
        blob = await exportPatientCsvV2(selectedPatient.patient_id);
      } else if (format === "json") {
        blob = await exportPatientJsonV2(selectedPatient.patient_id);
      } else if (format === "word") {
        blob = await exportPatientWordV2(selectedPatient.patient_id);
        fileExtension = "docx";
      }

      // Download the blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedPatient.full_name || "patient"}_history_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Patient history exported as ${format.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to export as ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Load initial data on mount - no default patient
  useEffect(() => {
    // Don't load any data initially - wait for user to search
  }, []);

  // Phase 7 — Handle season selection
  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setReportError(null);
  };

  // Phase 7 — Generate Patient Feedback Seasonal Word Report
  const handleGenerateFeedbackReport = async () => {
    if (!selectedSeason?.season_start || !selectedSeason?.season_end) {
      return;
    }

    try {
      setGeneratingReport(true);
      setReportError(null);

      console.log("Generating Patient Feedback Seasonal Report:", {
        season_start: selectedSeason.season_start,
        season_end: selectedSeason.season_end
      });

      const blob = await downloadPatientFeedbackSeasonalWordV2(
        selectedSeason.season_start,
        selectedSeason.season_end
      );

      const filename = `patient_feedback_report_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
      downloadBlobFile(blob, filename);

      setSuccess("Patient Feedback Report generated successfully!");
      setTimeout(() => setSuccess(null), 3000);

      console.log("✅ Report downloaded:", filename);
    } catch (err) {
      console.error("❌ Error generating Patient Feedback Seasonal Report:", err);
      setReportError(err.message || "Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

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
            👤 Patient History & Medical Records
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Search for any patient to view their complete incident history and medical feedback records
          </Typography>
        </Box>

        {/* Success Alerts */}
        {success && (
          <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Search Patient */}
        <Box sx={{ mb: 3 }}>
          <SearchPatient onSelectPatient={handleSelectPatient} />
        </Box>

        {/* Phase D — standardized loading and empty states */}
        {/* Conditional render order: error → loading → empty → content */}
        {error && !loading ? (
          <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ ml: 2, color: "#666" }}>
              Loading patient data...
            </Typography>
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
              />
            </Box>

            {/* Feedback Table */}
            <Box sx={{ mb: 3 }}>
              <PatientFeedbackTable feedbacks={feedbackList} onRefresh={handleRefresh} />
            </Box>
          </>
        ) : (
          <Alert
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              borderColor: "rgba(102, 126, 234, 0.3)",
              textAlign: "center",
              p: 4,
            }}
          >
            <Typography level="h6" sx={{ color: "#667eea", mb: 1 }}>
              Select a patient to view profile and generate report
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              Use the search above to find and select a patient
            </Typography>
          </Alert>
        )}
        
        {/* Export Actions - Centered Section */}
        {selectedPatient && patientProfile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Card sx={{ p: 3, minWidth: 340, maxWidth: 420, width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)', border: 'none' }}>
              <Typography
                level="body-md"
                sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
              >
                <DescriptionIcon sx={{ fontSize: 20 }} />
                تصدير بيانات المريض
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Select
                  size="sm"
                  placeholder="اختر الصيغة"
                  value={exportFormat}
                  onChange={(e, value) => setExportFormat(value)}
                  sx={{ width: '100%', background: 'white', '&:hover': { background: 'white' } }}
                >
                  <Option value="word">Word Report (.docx)</Option>
                  <Option value="csv">CSV</Option>
                  <Option value="json">JSON</Option>
                </Select>
                <Button
                  size="md"
                  variant="solid"
                  loading={exporting}
                  disabled={!exportFormat || exporting}
                  onClick={() => handleExport(exportFormat)}
                  sx={{ width: '100%', background: 'white', color: '#667eea', fontWeight: 700, '&:hover': { background: 'rgba(255, 255, 255, 0.9)' } }}
                >
                  تصدير البيانات
                </Button>
              </Box>
            </Card>
          </Box>
        )}

        {/* Phase 7 — Patient Feedback Seasonal Report Section */}
        {canViewReporting && (
          <Box sx={{ mt: 5, pt: 4, borderTop: '2px solid #eee' }}>
            <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: '#667eea', textAlign: 'center' }}>
              📊 تقرير ملاحظات المرضى الموسمي (Patient Feedback Report)
            </Typography>
            
            <Card sx={{ p: 4, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '2px solid rgba(102, 126, 234, 0.2)', textAlign: 'center' }}>
              <Typography level="body-md" sx={{ mb: 3, color: '#666' }}>
                Generate a comprehensive seasonal report analyzing Root Cause Analysis (RCA) and Patient Satisfaction data
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', alignItems: 'center' }}>
                <SeasonSelector
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                />

                <Button
                  size="lg"
                  variant="solid"
                  startDecorator={<DescriptionIcon />}
                  loading={generatingReport}
                  disabled={
                    !selectedSeason?.season_start || 
                    !selectedSeason?.season_end || 
                    generatingReport
                  }
                  onClick={handleGenerateFeedbackReport}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd6 0%, #6a42a0 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      color: '#999',
                      boxShadow: 'none',
                      transform: 'none',
                    }
                  }}
                >
                  📄 إنشاء التقرير / Generate Report
                </Button>

                {reportError && (
                  <Alert color="danger" size="sm">
                    {reportError}
                  </Alert>
                )}
              </Box>
            </Card>
          </Box>
        )}
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default PatientHistoryPage;
