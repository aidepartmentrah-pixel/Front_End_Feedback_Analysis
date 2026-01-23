// src/pages/TrendMonitoringPage.js
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Box, Typography, Divider, Button, Card, CircularProgress, Select, Option, FormControl, FormLabel, RadioGroup, Radio, Input, IconButton, Chip, Accordion, AccordionSummary, AccordionDetails, Tabs, TabList, Tab, TabPanel, Skeleton } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MainLayout from "../components/common/MainLayout";
import DomainTrendChart from "../components/trendMonitoring/DomainTrendChart";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import CategoryTrendChart from "../components/trendMonitoring/CategoryTrendChart";
import CategoryTrendTable from "../components/trendMonitoring/CategoryTrendTable";
import { fetchTrendsByScope } from "../api/trends";
import { fetchDashboardHierarchy } from "../api/dashboard";
import { fetchReferenceData } from "../api/insertRecord";
import { fetchDistributionData, buildTimeWindow, isValidDateFormat, isValidSeasonFormat, isValidMonthFormat } from "../api/distribution";
import DistributionErrorBoundary from "../components/common/DistributionErrorBoundary";
import { useDebounce } from "../hooks/useDebounce";

// Lazy load chart components for better performance
const NoDataMessage = lazy(() => import("../components/distribution/NoDataMessage"));
const DistributionBarChart = lazy(() => import("../components/distribution/DistributionBarChart"));
const DistributionPieChart = lazy(() => import("../components/distribution/DistributionPieChart"));
const DistributionStackedBarChart = lazy(() => import("../components/distribution/DistributionStackedBarChart"));
const DistributionLineChart = lazy(() => import("../components/distribution/DistributionLineChart"));
const DistributionTableView = lazy(() => import("../components/distribution/DistributionTableView"));

