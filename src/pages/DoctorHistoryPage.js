// src/pages/DoctorHistoryPage.js
// Phase D — Doctor history switched to real V2 profile contract
// Phase D — V2 seasonal Word download handler
// Phase D — role guard restricted to software_admin + complaint_department_worker
// Phase 2 — FAB for reports
import React, { useState } from "react";
import { Box, Typography, Alert, CircularProgress, Button, Card, Select, Option } from "@mui/joy";
import DescriptionIcon from '@mui/icons-material/Description';
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import SearchDoctor from "../components/doctorHistory/SearchDoctor";
import DoctorProfileCard from "../components/doctorHistory/DoctorProfileCard";
import DoctorStatisticsCards from "../components/doctorHistory/DoctorStatisticsCards";
import DoctorCharts from "../components/doctorHistory/DoctorCharts";
import UniversalIncidentsTable from "../components/common/UniversalIncidentsTable";
import SeasonSelector from "../components/personReporting/SeasonSelector";
import { getDoctorFullHistoryV2, exportDoctorCsvV2, exportDoctorJsonV2, exportDoctorWordV2, downloadDoctorSeasonalWordV2, downloadAllDoctorsSeasonalWordV2, downloadBlobFile } from "../api/personApiV2";
import { useAuth } from "../context/AuthContext";
import { canViewPersonReporting } from "../utils/roleGuards";

