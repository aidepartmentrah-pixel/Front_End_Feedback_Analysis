// src/pages/WorkerHistoryPage.js
// Phase D — Worker history real V2 implementation
// Phase D — V2 seasonal Word download handler
// Phase D — role guard restricted to software_admin + complaint_department_worker
// Phase 2 — FAB for reports
// Phase Universal — Using UniversalIncidentsTable

import React, { useState } from "react";
import { Box, Typography, Alert, CircularProgress, Card, Button } from "@mui/joy";
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import theme from "../theme";
import MainLayout from "../components/common/MainLayout";
import PersonProfileCard from "../components/common/PersonProfileCard";
import SearchWorker from "../components/workerHistory/SearchWorker";
import UniversalIncidentsTable from "../components/common/UniversalIncidentsTable";
import ExportMenu from "../components/common/ExportMenu";
import SeasonSelector from "../components/personReporting/SeasonSelector";
import { getWorkerFullHistoryV2, exportWorkerCsvV2, exportWorkerJsonV2, exportWorkerWordV2, downloadWorkerSeasonalWordV2, downloadAllWorkersSeasonalWordV2, downloadBlobFile, extractApiErrorMessage } from "../api/personApiV2";
import { useAuth } from "../context/AuthContext";
import { canViewPersonReporting } from "../utils/roleGuards";

