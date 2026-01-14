// src/pages/SeasonalReportsPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  Option,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  Divider,
} from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import { fetchDashboardHierarchy } from "../api/dashboard";
import {
  getSeasonalReportBySeason,
  generateSeasonalReport,
} from "../api/seasonalReports";

const SeasonalReportsPage = () => {
  const navigate = useNavigate();

  // Hierarchy data
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Selection state
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [selectedOrgUnitType, setSelectedOrgUnitType] = useState(null);

  // Report state
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [checkingReport, setCheckingReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState(null);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch hierarchy on mount
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => {
        console.log("✅ Hierarchy loaded:", data);
        setHierarchy(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load hierarchy:", err);
        setError("Failed to load organizational hierarchy");
      })
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // Seasons data (hardcoded for now - can be moved to API later)
  const seasons = [
    { id: 1, name: "Q1 2025 (Jan-Mar)", name_ar: "الربع الأول 2025" },
    { id: 2, name: "Q2 2025 (Apr-Jun)", name_ar: "الربع الثاني 2025" },
    { id: 3, name: "Q3 2025 (Jul-Sep)", name_ar: "الربع الثالث 2025" },
    { id: 4, name: "Q4 2025 (Oct-Dec)", name_ar: "الربع الرابع 2025" },
    { id: 5, name: "Q1 2026 (Jan-Mar)", name_ar: "الربع الأول 2026" },
  ];

  // Org unit types (matching backend structure)
  const orgUnitTypes = [
    { id: 1, name: "Idara (Administration)", name_ar: "إدارة" },
    { id: 2, name: "Dayra (Department)", name_ar: "دائرة" },
    { id: 3, name: "Qism (Section)", name_ar: "قسم" },
  ];

  // Get org units based on selected type
  const getOrgUnits = () => {
    if (!hierarchy || !selectedOrgUnitType) return [];

    switch (selectedOrgUnitType) {
      case 1: // Idara
        return hierarchy.administrations || [];
      case 2: // Dayra
        return hierarchy.departments || [];
      case 3: // Qism
        return hierarchy.sections || [];
      default:
        return [];
    }
  };

  // Check if report exists for current selection
  const handleCheckReport = async () => {
    if (!selectedSeason || !selectedOrgUnit || !selectedOrgUnitType) {
      setError("Please select Season, Org Unit, and Org Unit Type");
      return;
    }

    setCheckingReport(true);
    setError(null);
    setReport(null);

    try {
      const result = await getSeasonalReportBySeason({
        seasonId: selectedSeason,
        orgUnitId: selectedOrgUnit,
        orgUnitType: selectedOrgUnitType,
      });

      setReport(result);
      if (!result) {
        console.log("ℹ️ No report found - user can generate one");
      }
    } catch (err) {
      console.error("❌ Error checking report:", err);
      setError(err.message || "Failed to check report");
    } finally {
      setCheckingReport(false);
    }
  };

  // Generate new report
  const handleGenerateReport = async () => {
    if (!selectedSeason || !selectedOrgUnit || !selectedOrgUnitType) {
      setError("Please select Season, Org Unit, and Org Unit Type");
      return;
    }

    setGeneratingReport(true);
    setError(null);

    try {
      const result = await generateSeasonalReport({
        seasonId: selectedSeason,
        orgUnitId: selectedOrgUnit,
        orgUnitType: selectedOrgUnitType,
      });

      console.log("✅ Report generated:", result);
      setReport(result);
      setError(null);
    } catch (err) {
      console.error("❌ Error generating report:", err);
      setError(err.message || "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Open regenerate confirmation dialog
  const handleRegenerateClick = () => {
    setConfirmDialogOpen(true);
  };

  // Confirm regenerate
  const handleConfirmRegenerate = async () => {
    setConfirmDialogOpen(false);
    await handleGenerateReport(); // Same function, will overwrite existing
  };

  // Navigate to report details
  const handleOpenReport = () => {
    if (report?.seasonalReportId) {
      navigate(`/seasonal-reports/${report.seasonalReportId}`);
    }
  };

  // Get selected season name
  const getSeasonName = () => {
    const season = seasons.find((s) => s.id === selectedSeason);
    return season?.name || "Unknown Season";
  };

  // Get selected org unit name
  const getOrgUnitName = () => {
    const units = getOrgUnits();
    const unit = units.find((u) => u.id === selectedOrgUnit);
    return unit?.name || unit?.name_en || "Unknown Unit";
  };

  // Get selected org unit type name
  const getOrgUnitTypeName = () => {
    const type = orgUnitTypes.find((t) => t.id === selectedOrgUnitType);
    return type?.name || "Unknown Type";
  };

  if (loadingHierarchy) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography level="h2" sx={{ mb: 3 }}>
          📊 Seasonal Reports Dashboard
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              🔍 Select Parameters
            </Typography>

            <Stack spacing={2}>
              {/* Season Selector */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Season
                </Typography>
                <Select
                  placeholder="Select season..."
                  value={selectedSeason}
                  onChange={(e, value) => {
                    setSelectedSeason(value);
                    setReport(null); // Clear report when selection changes
                  }}
                  sx={{ width: "100%", maxWidth: 400 }}
                >
                  {seasons.map((season) => (
                    <Option key={season.id} value={season.id}>
                      {season.name}
                    </Option>
                  ))}
                </Select>
              </Box>

              {/* Org Unit Type Selector */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Organizational Unit Type
                </Typography>
                <Select
                  placeholder="Select org unit type..."
                  value={selectedOrgUnitType}
                  onChange={(e, value) => {
                    setSelectedOrgUnitType(value);
                    setSelectedOrgUnit(null); // Reset org unit when type changes
                    setReport(null);
                  }}
                  sx={{ width: "100%", maxWidth: 400 }}
                >
                  {orgUnitTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Box>

              {/* Org Unit Selector */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Organizational Unit
                </Typography>
                <Select
                  placeholder={
                    selectedOrgUnitType
                      ? "Select org unit..."
                      : "Select type first..."
                  }
                  value={selectedOrgUnit}
                  onChange={(e, value) => {
                    setSelectedOrgUnit(value);
                    setReport(null);
                  }}
                  disabled={!selectedOrgUnitType}
                  sx={{ width: "100%", maxWidth: 400 }}
                >
                  {getOrgUnits().map((unit) => (
                    <Option key={unit.id} value={unit.id}>
                      {unit.name || unit.name_en}
                    </Option>
                  ))}
                </Select>
              </Box>

              {/* Check Report Button */}
              <Box>
                <Button
                  onClick={handleCheckReport}
                  loading={checkingReport}
                  disabled={
                    !selectedSeason || !selectedOrgUnit || !selectedOrgUnitType
                  }
                  sx={{ mt: 1 }}
                >
                  {checkingReport ? "Checking..." : "Check / Load Report"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Status Card - Only show after checking */}
        {!checkingReport &&
          selectedSeason &&
          selectedOrgUnit &&
          selectedOrgUnitType && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 2 }}>
                  📋 Report Status
                </Typography>

                {!report ? (
                  // No Report Exists
                  <Box>
                    <Alert color="warning" sx={{ mb: 2 }}>
                      ⚠️ No report generated yet for this selection.
                    </Alert>
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                      Season: <strong>{getSeasonName()}</strong>
                      <br />
                      Unit Type: <strong>{getOrgUnitTypeName()}</strong>
                      <br />
                      Unit: <strong>{getOrgUnitName()}</strong>
                    </Typography>
                    <Button
                      color="success"
                      onClick={handleGenerateReport}
                      loading={generatingReport}
                    >
                      {generatingReport
                        ? "Generating..."
                        : "🚀 Generate Report"}
                    </Button>
                  </Box>
                ) : (
                  // Report Exists
                  <Box>
                    <Alert color="success" sx={{ mb: 2 }}>
                      ✅ Report exists for this selection
                    </Alert>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography level="body-sm">
                        <strong>Report ID:</strong> {report.seasonalReportId}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Season:</strong> {getSeasonName()}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Unit Type:</strong> {getOrgUnitTypeName()}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Unit:</strong> {getOrgUnitName()}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Total Cases:</strong> {report.totalCases || 0}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography level="body-sm">
                          <strong>Compliance:</strong>
                        </Typography>
                        <Chip
                          color={report.isCompliant ? "success" : "danger"}
                          size="sm"
                        >
                          {report.isCompliant ? "✓ Compliant" : "✗ Non-Compliant"}
                        </Chip>
                      </Box>
                      {!report.isCompliant && report.violatedRules && (
                        <Typography level="body-sm" color="danger">
                          <strong>Violated Rules:</strong> {report.violatedRules}
                        </Typography>
                      )}
                      <Typography level="body-sm">
                        <strong>Last Evaluated:</strong>{" "}
                        {report.evaluatedAt
                          ? new Date(report.evaluatedAt).toLocaleString()
                          : "N/A"}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Created:</strong>{" "}
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString()
                          : "N/A"}
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={2}>
                      <Button color="primary" onClick={handleOpenReport}>
                        📖 Open Report
                      </Button>
                      <Button
                        color="warning"
                        variant="outlined"
                        onClick={handleRegenerateClick}
                        loading={generatingReport}
                      >
                        {generatingReport
                          ? "Regenerating..."
                          : "🔄 Regenerate"}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
      </Box>

      {/* Regenerate Confirmation Dialog */}
      <Modal
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            ⚠️ Confirm Regenerate
          </Typography>
          <Typography level="body-md" sx={{ mb: 3 }}>
            Are you sure you want to regenerate this report?
            <br />
            <br />
            <strong>This will:</strong>
            <br />
            • Overwrite the existing report data
            <br />
            • Recalculate all statistics from current database state
            <br />
            • Reset compliance evaluation
            <br />
            • Clear any existing explanations
            <br />
            <br />
            This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleConfirmRegenerate}>
              Yes, Regenerate
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </MainLayout>
  );
};

export default SeasonalReportsPage;
