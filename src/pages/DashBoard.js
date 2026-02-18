// src/pages/DashboardPage.js
import React, { useEffect, useState, useRef } from "react";
import { fetchDashboardHierarchy, fetchDashboardStats, fetchDashboardDateBounds } from "../api/dashboard";
import { indexToDate, clampIndex } from "../utils/dateSliderMapping";
import { hasFullOperationalAccess } from "../utils/roleGuards";
import { useAuth } from "../context/AuthContext";
import theme from '../theme';

import { Box, Card, Typography, Select, Option, FormControl, FormLabel, Slider } from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Components
import MainLayout from "../components/common/MainLayout";
import DashboardTitle from "../components/dashboard/DashboardTitle";
import GlobalDashboardStats from "../components/dashboard/GlobalDashboardStats";
import IdaraDashboardStats from "../components/dashboard/IdaraDashboardStats";
import DayraDashboardStats from "../components/dashboard/DayraDashboardStats";
import QismDashboardStats from "../components/dashboard/QismDashboardStats";
import DashboardActions from "../components/dashboard/DashboardActions";

const DashboardPage = () => {
  // Auth context
  const { user } = useAuth();
  
// ============================
  // STATE
  // ============================
  const [scope, setScope] = useState("hospital");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);
  
  const [boundsLoading, setBoundsLoading] = useState(false);
  
  // Date range for stats (defaults to last 30 days)
  const [dateRange, setDateRange] = useState({
    start_date: null, // Will default to 30 days ago on backend
    end_date: null,   // Will default to today on backend
  });

  // Date bounds from backend (for slider range)
  const [dateBounds, setDateBounds] = useState({
    minDate: null,
    maxDate: null,
    totalDays: null
  });

  // Slider value (local state, no binding yet)
  const [sliderValue, setSliderValue] = useState([0, 0]);

  // Debounce timer ref for slider updates
  const debounceTimerRef = useRef(null);

  // Chart mode selections
  const [chartModes, setChartModes] = useState({
    classification_mode: "top5", // top5, bottom5, all, byDomain
    stage_mode: "histogram",     // histogram, bySeverity, byDomain, byStatus
    department_mode: "issuing"   // issuing, responsible, patient, caseManager
  });

  // Chart visualization types
  const [chartTypes, setChartTypes] = useState({
    classification: "bar",  // bar, pie, donut, line
    stage: "bar",           // bar, pie, donut, line
    department: "bar"       // bar, pie, donut, line
  });