const TrendMonitoringPage = () => {
  const navigate = useNavigate();
  
  // Scope selection
  const [scope, setScope] = useState("hospital");
  
  // Hierarchy state - copied from InvestigationPage
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  
  // Trends data
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reference data for category names
  const [referenceData, setReferenceData] = useState(null);

  // ============================
  // DISTRIBUTION ANALYSIS STATE
  // ============================
  const [dimension, setDimension] = useState("severity");
  const [timeMode, setTimeMode] = useState("single");
  const [timeWindowType, setTimeWindowType] = useState("year");
  const [yearValue, setYearValue] = useState(2025);
  const [seasonValue, setSeasonValue] = useState("2025-Q1");
  const [monthValue, setMonthValue] = useState("2025-06");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [multiWindows, setMultiWindows] = useState([
    { type: "year", value: 2024 },
    { type: "year", value: 2025 }
  ]);
  const [splitDate, setSplitDate] = useState("2024-06-01");
  const [distributionFilters, setDistributionFilters] = useState({});
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionError, setDistributionError] = useState(null);
  const [distributionData, setDistributionData] = useState(null);
  const [chartType, setChartType] = useState("bar");

  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(distributionFilters, 500);

  // ============================
  // LOAD HIERARCHY - copied from InvestigationPage
  // ============================
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ============================
  // LOAD REFERENCE DATA FOR CATEGORY NAMES
  // ============================
  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const refData = await fetchReferenceData();
        console.log("✅ Reference data loaded:", refData);
        
        // Fetch all categories from all domains
        const allCategories = [];
        if (refData.domains && Array.isArray(refData.domains)) {
          for (const domain of refData.domains) {
            try {
              const { fetchCategories } = await import("../api/insertRecord");
              const categories = await fetchCategories(domain.id);
              allCategories.push(...categories);
            } catch (err) {
              console.warn(`Could not load categories for domain ${domain.id}:`, err);
            }
          }
        }
        
        console.log("✅ All categories loaded:", allCategories);
        setReferenceData({
          ...refData,
          allCategories
        });
      } catch (error) {
        console.error("❌ Failed to load reference data:", error);
      }
    };
    
    loadAllCategories();
  }, []);

  // ============================
  // HELPER FUNCTIONS - copied from InvestigationPage
  // ============================
  const getDepartments = () => {
    if (!selectedAdmin || !hierarchy) {
      return [];
    }
    return hierarchy.Department?.[selectedAdmin] || [];
  };

  const getSections = () => {
    if (!selectedDept || !hierarchy) {
      return [];
    }
    return hierarchy.Section?.[selectedDept] || [];
  };

  const handleAdminChange = (event, newValue) => {
    setSelectedAdmin(newValue);
    setSelectedDept("");
    setSelectedSection("");
  };

  const handleDeptChange = (event, newValue) => {
    setSelectedDept(newValue);
    setSelectedSection("");
  };

  // ============================
  // FETCH TRENDS BY SCOPE
  // ============================
  useEffect(() => {
    console.log("🔄 Fetching trends for scope:", scope);
    setLoading(true);
    setError(null);

    // Build params with hierarchy IDs - copied from InvestigationPage
    const params = { scope };
    
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
      } else {
        setLoading(false);
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
      } else {
        setLoading(false);
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
      } else {
        setLoading(false);
        return; // Wait for section selection
      }
    }

    fetchTrendsByScope(params)
      .then((data) => {
        console.log("✅ Trends loaded successfully:", data);
        console.log("✅ Category trend data:", data.category);
        setTrendsData(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load trends:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection]);

  // ============================
  // DISTRIBUTION ANALYSIS FUNCTIONS
  // ============================
  
  /**
   * Build distribution request based on current state
   */
  const buildDistributionRequest = () => {
    const request = {
      dimension: dimension,
      time_mode: timeMode
    };

    if (timeMode === "single") {
      let windowValue;
      
      if (timeWindowType === "year") {
        windowValue = yearValue;
      } else if (timeWindowType === "season") {
        windowValue = seasonValue;
      } else if (timeWindowType === "month") {
        windowValue = monthValue;
      } else if (timeWindowType === "range") {
        windowValue = { from_date: rangeFrom, to_date: rangeTo };
      }
      
      request.time_window = buildTimeWindow(timeWindowType, windowValue);
    } else if (timeMode === "multi") {
      request.time_windows = multiWindows;
    } else if (timeMode === "binary_split") {
      request.split_date = splitDate;
    }

    if (Object.keys(distributionFilters).length > 0) {
      request.filters = distributionFilters;
    }

    return request;
  };

  /**
   * Validate distribution request before submission
   */
  const validateDistributionRequest = () => {
    if (!dimension) return "Please select a dimension";

    if (timeMode === "single") {
      if (!timeWindowType) return "Please select a time window type";
      
      if (timeWindowType === "year" && !yearValue) {
        return "Please enter a year";
      }
      if (timeWindowType === "season" && !isValidSeasonFormat(seasonValue)) {
        return "Invalid season format (should be YYYY-Q1 to YYYY-Q4)";
      }
      if (timeWindowType === "month" && !isValidMonthFormat(monthValue)) {
        return "Invalid month format (should be YYYY-MM)";
      }
      if (timeWindowType === "range") {
        if (!rangeFrom || !rangeTo) {
          return "Please select both from and to dates";
        }
        if (!isValidDateFormat(rangeFrom) || !isValidDateFormat(rangeTo)) {
          return "Invalid date format (should be YYYY-MM-DD)";
        }
      }
    } else if (timeMode === "multi") {
      if (!multiWindows || multiWindows.length < 2) {
        return "Please add at least 2 time periods";
      }
      for (const window of multiWindows) {
        if (!window.type || !window.value) {
          return "All time windows must have type and value";
        }
      }
    } else if (timeMode === "binary_split") {
      if (!splitDate) {
        return "Please select a split date";
      }
      if (!isValidDateFormat(splitDate)) {
        return "Invalid split date format (should be YYYY-MM-DD)";
      }
    }

    return null;
  };

  /**
   * Handle distribution analysis submission with request cancellation support
   */
  const handleAnalyzeDistribution = async () => {
    // Validate request
    const validationError = validateDistributionRequest();
    if (validationError) {
      setDistributionError(validationError);
      return;
    }

    setDistributionLoading(true);
    setDistributionError(null);
    
    // Create AbortController for request cancellation
    const abortController = new AbortController();
    
    try {
      const request = buildDistributionRequest();
      console.log("📤 Submitting distribution request:", request);
      
      const data = await fetchDistributionData(request, abortController.signal);
      console.log("✅ Distribution data received:", data);
      
      setDistributionData(data);
    } catch (err) {
      // Ignore cancelled requests
      if (err.message === "Request cancelled") {
        console.log("🚫 Request was cancelled");
        return;
      }
      
      console.error("❌ Distribution analysis failed:", err);
      setDistributionError(err.message || "Failed to fetch distribution data");
    } finally {
      setDistributionLoading(false);
    }
  };

  /**
   * Add a new time window to multi mode
   */
  const handleAddTimeWindow = () => {
    setMultiWindows([...multiWindows, { type: "year", value: 2025 }]);
  };

  /**
   * Remove a time window from multi mode
   */
  const handleRemoveTimeWindow = (index) => {
    if (multiWindows.length <= 2) {
      alert("You must have at least 2 time periods");
      return;
    }
    const newWindows = multiWindows.filter((_, i) => i !== index);
    setMultiWindows(newWindows);
  };

  /**
   * Update a specific time window
   */
  const handleUpdateTimeWindow = (index, field, value) => {
    const newWindows = [...multiWindows];
    newWindows[index][field] = value;
    setMultiWindows(newWindows);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ fontWeight: 600 }}
          >
            عودة إلى لوحة القيادة (Back to Dashboard)
          </Button>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            📊 مراقبة الاتجاهات (Trend Monitoring)
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            تتبع الاتجاهات الشهرية للحوادث لاكتشاف التدهور والتحسين المبكر
          </Typography>
        </Box>

        {/* Hierarchy Selection - copied from InvestigationPage */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Trend Monitoring Scope
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Scope Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>Scope Level</FormLabel>
              <Select
                value={scope}
                onChange={(e, newValue) => {
                  setScope(newValue);
                  setSelectedAdmin("");
                  setSelectedDept("");
                  setSelectedSection("");
                }}
                size="lg"
              >
                <Option value="hospital">🏥 Hospital</Option>
                <Option value="administration">📋 Administration</Option>
                <Option value="department">🏢 Department</Option>
                <Option value="section">📌 Section</Option>
              </Select>
            </FormControl>

            {/* Administration Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 Administration
              </FormLabel>
              <Select
                value={selectedAdmin}
                onChange={handleAdminChange}
                size="lg"
                disabled={loadingHierarchy || scope === "hospital"}
              >
                <Option value="">All Administrations</Option>
                {(hierarchy?.Administration || []).map((admin) => (
                  <Option key={admin.id} value={admin.id}>
                    {admin.nameAr} ({admin.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 Department
              </FormLabel>
              <Select
                value={selectedDept}
                onChange={handleDeptChange}
                size="lg"
                disabled={!selectedAdmin || loadingHierarchy}
              >
                <Option value="">All Departments</Option>
                {getDepartments().map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.nameAr} ({dept.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Section Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📌 Section
              </FormLabel>
              <Select
                value={selectedSection}
                onChange={(e, newValue) => setSelectedSection(newValue)}
                size="lg"
                disabled={!selectedDept || loadingHierarchy}
              >
                <Option value="">All Sections</Option>
                {getSections().map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.nameAr} ({section.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Display time range if data is loaded */}
        {trendsData?.time_range && (
          <Typography level="body-sm" sx={{ color: "#999", mb: 3 }}>
            📅 {trendsData.time_range.start} to {trendsData.time_range.end}
          </Typography>
        )}

        {/* Loading State */}
        {loading && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading trend data...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading trends: {error}
            </Typography>
          </Card>
        )}

        {/* Domain Trends Section */}
        {!loading && !error && trendsData?.domain && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
              🔬 Domain Trends (Clinical, Management, Relational)
            </Typography>
            <DomainTrendChart data={trendsData.domain} />
            <DomainTrendTable data={trendsData.domain} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Category Trends Section */}
        {!loading && !error && trendsData?.category && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
              📑 Category Trends
            </Typography>
            <CategoryTrendChart data={trendsData.category} referenceData={referenceData} />
            <CategoryTrendTable data={trendsData.category} referenceData={referenceData} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* ============================
            DISTRIBUTION ANALYSIS SECTION
            ============================ */}
        <Box sx={{ mb: 5 }}>
          <Typography level="h3" sx={{ mb: 3, color: "#764ba2", fontWeight: 700 }}>
            📊 Distribution Analysis (Operator)
          </Typography>
          
          <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
            {/* Dimension Selector */}
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ fontWeight: 600, mb: 1 }} id="dimension-label">
                Analysis Dimension
              </FormLabel>
              <Select
                value={dimension}
                onChange={(e, newValue) => setDimension(newValue)}
                size="lg"
                aria-labelledby="dimension-label"
                aria-label="Select dimension for distribution analysis"
              >
                <Option value="domain">Domain</Option>
                <Option value="category">Category</Option>
                <Option value="subcategory">Subcategory</Option>
                <Option value="classification">Classification</Option>
                <Option value="stage">Stage</Option>
                <Option value="severity">Severity</Option>
                <Option value="harm">Harm</Option>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Time Mode Selector */}
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ fontWeight: 600, mb: 2 }}>
                Time Analysis Mode
              </FormLabel>
              <Tabs
                value={timeMode}
                onChange={(e, newValue) => setTimeMode(newValue)}
                sx={{ bgcolor: "background.level1", borderRadius: "sm" }}
              >
                <TabList>
                  <Tab value="single">Single Period</Tab>
                  <Tab value="multi">Multiple Periods</Tab>
                  <Tab value="binary_split">Before/After Split</Tab>
                </TabList>
              </Tabs>
            </FormControl>

            {/* Single Period Mode */}
            {timeMode === "single" && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "background.level1", borderRadius: "md" }}>
                <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Time Period
                </Typography>
                
                <FormControl sx={{ mb: 2 }}>
                  <FormLabel>Period Type</FormLabel>
                  <RadioGroup
                    value={timeWindowType}
                    onChange={(e) => setTimeWindowType(e.target.value)}
                    sx={{ gap: 1 }}
                  >
                    <Radio value="year" label="Year" />
                    <Radio value="season" label="Season (Quarter)" />
                    <Radio value="month" label="Month" />
                    <Radio value="range" label="Date Range" />
                  </RadioGroup>
                </FormControl>

                {timeWindowType === "year" && (
                  <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input
                      type="number"
                      value={yearValue}
                      onChange={(e) => setYearValue(parseInt(e.target.value))}
                      slotProps={{ input: { min: 2020, max: 2030 } }}
                      size="lg"
                    />
                  </FormControl>
                )}

                {timeWindowType === "season" && (
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <FormControl>
                      <FormLabel>Year</FormLabel>
                      <Input
                        type="number"
                        value={parseInt(seasonValue.split("-")[0])}
                        onChange={(e) => {
                          const quarter = seasonValue.split("-")[1] || "Q1";
                          setSeasonValue(`${e.target.value}-${quarter}`);
                        }}
                        slotProps={{ input: { min: 2020, max: 2030 } }}
                        size="lg"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Quarter</FormLabel>
                      <Select
                        value={seasonValue.split("-")[1] || "Q1"}
                        onChange={(e, newValue) => {
                          const year = seasonValue.split("-")[0] || "2025";
                          setSeasonValue(`${year}-${newValue}`);
                        }}
                        size="lg"
                      >
                        <Option value="Q1">Q1 (Jan-Mar)</Option>
                        <Option value="Q2">Q2 (Apr-Jun)</Option>
                        <Option value="Q3">Q3 (Jul-Sep)</Option>
                        <Option value="Q4">Q4 (Oct-Dec)</Option>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {timeWindowType === "month" && (
                  <FormControl>
                    <FormLabel>Month (YYYY-MM)</FormLabel>
                    <Input
                      type="month"
                      value={monthValue}
                      onChange={(e) => setMonthValue(e.target.value)}
                      size="lg"
                    />
                  </FormControl>
                )}

                {timeWindowType === "range" && (
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <FormControl>
                      <FormLabel>From Date</FormLabel>
                      <Input
                        type="date"
                        value={rangeFrom}
                        onChange={(e) => setRangeFrom(e.target.value)}
                        size="lg"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>To Date</FormLabel>
                      <Input
                        type="date"
                        value={rangeTo}
                        onChange={(e) => setRangeTo(e.target.value)}
                        size="lg"
                      />
                    </FormControl>
                  </Box>
                )}
              </Box>
            )}

            {/* Multiple Periods Mode */}
            {timeMode === "multi" && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "background.level1", borderRadius: "md" }}>
                <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Multiple Time Periods (min: 2)
                </Typography>
                
                {multiWindows.map((window, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: "background.surface",
                      borderRadius: "sm",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip color="primary" size="sm">
                        Period {index + 1}
                      </Chip>
                      {multiWindows.length > 2 && (
                        <IconButton
                          size="sm"
                          color="danger"
                          onClick={() => handleRemoveTimeWindow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2 }}>
                      <FormControl>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={window.type}
                          onChange={(e, newValue) => handleUpdateTimeWindow(index, "type", newValue)}
                          size="md"
                        >
                          <Option value="year">Year</Option>
                          <Option value="season">Season</Option>
                          <Option value="month">Month</Option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Value</FormLabel>
                        {window.type === "year" && (
                          <Input
                            type="number"
                            value={window.value}
                            onChange={(e) => handleUpdateTimeWindow(index, "value", parseInt(e.target.value))}
                            slotProps={{ input: { min: 2020, max: 2030 } }}
                            size="md"
                          />
                        )}
                        {window.type === "season" && (
                          <Input
                            placeholder="e.g., 2025-Q1"
                            value={window.value}
                            onChange={(e) => handleUpdateTimeWindow(index, "value", e.target.value)}
                            size="md"
                          />
                        )}
                        {window.type === "month" && (
                          <Input
                            type="month"
                            value={window.value}
                            onChange={(e) => handleUpdateTimeWindow(index, "value", e.target.value)}
                            size="md"
                          />
                        )}
                      </FormControl>
                    </Box>
                  </Box>
                ))}

                <Button
                  startDecorator={<AddIcon />}
                  onClick={handleAddTimeWindow}
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  Add Another Period
                </Button>
              </Box>
            )}

            {/* Binary Split Mode */}
            {timeMode === "binary_split" && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "background.level1", borderRadius: "md" }}>
                <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Split Date (Before/After Analysis)
                </Typography>
                
                <FormControl>
                  <FormLabel>Split Date</FormLabel>
                  <Input
                    type="date"
                    value={splitDate}
                    onChange={(e) => setSplitDate(e.target.value)}
                    size="lg"
                  />
                  <Typography level="body-sm" sx={{ mt: 1, color: "text.secondary" }}>
                    Data will be split into "Before" and "After" this date
                  </Typography>
                </FormControl>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Optional Filters */}
            <Accordion>
              <AccordionSummary indicator={<ExpandMoreIcon />}>
                <Typography level="title-md" sx={{ fontWeight: 600 }}>
                  🔍 Optional Filters
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <FormControl>
                    <FormLabel>Department ID</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 42"
                      value={distributionFilters.department_id || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDistributionFilters({
                          ...distributionFilters,
                          department_id: value ? parseInt(value) : undefined
                        });
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Severity Filter</FormLabel>
                    <Select
                      placeholder="Select severity..."
                      value={distributionFilters.severity || ""}
                      onChange={(e, newValue) => {
                        setDistributionFilters({
                          ...distributionFilters,
                          severity: newValue || undefined
                        });
                      }}
                    >
                      <Option value="">All</Option>
                      <Option value="High">High</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="Low">Low</Option>
                    </Select>
                  </FormControl>
                </Box>

                <Button
                  variant="soft"
                  color="neutral"
                  size="sm"
                  onClick={() => setDistributionFilters({})}
                  sx={{ mt: 2 }}
                >
                  Clear All Filters
                </Button>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Submit Button */}
            <Button
              size="lg"
              fullWidth
              onClick={handleAnalyzeDistribution}
              loading={distributionLoading}
              disabled={distributionLoading || !dimension}
              aria-label="Analyze distribution data"
              aria-busy={distributionLoading}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontWeight: 700,
              }}
            >
              {distributionLoading ? "Analyzing..." : "📊 Analyze Distribution"}
            </Button>

              <Card sx={{ mt: 2, p: 2, bgcolor: "danger.softBg" }} role="alert">
                <Typography color="danger">
                  ❌ {distributionError}
                </Typography>
                <Button
                  variant="soft"
                  color="danger"
                  size="sm"
                  onClick={handleAnalyzeDistribution}
                  sx={{ mt: 1 }}
                  aria-label="Retry distribution analysis"
                >
                  Retry
                </Button>
              </Card>
            )}
          </Card>

          {/* Distribution Results Display with Loading Skeleton */}
          {distributionLoading && (
            <Box sx={{ mt: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 'sm' }} />
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 'sm' }} />
              <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
              <Skeleton variant="text" width="40%" />
            </Box>
          )}

          {distributionData && !distributionLoading && (
            <Box sx={{ mt: 3 }}>
              {/* Check if all buckets have NO_DATA status */}
              {distributionData.buckets && distributionData.buckets.every(b => b.status === 'NO_DATA') ? (
                <Suspense fallback={<CircularProgress />}>
                  <NoDataMessage timeLabel={distributionData.buckets[0]?.time_label || 'selected period'} />
                </Suspense>
              ) : (
                <>
                  {/* Chart Type Selector */}
                  <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }} id="chart-type-label">
                      📊 Visualization Type
                    </Typography>
                    <Tabs
                      value={chartType}
                      onChange={(e, newValue) => setChartType(newValue)}
                      sx={{ bgcolor: "background.level1", borderRadius: "sm" }}
                      aria-labelledby="chart-type-label"
                    >
                      <TabList>
                        {distributionData.time_mode === 'single' && (
                          <>
                            <Tab value="bar" aria-label="Bar chart visualization">Bar Chart</Tab>
                            <Tab value="pie" aria-label="Pie chart visualization">Pie Chart</Tab>
                          </>
                        )}
                        {distributionData.time_mode !== 'single' && (
                          <>
                            <Tab value="stacked" aria-label="Stacked bar chart visualization">Stacked Bar</Tab>
                            <Tab value="line" aria-label="Line chart visualization">Line Chart</Tab>
                          </>
                        )}
                        <Tab value="table" aria-label="Table view visualization">Table View</Tab>
                      </TabList>
                    </Tabs>
                  </Card>

                  {/* Chart Rendering with Error Boundary and Suspense */}
                  <DistributionErrorBoundary>
                    <Suspense fallback={
                      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                        <CircularProgress size="lg" />
                        <Typography level="body-sm" sx={{ mt: 2 }}>
                          Loading chart...
                        </Typography>
                      </Box>
                    }>
                      <Box
                        component="figure"
                        role="img"
                        aria-label={`Distribution of ${dimension} for ${distributionData.buckets[0]?.time_label || 'selected period'}`}
                        sx={{ m: 0 }}
                      >
                        {chartType === 'bar' && distributionData.time_mode === 'single' && (
                          <DistributionBarChart bucket={distributionData.buckets[0]} />
                        )}

                        {chartType === 'pie' && distributionData.time_mode === 'single' && (
                          <DistributionPieChart bucket={distributionData.buckets[0]} />
                        )}

                        {chartType === 'stacked' && distributionData.time_mode !== 'single' && (
                          <DistributionStackedBarChart buckets={distributionData.buckets} />
                        )}

                        {chartType === 'line' && distributionData.time_mode !== 'single' && (
                          <DistributionLineChart buckets={distributionData.buckets} />
                        )}

                        {chartType === 'table' && (
                          <DistributionTableView buckets={distributionData.buckets} />
                        )}
                        
                        <Typography
                          level="body-sm"
                          component="figcaption"
                          sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}
                        >
                          Showing {distributionData.buckets.reduce((sum, b) => sum + b.total, 0)} total incidents
                          distributed across {distributionData.buckets.length} time period(s)
                        </Typography>
                      </Box>
                    </Suspense>
                  </DistributionErrorBoundary>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
