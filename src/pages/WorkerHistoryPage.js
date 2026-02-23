// src/pages/WorkerHistoryPage.js
// Phase D — Worker history real V2 implementation
// Phase D — V2 seasonal Word download handler
// Phase D — role guard restricted to software_admin + complaint_department_worker
// Phase 2 — FAB for reports
// Phase Universal — Using UniversalIncidentsTable

import React, { useState } from "react";
import { Box, Typography, Alert, CircularProgress, Card, Button, Select, Option } from "@mui/joy";
import DescriptionIcon from '@mui/icons-material/Description';
import theme from "../theme";
import MainLayout from "../components/common/MainLayout";
import MetricsPanel from "../components/personReporting/MetricsPanel";
import SearchWorker from "../components/workerHistory/SearchWorker";
import UniversalIncidentsTable from "../components/common/UniversalIncidentsTable";
import SeasonSelector from "../components/personReporting/SeasonSelector";
import { getWorkerFullHistoryV2, exportWorkerCsvV2, exportWorkerJsonV2, exportWorkerWordV2, downloadWorkerSeasonalWordV2, downloadAllWorkersSeasonalWordV2, downloadBlobFile } from "../api/personApiV2";
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
  const [exportFormat, setExportFormat] = useState('word');
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
      setError(`Failed to export as ${format.toUpperCase()}: ${err.message}`);
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
      setReportError(err.message || "Failed to generate seasonal report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Build metrics config from worker metrics - Updated with severity and intent classifications
  const metricsConfig = workerMetrics ? [
    {
      key: "total_incidents",
      label: "Total Incidents",
      value: workerMetrics.total_incidents || 0,
      icon: "📊",
      color: "#667eea"
    },
    {
      key: "high_severity",
      label: "High Severity",
      value: workerMetrics.high_severity || 0,
      icon: "⚠️",
      color: "#ff4757"
    },
    {
      key: "medium_severity",
      label: "Medium Severity",
      value: workerMetrics.medium_severity || 0,
      icon: "📝",
      color: "#ffa502"
    },
    {
      key: "low_severity",
      label: "Low Severity",
      value: workerMetrics.low_severity || 0,
      icon: "✅",
      color: "#2ed573"
    },
    {
      key: "good_feedback_count",
      label: "Good Feedback",
      value: workerMetrics.good_feedback_count || 0,
      icon: "😊",
      color: "#4caf50"
    },
    {
      key: "neutral_feedback_count",
      label: "Neutral Feedback",
      value: workerMetrics.neutral_feedback_count || 0,
      icon: "😐",
      color: "#95a5a6"
    },
    {
      key: "bad_feedback_count",
      label: "Bad Feedback",
      value: workerMetrics.bad_feedback_count || 0,
      icon: "😞",
      color: "#e74c3c"
    },
    {
      key: "total_action_items",
      label: "Total Actions",
      value: workerMetrics.total_action_items || 0,
      icon: "📋",
      color: "#3498db"
    },
    {
      key: "completed_action_items",
      label: "Completed",
      value: workerMetrics.completed_action_items || 0,
      icon: "✔️",
      color: "#27ae60"
    },
    {
      key: "overdue_action_items",
      label: "Overdue",
      value: workerMetrics.overdue_action_items || 0,
      icon: "⏰",
      color: "#e67e22"
    },
    {
      key: "rejected_count",
      label: "Rejected",
      value: workerMetrics.explanation_rejected_count || 0,
      icon: "❌",
      color: "#c0392b"
    }
  ] : [];

  // Profile section
  const profileSection = workerProfile ? (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        mb: 3
      }}
    >
      <Typography level="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {workerProfile.full_name || workerProfile.name || "Unknown Worker"}
      </Typography>
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box>
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Employee ID
          </Typography>
          <Typography level="body-md" sx={{ fontWeight: 600 }}>
            {workerProfile.employee_id || "N/A"}
          </Typography>
        </Box>
        <Box>
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Job Title
          </Typography>
          <Typography level="body-md" sx={{ fontWeight: 600 }}>
            {workerProfile.job_title || "N/A"}
          </Typography>
        </Box>
        <Box>
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Department
          </Typography>
          <Typography level="body-md" sx={{ fontWeight: 600 }}>
            {workerProfile.department_name || `Dept ${workerProfile.department_id}` || "N/A"}
          </Typography>
        </Box>
        {workerProfile.section_id && (
          <Box>
            <Typography level="body-sm" sx={{ opacity: 0.9 }}>
              Section
            </Typography>
            <Typography level="body-md" sx={{ fontWeight: 600 }}>
              {workerProfile.section_name || `Section ${workerProfile.section_id}`}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  ) : null;

  // Incidents table section - using UniversalIncidentsTable
  const tableSection = workerProfile ? (
    <UniversalIncidentsTable
      incidents={workerActions}
      context="worker"
      title="👷 Incidents Involving This Worker"
      emptyMessage="No incidents found for this worker"
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
            🧑‍💼 Worker History & Performance Analysis
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Search for any worker to view their performance metrics and action item history
          </Typography>
        </Box>

        {/* Search Component */}
        <SearchWorker onWorkerSelect={handleWorkerSelect} />

        {/* Success Alerts */}
        {success && (
          <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Phase D — standardized loading and empty states */}
        {/* Conditional render order: error → loading → empty → content */}
        {error && !loading ? (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ ml: 2, color: "#666" }}>
              Loading worker data...
            </Typography>
          </Box>
        ) : selectedWorker && workerProfile ? (
          <>
            {/* Profile Section */}
            {profileSection}

            {/* Metrics Panel */}
            {workerMetrics && <MetricsPanel metrics={metricsConfig} />}

            {/* Incidents Table */}
            {tableSection}

            {/* Export Actions - Centered Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, mt: 3 }}>
              <Card sx={{ p: 3, minWidth: 340, maxWidth: 420, width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)', border: 'none' }}>
                <Typography
                  level="body-md"
                  sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
                >
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                  تصدير بيانات الموظف
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
          </>
        ) : selectedWorker && !workerProfile && !loading ? (
          <Alert color="warning" sx={{ mb: 3 }}>
            No data found for selected worker
          </Alert>
        ) : !selectedWorker && !loading ? (
          <Alert
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              borderColor: "rgba(102, 126, 234, 0.3)",
              textAlign: "center",
              p: 4,
            }}
          >
            <Typography level="h6" sx={{ color: "#667eea", mb: 1 }}>
              Select a worker to view profile and generate report
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              Use the search above to find and select a worker
            </Typography>
          </Alert>
        ) : null}

        {/* ALL Workers Aggregate Report Section - At Bottom */}
        <Box sx={{ mt: 5, pt: 4, borderTop: '2px solid #eee' }}>
          <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: '#667eea', textAlign: 'center' }}>
            📊 Aggregate Reports for ALL Workers
          </Typography>
          
          <Card sx={{ p: 4, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '2px solid rgba(102, 126, 234, 0.2)', textAlign: 'center' }}>
            <Typography level="body-md" sx={{ mb: 3, color: '#666' }}>
              Generate a comprehensive seasonal report for all workers in the system
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
                onClick={handleGenerateSeasonalReport}
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
                📄 Generate Report for ALL Workers
              </Button>

              {reportError && (
                <Alert color="danger" size="sm">
                  {reportError}
                </Alert>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    )}
    </>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default WorkerHistoryPage;