// Fetch hierarchy on mount - copied from InvestigationPage
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ============================
  // FETCH DASHBOARD DATE BOUNDS
  // ============================
  useEffect(() => {
    // Build params based on current scope (same logic as stats fetch)
    const params = {
      scope,
    };

    // Add IDs based on scope
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
      } else {
        // Reset bounds if waiting for selection
        setDateBounds({
          minDate: null,
          maxDate: null,
          totalDays: null
        });
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
      } else {
        // Reset bounds if waiting for selection
        setDateBounds({
          minDate: null,
          maxDate: null,
          totalDays: null
        });
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
      } else {
        // Reset bounds if waiting for selection
        setDateBounds({
          minDate: null,
          maxDate: null,
          totalDays: null
        });
        return; // Wait for section selection
      }
    }

    console.log("🔄 Fetching dashboard date bounds with params:", params);
    setBoundsLoading(true);

    fetchDashboardDateBounds(params)
      .then((data) => {
        console.log("✅ Dashboard date bounds loaded successfully:", data);
        
        // Compute totalDays if both dates are present
        const totalDays = computeTotalDays(data.min_date, data.max_date);
        
        // Update dateBounds state
        setDateBounds({
          minDate: data.min_date,
          maxDate: data.max_date,
          totalDays: totalDays
        });
      })
      .catch((error) => {
        console.error("❌ Failed to load dashboard date bounds:", error);
        console.error("❌ Error details - Scope:", scope, "Selected:", {
          administration: selectedAdmin,
          department: selectedDept,
          section: selectedSection
        });
        
        // Reset bounds on error
        setDateBounds({
          minDate: null,
          maxDate: null,
          totalDays: null
        });
      })
      .finally(() => setBoundsLoading(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection]);

  // ============================
  // SYNC SLIDER VALUE WITH BOUNDS (Guard: bounds change reset)
  // ============================
  useEffect(() => {
    if (dateBounds.totalDays !== null) {
      setSliderValue([0, dateBounds.totalDays]);
    }
  }, [dateBounds.totalDays]);

  // ============================
  // CLEANUP DEBOUNCE TIMER ON UNMOUNT
  // ============================
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ============================
  // FETCH DASHBOARD STATS
  // ============================
  useEffect(() => {
    // Build params based on current scope
    const params = {
      scope,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      // Add chart modes
      classification_mode: chartModes.classification_mode,
      stage_mode: chartModes.stage_mode,
      department_mode: chartModes.department_mode,
    };

    // Add IDs based on scope - using IDs directly like InvestigationPage
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
        console.log("📍 Selected Administration ID:", params.administration_id);
      } else {
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
        console.log("📍 Selected Department ID:", params.department_id);
      } else {
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
        console.log("📍 Selected Section ID:", params.section_id);
      } else {
        return; // Wait for section selection
      }
    }

    console.log("🔄 Fetching dashboard stats with params:", params);
    setLoadingStats(true);
    setStatsError(null);

    fetchDashboardStats(params)
      .then((data) => {
        console.log("✅ Dashboard stats loaded successfully:", data);
        setDashboardStats(data);
      })
      .catch((error) => {
        console.error("❌ Failed to load dashboard stats:", error);
        console.error("❌ Error details - Scope:", scope, "Selected:", {
          administration: selectedAdmin,
          department: selectedDept,
          section: selectedSection
        });
        setStatsError(error.message);
      })
      .finally(() => setLoadingStats(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection, dateRange, chartModes]);

  // ============================
  // HELPER FUNCTIONS - copied from InvestigationPage
  // ============================
  // Compute total days between date bounds
  const computeTotalDays = (minDate, maxDate) => {
    if (!minDate || !maxDate) {
      return null;
    }
    
    try {
      const min = new Date(minDate);
      const max = new Date(maxDate);
      
      // Check for invalid dates
      if (isNaN(min.getTime()) || isNaN(max.getTime())) {
        return null;
      }
      
      // Calculate difference in milliseconds and convert to days
      const diffMs = max - min;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 ? diffDays : null;
    } catch (error) {
      console.error("Error computing total days:", error);
      return null;
    }
  };

  // Department options (filtered by selected administration)
  const getDepartments = () => {
    if (!selectedAdmin || !hierarchy) {
      return [];
    }
    return hierarchy.Department?.[selectedAdmin] || [];
  };

  // Section options (filtered by selected department)
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
  // SLIDER CHANGE HANDLER (with UX Guards)
  // ============================
  const handleSliderChange = (event, newValue) => {
    // Guard 1: Bounds presence
    if (!dateBounds.minDate || !dateBounds.maxDate || dateBounds.totalDays === null) {
      return;
    }

    // Guard 2: Loading state
    if (boundsLoading) {
      return;
    }

    // Guard 3: Validate newValue is array with two elements
    if (!Array.isArray(newValue) || newValue.length !== 2) {
      return;
    }

    let [minIndex, maxIndex] = newValue;

    // Guard 4: Clamp indices to valid range
    minIndex = clampIndex(minIndex, 0, dateBounds.totalDays);
    maxIndex = clampIndex(maxIndex, 0, dateBounds.totalDays);

    // Guard 5: Order safety - ensure minIndex <= maxIndex
    if (minIndex > maxIndex) {
      // Auto-correct by swapping
      [minIndex, maxIndex] = [maxIndex, minIndex];
    }

    const clampedValue = [minIndex, maxIndex];

    // Update local slider state immediately (no debounce for UI responsiveness)
    setSliderValue(clampedValue);

    // Convert indices to dates
    const start_date = indexToDate(minIndex, dateBounds.minDate);
    const end_date = indexToDate(maxIndex, dateBounds.minDate);

    // Guard 6: Ensure conversion succeeded
    if (!start_date || !end_date) {
      return;
    }

    // Guard 7: Debounce dateRange update to prevent excessive refetches
    // Clear any pending timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced update
    debounceTimerRef.current = setTimeout(() => {
      setDateRange({
        start_date,
        end_date
      });
    }, 250); // 250ms debounce delay
  };

  // ============================
  // VIEW FLAGS
  // ============================
  const isGlobalView = scope === "hospital";
  const isIdaraView = scope === "administration" && selectedAdmin;
  const isDayraView = scope === "department" && selectedDept;
  const isQismView = scope === "section" && selectedSection;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Loading states */}
        {loadingHierarchy && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
            <Typography>Loading department hierarchy...</Typography>
          </Card>
        )}

        {loadingStats && !loadingHierarchy && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
            <Typography>Loading dashboard statistics...</Typography>
          </Card>
        )}

        {statsError && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center", bgcolor: "danger.softBg" }}>
            <Typography color="danger">Error loading stats: {statsError}</Typography>
          </Card>
        )}

        {/* Hierarchy Selection - copied from InvestigationPage */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Dashboard Scope
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
              <FormLabel sx={{ fontWeight: 600 }}>Dashboard Level</FormLabel>
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

          {/* Date Range Slider */}
          {dateBounds.totalDays !== null && (
            <Box sx={{ mt: 4, px: 2 }}>
              <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
                Date Range
              </Typography>
              <Slider
                value={sliderValue}
                onChange={handleSliderChange}
                min={0}
                max={dateBounds.totalDays}
                valueLabelDisplay="auto"
                valueLabelFormat={(index) => {
                  if (!dateBounds.minDate) return '';
                  return indexToDate(index, dateBounds.minDate);
                }}
                disabled={boundsLoading}
                sx={{
                  width: '100%',
                  '& .MuiSlider-track': {
                    height: 4,
                    backgroundColor: theme.colors.primary,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: theme.colors.primary,
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 0.5,
                }}
              >
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {dateBounds.minDate}
                </Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {dateBounds.maxDate}
                </Typography>
              </Box>
            </Box>
          )}
        </Card>

        {/* Dashboard Title */}
        <DashboardTitle
          scope={scope}
          selectedAdministration={selectedAdmin ? hierarchy?.Administration?.find(a => a.id === selectedAdmin) : null}
          selectedDepartment={selectedDept ? getDepartments().find(d => d.id === selectedDept) : null}
          selectedSection={selectedSection ? getSections().find(s => s.id === selectedSection) : null}
          hierarchy={hierarchy}
        />

        {/* Conditional Dashboard Views */}
        {isGlobalView && <GlobalDashboardStats stats={dashboardStats} loading={loadingStats} chartModes={chartModes} setChartModes={setChartModes} chartTypes={chartTypes} setChartTypes={setChartTypes} />}
        {isIdaraView && <IdaraDashboardStats idara={hierarchy?.Administration?.find(a => a.id === selectedAdmin)} stats={dashboardStats} loading={loadingStats} />}
        {isDayraView && <DayraDashboardStats dayra={getDepartments().find(d => d.id === selectedDept)} stats={dashboardStats} loading={loadingStats} />}
        {isQismView && <QismDashboardStats qism={getSections().find(s => s.id === selectedSection)} stats={dashboardStats} loading={loadingStats} />}

        {/* Dashboard Actions - Hidden for limited admins (3 monkeys) */}
        {hasFullOperationalAccess(user) && (
          <Box sx={{ mt: 3 }}>
            <DashboardActions />
          </Box>
        )}

        {/* Trend Monitoring Link */}
        <Box sx={{ mt: 3 }}>
          <Card
            sx={{
              p: 2.5,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.2)",
              },
            }}
            onClick={() => window.location.href = "/trend-monitoring"}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography level="h5" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 0.5 }}>
                  📊 عرض تحليل الاتجاهات (View Trend Analysis)
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  تتبع الاتجاهات الشهرية لاكتشاف أنماط التدهور والتحسين
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: "32px", color: theme.colors.primary }} />
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
