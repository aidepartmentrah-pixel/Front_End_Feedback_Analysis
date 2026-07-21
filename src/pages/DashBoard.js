// src/pages/DashboardPage.js
import React, { useEffect, useState, useRef, useMemo } from "react";
import { fetchDashboardHierarchy, fetchDashboardStats, fetchDashboardDateBounds, fetchOperationalSummary } from "../api/dashboard";
import { indexToDate, dateToIndex, clampIndex } from "../utils/dateSliderMapping";
import { hasFullOperationalAccess } from "../utils/roleGuards";
import { useAuth } from "../context/AuthContext";
import theme from '../theme';

import { Box, Card, Typography, Select, Option, FormControl, FormLabel, Slider, Input } from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Components
import MainLayout from "../components/common/MainLayout";
import DashboardTitle from "../components/dashboard/DashboardTitle";
import GlobalDashboardStats from "../components/dashboard/GlobalDashboardStats";
import IdaraDashboardStats from "../components/dashboard/IdaraDashboardStats";
import DayraDashboardStats from "../components/dashboard/DayraDashboardStats";
import QismDashboardStats from "../components/dashboard/QismDashboardStats";
import DashboardActions from "../components/dashboard/DashboardActions";
import LatestPublicationBatches from "../components/dashboard/LatestPublicationBatches";
import OrgUnitSearchSelect from "../components/dashboard/OrgUnitSearchSelect";

const SCOPE_OPTION_LABELS = {
  hospital: "🏥 المستشفى",
  administration: "📋 الإدارة",
  department: "🏢 الدائرة",
  section: "📌 القسم",
};

