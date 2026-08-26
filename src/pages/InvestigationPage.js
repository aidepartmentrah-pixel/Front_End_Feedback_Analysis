// src/pages/InvestigationPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Select,
  Option,
  FormControl,
  FormLabel,
  CircularProgress,
  Button,
  Input,
} from "@mui/joy";
import theme from "../theme";
import MainLayout from "../components/common/MainLayout";
import IncidentCountTree from "../components/investigation/IncidentCountTree";
import { fetchDashboardHierarchy } from "../api/dashboard";
import { fetchInvestigationTree, fetchSeasons } from "../api/investigation";

// ─── helpers ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

/** Years to show in the yearly selector: 5 years back up to current year */
const AVAILABLE_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 5 + i);

/** ISO (yyyy-mm-dd) for today, for date-input defaults */
const toISODate = (d) => d.toISOString().slice(0, 10);

/** Default Custom Range: last 30 days, so switching to Custom Range never
 * lands on an empty/invalid state before the user has touched anything. */
const DEFAULT_CUSTOM_TO = toISODate(new Date());
const DEFAULT_CUSTOM_FROM = toISODate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

/** Given a period type + the relevant state, return { start_date, end_date } or null */
function resolveDateRange({ periodType, selectedSeason, availableSeasons, selectedYear, customFrom, customTo }) {
  if (periodType === "seasonal") {
    const season = availableSeasons.find((s) => s.season_id === selectedSeason);
    if (!season || !season.start_date || !season.end_date) return null;
    return { start_date: season.start_date, end_date: season.end_date };
  }
  if (periodType === "yearly") {
    if (!selectedYear) return null;
    return { start_date: `${selectedYear}-01-01`, end_date: `${selectedYear}-12-31` };
  }
  if (periodType === "custom") {
    if (!customFrom || !customTo) return null;
    if (customFrom > customTo) return null;
    return { start_date: customFrom, end_date: customTo };
  }
  return null;
}

/** Human-readable label for the selected period */
function buildPeriodLabel({ periodType, selectedSeason, availableSeasons, selectedYear, customFrom, customTo }) {
  if (periodType === "seasonal") {
    const season = availableSeasons.find((s) => s.season_id === selectedSeason);
    return season ? season.season_label : "";
  }
  if (periodType === "yearly") return selectedYear || "";
  if (periodType === "custom") {
    if (!customFrom || !customTo) return "";
    return `${customFrom} – ${customTo}`;
  }
  return "";
}

// ─── component ──────────────────────────────────────────────────────────────

