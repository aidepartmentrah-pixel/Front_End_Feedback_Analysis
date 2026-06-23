// src/pages/TrendMonitoringPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, Card, CircularProgress, Select, Option, FormControl, FormLabel, Input } from "@mui/joy";
import theme from '../theme';
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "../components/common/MainLayout";
import DomainTrendChart from "../components/trendMonitoring/DomainTrendChart";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import HospitalSafetyMetricsWidget from "../components/trendMonitoring/HospitalSafetyMetricsWidget";
import { fetchTrendsByScope, fetchHospitalSafetyMetrics } from "../api/trends";
import { fetchDashboardHierarchy } from "../api/dashboard";
import { fetchDomainTargets } from "../api/policy";
import { fetchSectionCompliance } from "../api/sectionCompliance";
import { fetchSeasons } from "../api/investigation";
import { getToday, formatDueDate } from "../utils/dateOnly";
import ClassificationCompliancePanel from "../components/trendMonitoring/ClassificationCompliancePanel";
import { useAuth } from "../context/AuthContext";

// ============================
// ROLE-BASED SCOPE LOCK
// ============================
// Limited admin roles ("three monkeys") must be locked to their own org
// unit level — a SECTION_ADMIN should never default to or be able to pick
// Hospital scope, since that exposes data across every other section.
const LIMITED_ADMIN_ROLES = ["ADMINISTRATION_ADMIN", "DEPARTMENT_ADMIN", "SECTION_ADMIN"];

// ============================
// UNIFIED TIME RANGE HELPERS
// ============================
// Default range: "Last 12 Months" — mirrors the backend's own default
// (end = today, start = today minus 12 months), so sending these values
// explicitly produces identical results to the previous implicit default.
// Charts remain monthly-bucketed server-side (unchanged), so the exact day
// picked only determines which month it falls in.
const getDefaultDateRange = () => {
  const today = getToday();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setMonth(start.getMonth() - 12);
  return { startDate: formatDueDate(start), endDate: formatDueDate(today) };
};

const TrendMonitoringPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Scope selection
  const [scope, setScope] = useState("hospital");
  const [scopeLocked, setScopeLocked] = useState(false);

  // Hierarchy state - copied from InvestigationPage
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Unified page-level time range (Feature 3) — single source of truth
  // consumed by every analytic on the page.
  const [fromDate, setFromDate] = useState(() => getDefaultDateRange().startDate);
  const [toDate, setToDate] = useState(() => getDefaultDateRange().endDate);
  const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  // Season quick-select — a convenience shortcut that fills the same
  // fromDate/toDate state above, not a separate time system. Driving both
  // Domain Target Analysis and Section Compliance since they already share
  // that state.
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");

  // Trends data
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Domain targets (Session 2 — Domain Target Analysis). Policy is scope-driven,
  // not date-range-driven, so this is fetched independently of fromDate/toDate.
  const [domainTargets, setDomainTargets] = useState(null);

  // Section compliance (Session 3). Visible for section + hospital scopes.
  // Uses the same From/To date pickers as the rest of the page.
  const [complianceData, setComplianceData] = useState(null);
  const [loadingCompliance, setLoadingCompliance] = useState(false);

  // Hospital safety metrics widget — constant thresholds (5% / 3%), not
  // policy-table-driven. Hospital scope only.
  const [safetyMetrics, setSafetyMetrics] = useState(null);

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
  // ROLE-BASED SCOPE LOCK
  // ============================
  // Forces limited admins onto their own org unit level once hierarchy is
  // loaded, and locks the selectors so they can't switch to a broader scope.
  useEffect(() => {
    if (!hierarchy || !user?.roles?.length) return;

    const role = user.roles[0];
    const unitId = user.primary_unit_id;
    if (!LIMITED_ADMIN_ROLES.includes(role) || !unitId) return;

    // Do NOT attempt ancestor lookup — for limited admins the hierarchy
    // endpoint only returns their own leaf node (allowed_unit_ids = {leafId}),
    // so ancestor data is unavailable. The backend APIs only need the leaf
    // ID for their respective scope (section_id for section, etc.) so we
    // set only the relevant selector and bypass the cascade requirement
    // in missingSelectionMessage via the scopeLocked flag.
    if (role === "SECTION_ADMIN") {
      setScope("section");
      setSelectedSection(String(unitId));
      setScopeLocked(true);
    } else if (role === "DEPARTMENT_ADMIN") {
      setScope("department");
      setSelectedDept(String(unitId));
      setScopeLocked(true);
    } else if (role === "ADMINISTRATION_ADMIN") {
      setScope("administration");
      setSelectedAdmin(String(unitId));
      setScopeLocked(true);
    }
  }, [hierarchy, user]);

  // ============================
  // LOAD SEASONS (quick-select for the unified time range)
  // ============================
  // Defaults to the current season on load — both Domain Target Analysis
  // and Section Compliance are evaluated against seasonal targets, so
  // "this season" is the more natural starting point than "last 12 months".
  useEffect(() => {
    fetchSeasons()
      .then((data) => {
        const seasons = data.seasons || [];
        setAvailableSeasons(seasons);

        const current = seasons.find((s) => s.is_current);
        if (current) {
          setSelectedSeasonId(current.season_id);
          if (current.start_date && current.end_date) {
            setFromDate(current.start_date);
            setToDate(current.end_date);
          }
        }
      })
      .catch((err) => console.error("Failed to load seasons:", err));
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
  // SCOPE SELECTION STATUS (Feature 2)
  // ============================
  // A single, explicit description of what's missing before data can be
  // fetched for the current scope — prevents the page from silently
  // showing stale data from a previous scope/selection.
  const missingSelectionMessage = (() => {
    if (dateRangeInvalid) {
      return "From date must be on or before To date.";
    }

    // When scope is locked by role, skip the full cascade — the backend only
    // needs the leaf unit ID (section_id / department_id / administration_id)
    // and the ancestor IDs are not available in the filtered hierarchy.
    if (scopeLocked) {
      if (scope === "section" && !selectedSection)       return "Loading your section data…";
      if (scope === "department" && !selectedDept)       return "Loading your department data…";
      if (scope === "administration" && !selectedAdmin)  return "Loading your administration data…";
      return null;
    }

    if ((scope === "administration" || scope === "department" || scope === "section") && !selectedAdmin) {
      return "Please select an Administration to view data for this scope.";
    }
    if ((scope === "department" || scope === "section") && !selectedDept) {
      return "Please select a Department to view data for this scope.";
    }
    if (scope === "section" && !selectedSection) {
      return "Please select a Section to view data for this scope.";
    }
    return null;
  })();

  // ============================
  // FETCH TRENDS BY SCOPE
  // ============================
  useEffect(() => {
    setError(null);

    if (missingSelectionMessage) {
      setTrendsData(null);
      setLoading(false);
      return;
    }

    // Build params with hierarchy IDs and the unified time range
    const params = { scope, start_date: fromDate, end_date: toDate };

    if (scope === "administration" || scope === "department" || scope === "section") {
      params.administration_id = selectedAdmin;
    }
    if (scope === "department" || scope === "section") {
      params.department_id = selectedDept;
    }
    if (scope === "section") {
      params.section_id = selectedSection;
    }

    setLoading(true);

    fetchTrendsByScope(params)
      .then((data) => setTrendsData(data))
      .catch((err) => {
        console.error("❌ Failed to load trends:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection, fromDate, toDate, missingSelectionMessage]);

  // ============================
  // FETCH DOMAIN TARGETS (Session 2 — Domain Target Analysis)
  // ============================
  // Mandatory rule: Section scope never receives domain targets — section
  // policy is classification-based, not domain-based — so it's resolved
  // locally without a network call.
  useEffect(() => {
    if (missingSelectionMessage) {
      setDomainTargets(null);
      return;
    }

    if (scope === "section") {
      setDomainTargets({
        has_domain_targets: false,
        clinical_domain_limit: null,
        management_domain_limit: null,
        relational_domain_limit: null,
      });
      return;
    }

    fetchDomainTargets({ scope, administration_id: selectedAdmin, department_id: selectedDept })
      .then((data) => setDomainTargets(data))
      .catch((err) => {
        console.error("❌ Failed to load domain targets:", err);
        setDomainTargets(null);
      });
  }, [scope, selectedAdmin, selectedDept, missingSelectionMessage]);

  // ============================
  // FETCH SECTION COMPLIANCE (Session 3)
  // ============================
  // Visible for section + hospital scopes only.
  // Uses the same From/To date range as the rest of the page.
  useEffect(() => {
    const showCompliance = scope === "section" || scope === "hospital";

    if (!showCompliance || missingSelectionMessage || dateRangeInvalid) {
      setComplianceData(null);
      return;
    }

    setLoadingCompliance(true);

    fetchSectionCompliance({
      scope,
      start_date: fromDate,
      end_date:   toDate,
      section_id: scope === "section" ? selectedSection : null,
    })
      .then((data) => setComplianceData(data))
      .catch((err) => {
        console.error("❌ Failed to load section compliance:", err);
        setComplianceData(null);
      })
      .finally(() => setLoadingCompliance(false));
  }, [scope, selectedSection, fromDate, toDate, missingSelectionMessage, dateRangeInvalid]);

  // ============================
  // FETCH HOSPITAL SAFETY METRICS
  // ============================
  // Constant thresholds widget — hospital scope only.
  useEffect(() => {
    if (scope !== "hospital" || missingSelectionMessage || dateRangeInvalid) {
      setSafetyMetrics(null);
      return;
    }

    fetchHospitalSafetyMetrics({ start_date: fromDate, end_date: toDate })
      .then((data) => setSafetyMetrics(data))
      .catch((err) => {
        console.error("❌ Failed to load hospital safety metrics:", err);
        setSafetyMetrics(null);
      });
  }, [scope, fromDate, toDate, missingSelectionMessage, dateRangeInvalid]);

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
            Back to Dashboard
          </Button>
        </Box>

        {/* Header */}
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
            🎯 Target Analysis
          </Typography>
        </Box>

        {/* Hierarchy Selection - copied from InvestigationPage */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Target Analysis Scope
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
                disabled={scopeLocked}
              >
                <Option value="hospital">🏥 Hospital</Option>
                <Option value="administration">📋 الإدارة</Option>
                <Option value="department">🏢 الدائرة</Option>
                <Option value="section">📌 القسم</Option>
              </Select>
            </FormControl>

            {/* Administration Selector — enabled for administration/department/section scope */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 الإدارة
              </FormLabel>
              <Select
                value={selectedAdmin}
                onChange={handleAdminChange}
                size="lg"
                disabled={loadingHierarchy || scope === "hospital" || scopeLocked}
              >
                <Option value="">All Administrations</Option>
                {(hierarchy?.Administration || []).map((admin) => (
                  <Option key={admin.id} value={admin.id}>
                    {admin.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector — enabled only for department/section scope (Feature 2: scope-driven, not just hierarchy-driven) */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 الدائرة
              </FormLabel>
              <Select
                value={selectedDept}
                onChange={handleDeptChange}
                size="lg"
                disabled={loadingHierarchy || !selectedAdmin || (scope !== "department" && scope !== "section") || scopeLocked}
              >
                <Option value="">All Departments</Option>
                {getDepartments().map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Section Selector — enabled only for section scope (Feature 2: scope-driven, not just hierarchy-driven) */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📌 القسم
              </FormLabel>
              <Select
                value={selectedSection}
                onChange={(e, newValue) => setSelectedSection(newValue)}
                size="lg"
                disabled={loadingHierarchy || !selectedDept || scope !== "section" || scopeLocked}
              >
                <Option value="">All Sections</Option>
                {getSections().map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Unified Time Range (Feature 3) — single source of truth for every analytic on this page */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl size="sm">
              <FormLabel sx={{ fontWeight: 600 }}>Season</FormLabel>
              <Select
                size="sm"
                value={selectedSeasonId}
                placeholder="Quick-select…"
                sx={{ minWidth: 160 }}
                onChange={(e, newValue) => {
                  setSelectedSeasonId(newValue);
                  const season = availableSeasons.find((s) => s.season_id === newValue);
                  if (season?.start_date && season?.end_date) {
                    setFromDate(season.start_date);
                    setToDate(season.end_date);
                  }
                }}
              >
                {availableSeasons.map((s) => (
                  <Option key={s.season_id} value={s.season_id}>
                    {s.season_label}{s.is_current ? " (Current)" : ""}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl size="sm">
              <FormLabel sx={{ fontWeight: 600 }}>From Date</FormLabel>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setSelectedSeasonId(""); }}
                size="sm"
              />
            </FormControl>
            <FormControl size="sm">
              <FormLabel sx={{ fontWeight: 600 }}>To Date</FormLabel>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setSelectedSeasonId(""); }}
                size="sm"
              />
            </FormControl>
          </Box>
        </Card>

        {/* Display time range if data is loaded */}
        {trendsData?.time_range && (
          <Typography level="body-sm" sx={{ color: "#999", mb: 3 }}>
            📅 {trendsData.time_range.start} to {trendsData.time_range.end}
          </Typography>
        )}

        {/* Awaiting a required scope selection (Feature 2) */}
        {!loading && missingSelectionMessage && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "neutral.softBg" }}>
            <Typography level="body-md" sx={{ color: "#666" }}>
              ℹ️ {missingSelectionMessage}
            </Typography>
          </Card>
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

        {/* Hospital Safety Metrics widget — constant thresholds, hospital scope only,
            shown above Domain Trends as the headline safety signal. */}
        {scope === "hospital" && safetyMetrics && (
          <HospitalSafetyMetricsWidget data={safetyMetrics} />
        )}

        {/* Domain Trends Section — hidden for Section scope. Section policy is
            classification-based, not domain-based, so a section user only
            needs Classification Compliance below, not domain trend graphs. */}
        {!loading && !error && trendsData?.domain && scope !== "section" && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: theme.colors.primary, fontWeight: 700 }}>
              🔬 Domain Trends (Clinical, Management, Relational)
            </Typography>
            <DomainTrendChart data={trendsData.domain} targets={domainTargets} />
            <DomainTrendTable data={trendsData.domain} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* ─────────────────────────────────────────────────
            Section Compliance (Session 3)
            Visible for section scope and hospital scope.
            ───────────────────────────────────────────────── */}
        {(scope === "section" || scope === "hospital") && !missingSelectionMessage && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 1, color: theme.colors.primary, fontWeight: 700 }}>
              🎯 Section Compliance Analysis
            </Typography>
            <Typography level="body-sm" sx={{ color: "#888", mb: 3 }}>
              {scope === "hospital"
                ? "Showing classification compliance aggregated across all sections."
                : "Showing classification compliance for the selected section."}
            </Typography>

            {loadingCompliance && (
              <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                Loading compliance data…
              </Box>
            )}

            {!loadingCompliance && complianceData && (
              <ClassificationCompliancePanel data={complianceData} scope={scope} />
            )}

            {!loadingCompliance && !complianceData && (
              <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                No compliance data available for the selected period.
              </Box>
            )}
          </Box>
        )}

      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