const DoctorHistoryPage = ({ embedded = false }) => {
  // Phase D — standardized loading and empty states
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorMetrics, setDoctorMetrics] = useState(null);
  const [doctorItems, setDoctorItems] = useState([]);
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
  const [reportScope] = useState('all'); // Always ALL doctors

  // Phase D — role guard: Check authorization
  const isAuthorized = canViewPersonReporting(user);

  // Fetch doctor full history from V2 API (new unified endpoint)
  const fetchDoctorData = async (doctorId) => {
    try {
      setLoading(true);
      setError(null);

      // Call V2 API with doctor ID - using new full-history endpoint
      const data = await getDoctorFullHistoryV2(doctorId);
      
      // Extract V2 contract fields: profile, metrics, items, meta
      setDoctorProfile(data.profile || null);
      setDoctorMetrics(data.metrics || null);
      setDoctorItems(data.items || []);
      
      console.log("Doctor data loaded successfully (V2)", { 
        profile: data.profile, 
        metricsCount: Object.keys(data.metrics || {}).length,
        itemsCount: (data.items || []).length 
      });
    } catch (err) {
      setError(err.message || "Failed to load doctor data. Please try again.");
      console.error("Error fetching doctor data:", err);
      setDoctorProfile(null);
      setDoctorMetrics(null);
      setDoctorItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle export using V2 API
  const handleExport = async (format) => {
    if (!selectedDoctor) return;

    const doctorId = selectedDoctor.doctor_id || selectedDoctor.employeeId || selectedDoctor.id;
    if (!doctorId) return;

    try {
      setExporting(true);
      let blob;
      let fileExtension = format;
      
      if (format === "csv") {
        blob = await exportDoctorCsvV2(doctorId);
      } else if (format === "json") {
        blob = await exportDoctorJsonV2(doctorId);
      } else if (format === "word") {
        blob = await exportDoctorWordV2(doctorId);
        fileExtension = "docx";
      }

      // Download the blob
      const doctorName = doctorProfile?.full_name || doctorProfile?.nameEn || doctorProfile?.name || doctorId;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doctorName}_history_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Doctor history exported as ${format.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to export as ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    // Fetch data using doctor_id, employeeId, or id
    const doctorId = doctor.doctor_id || doctor.employeeId || doctor.id;
    if (doctorId) {
      fetchDoctorData(doctorId);
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

    // For 'single' scope, require a selected doctor
    if (reportScope === 'single' && !selectedDoctor) {
      return;
    }

    try {
      setGeneratingReport(true);
      setReportError(null);

      let blob;
      let filename;

      if (reportScope === 'all') {
        // Generate report for ALL doctors
        console.log("Generating ALL doctors seasonal report:", {
          season_start: selectedSeason.season_start,
          season_end: selectedSeason.season_end
        });

        blob = await downloadAllDoctorsSeasonalWordV2(
          selectedSeason.season_start,
          selectedSeason.season_end
        );

        filename = `all_doctors_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
      } else {
        // Generate report for single selected doctor
        const doctorId = selectedDoctor.doctor_id || selectedDoctor.employeeId || selectedDoctor.id;
        
        console.log("Generating doctor seasonal report:", {
          doctorId,
          season_start: selectedSeason.season_start,
          season_end: selectedSeason.season_end
        });

        blob = await downloadDoctorSeasonalWordV2(
          doctorId,
          selectedSeason.season_start,
          selectedSeason.season_end
        );

        const doctorName = doctorProfile?.full_name || doctorProfile?.nameEn || doctorProfile?.name || doctorId;
        const sanitizedName = doctorName.replace(/[^a-zA-Z0-9]/g, '_');
        filename = `doctor_${sanitizedName}_seasonal_${selectedSeason.quarter}_${selectedSeason.year}.docx`;
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

  const content = (
      <Box sx={{ p: 3 }}>
        {/* Phase D — role guard: Not authorized guard */}
        {!isAuthorized ? (
          <Alert color="danger" sx={{ textAlign: "center", p: 4 }}>
            <Typography level="h6" sx={{ mb: 1 }}>
              🚫 Not Authorized
            </Typography>
            <Typography level="body-sm">
              You do not have permission to view this page. This page is restricted to Software Admins and Complaint Department Workers.
            </Typography>
          </Alert>
        ) : (
        <>
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
        <SearchDoctor onDoctorSelect={handleDoctorSelect} />

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
              Loading doctor data...
            </Typography>
          </Box>
        ) : selectedDoctor && doctorProfile ? (
          <>
            {/* Doctor Profile Card */}
            <DoctorProfileCard doctor={doctorProfile} />

            {/* Statistics Cards */}
            {doctorMetrics && (
              <DoctorStatisticsCards statistics={doctorMetrics} />
            )}

            {/* Charts - only if data available */}
            {doctorMetrics?.categoryBreakdown && doctorMetrics?.monthlyTrend && (
              <DoctorCharts
                categoryBreakdown={doctorMetrics.categoryBreakdown}
                monthlyTrend={doctorMetrics.monthlyTrend}
              />
            )}

            {/* Incidents Table */}
            <UniversalIncidentsTable
              incidents={doctorItems}
              context="doctor"
              title="🩺 Incidents Involving This Doctor"
              emptyMessage="No incidents found for this doctor"
            />

            {/* Export Actions - Centered Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Card sx={{ p: 3, minWidth: 340, maxWidth: 420, width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)', border: 'none' }}>
                <Typography
                  level="body-md"
                  sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
                >
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                  تصدير بيانات الطبيب
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
        ) : selectedDoctor && !doctorProfile && !loading ? (
          <Alert color="warning" sx={{ mb: 3 }}>
            No data found for selected doctor
          </Alert>
        ) : !selectedDoctor && !loading ? (
          <Alert
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              borderColor: "rgba(102, 126, 234, 0.3)",
              textAlign: "center",
              p: 4,
            }}
          >
            <Typography level="h6" sx={{ color: "#667eea", mb: 1 }}>
              Select a doctor to view profile and generate report
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              Use the search above to find and select a doctor
            </Typography>
          </Alert>
        ) : null}

        {/* ALL Doctors Aggregate Report Section - At Bottom */}
        <Box sx={{ mt: 5, pt: 4, borderTop: '2px solid #eee' }}>
          <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: '#667eea', textAlign: 'center' }}>
            📊 Aggregate Reports for ALL Doctors
          </Typography>
          
          <Card sx={{ p: 4, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '2px solid rgba(102, 126, 234, 0.2)', textAlign: 'center' }}>
            <Typography level="body-md" sx={{ mb: 3, color: '#666' }}>
              Generate a comprehensive seasonal report for all doctors in the system
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
                📄 Generate Report for ALL Doctors
              </Button>

              {reportError && (
                <Alert color="danger" size="sm">
                  {reportError}
                </Alert>
              )}
            </Box>
          </Card>
        </Box>
        </>
        )}
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default DoctorHistoryPage;