const InvestigationPage = () => {
  // ── period type ────────────────────────────────────────────────────────────
  const [periodType, setPeriodType] = useState("seasonal"); // "seasonal" | "yearly" | "custom"

  // seasonal
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [loadingSeasons, setLoadingSeasons] = useState(true);

  // yearly
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));

  // custom
  const [customFrom, setCustomFrom] = useState(DEFAULT_CUSTOM_FROM);
  const [customTo, setCustomTo] = useState(DEFAULT_CUSTOM_TO);

  // ── org scope ──────────────────────────────────────────────────────────────
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // ── visualization type ────────────────────────────────────────────────────
  const [selectedTreeType, setSelectedTreeType] = useState("incident_count");

  // ── tree data ──────────────────────────────────────────────────────────────
  const [treeData, setTreeData] = useState(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState(null);

  // ── load seasons ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSeasons()
      .then((data) => {
        const seasons = data.seasons || [];
        setAvailableSeasons(seasons);
        if (data.current_season) setSelectedSeason(data.current_season);
      })
      .catch((err) => console.error("Failed to load seasons:", err))
      .finally(() => setLoadingSeasons(false));
  }, []);

  // ── load hierarchy ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((err) => console.error("Failed to load hierarchy:", err))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ── fetch tree ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const dateRange = resolveDateRange({
      periodType,
      selectedSeason,
      availableSeasons,
      selectedYear,
      customFrom,
      customTo,
    });

    if (!dateRange) {
      setTreeError(
        periodType === "custom"
          ? "Please select a valid From Date and To Date (From must be before To)"
          : periodType === "seasonal"
          ? "Please select a season"
          : "Please select a year"
      );
      setTreeData(null);
      return;
    }

    if (!selectedTreeType) return;

    setLoadingTree(true);
    setTreeError(null);

    const administrationId = selectedAdmin || null;
    const departmentId     = selectedDept   || null;
    const sectionId        = selectedSection || null;

    fetchInvestigationTree({
      start_date: dateRange.start_date,
      end_date:   dateRange.end_date,
      tree_type:  selectedTreeType,
      administration_id: administrationId,
      department_id:     departmentId,
      section_id:        sectionId,
    })
      .then((data) => setTreeData(data))
      .catch((err) => setTreeError(err.message))
      .finally(() => setLoadingTree(false));
  }, [
    periodType,
    selectedSeason,
    availableSeasons,
    selectedYear,
    customFrom,
    customTo,
    selectedAdmin,
    selectedDept,
    selectedSection,
    selectedTreeType,
  ]);

  // ── org helper fns ─────────────────────────────────────────────────────────
  const getDepartments = () =>
    selectedAdmin && hierarchy ? hierarchy.Department?.[selectedAdmin] || [] : [];

  const getSections = () =>
    selectedDept && hierarchy ? hierarchy.Section?.[selectedDept] || [] : [];

  const handleAdminChange = (_, newValue) => {
    setSelectedAdmin(newValue);
    setSelectedDept("");
    setSelectedSection("");
  };

  const handleDeptChange = (_, newValue) => {
    setSelectedDept(newValue);
    setSelectedSection("");
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const periodLabel = buildPeriodLabel({
    periodType,
    selectedSeason,
    availableSeasons,
    selectedYear,
    customFrom,
    customTo,
  });

  const PERIOD_BUTTONS = [
    { value: "seasonal", label: "📅 Seasonal" },
    { value: "yearly",   label: "📆 Yearly"   },
    { value: "custom",   label: "🗓 Custom Range" },
  ];

  const treeTypes = [
    { value: "incident_count",                   label: "Number of Incidents" },
    { value: "domain_distribution_numbers",      label: "Domain Distribution (Numbers)" },
    { value: "domain_distribution_percentage",   label: "Domain Distribution (Percentage)" },
    { value: "severity_distribution_numbers",    label: "Severity Distribution (Numbers)" },
    { value: "severity_distribution_percentage", label: "Severity Distribution (Percentage)" },
    { value: "red_flag_incidents",               label: "Red Flag Incident" },
    { value: "never_event_incidents",            label: "Never Event Incident" },
    { value: "notice_count",                     label: "Number of Notices" },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
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
            🔍 Root Cause Investigation
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Exploratory analysis tool to understand why departments crossed policy
            thresholds. Analyze incident patterns and concentrations across the
            organizational structure.
          </Typography>
        </Box>

        {/* Investigation Scope */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Investigation Scope
          </Typography>

          {/* ── Period Type Toggle ── */}
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>
              Period Type
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {PERIOD_BUTTONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={periodType === value ? "solid" : "outlined"}
                  color="primary"
                  size="sm"
                  onClick={() => setPeriodType(value)}
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* ── Period Controls ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Seasonal: quarter dropdown */}
            {periodType === "seasonal" && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600 }}>Quarter</FormLabel>
                <Select
                  value={selectedSeason}
                  onChange={(_, v) => setSelectedSeason(v)}
                  size="md"
                  disabled={loadingSeasons}
                  placeholder={loadingSeasons ? "Loading..." : "Select quarter"}
                >
                  {availableSeasons.map((s) => (
                    <Option key={s.season_id} value={s.season_id}>
                      {s.season_label}
                      {s.is_current ? " (Current)" : ""}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Yearly: year dropdown */}
            {periodType === "yearly" && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600 }}>Year</FormLabel>
                <Select
                  value={selectedYear}
                  onChange={(_, v) => setSelectedYear(v)}
                  size="md"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <Option key={y} value={String(y)}>
                      {y}
                      {y === CURRENT_YEAR ? " (Current)" : ""}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Custom: from + to date inputs */}
            {periodType === "custom" && (
              <>
                <FormControl>
                  <FormLabel sx={{ fontWeight: 600 }}>From Date</FormLabel>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    size="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel sx={{ fontWeight: 600 }}>To Date</FormLabel>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    size="md"
                  />
                </FormControl>
              </>
            )}
          </Box>

          {/* ── Org Scope Filters ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>📋 الإدارة (Administration)</FormLabel>
              <Select
                value={selectedAdmin}
                onChange={handleAdminChange}
                size="md"
                disabled={loadingHierarchy}
              >
                <Option value="">كل الإدارات</Option>
                {(hierarchy?.Administration || []).map((admin) => (
                  <Option key={admin.id} value={admin.id}>
                    {admin.nameAr} ({admin.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>🏢 الدائرة (Department)</FormLabel>
              <Select
                value={selectedDept}
                onChange={handleDeptChange}
                size="md"
                disabled={!selectedAdmin || loadingHierarchy}
              >
                <Option value="">كل الدوائر</Option>
                {getDepartments().map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.nameAr} ({dept.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>📍 القسم (Section)</FormLabel>
              <Select
                value={selectedSection}
                onChange={(_, v) => setSelectedSection(v)}
                size="md"
                disabled={!selectedDept || loadingHierarchy}
              >
                <Option value="">كل الأقسام</Option>
                {getSections().map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.nameAr} ({section.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Visualization Type */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🌳 Visualization Type
          </Typography>
          <FormControl>
            <Select
              value={selectedTreeType}
              onChange={(_, v) => setSelectedTreeType(v)}
              size="lg"
            >
              {treeTypes.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Card>

        {/* Loading */}
        {loadingTree && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading investigation tree...
            </Typography>
          </Card>
        )}

        {/* Error */}
        {!loadingTree && treeError && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger" sx={{ fontWeight: 600, mb: 1 }}>
              ❌ Error loading investigation tree
            </Typography>
            <Typography level="body-sm" color="danger">
              {treeError}
            </Typography>
          </Card>
        )}

        {/* Tree */}
        {!loadingTree && !treeError && treeData && (
          <IncidentCountTree
            data={treeData}
            periodLabel={periodLabel}
            selectedAdmin={selectedAdmin}
            selectedDept={selectedDept}
            selectedSection={selectedSection}
            treeType={selectedTreeType}
          />
        )}
      </Box>
    </MainLayout>
  );
};

export default InvestigationPage;
