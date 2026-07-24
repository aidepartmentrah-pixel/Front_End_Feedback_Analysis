// src/pages/PatientHistoryPage.js
// Phase D — Patient history mapped to V2 unified profile contract
// Phase 2 — FAB for export actions
// Phase R-P — Normalized field names, V2 export endpoints, removed fallback chaos
// Phase 7 — Patient Feedback Seasonal Report widget integrated
// Phase Universal — Using UniversalIncidentsTable with satisfaction support
import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Typography, Button, Card } from "@mui/joy";
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import SearchPatient from "../components/patientHistory/SearchPatient";
import PatientInfoCard from "../components/patientHistory/PatientInfoCard";
import UniversalIncidentsTable from "../components/common/UniversalIncidentsTable";
import ExportMenu from "../components/common/ExportMenu";
import SatisfactionModal from "../components/patientHistory/SatisfactionModal";
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
  const [exporting, setExporting] = useState(false);
  
  // Phase 7 — Patient Feedback Seasonal Report state
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  
  // Satisfaction modal state
  const [satisfactionModalOpen, setSatisfactionModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  
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

  // Handle opening satisfaction modal
  const handleOpenSatisfaction = (feedback) => {
    setSelectedCase({
      id: feedback.id || feedback.incident_case_id || feedback.incident_id,
      name: `Case #${feedback.id || feedback.incident_case_id || feedback.incident_id}`,
    });
    setSatisfactionModalOpen(true);
  };

  // Handle satisfaction success
  const handleSatisfactionSuccess = () => {
    setSatisfactionModalOpen(false);
    setSelectedCase(null);
    handleRefresh();
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
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3.5 }}>
        {/* Page Header */}
        <Box>
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
          <Typography level="body-md" sx={{ color: theme.colors.textSecondary }}>
            Search for any patient to view their complete incident history and medical feedback records
          </Typography>
        </Box>

        {/* Success Alerts */}
        {success && (
          <Alert color="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Search Patient */}
        <SearchPatient onSelectPatient={handleSelectPatient} />

        {/* Phase D — standardized loading and empty states */}
        {/* Conditional render order: error → loading → empty → content */}
        {error && !loading ? (
          <Alert color="danger" onClose={() => setError(null)}>
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
            <Typography level="body-md" sx={{ ml: 2, color: theme.colors.textSecondary }}>
              Loading patient data...
            </Typography>
          </Box>
        ) : selectedPatient && patientProfile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Patient Info Card */}
            <PatientInfoCard patient={patientProfile} />

            {/* Actions Row */}
            <PatientActions
              patient={patientProfile}
              onRefresh={handleRefresh}
            />

            {/* Feedback Table -- export lives here as a compact toolbar
                action, not a standalone feature card competing for attention */}
            <UniversalIncidentsTable
              incidents={feedbackList}
              context="patient"
              showSatisfaction={true}
              onOpenSatisfaction={handleOpenSatisfaction}
              onRefresh={handleRefresh}
              title="📋 Patient Feedback History"
              emptyMessage="No feedback records found for this patient"
              actions={<ExportMenu onExport={handleExport} loading={exporting} />}
            />

            {/* Satisfaction Modal */}
            <SatisfactionModal
              open={satisfactionModalOpen}
              onClose={() => {
                setSatisfactionModalOpen(false);
                setSelectedCase(null);
              }}
              caseData={selectedCase}
              onSuccess={handleSatisfactionSuccess}
            />
          </Box>
        ) : null}

        {/* Phase 7 — Patient Feedback Seasonal Report Section - distinct
            feature area, visually separated but no longer a saturated
            gradient panel */}
        {canViewReporting && (
          <Box sx={{ pt: 3, borderTop: `1px solid ${theme.colors.border}`, textAlign: "center" }}>
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: theme.colors.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <AssessmentIcon sx={{ color: theme.colors.primary }} fontSize="small" />
              Aggregate Reports for RCA & Satisfaction
            </Typography>

            <Card variant="outlined" sx={{ p: 2.5, borderRadius: theme.radius.lg, borderColor: theme.colors.border, maxWidth: 480, mx: "auto" }}>
              <Typography level="body-sm" sx={{ mb: 2, color: theme.colors.textSecondary }}>
                Generate a comprehensive seasonal report analyzing Root Cause Analysis (RCA) and Patient Satisfaction data
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: "column", gap: 2, alignItems: "center" }}>
                <SeasonSelector
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                />

                <Button
                  size="md"
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
                    background: theme.gradients.primary,
                    color: 'white',
                    fontWeight: 700,
                    '&:hover': {
                      background: theme.gradients.primaryReverse,
                    },
                    '&:disabled': {
                      background: theme.colors.disabled,
                      color: theme.colors.disabledText,
                    }
                  }}
                >
                  Generate Report
                </Button>
              </Box>

              {reportError && (
                <Alert color="danger" size="sm" sx={{ mt: 2 }}>
                  {reportError}
                </Alert>
              )}
            </Card>
          </Box>
        )}
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default PatientHistoryPage;