const WorkerHistoryPage = ({ embedded = false }) => {
  // Phase D — standardized loading and empty states
  const { user } = useAuth();
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerMetrics, setWorkerMetrics] = useState(null);
  const [workerActions, setWorkerActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  
  // Report scope state - always 'all' for aggregate reports
  const [reportScope] = useState('all'); // Always ALL workers

  // Phase D — role guard: Check authorization
  const isAuthorized = canViewPersonReporting(user);

  // Fetch worker full history from V2 API (new unified endpoint)
  const fetchWorkerData = async (workerId) => {
    try {
      setLoading(true);
      setError(null);

      // Call V2 API with worker ID - using new full-history endpoint
      const data = await getWorkerFullHistoryV2(workerId);
      
      // Extract V2 contract fields: profile, metrics, items, meta
      setWorkerProfile(data.profile || null);
      setWorkerMetrics(data.metrics || null);
      setWorkerActions(data.items || []);
      
      console.log("Worker data loaded successfully (V2)", {
        profile: data.profile,
        metricsCount: Object.keys(data.metrics || {}).length,
        itemsCount: (data.items || []).length
      });
    } catch (err) {
      setError(err.message || "Failed to load worker data. Please try again.");
      console.error("Error fetching worker data:", err);
      setWorkerProfile(null);
      setWorkerMetrics(null);
      setWorkerActions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle export using V2 API
  const handleExport = async (format) => {
    if (!selectedWorker) return;

    const workerId = selectedWorker.employee_id || selectedWorker.id;
    if (!workerId) return;

    try {
      setExporting(true);
      let blob;
      let fileExtension = format;
      
      if (format === "csv") {
        blob = await exportWorkerCsvV2(workerId);
      } else if (format === "json") {
        blob = await exportWorkerJsonV2(workerId);
      } else if (format === "word") {
        blob = await exportWorkerWordV2(workerId);
        fileExtension = "docx";
      }

      // Download the blob
      const workerName = workerProfile?.full_name || workerProfile?.name || workerId;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workerName}_history_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Worker history exported as ${format.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = await extractApiErrorMessage(err, `Failed to export as ${format.toUpperCase()}.`);
      setError(`Failed to export as ${format.toUpperCase()}: ${message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    // Fetch data using employee_id or id
    const workerId = worker.employee_id || worker.id;
    if (workerId) {
      fetchWorkerData(workerId);
    }
  };

  // Handle season selection
  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setReportError(null);
  };

  // Generate seasonal Word report
  const handleGenerateSeasonalReport = async () => {
    // Validate season selection
    if (!selectedSeason?.season_start || !selectedSeason?.season_end) {
      return;
    }

    // For 'single' scope, require a selected worker
    if (reportScope === 'single' && !selectedWorker) {
      return;
    }

    try {
      setGeneratingReport(true);
      setReportError(null);

      let blob;
      let filename;

      if (reportScope === 'all') {
        // Generate report for ALL workers
        console.log("Generating ALL workers seasonal report:", {
          season_start: selectedSeason.season_start,
          season_end: selectedSeason.season_end
        });

        blob = await downloadAllWorkersSeasonalWordV2(
          selectedSeason.season_start,
          selectedSeason.season_end
        );

        filename = `all_workers_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
      } else {
        // Generate report for single selected worker
        const workerId = selectedWorker.employee_id || selectedWorker.id;
        
        console.log("Generating worker seasonal report:", {
          workerId,
          season_start: selectedSeason.season_start,
          season_end: selectedSeason.season_end
        });

        blob = await downloadWorkerSeasonalWordV2(
          workerId,
          selectedSeason.season_start,
          selectedSeason.season_end
        );

        const workerName = workerProfile?.full_name || workerProfile?.name || workerId;
        const sanitizedName = workerName.replace(/[^a-zA-Z0-9]/g, '_');
        filename = `worker_${sanitizedName}_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
      }

      // Trigger download
      downloadBlobFile(blob, filename);

      console.log("✅ Report downloaded:", filename);
    } catch (err) {
      console.error("❌ Error generating seasonal report:", err);
      const message = await extractApiErrorMessage(err, "Failed to generate seasonal report. Please try again.");
      // A 400 here means "no data for this period" - that's an informational
      // result, not a system failure, so don't alarm the user with a red alert.
      const color = err?.response?.status === 400 ? "warning" : "danger";
      setReportError({ message, color });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Build metrics config from worker metrics. Action-item tiles (Total
  // Actions/Completed/Overdue/Rejected) and Neutral Feedback were removed
  // per product decision -- "neutral" is structurally always 0 (the backend
  // only ever classifies feedback as Notice/Critique, no neutral bucket).
  const metricsConfig = workerMetrics ? [
    {
      key: "total_incidents",
      label: "Total Incidents",
      value: workerMetrics.total_incidents || 0,
      icon: <AssessmentIcon />,
      color: theme.colors.primary
    },
    {
      key: "high_severity",
      label: "High Severity",
      value: workerMetrics.high_severity || 0,
      icon: <ErrorIcon />,
      color: theme.colors.error
    },
    {
      key: "medium_severity",
      label: "Medium Severity",
      value: workerMetrics.medium_severity || 0,
      icon: <WarningAmberIcon />,
      color: theme.colors.warning
    },
    {
      key: "low_severity",
      label: "Low Severity",
      value: workerMetrics.low_severity || 0,
      icon: <CheckCircleIcon />,
      color: theme.colors.success
    },
    {
      key: "good_feedback_count",
      label: "Good Feedback",
      value: workerMetrics.good_feedback_count || 0,
      icon: <SentimentSatisfiedAltIcon />,
      color: theme.colors.success
    },
    {
      key: "bad_feedback_count",
      label: "Bad Feedback",
      value: workerMetrics.bad_feedback_count || 0,
      icon: <SentimentDissatisfiedIcon />,
      color: theme.colors.error
    }
  ] : [];

  // Profile section
  const profileSection = workerProfile ? (
    <PersonProfileCard
      icon={<PersonIcon />}
      name={workerProfile.full_name || workerProfile.name || "Unknown Worker"}
      statusLabel={workerProfile.is_active === false ? "Inactive" : "Active"}
      statusColor={workerProfile.is_active === false ? "neutral" : "success"}
      fields={[
        { icon: <BadgeIcon fontSize="small" />, label: "Employee ID", value: workerProfile.employee_id },
        { icon: <WorkIcon fontSize="small" />, label: "Job Title", value: workerProfile.job_title },
        {
          icon: <ApartmentIcon fontSize="small" />,
          label: "Department",
          value: workerProfile.department_name || (workerProfile.department_id != null ? `Dept ${workerProfile.department_id}` : null),
        },
        ...(workerProfile.section_id != null
          ? [{ icon: <GroupsIcon fontSize="small" />, label: "Section", value: workerProfile.section_name || `Section ${workerProfile.section_id}` }]
          : []),
      ]}
      metrics={metricsConfig}
    />
  ) : null;

  // Incidents table section -- export lives here as a compact toolbar
  // action, not a standalone feature card competing for attention
  const tableSection = workerProfile ? (
    <UniversalIncidentsTable
      incidents={workerActions}
      context="worker"
      title="👷 Incidents Involving This Worker"
      emptyMessage="No incidents found for this worker"
      actions={<ExportMenu onExport={handleExport} loading={exporting} />}
    />
  ) : null;

  const content = (
    <>
    {/* Phase D — role guard: Not authorized guard */}
    {!isAuthorized ? (
      <Box sx={{ p: 3 }}>
        <Alert color="danger" sx={{ textAlign: "center", p: 4 }}>
          <Typography level="h6" sx={{ mb: 1 }}>
            🚫 Not Authorized
          </Typography>
          <Typography level="body-sm">
            You do not have permission to view this page. This page is restricted to Software Admins and Complaint Department Workers.
          </Typography>
        </Alert>
      </Box>
    ) : (
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
            🧑‍💼 Worker History & Performance Analysis
          </Typography>
          <Typography level="body-md" sx={{ color: theme.colors.textSecondary }}>
            Search for any worker to view their performance metrics and action item history
          </Typography>
        </Box>

        {/* Search Component */}
        <SearchWorker onWorkerSelect={handleWorkerSelect} />

        {/* Success Alerts */}
        {success && (
          <Alert color="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Phase D — standardized loading and empty states */}
        {/* Conditional render order: error → loading → empty → content */}
        {error && !loading ? (
          <Alert color="danger">
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ ml: 2, color: theme.colors.textSecondary }}>
              Loading worker data...
            </Typography>
          </Box>
        ) : selectedWorker && workerProfile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Profile Section + integrated performance stat strip */}
            {profileSection}

            {/* Incidents Table */}
            {tableSection}
          </Box>
        ) : selectedWorker && !workerProfile && !loading ? (
          <Alert color="warning">
            No data found for selected worker
          </Alert>
        ) : null}

        {/* ALL Workers Aggregate Report Section - distinct feature area,
            visually separated but no longer a saturated gradient panel */}
        <Box sx={{ pt: 3, borderTop: `1px solid ${theme.colors.border}`, textAlign: "center" }}>
          <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, color: theme.colors.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <AssessmentIcon sx={{ color: theme.colors.primary }} fontSize="small" />
            Aggregate Reports for ALL Workers
          </Typography>

          <Card variant="outlined" sx={{ p: 2.5, borderRadius: theme.radius.lg, borderColor: theme.colors.border, maxWidth: 480, mx: "auto" }}>
            <Typography level="body-sm" sx={{ mb: 2, color: theme.colors.textSecondary }}>
              Generate a comprehensive seasonal report for all workers in the system
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
                onClick={handleGenerateSeasonalReport}
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
              <Alert color={reportError.color} size="sm" sx={{ mt: 2 }}>
                {reportError.message}
              </Alert>
            )}
          </Card>
        </Box>
      </Box>
    )}
    </>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default WorkerHistoryPage;