const DashboardPage = () => {
  // Auth context
  const { user } = useAuth();

  // Limited-admin roles are locked to their own org subtree: they can never
  // reach "hospital" scope or another administration/department/section.
  const roleCode = user?.scopes?.[0]?.role_code;
  const isSectionAdmin = roleCode === "SECTION_ADMIN";
  const isDepartmentAdmin = roleCode === "DEPARTMENT_ADMIN";
  const isAdministrationAdmin = roleCode === "ADMINISTRATION_ADMIN";
  const isLimitedAdmin = isSectionAdmin || isDepartmentAdmin || isAdministrationAdmin;

  const allowedScopeOptions = isDepartmentAdmin
    ? ["department", "section"]
    : isAdministrationAdmin
    ? ["administration", "department", "section"]
    : ["hospital", "administration", "department", "section"];

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

  const [operationalSummary, setOperationalSummary] = useState(null);
  
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

  // Guard: auto-scope only fires once per session
  const autoScopeApplied = useRef(false);

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
  // AUTO-SCOPE: set scope to user's own org level on first load
  // SECTION_ADMIN  → section scope  (their section pre-selected)
  // DEPARTMENT_ADMIN → department scope (their dept pre-selected)
  // ADMINISTRATION_ADMIN → administration scope (their admin pre-selected)
  // Others (COMPLAINT_SUPERVISOR, SOFTWARE_ADMIN) → stay at hospital default
  // ============================
  useEffect(() => {
    if (!user || !hierarchy || autoScopeApplied.current) return;

    const roleCode  = user.scopes?.[0]?.role_code;
    const orgUnitId = user.scopes?.[0]?.org_unit_id;
    if (!roleCode || !orgUnitId) return;

    if (roleCode === "SECTION_ADMIN") {
      // Walk hierarchy: Section map is { deptId: [{ id, nameAr, nameEn }] }
      let foundDept = null;
      let foundAdmin = null;

      for (const [deptId, sections] of Object.entries(hierarchy.Section || {})) {
        if (sections.some(s => s.id === orgUnitId)) {
          foundDept = Number(deptId);
          break;
        }
      }
      if (foundDept) {
        for (const [adminId, depts] of Object.entries(hierarchy.Department || {})) {
          if (depts.some(d => d.id === foundDept)) {
            foundAdmin = Number(adminId);
            break;
          }
        }
      }
      if (foundAdmin && foundDept) {
        setScope("section");
        setSelectedAdmin(foundAdmin);
        setSelectedDept(foundDept);
        setSelectedSection(orgUnitId);
        autoScopeApplied.current = true;
      }

    } else if (roleCode === "DEPARTMENT_ADMIN") {
      let foundAdmin = null;
      for (const [adminId, depts] of Object.entries(hierarchy.Department || {})) {
        if (depts.some(d => d.id === orgUnitId)) {
          foundAdmin = Number(adminId);
          break;
        }
      }
      if (foundAdmin) {
        setScope("department");
        setSelectedAdmin(foundAdmin);
        setSelectedDept(orgUnitId);
        autoScopeApplied.current = true;
      }

    } else if (roleCode === "ADMINISTRATION_ADMIN") {
      setScope("administration");
      setSelectedAdmin(orgUnitId);
      autoScopeApplied.current = true;
    }
    // COMPLAINT_SUPERVISOR / SOFTWARE_ADMIN: hospital default, no change
  }, [user, hierarchy]);

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
  // SYNC SLIDER VALUE AND DATE RANGE WITH BOUNDS (Guard: bounds change reset)
  // ============================
  useEffect(() => {
    if (dateBounds.totalDays !== null && dateBounds.minDate && dateBounds.maxDate) {
      setSliderValue([0, dateBounds.totalDays]);
      // CRITICAL: Also initialize dateRange to the actual data bounds
      // This ensures stats are fetched for the correct date range
      setDateRange({
        start_date: dateBounds.minDate,
        end_date: dateBounds.maxDate
      });
    }
  }, [dateBounds.totalDays, dateBounds.minDate, dateBounds.maxDate]);

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
    // Guard: Wait for dateRange to be initialized from bounds
    // This prevents fetching with null dates which would default to today-30
    if (!dateRange.start_date || !dateRange.end_date) {
      console.log("⏳ Waiting for dateRange to be initialized from bounds...");
      return;
    }

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
  // FETCH OPERATIONAL SUMMARY (HCAT Performance & Delay Monitoring - Session 2)
  // ============================
  useEffect(() => {
    // Build params based on current scope (same scope-resolution as dashboard stats)
    const params = { scope };

    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
      } else {
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
      } else {
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
      } else {
        return; // Wait for section selection
      }
    }

    fetchOperationalSummary(params)
      .then((data) => setOperationalSummary(data))
      .catch((error) => {
        console.error("❌ Failed to load operational summary:", error);
        setOperationalSummary(null);
      });
  }, [scope, selectedAdmin, selectedDept, selectedSection]);

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

  // Flat, searchable lists for the "jump straight in" picker mode. Built
  // from the same hierarchy payload as the cascading selects, so they're
  // automatically bounded to whatever subtree the current user's role
  // already restricts them to - no separate API call needed.
  const flatDepartments = useMemo(() => {
    if (!hierarchy) return [];
    const adminNameById = Object.fromEntries((hierarchy.Administration || []).map((a) => [a.id, a.nameAr]));
    return Object.entries(hierarchy.Department || {}).flatMap(([adminId, depts]) =>
      depts.map((d) => {
        const adminName = adminNameById[Number(adminId)] || "";
        return { ...d, adminId: Number(adminId), adminName, parentLabel: adminName };
      })
    );
  }, [hierarchy]);

  const flatSections = useMemo(() => {
    if (!hierarchy) return [];
    const deptById = Object.fromEntries(flatDepartments.map((d) => [d.id, d]));
    return Object.entries(hierarchy.Section || {}).flatMap(([deptId, sections]) =>
      sections.map((s) => {
        const dept = deptById[Number(deptId)];
        return {
          ...s,
          deptId: Number(deptId),
          adminId: dept?.adminId,
          adminName: dept?.adminName || "",
          parentLabel: dept ? `${dept.nameAr}${dept.adminName ? ` / ${dept.adminName}` : ""}` : "",
        };
      })
    );
  }, [hierarchy, flatDepartments]);

  // Narrow the searchable lists to the currently selected parent, if any -
  // this is what makes selecting an Administration filter the Department
  // list, and selecting a Department filter the Section list. When no
  // parent is selected yet, the full (role-bounded) list is searchable
  // directly, and picking a result auto-fills its parent(s).
  const scopedDepartments = useMemo(() => {
    if (!selectedAdmin) return flatDepartments;
    return flatDepartments.filter((d) => d.adminId === selectedAdmin);
  }, [flatDepartments, selectedAdmin]);

  const scopedSections = useMemo(() => {
    if (selectedDept) return flatSections.filter((s) => s.deptId === selectedDept);
    if (selectedAdmin) return flatSections.filter((s) => s.adminId === selectedAdmin);
    return flatSections;
  }, [flatSections, selectedAdmin, selectedDept]);

  // All four slots (View Level, Administration, Department, Section) always
  // render - never mounted/unmounted - so the layout never shifts as the
  // View Level changes. A slot that isn't applicable yet is disabled with a
  // "-" placeholder; a slot a role has permanently fixed (own administration
  // / own department) is disabled but shows its real value, since
  // selectedAdmin/selectedDept are already populated for that role via the
  // auto-scope effect. Section Admin is handled separately (no grid at all).
  const adminFieldDisabled = isLimitedAdmin || scope === "hospital";
  const deptFieldDisabled = isDepartmentAdmin || (scope !== "department" && scope !== "section");
  const sectionFieldDisabled = scope !== "section";

  const adminPlaceholder = adminFieldDisabled ? "—" : "ابحث عن إدارة أو اختر من القائمة...";
  const deptPlaceholder = deptFieldDisabled ? "—" : "ابحث عن دائرة أو اختر من القائمة...";
  const sectionPlaceholder = sectionFieldDisabled ? "—" : "ابحث عن قسم أو اختر من القائمة...";

  const handleAdminSelect = (adminId) => {
    setSelectedAdmin(adminId);
    setSelectedDept("");
    setSelectedSection("");
  };

  const handleDeptSelect = (deptId) => {
    const dept = flatDepartments.find((d) => d.id === deptId);
    setSelectedAdmin(dept?.adminId ?? "");
    setSelectedDept(deptId);
    setSelectedSection("");
  };

  const handleSectionSelect = (sectionId) => {
    const section = flatSections.find((s) => s.id === sectionId);
    setSelectedAdmin(section?.adminId ?? "");
    setSelectedDept(section?.deptId ?? "");
    setSelectedSection(sectionId);
  };

  // Limited admins have a fixed Administration (and, for Department Admin,
  // a fixed Department too) - switching scope levels must never clear those,
  // only the deeper selection(s) that actually depend on the new scope.
  const handleScopeChange = (event, newValue) => {
    setScope(newValue);
    if (isDepartmentAdmin) {
      setSelectedSection("");
    } else if (isAdministrationAdmin) {
      setSelectedDept("");
      setSelectedSection("");
    } else {
      setSelectedAdmin("");
      setSelectedDept("");
      setSelectedSection("");
    }
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
  // FROM / TO DATE INPUT HANDLER (keeps slider in sync)
  // ============================
  const handleDateInputChange = (field, value) => {
    if (!value || !dateBounds.minDate || !dateBounds.maxDate) {
      return;
    }

    // Clamp typed date to the available bounds
    let clamped = value;
    if (clamped < dateBounds.minDate) clamped = dateBounds.minDate;
    if (clamped > dateBounds.maxDate) clamped = dateBounds.maxDate;

    const newRange = { ...dateRange, [field]: clamped };

    // Keep start <= end
    if (field === "start_date" && newRange.end_date && clamped > newRange.end_date) {
      newRange.end_date = clamped;
    }
    if (field === "end_date" && newRange.start_date && clamped < newRange.start_date) {
      newRange.start_date = clamped;
    }

    setDateRange(newRange);

    // Sync slider thumbs to match the typed dates
    if (dateBounds.totalDays !== null) {
      const startIndex = clampIndex(dateToIndex(newRange.start_date, dateBounds.minDate), 0, dateBounds.totalDays);
      const endIndex = clampIndex(dateToIndex(newRange.end_date, dateBounds.minDate), 0, dateBounds.totalDays);
      setSliderValue([startIndex, endIndex]);
    }
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

          {isSectionAdmin ? (
            /* Section Admin has nothing to choose - they only ever see their
               own section, so no selector is shown at all. */
            <Typography level="body-md" sx={{ fontWeight: 600 }}>
              📌 عرض: {getSections().find((s) => s.id === selectedSection)?.nameAr || "..."}
            </Typography>
          ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, minmax(0, 1fr))" },
              gap: 3,
            }}
          >
            {/* Scope Selector - always enabled, drives everything else */}
            <FormControl sx={{ minWidth: 0 }}>
              <FormLabel sx={{ fontWeight: 600 }}>مستوى العرض</FormLabel>
              <Select
                value={scope}
                onChange={handleScopeChange}
                size="lg"
                sx={{ minWidth: 0, width: "100%" }}
              >
                {allowedScopeOptions.map((opt) => (
                  <Option key={opt} value={opt}>{SCOPE_OPTION_LABELS[opt]}</Option>
                ))}
              </Select>
            </FormControl>

            {/* Administration - always rendered; disabled + fixed value for limited admins, disabled + "-" until scope needs it otherwise */}
            <FormControl sx={{ minWidth: 0 }}>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 الإدارة
              </FormLabel>
              <OrgUnitSearchSelect
                items={hierarchy?.Administration || []}
                value={selectedAdmin}
                placeholder={adminPlaceholder}
                disabled={loadingHierarchy || adminFieldDisabled}
                onChange={handleAdminSelect}
              />
            </FormControl>

            {/* Department - always rendered; disabled + fixed value for Department Admin, disabled + "-" until scope needs it otherwise */}
            <FormControl sx={{ minWidth: 0 }}>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 الدائرة
              </FormLabel>
              <OrgUnitSearchSelect
                items={scopedDepartments}
                value={selectedDept}
                subLabelKey="parentLabel"
                placeholder={deptPlaceholder}
                disabled={loadingHierarchy || deptFieldDisabled}
                onChange={handleDeptSelect}
              />
            </FormControl>

            {/* Section - always rendered; disabled + "-" until View Level is exactly "section" */}
            <FormControl sx={{ minWidth: 0 }}>
              <FormLabel sx={{ fontWeight: 600 }}>
                📌 القسم
              </FormLabel>
              <OrgUnitSearchSelect
                items={scopedSections}
                value={selectedSection}
                subLabelKey="parentLabel"
                placeholder={sectionPlaceholder}
                disabled={loadingHierarchy || sectionFieldDisabled}
                onChange={handleSectionSelect}
              />
            </FormControl>
          </Box>
          )}

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

              {/* From / To Date Selector */}
              <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                <FormControl sx={{ flex: 1, minWidth: 160 }}>
                  <FormLabel sx={{ fontWeight: 600 }}>من تاريخ (From Date)</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.start_date || ""}
                    onChange={(e) => handleDateInputChange("start_date", e.target.value)}
                    disabled={boundsLoading}
                    slotProps={{
                      input: { lang: "en-GB", min: dateBounds.minDate || undefined, max: dateBounds.maxDate || undefined },
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: 160 }}>
                  <FormLabel sx={{ fontWeight: 600 }}>إلى تاريخ (To Date)</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.end_date || ""}
                    onChange={(e) => handleDateInputChange("end_date", e.target.value)}
                    disabled={boundsLoading}
                    slotProps={{
                      input: { lang: "en-GB", min: dateBounds.minDate || undefined, max: dateBounds.maxDate || undefined },
                    }}
                  />
                </FormControl>
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
        {isGlobalView && <GlobalDashboardStats stats={dashboardStats} loading={loadingStats} operationalSummary={operationalSummary} chartModes={chartModes} setChartModes={setChartModes} chartTypes={chartTypes} setChartTypes={setChartTypes} />}
        {isIdaraView && <IdaraDashboardStats idara={hierarchy?.Administration?.find(a => a.id === selectedAdmin)} stats={dashboardStats} loading={loadingStats} operationalSummary={operationalSummary} />}
        {isDayraView && <DayraDashboardStats dayra={getDepartments().find(d => d.id === selectedDept)} stats={dashboardStats} loading={loadingStats} operationalSummary={operationalSummary} />}
        {isQismView && <QismDashboardStats qism={getSections().find(s => s.id === selectedSection)} stats={dashboardStats} loading={loadingStats} operationalSummary={operationalSummary} />}

        {/* Latest Publication Batches */}
        <Box sx={{ mt: 3 }}>
          <LatestPublicationBatches />
        </Box>

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
              p: 3,
              background: theme.colors.primary,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                opacity: 0.9,
              },
            }}
            onClick={() => window.location.href = "/trend-monitoring"}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography level="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                📊 Trend Analysis
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: "28px", color: "#fff" }} />
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
