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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Sheet,
} from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import { fetchDashboardHierarchy } from "../api/dashboard";
import {
  getSeasonalReportBySeason,
  generateSeasonalReport,
  getAvailableQuarters,
  exportSingleSeasonalReport,
  generate2QuarterComparison,
  generate3QuarterComparison,
  generate4QuarterComparison,
} from "../api/seasonalReports";

const SeasonalReportsPage = () => {
  const navigate = useNavigate();

  // Hierarchy data
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Available quarters from backend
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [loadingQuarters, setLoadingQuarters] = useState(true);

  // Report type selection
  const [reportType, setReportType] = useState("single");
  const [reportFormat, setReportFormat] = useState("docx");

  // Selection state
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [selectedOrgUnitType, setSelectedOrgUnitType] = useState(0); // 0 = hospital level

  // Report state
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [checkingReport, setCheckingReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState(null);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch hierarchy and available quarters on mount
  useEffect(() => {
    Promise.all([
      fetchDashboardHierarchy(),
      getAvailableQuarters()
    ])
      .then(([hierarchyData, quartersData]) => {
        console.log("✅ Hierarchy loaded:", hierarchyData);
        console.log("✅ Available quarters loaded:", quartersData);
        setHierarchy(hierarchyData);
        setAvailableQuarters(quartersData);
        
        // Auto-select the most recent quarter
        if (quartersData && quartersData.length > 0) {
          setSelectedSeasons([quartersData[0].SeasonID]);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load data:", err);
        setError("Failed to load organizational hierarchy or quarters");
      })
      .finally(() => {
        setLoadingHierarchy(false);
        setLoadingQuarters(false);
      });
  }, []);

  // Handle report type change
  useEffect(() => {
    const requiredSeasons = getRequiredSeasonCount();
    
    // Auto-select consecutive quarters based on report type
    if (availableQuarters.length > 0 && selectedSeasons.length === 0) {
      const seasons = availableQuarters.slice(0, requiredSeasons).map(q => q.SeasonID);
      setSelectedSeasons(seasons);
    } else if (selectedSeasons.length !== requiredSeasons) {
      // Adjust selection when report type changes
      const seasons = availableQuarters.slice(0, requiredSeasons).map(q => q.SeasonID);
      setSelectedSeasons(seasons);
    }
    
    // Clear previous report data
    setReport(null);
  }, [reportType]);

  // Get required number of seasons based on report type
  const getRequiredSeasonCount = () => {
    switch (reportType) {
      case "single":
        return 1;
      case "compare-2":
        return 2;
      case "compare-3":
        return 3;
      case "compare-4":
        return 4;
      default:
        return 1;
    }
  };

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
    { id: 0, name: "Hospital (All Units)", name_ar: "المستشفى" },
    { id: 1, name: "Idara (Administration)", name_ar: "إدارة" },
    { id: 2, name: "Dayra (Department)", name_ar: "دائرة" },
    { id: 3, name: "Qism (Section)", name_ar: "قسم" },
  ];

  // Get org units based on selected type
  const getOrgUnits = () => {
    if (!hierarchy || selectedOrgUnitType === 0) {
      // Hospital level - return hospital as the only option
      return [{ id: 1, name: "King Abdulaziz Hospital", name_en: "King Abdulaziz Hospital" }];
    }

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

  // Generate/Export report based on type
  const handleGenerateReport = async () => {
    if (selectedSeasons.length === 0 || selectedOrgUnit === null) {
      setError("Please select seasons and organizational unit");
      return;
    }

    const requiredSeasons = getRequiredSeasonCount();
    if (selectedSeasons.length < requiredSeasons) {
      setError(`Please select ${requiredSeasons} season(s) for this report type`);
      return;
    }

    setGeneratingReport(true);
    setError(null);

    try {
      let result;
      
      if (reportType === "single") {
        // Single seasonal report
        const selectedQuarter = availableQuarters.find(q => q.SeasonID === selectedSeasons[0]);
        const startDate = new Date(selectedQuarter.StartDate);
        
        const params = {
          report_type: "seasonal",
          file_format: reportFormat,
          year: startDate.getFullYear(),
          quarter: Math.ceil((startDate.getMonth() + 1) / 3),
          language: "ar",
          filters: {
            season_id: selectedSeasons[0],
            orgunit_id: selectedOrgUnit,
            orgunit_type: selectedOrgUnitType
          },
          display_mode: null
        };
        
        result = await exportSingleSeasonalReport(params);
      } else {
        // Comparison reports
        const params = {
          season_ids: selectedSeasons,
          orgunit_id: selectedOrgUnit,
          orgunit_type: selectedOrgUnitType,
          format: reportFormat
        };
        
        switch (reportType) {
          case "compare-2":
            result = await generate2QuarterComparison(params);
            break;
          case "compare-3":
            result = await generate3QuarterComparison(params);
            break;
          case "compare-4":
            result = await generate4QuarterComparison(params);
            break;
          default:
            throw new Error("Invalid report type");
        }
      }

      // Handle response based on format
      if (reportFormat === "docx") {
        // Download DOCX file
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Extract filename from Content-Disposition header
        const contentDisposition = result.contentDisposition;
        let filename = "report.docx";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1].replace(/"/g, '');
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setReport({ message: "Report downloaded successfully", format: "docx" });
      } else {
        // Display JSON data
        setReport(result);
      }
      
      console.log("✅ Report generated:", result);
    } catch (err) {
      console.error("❌ Error generating report:", err);
      setError(err.message || "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Get selected quarter names
  const getSelectedQuarterNames = () => {
    return selectedSeasons
      .map(seasonId => {
        const quarter = availableQuarters.find(q => q.SeasonID === seasonId);
        return quarter ? quarter.SeasonName : `Season ${seasonId}`;
      })
      .join(", ");
  };

  if (loadingHierarchy || loadingQuarters) {
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
          <Typography sx={{ ml: 2 }}>Loading data...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography level="h2" sx={{ mb: 3 }}>
          📊 Seasonal Reports & Comparisons
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Report Type Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              📈 Report Type
            </Typography>

            <FormControl>
              <RadioGroup
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReport(null);
                }}
              >
                <Sheet
                  sx={{
                    borderRadius: "sm",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Radio
                    value="single"
                    label="Seasonal Report (Current Quarter Only)"
                    slotProps={{
                      label: { sx: { fontWeight: "md" } },
                    }}
                  />
                  <Typography level="body-sm" sx={{ ml: 4, mt: 0.5, color: "text.secondary" }}>
                    Download report for selected quarter only
                  </Typography>
                </Sheet>

                <Divider sx={{ my: 2 }} />

                <Sheet
                  sx={{
                    borderRadius: "sm",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Radio
                    value="compare-2"
                    label="Compare with 1 Previous Quarter"
                    slotProps={{
                      label: { sx: { fontWeight: "md" } },
                    }}
                  />
                  <Typography level="body-sm" sx={{ ml: 4, mt: 0.5, color: "text.secondary" }}>
                    Side-by-side comparison: Current vs Previous
                  </Typography>
                </Sheet>

                <Sheet
                  sx={{
                    borderRadius: "sm",
                    p: 2,
                    mt: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Radio
                    value="compare-3"
                    label="Compare with 2 Previous Quarters"
                    slotProps={{
                      label: { sx: { fontWeight: "md" } },
                    }}
                  />
                  <Typography level="body-sm" sx={{ ml: 4, mt: 0.5, color: "text.secondary" }}>
                    Trend analysis across 3 consecutive quarters
                  </Typography>
                </Sheet>

                <Sheet
                  sx={{
                    borderRadius: "sm",
                    p: 2,
                    mt: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Radio
                    value="compare-4"
                    label="Compare with 3 Previous Quarters"
                    slotProps={{
                      label: { sx: { fontWeight: "md" } },
                    }}
                  />
                  <Typography level="body-sm" sx={{ ml: 4, mt: 0.5, color: "text.secondary" }}>
                    Full year comparison (4 quarters)
                  </Typography>
                </Sheet>
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2 }}>
              🔍 Select Parameters
            </Typography>

            <Stack spacing={3}>
              {/* Quarter Selection */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  {reportType === "single" ? "Select Quarter" : `Select ${getRequiredSeasonCount()} Quarters`}
                </Typography>
                <Typography level="body-xs" sx={{ mb: 1, color: "text.secondary" }}>
                  {reportType === "single" 
                    ? "Choose the quarter for the report"
                    : "Select consecutive quarters for comparison"}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {availableQuarters.slice(0, Math.max(getRequiredSeasonCount(), 6)).map((quarter, index) => {
                    const isSelected = selectedSeasons.includes(quarter.SeasonID);
                    const canSelect = reportType === "single" || selectedSeasons.length < getRequiredSeasonCount() || isSelected;
                    
                    return (
                      <Chip
                        key={quarter.SeasonID}
                        variant={isSelected ? "solid" : "outlined"}
                        color={isSelected ? "primary" : "neutral"}
                        onClick={() => {
                          if (reportType === "single") {
                            setSelectedSeasons([quarter.SeasonID]);
                          } else {
                            if (isSelected) {
                              setSelectedSeasons(selectedSeasons.filter(id => id !== quarter.SeasonID));
                            } else if (canSelect) {
                              setSelectedSeasons([...selectedSeasons, quarter.SeasonID]);
                            }
                          }
                          setReport(null);
                        }}
                        sx={{ cursor: canSelect ? "pointer" : "not-allowed", opacity: canSelect ? 1 : 0.5 }}
                      >
                        {quarter.SeasonName}
                      </Chip>
                    );
                  })}
                </Stack>
                
                {selectedSeasons.length > 0 && (
                  <Typography level="body-sm" sx={{ mt: 1, color: "success.500" }}>
                    ✓ Selected: {getSelectedQuarterNames()}
                  </Typography>
                )}
              </Box>

              {/* Org Unit Type Selector */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Organizational Level
                </Typography>
                <Select
                  value={selectedOrgUnitType}
                  onChange={(e, value) => {
                    setSelectedOrgUnitType(value);
                    if (value === 0) {
                      setSelectedOrgUnit(1); // Auto-select hospital
                    } else {
                      setSelectedOrgUnit(null);
                    }
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
              {selectedOrgUnitType !== 0 && (
                <Box>
                  <Typography level="title-sm" sx={{ mb: 1 }}>
                    Organizational Unit
                  </Typography>
                  <Select
                    placeholder="Select org unit..."
                    value={selectedOrgUnit}
                    onChange={(e, value) => {
                      setSelectedOrgUnit(value);
                      setReport(null);
                    }}
                    sx={{ width: "100%", maxWidth: 400 }}
                  >
                    {getOrgUnits().map((unit) => (
                      <Option key={unit.id} value={unit.id}>
                        {unit.name || unit.name_en}
                      </Option>
                    ))}
                  </Select>
                </Box>
              )}

              {/* Format Selection */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Export Format
                </Typography>
                <RadioGroup
                  orientation="horizontal"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <Radio value="docx" label="Word Document (DOCX)" />
                  <Radio value="json" label="JSON Preview" />
                </RadioGroup>
              </Box>

              {/* Generate Button */}
              <Box>
                <Button
                  onClick={handleGenerateReport}
                  loading={generatingReport}
                  disabled={
                    selectedSeasons.length === 0 ||
                    selectedOrgUnit === null ||
                    selectedSeasons.length < getRequiredSeasonCount()
                  }
                  size="lg"
                  sx={{ mt: 1 }}
                >
                  {generatingReport
                    ? "Generating..."
                    : reportFormat === "docx"
                    ? "📥 Download Report"
                    : "📊 Generate Report"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Report Preview (JSON only) */}
        {report && reportFormat === "json" && report.format !== "docx" && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography level="title-lg" sx={{ mb: 2 }}>
                📋 Report Preview
              </Typography>

              {report.report_type && (
                <Alert color="success" sx={{ mb: 2 }}>
                  ✅ Report generated successfully: {report.report_type}
                </Alert>
              )}

              <Box
                sx={{
                  backgroundColor: "background.level1",
                  p: 2,
                  borderRadius: "sm",
                  maxHeight: "600px",
                  overflow: "auto",
                }}
              >
                <pre style={{ margin: 0, fontSize: "12px" }}>
                  {JSON.stringify(report, null, 2)}
                </pre>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Success Message for DOCX */}
        {report && report.format === "docx" && (
          <Alert color="success" sx={{ mb: 3 }}>
            ✅ {report.message}
          </Alert>
        )}
      </Box>
    </MainLayout>
  );
};

export default SeasonalReportsPage;
